package br.com.fonosystem.dto;

import br.com.fonosystem.model.enums.TipoProtocolo;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProtocoloAvaliacaoRequest {

    @NotNull(message = "Tipo de protocolo é obrigatório")
    private TipoProtocolo tipo;

    @NotNull(message = "Data de aplicação é obrigatória")
    private LocalDate dataAplicacao;

    private String observacoes;

    @NotNull(message = "Resultado é obrigatório")
    private String resultadoJson;
}
