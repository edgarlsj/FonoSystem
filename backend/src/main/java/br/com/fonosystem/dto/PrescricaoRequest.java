package br.com.fonosystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class PrescricaoRequest {
    private Long pacienteId;  // Setado pelo controller, não precisa validação

    @NotNull(message = "Data da prescrição é obrigatória")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataPrescricao;

    @NotBlank(message = "Título é obrigatório")
    private String titulo;

    private String descricaoExercicios;  // Opcional

    private String observacoes;
}
