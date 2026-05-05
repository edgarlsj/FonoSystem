package br.com.fonosystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TemplateRelatorioRequest {

    @NotBlank(message = "Nome do template é obrigatório")
    @Size(min = 3, max = 200, message = "Nome deve ter entre 3 e 200 caracteres")
    private String nome;

    private String metaTrabalhada;
    private String atividadesRealizadas;
    private String evolucaoObservada;
    private String orientacoesFamilia;
    private String planejamentoProximaSessao;
}
