package br.com.fonosystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RelatorioRequest {
    @NotNull(message = "Paciente é obrigatório")
    private Long pacienteId;

    @NotNull(message = "Data da sessão é obrigatória")
    private LocalDate dataSessao;

    @NotNull(message = "Hora início é obrigatória")
    private LocalTime horaInicio;

    @NotNull(message = "Hora fim é obrigatória")
    private LocalTime horaFim;

    @NotBlank(message = "Atividades realizadas é obrigatório")
    private String atividadesRealizadas;

    @NotBlank(message = "Meta trabalhada é obrigatória")
    private String metaTrabalhada;

    // TEA
    private BigDecimal percentualAcerto;
    private Short nivelEngajamento;
    private Boolean usoCaaSessao;
    private String recursoCaaUtilizado;

    // Auditiva
    private String respostaEstimulacaoAuditiva;

    // Evolução
    private String evolucaoObservada;
    private String intercorrencias;
    private String orientacoesFamilia;
    private String planejamentoProximaSessao;
}
