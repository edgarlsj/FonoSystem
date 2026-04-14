package br.com.fonosystem.service;

import br.com.fonosystem.dto.RelatorioRequest;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.model.RelatorioDiario;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.PacienteRepository;
import br.com.fonosystem.repository.RelatorioDiarioRepository;
import br.com.fonosystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RelatorioService {

    private final RelatorioDiarioRepository relatorioRepository;
    private final PacienteRepository pacienteRepository;
    private final UserRepository userRepository;

    public List<RelatorioDiario> listarPorPaciente(Long pacienteId) {
        return relatorioRepository.findByPacienteIdOrderByDataSessaoDesc(pacienteId);
    }

    public List<RelatorioDiario> listarPorData(LocalDate data) {
        return relatorioRepository.findByDataSessaoOrderByHoraInicio(data);
    }

    public RelatorioDiario buscarPorId(Long id) {
        return relatorioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Relatório não encontrado: " + id));
    }

    public List<RelatorioDiario> buscarEvolucao(Long pacienteId, LocalDate inicio, LocalDate fim) {
        return relatorioRepository.findByPacienteIdAndDataSessaoBetween(pacienteId, inicio, fim);
    }

    @Transactional
    public RelatorioDiario criar(RelatorioRequest request) {
        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User profissional = userRepository.findByEmail(email).orElseThrow();

        RelatorioDiario relatorio = RelatorioDiario.builder()
                .paciente(paciente)
                .profissional(profissional)
                .dataSessao(request.getDataSessao())
                .horaInicio(request.getHoraInicio())
                .horaFim(request.getHoraFim())
                .atividadesRealizadas(request.getAtividadesRealizadas())
                .metaTrabalhada(request.getMetaTrabalhada())
                .percentualAcerto(request.getPercentualAcerto())
                .nivelEngajamento(request.getNivelEngajamento())
                .usoCaaSessao(request.getUsoCaaSessao())
                .recursoCaaUtilizado(request.getRecursoCaaUtilizado())
                .respostaEstimulacaoAuditiva(request.getRespostaEstimulacaoAuditiva())
                .evolucaoObservada(request.getEvolucaoObservada())
                .intercorrencias(request.getIntercorrencias())
                .orientacoesFamilia(request.getOrientacoesFamilia())
                .planejamentoProximaSessao(request.getPlanejamentoProximaSessao())
                .build();

        return relatorioRepository.save(relatorio);
    }
}
