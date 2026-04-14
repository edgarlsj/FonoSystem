package br.com.fonosystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "avaliacoes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Avaliacao {

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

    @Column(name = "tipo_avaliacao", nullable = false, length = 30)
    private String tipoAvaliacao;

    @Column(name = "area_especialidade", nullable = false, length = 30)
    private String areaEspecialidade;

    @Column(name = "instrumento_avaliacao", length = 200)
    private String instrumentoAvaliacao;

    @Column(name = "abordagem_terapeutica", length = 50)
    private String abordagemTerapeutica;

    @Column(name = "sessoes_por_semana")
    private Integer sessoesPorSemana = 2;

    @Column(name = "data_avaliacao", nullable = false)
    private LocalDate dataAvaliacao;

    @Column(name = "hipotese_diagnostica", columnDefinition = "TEXT")
    private String hipoteseDiagnostica;

    @Column(columnDefinition = "TEXT")
    private String resultados;

    @Column(name = "orientacoes_familia", columnDefinition = "TEXT")
    private String orientacoesFamilia;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @JsonIgnore
    @OneToMany(mappedBy = "avaliacao", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PlanoTerapeutico> planos = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
