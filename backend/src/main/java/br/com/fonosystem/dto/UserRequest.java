package br.com.fonosystem.dto;

import br.com.fonosystem.model.enums.Perfil;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 3, max = 150, message = "Nome deve ter entre 3 e 150 caracteres")
    private String nome;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ser válido")
    private String email;

    @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
    private String senha;

    @NotNull(message = "Perfil é obrigatório")
    private Perfil perfil;

    @Size(max = 50, message = "Número do conselho deve ter no máximo 50 caracteres")
    private String numeroConselho;

    private Boolean ativo = true;
}
