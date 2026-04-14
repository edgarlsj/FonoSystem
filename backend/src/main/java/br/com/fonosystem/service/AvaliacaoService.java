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
    private final PacienteRepository pacienteRepository;
    private final UserRepository userRepository;

    public List<Avaliacao> listarPorPaciente(Long pacienteId) {
        return avaliacaoRepository.findByPacienteIdOrderByDataAvaliacaoDesc(pacienteId);
    }

    public Avaliacao buscarPorId(Long id) {
        return avaliacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada: " + id));
    }

    @Transactional
    public Avaliacao criar(AvaliacaoRequest request) {
        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User profissional = userRepository.findByEmail(email).orElseThrow();

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
}
