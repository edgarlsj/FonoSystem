package br.com.fonosystem.dto;

import br.com.fonosystem.model.enums.StatusAgendamento;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AgendamentoRequest {

    private Long pacienteId;

    @NotNull(message = "Data e hora de início são obrigatórios")
    private LocalDateTime dataHoraInicio;

    @Min(value = 10, message = "Duração mínima é 10 minutos")
    @Max(value = 240, message = "Duração máxima é 240 minutos")
    private Integer duracao = 50;

    @Size(max = 500, message = "Observações deve ter no máximo 500 caracteres")
    private String observacoes;

    private StatusAgendamento status;
}
