package br.com.fonosystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentoRequest {

    @NotBlank(message = "Nome do arquivo é obrigatório")
    @Size(min = 1, max = 200)
    private String nomeArquivo;

    @NotBlank(message = "Nome do profissional é obrigatório")
    @Size(min = 1, max = 200)
    private String nomeProfissional;

    @Size(max = 100)
    private String especialidade;

    @Size(max = 5000)
    private String descricao;

    // Arquivo será enviado via MultipartFile no Controller
}
