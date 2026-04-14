package br.com.fonosystem.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PrescricaoResponse {
    private Long id;
    private Long pacienteId;
    private String pacienteNome;
    private String profissionalNome;
    private LocalDate dataPrescricao;
    private String titulo;
    private String descricaoExercicios;
    private String observacoes;
    private LocalDateTime createdAt;
}
