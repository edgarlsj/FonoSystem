package br.com.fonosystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AvaliacaoRequest {
    @NotNull(message = "Paciente é obrigatório")
    private Long pacienteId;

    @NotBlank(message = "Tipo de avaliação é obrigatório")
    private String tipoAvaliacao;

    @NotBlank(message = "Área de especialidade é obrigatória")
    private String areaEspecialidade;

    private String instrumentoAvaliacao;
    private String abordagemTerapeutica;
    private Integer sessoesPorSemana;

    @NotNull(message = "Data da avaliação é obrigatória")
    private LocalDate dataAvaliacao;

    private String hipoteseDiagnostica;
    private String resultados;
    private String orientacoesFamilia;
    private String observacoes;
}
