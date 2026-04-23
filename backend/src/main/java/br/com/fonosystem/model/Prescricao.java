package br.com.fonosystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescricoes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Prescricao {

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
    private User profissional;

    // Expõe dados no JSON sem referência circular (mesmo padrão de RelatorioDiario)
    @Transient
    public String getPacienteNome() {
        return paciente != null ? paciente.getNomeCompleto() : null;
    }

    @Transient
    public Long getPacienteId() {
        return paciente != null ? paciente.getId() : null;
    }

    @Transient
    public String getProfissionalNome() {
        return profissional != null ? profissional.getNome() : null;
    }

    @Transient
    public String getProfissionalConselho() {
        return profissional != null ? profissional.getNumeroConselho() : null;
    }

    @Column(name = "data_prescricao", nullable = false)
    private LocalDate dataPrescricao;

    @Column(nullable = false, length = 255)
    private String titulo;

    @Column(name = "descricao_exercicios", nullable = false, columnDefinition = "TEXT")
    private String descricaoExercicios;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
