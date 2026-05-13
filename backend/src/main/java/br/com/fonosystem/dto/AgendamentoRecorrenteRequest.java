package br.com.fonosystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
public class AgendamentoRecorrenteRequest {

    private Long pacienteId;

    @NotNull(message = "Data e hora de início são obrigatórios")
    private LocalDateTime dataHoraInicio;

    @NotNull(message = "Data de término é obrigatória")
    private LocalDate dataFim;

    @Min(value = 10, message = "Duração mínima é 10 minutos")
    @Max(value = 240, message = "Duração máxima é 240 minutos")
    private Integer duracao = 50;

    @Size(max = 500)
    private String observacoes;
}
