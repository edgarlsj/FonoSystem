package br.com.fonosystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Table(name = "templates_relatorios")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TemplateRelatorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profissional_id", nullable = false)
    private User profissional;

    @Column(name = "nome", nullable = false, length = 200)
    private String nome;

    @Column(name = "meta_trabalhada", columnDefinition = "TEXT")
    private String metaTrabalhada;

    @Column(name = "atividades_realizadas", columnDefinition = "TEXT")
    private String atividadesRealizadas;

    @Column(name = "evolucao_observada", columnDefinition = "TEXT")
    private String evolucaoObservada;

    @Column(name = "orientacoes_familia", columnDefinition = "TEXT")
    private String orientacoesFamilia;

    @Column(name = "planejamento_proxima_sessao", columnDefinition = "TEXT")
    private String planejamentoProximaSessao;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
