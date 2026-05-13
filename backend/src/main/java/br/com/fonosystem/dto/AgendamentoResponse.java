package br.com.fonosystem.dto;

import br.com.fonosystem.model.enums.StatusAgendamento;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AgendamentoResponse {

    private Long id;
    private Long pacienteId;
    private String pacienteNome;
    private Long profissionalId;
    private String profissionalNome;
    private LocalDateTime dataHoraInicio;
    private Integer duracao;
    private StatusAgendamento status;
    private String observacoes;
    private LocalDateTime createdAt;
}
