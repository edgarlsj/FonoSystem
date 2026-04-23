package br.com.fonosystem.service;

import br.com.fonosystem.dto.AvaliacaoRequest;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Avaliacao;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.AvaliacaoRepository;
import br.com.fonosystem.repository.PacienteRepository;
import br.com.fonosystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final PacienteService pacienteService;
    private final UserRepository userRepository;

    public List<Avaliacao> listarPorPaciente(Long pacienteId) {
        pacienteService.buscarEntidadePorId(pacienteId);
        return avaliacaoRepository.findByPacienteIdOrderByDataAvaliacaoDesc(pacienteId);
    }

    public Avaliacao buscarPorId(Long id) {
        Avaliacao avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada: " + id));
        pacienteService.buscarEntidadePorId(avaliacao.getPaciente().getId());
        return avaliacao;
    }

    @Transactional
    public Avaliacao criar(AvaliacaoRequest request) {
        Paciente paciente = pacienteService.buscarEntidadePorId(request.getPacienteId());
        User profissional = paciente.getProfissional();

        Avaliacao avaliacao = Avaliacao.builder()
                .paciente(paciente)
                .profissional(profissional)
                .tipoAvaliacao(request.getTipoAvaliacao())
                .areaEspecialidade(request.getAreaEspecialidade())
                .instrumentoAvaliacao(request.getInstrumentoAvaliacao())
                .abordagemTerapeutica(request.getAbordagemTerapeutica())
                .sessoesPorSemana(request.getSessoesPorSemana())
                .dataAvaliacao(request.getDataAvaliacao())
                .hipoteseDiagnostica(request.getHipoteseDiagnostica())
                .resultados(request.getResultados())
                .orientacoesFamilia(request.getOrientacoesFamilia())
                .observacoes(request.getObservacoes())
                .build();

        return avaliacaoRepository.save(avaliacao);
    }

    @Transactional
    public Avaliacao atualizar(Long id, AvaliacaoRequest request) {
        Avaliacao avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada: " + id));

        avaliacao.setTipoAvaliacao(request.getTipoAvaliacao());
        avaliacao.setAreaEspecialidade(request.getAreaEspecialidade());
        avaliacao.setInstrumentoAvaliacao(request.getInstrumentoAvaliacao());
        avaliacao.setAbordagemTerapeutica(request.getAbordagemTerapeutica());
        avaliacao.setSessoesPorSemana(request.getSessoesPorSemana());
        avaliacao.setDataAvaliacao(request.getDataAvaliacao());
        avaliacao.setHipoteseDiagnostica(request.getHipoteseDiagnostica());
        avaliacao.setResultados(request.getResultados());
        avaliacao.setOrientacoesFamilia(request.getOrientacoesFamilia());
        avaliacao.setObservacoes(request.getObservacoes());

        return avaliacaoRepository.save(avaliacao);
    }
}
