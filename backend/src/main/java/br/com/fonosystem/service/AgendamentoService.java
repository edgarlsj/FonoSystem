package br.com.fonosystem.service;

import br.com.fonosystem.dto.AgendamentoRecorrenteRequest;
import br.com.fonosystem.dto.AgendamentoRequest;
import br.com.fonosystem.dto.AgendamentoResponse;
import br.com.fonosystem.exception.BusinessException;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Agendamento;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.model.User;
import br.com.fonosystem.model.enums.StatusAgendamento;
import br.com.fonosystem.repository.AgendamentoRepository;
import br.com.fonosystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final PacienteService pacienteService;
    private final UserRepository userRepository;

    private User getUsuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + email));
    }

    public List<AgendamentoResponse> listarPorDia(LocalDate data) {
        User user = getUsuarioLogado();
        LocalDateTime inicio = data.atStartOfDay();
        LocalDateTime fim = data.plusDays(1).atStartOfDay();
        return agendamentoRepository.findByProfissionalIdAndDia(user.getId(), inicio, fim)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AgendamentoResponse> listarPorPeriodo(LocalDate inicio, LocalDate fim) {
        User user = getUsuarioLogado();
        LocalDateTime ini = inicio.atStartOfDay();
        LocalDateTime end = fim.plusDays(1).atStartOfDay();
        return agendamentoRepository.findByProfissionalIdAndPeriodo(user.getId(), ini, end)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AgendamentoResponse> listarPorPaciente(Long pacienteId) {
        pacienteService.buscarEntidadePorId(pacienteId);
        User user = getUsuarioLogado();
        return agendamentoRepository.findByProfissionalIdAndPacienteId(user.getId(), pacienteId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public AgendamentoResponse buscarPorId(Long id) {
        User user = getUsuarioLogado();
        Agendamento ag = agendamentoRepository.findByIdAndProfissional(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado: " + id));
        return toResponse(ag);
    }

    @Transactional
    public AgendamentoResponse criar(AgendamentoRequest request) {
        Paciente paciente = pacienteService.buscarEntidadePorId(request.getPacienteId());
        User profissional = paciente.getProfissional();

        Agendamento ag = Agendamento.builder()
                .paciente(paciente)
                .profissional(profissional)
                .dataHoraInicio(request.getDataHoraInicio())
                .duracao(request.getDuracao() != null ? request.getDuracao() : 50)
                .status(StatusAgendamento.AGENDADO)
                .observacoes(request.getObservacoes())
                .build();

        return toResponse(agendamentoRepository.save(ag));
    }

    @Transactional
    public List<AgendamentoResponse> criarRecorrente(AgendamentoRecorrenteRequest request) {
        Paciente paciente = pacienteService.buscarEntidadePorId(request.getPacienteId());
        User profissional = paciente.getProfissional();

        LocalDate dataInicio = request.getDataHoraInicio().toLocalDate();
        if (request.getDataFim().isBefore(dataInicio)) {
            throw new BusinessException("Data final nao pode ser anterior a data inicial");
        }

        List<Agendamento> agendamentos = new ArrayList<>();
        LocalDateTime dataHora = request.getDataHoraInicio();
        while (!dataHora.toLocalDate().isAfter(request.getDataFim())) {
            agendamentos.add(Agendamento.builder()
                    .paciente(paciente)
                    .profissional(profissional)
                    .dataHoraInicio(dataHora)
                    .duracao(request.getDuracao() != null ? request.getDuracao() : 50)
                    .status(StatusAgendamento.AGENDADO)
                    .observacoes(request.getObservacoes())
                    .build());
            dataHora = dataHora.plusWeeks(1);
        }

        return agendamentoRepository.saveAll(agendamentos)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public AgendamentoResponse atualizar(Long id, AgendamentoRequest request) {
        User user = getUsuarioLogado();
        Agendamento ag = agendamentoRepository.findByIdAndProfissional(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado: " + id));

        ag.setDataHoraInicio(request.getDataHoraInicio());
        if (request.getDuracao() != null) ag.setDuracao(request.getDuracao());
        ag.setObservacoes(request.getObservacoes());
        if (request.getStatus() != null) ag.setStatus(request.getStatus());

        return toResponse(agendamentoRepository.save(ag));
    }

    @Transactional
    public AgendamentoResponse marcarFaltou(Long id) {
        User user = getUsuarioLogado();
        Agendamento ag = agendamentoRepository.findByIdAndProfissional(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado: " + id));
        ag.setStatus(StatusAgendamento.FALTOU);
        return toResponse(agendamentoRepository.save(ag));
    }

    @Transactional
    public AgendamentoResponse cancelar(Long id) {
        User user = getUsuarioLogado();
        Agendamento ag = agendamentoRepository.findByIdAndProfissional(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado: " + id));
        ag.setStatus(StatusAgendamento.CANCELADO);
        return toResponse(agendamentoRepository.save(ag));
    }

    @Transactional
    public void excluir(Long id) {
        User user = getUsuarioLogado();
        Agendamento ag = agendamentoRepository.findByIdAndProfissional(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado: " + id));
        ag.setDeletedAt(LocalDateTime.now());
        agendamentoRepository.save(ag);
    }

    private AgendamentoResponse toResponse(Agendamento ag) {
        AgendamentoResponse r = new AgendamentoResponse();
        r.setId(ag.getId());
        r.setPacienteId(ag.getPaciente().getId());
        r.setPacienteNome(ag.getPaciente().getNomeCompleto());
        r.setProfissionalId(ag.getProfissional().getId());
        r.setProfissionalNome(ag.getProfissional().getNome());
        r.setDataHoraInicio(ag.getDataHoraInicio());
        r.setDuracao(ag.getDuracao());
        r.setStatus(ag.getStatus());
        r.setObservacoes(ag.getObservacoes());
        r.setCreatedAt(ag.getCreatedAt());
        return r;
    }
}
