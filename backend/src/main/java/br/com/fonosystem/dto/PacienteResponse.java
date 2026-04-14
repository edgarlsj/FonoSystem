package br.com.fonosystem.dto;

import br.com.fonosystem.model.Paciente;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class PacienteResponse {
    private Long id;
    private String nomeCompleto;
    private LocalDate dataNascimento;
    private int idade;
    private String cpf;
    private String sexo;
    private String telefone;
    private String email;
    private String nomeResponsavel;
    private String telefoneResponsavel;
    private String convenio;
    private String numeroConvenio;
    private String tipoAtendimento;
    private String status;
    private LocalDateTime createdAt;

    public static PacienteResponse fromEntity(Paciente p) {
        return PacienteResponse.builder()
                .id(p.getId())
                .nomeCompleto(p.getNomeCompleto())
                .dataNascimento(p.getDataNascimento())
                .idade(p.getIdade())
                .cpf(p.getCpf())
                .sexo(p.getSexo())
                .telefone(p.getTelefone())
                .email(p.getEmail())
                .nomeResponsavel(p.getNomeResponsavel())
                .telefoneResponsavel(p.getTelefoneResponsavel())
                .convenio(p.getConvenio())
                .numeroConvenio(p.getNumeroConvenio())
                .tipoAtendimento(p.getTipoAtendimento())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
