package br.com.fonosystem.dto;

import br.com.fonosystem.model.ProtocoloAvaliacao;
import br.com.fonosystem.model.enums.TipoProtocolo;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ProtocoloAvaliacaoResponse {

    private Long id;
    private Long pacienteId;
    private String pacienteNome;
    private Long profissionalId;
    private String profissionalNome;
    private TipoProtocolo tipo;
    private LocalDate dataAplicacao;
    private String observacoes;
    private String resultadoJson;
    private LocalDateTime createdAt;

    public static ProtocoloAvaliacaoResponse fromEntity(ProtocoloAvaliacao p) {
        return ProtocoloAvaliacaoResponse.builder()
                .id(p.getId())
                .pacienteId(p.getPaciente().getId())
                .pacienteNome(p.getPaciente().getNomeCompleto())
                .profissionalId(p.getProfissional().getId())
                .profissionalNome(p.getProfissional().getNome())
                .tipo(p.getTipo())
                .dataAplicacao(p.getDataAplicacao())
                .observacoes(p.getObservacoes())
                .resultadoJson(p.getResultadoJson())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
