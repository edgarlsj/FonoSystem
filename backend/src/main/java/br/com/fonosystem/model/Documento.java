package br.com.fonosystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Table(name = "documentos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profissional_id", nullable = false)
    private User profissional; // Quem anexou

    @Column(name = "nome_arquivo", nullable = false, length = 200)
    private String nomeArquivo; // "relatorio_auditivo.pdf"

    @Column(name = "nome_profissional", nullable = false, length = 200)
    private String nomeProfissional; // Nome de quem originou o doc

    @Column(name = "especialidade", length = 100)
    private String especialidade; // "Audiólogo", "Psicólogo", etc

    @Column(columnDefinition = "TEXT")
    private String descricao; // Nota sobre o documento

    @Column(name = "tipo_mime", length = 50)
    private String tipoMime; // "application/pdf", "image/jpeg", etc

    @Column(name = "tamanho_bytes")
    private Long tamanhoBytes;

    @Column(name = "conteudo", columnDefinition = "BYTEA") // PostgreSQL
    @JsonIgnore
    private byte[] conteudo; // Arquivo em memória

    @CreationTimestamp
    @Column(name = "data_anexacao", updatable = false)
    private LocalDateTime dataAnexacao;

    @Transient
    @JsonIgnore
    public String getProfissionalNome() {
        return profissional != null ? profissional.getNome() : null;
    }

    @Transient
    @JsonIgnore
    public String getProfissionalAnexouNome() {
        return profissional != null ? profissional.getNome() : "Profissional desconhecido";
    }
}
