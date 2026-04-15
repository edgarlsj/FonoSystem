package br.com.fonosystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AvaliacaoRequest {

    // Setado pelo controller via path variable, não precisa de validação
    private Long pacienteId;

    @NotBlank(message = "Tipo de avaliação é obrigatório")
    private String tipoAvaliacao;

    @NotBlank(message = "Área de especialidade é obrigatória")
    private String areaEspecialidade;

    private String instrumentoAvaliacao;
    private String abordagemTerapeutica;

    @Min(value = 1, message = "Sessões por semana deve ser no mínimo 1")
    @Max(value = 7, message = "Sessões por semana deve ser no máximo 7")
    private Integer sessoesPorSemana;

    @NotNull(message = "Data da avaliação é obrigatória")
    @PastOrPresent(message = "Data da avaliação não pode ser futura")
    private LocalDate dataAvaliacao;

    @Size(max = 500, message = "Hipótese diagnóstica deve ter no máximo 500 caracteres")
    private String hipoteseDiagnostica;

    @Size(max = 3000, message = "Resultados deve ter no máximo 3000 caracteres")
    private String resultados;

    @Size(max = 1000, message = "Orientações à família deve ter no máximo 1000 caracteres")
    private String orientacoesFamilia;

    @Size(max = 1000, message = "Observações deve ter no máximo 1000 caracteres")
    private String observacoes;
}
