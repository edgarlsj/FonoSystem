package br.com.fonosystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PacienteRequest {
    @NotBlank(message = "Nome completo é obrigatório")
    private String nomeCompleto;

    @NotNull(message = "Data de nascimento é obrigatória")
    private LocalDate dataNascimento;

    private String cpf;

    @NotBlank(message = "Sexo é obrigatório")
    private String sexo;

    private String telefone;
    private String email;

    @NotBlank(message = "Nome do responsável é obrigatório")
    private String nomeResponsavel;

    @NotBlank(message = "Telefone do responsável é obrigatório")
    private String telefoneResponsavel;

    private String emailResponsavel;
    private String grauParentesco;
    private String convenio;
    private String numeroConvenio;
    private String tipoAtendimento;
    private boolean consentimentoLgpd;
}
