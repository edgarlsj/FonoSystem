package br.com.fonosystem.service;

import br.com.fonosystem.dto.ProtocoloAvaliacaoRequest;
import br.com.fonosystem.dto.ProtocoloAvaliacaoResponse;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.model.ProtocoloAvaliacao;
import br.com.fonosystem.model.User;
import br.com.fonosystem.model.enums.TipoProtocolo;
import br.com.fonosystem.repository.PacienteRepository;
import br.com.fonosystem.repository.ProtocoloAvaliacaoRepository;
import br.com.fonosystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProtocoloAvaliacaoService {

    private final ProtocoloAvaliacaoRepository repository;
    private final PacienteRepository pacienteRepository;
    private final UserRepository userRepository;

    public List<ProtocoloAvaliacaoResponse> listarPorPaciente(Long pacienteId) {
        return repository.findByPacienteIdOrderByDataAplicacaoDesc(pacienteId)
                .stream()
                .map(ProtocoloAvaliacaoResponse::fromEntity)
                .toList();
    }

    public List<ProtocoloAvaliacaoResponse> listarPorPacienteETipo(Long pacienteId, TipoProtocolo tipo) {
        return repository.findByPacienteIdAndTipoOrderByDataAplicacaoDesc(pacienteId, tipo)
                .stream()
                .map(ProtocoloAvaliacaoResponse::fromEntity)
                .toList();
    }

    public ProtocoloAvaliacaoResponse buscarPorId(Long id) {
        return ProtocoloAvaliacaoResponse.fromEntity(findById(id));
    }

    @Transactional
    public ProtocoloAvaliacaoResponse criar(Long pacienteId, ProtocoloAvaliacaoRequest request) {
        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado: " + pacienteId));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User profissional = userRepository.findByEmail(email).orElseThrow();

        ProtocoloAvaliacao protocolo = ProtocoloAvaliacao.builder()
                .paciente(paciente)
                .profissional(profissional)
                .tipo(request.getTipo())
                .dataAplicacao(request.getDataAplicacao())
                .observacoes(request.getObservacoes())
                .resultadoJson(request.getResultadoJson())
                .build();

        return ProtocoloAvaliacaoResponse.fromEntity(repository.save(protocolo));
    }

    @Transactional
    public ProtocoloAvaliacaoResponse atualizar(Long id, ProtocoloAvaliacaoRequest request) {
        ProtocoloAvaliacao protocolo = findById(id);
        protocolo.setDataAplicacao(request.getDataAplicacao());
        protocolo.setObservacoes(request.getObservacoes());
        protocolo.setResultadoJson(request.getResultadoJson());
        return ProtocoloAvaliacaoResponse.fromEntity(repository.save(protocolo));
    }

    @Transactional
    public void excluir(Long id) {
        findById(id);
        repository.deleteById(id);
    }

    private ProtocoloAvaliacao findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Protocolo não encontrado: " + id));
    }
}
