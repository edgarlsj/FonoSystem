package br.com.fonosystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pacientes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_completo", nullable = false, length = 200)
    private String nomeCompleto;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @Column(length = 14, unique = true)
    private String cpf;

    @Column(nullable = false, length = 10)
    private String sexo;

    @Column(length = 20)
    private String telefone;

    @Column(length = 200)
    private String email;

    @Column(name = "nome_responsavel", nullable = false, length = 200)
    private String nomeResponsavel;

    @Column(name = "telefone_responsavel", nullable = false, length = 20)
    private String telefoneResponsavel;

    @Column(name = "email_responsavel", length = 200)
    private String emailResponsavel;

    @Column(name = "grau_parentesco", length = 50)
    private String grauParentesco;

    @Column(length = 100)
    private String convenio;

    @Column(name = "numero_convenio", length = 50)
    private String numeroConvenio;

    @Column(name = "tipo_atendimento", nullable = false, length = 20)
    private String tipoAtendimento = "CONVENIO";

    @Column(nullable = false, length = 10)
    private String status = "ATIVO";

    @Column(length = 255)
    private String endereco;

    @Column(length = 100)
    private String bairro;

    @Column(name = "cidade_uf", length = 100)
    private String cidadeUf;

    @Column(name = "contato_emergencia", length = 100)
    private String contatoEmergencia;

    @Column(name = "data_consentimento")
    private LocalDateTime dataConsentimento;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profissional_id")
    private User profissional;

    @JsonIgnore
    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Anamnese> anamneses = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Avaliacao> avaliacoes = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RelatorioDiario> relatorios = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Helper para calcular idade
    public int getIdade() {
        if (dataNascimento == null) return 0;
        return java.time.Period.between(dataNascimento, LocalDate.now()).getYears();
    }
}
