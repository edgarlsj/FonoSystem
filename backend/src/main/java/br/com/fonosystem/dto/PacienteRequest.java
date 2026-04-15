package br.com.fonosystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PacienteRequest {

    @NotBlank(message = "Nome completo é obrigatório")
    @Size(min = 3, max = 150, message = "Nome deve ter entre 3 e 150 caracteres")
    private String nomeCompleto;

    @NotNull(message = "Data de nascimento é obrigatória")
    @Past(message = "Data de nascimento deve ser uma data passada")
    private LocalDate dataNascimento;

    @Pattern(regexp = "^(\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{11})?$",
             message = "CPF inválido. Use o formato 000.000.000-00")
    private String cpf;

    @NotBlank(message = "Sexo é obrigatório")
    @Pattern(regexp = "^(M|F|O)$", message = "Sexo deve ser M, F ou O")
    private String sexo;

    @Pattern(regexp = "^(\\(?\\d{2}\\)?[\\s-]?\\d{4,5}-?\\d{4})?$",
             message = "Telefone inválido")
    private String telefone;

    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "Nome do responsável é obrigatório")
    @Size(min = 3, max = 150, message = "Nome do responsável deve ter entre 3 e 150 caracteres")
    private String nomeResponsavel;

    @NotBlank(message = "Telefone do responsável é obrigatório")
    @Pattern(regexp = "^\\(?\\d{2}\\)?[\\s-]?\\d{4,5}-?\\d{4}$",
             message = "Telefone do responsável inválido")
    private String telefoneResponsavel;

    @Email(message = "Email do responsável inválido")
    private String emailResponsavel;

    private String grauParentesco;
    private String convenio;
    private String numeroConvenio;
    private String tipoAtendimento;
    private boolean consentimentoLgpd;
}
