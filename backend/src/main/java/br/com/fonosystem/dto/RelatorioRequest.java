package br.com.fonosystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RelatorioRequest {

    // Setado pelo controller via path variable, não precisa de validação
    private Long pacienteId;

    @NotNull(message = "Data da sessão é obrigatória")
    @PastOrPresent(message = "Data da sessão não pode ser futura")
    private LocalDate dataSessao;

    @NotNull(message = "Hora de início é obrigatória")
    private LocalTime horaInicio;

    @NotNull(message = "Hora de fim é obrigatória")
    private LocalTime horaFim;

    @NotBlank(message = "Atividades realizadas é obrigatório")
    @Size(max = 2000, message = "Atividades realizadas deve ter no máximo 2000 caracteres")
    private String atividadesRealizadas;

    @NotBlank(message = "Meta trabalhada é obrigatória")
    @Size(max = 1000, message = "Meta trabalhada deve ter no máximo 1000 caracteres")
    private String metaTrabalhada;

    // TEA
    @DecimalMin(value = "0.0", message = "Percentual de acerto não pode ser negativo")
    @DecimalMax(value = "100.0", message = "Percentual de acerto não pode passar de 100")
    private BigDecimal percentualAcerto;

    @Min(value = 1, message = "Nível de engajamento mínimo é 1")
    @Max(value = 5, message = "Nível de engajamento máximo é 5")
    private Short nivelEngajamento;

    private Boolean usoCaaSessao;
    private String recursoCaaUtilizado;

    // Auditiva
    private String respostaEstimulacaoAuditiva;

    // Evolução
    @Size(max = 2000, message = "Evolução observada deve ter no máximo 2000 caracteres")
    private String evolucaoObservada;

    @Size(max = 1000, message = "Intercorrências deve ter no máximo 1000 caracteres")
    private String intercorrencias;

    @Size(max = 1000, message = "Orientações à família deve ter no máximo 1000 caracteres")
    private String orientacoesFamilia;

    @Size(max = 1000, message = "Planejamento da próxima sessão deve ter no máximo 1000 caracteres")
    private String planejamentoProximaSessao;
}
