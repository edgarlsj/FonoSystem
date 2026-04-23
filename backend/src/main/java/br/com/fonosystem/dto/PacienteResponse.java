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
    private String tipoAtendimento;
    private String numeroConvenio;
    private String status;
    private String endereco;
    private String bairro;
    private String cidadeUf;
    private String contatoEmergencia;
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
                .endereco(p.getEndereco())
                .bairro(p.getBairro())
                .cidadeUf(p.getCidadeUf())
                .contatoEmergencia(p.getContatoEmergencia())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
