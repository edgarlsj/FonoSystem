package br.com.fonosystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PrescricaoRequest {
    @NotNull(message = "Paciente é obrigatório")
    private Long pacienteId;

    @NotNull(message = "Data da prescrição é obrigatória")
    private LocalDate dataPrescricao;

    @NotBlank(message = "Título é obrigatório")
    private String titulo;

    @NotBlank(message = "Descrição dos exercícios é obrigatória")
    private String descricaoExercicios;

    private String observacoes;
}
