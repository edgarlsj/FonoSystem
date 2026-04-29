package br.com.fonosystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class PrescricaoRequest {

    // Setado pelo controller via path variable, não precisa de validação
    private Long pacienteId;

    @NotNull(message = "Data da prescrição é obrigatória")
    @PastOrPresent(message = "Data da prescrição não pode ser futura")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataPrescricao;

    @NotBlank(message = "Título é obrigatório")
    @Size(max = 255, message = "Título deve ter no máximo 255 caracteres")
    private String titulo;

    @NotBlank(message = "Descrição dos exercícios é obrigatória")
    @Size(max = 5000, message = "Descrição deve ter no máximo 5000 caracteres")
    private String descricaoExercicios;

    @Size(max = 1000, message = "Observações deve ter no máximo 1000 caracteres")
    private String observacoes;
}
