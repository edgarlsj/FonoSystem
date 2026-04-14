package br.com.fonosystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "relatorios_diarios")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RelatorioDiario {

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

    // Expõe nome do paciente/profissional no JSON sem referência circular
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

    @Column(name = "data_sessao", nullable = false)
    private LocalDate dataSessao;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fim", nullable = false)
    private LocalTime horaFim;

    @Column(name = "atividades_realizadas", nullable = false, columnDefinition = "TEXT")
    private String atividadesRealizadas;

    @Column(name = "meta_trabalhada", nullable = false, columnDefinition = "TEXT")
    private String metaTrabalhada;

    // --- TEA ---
    @Column(name = "percentual_acerto", precision = 5, scale = 2)
    private BigDecimal percentualAcerto;

    @Column(name = "nivel_engajamento")
    private Short nivelEngajamento;

    @Column(name = "uso_caa_sessao")
    private Boolean usoCaaSessao = false;

    @Column(name = "recurso_caa_utilizado", length = 100)
    private String recursoCaaUtilizado;

    // --- Auditiva ---
    @Column(name = "resposta_estimulacao_auditiva", columnDefinition = "TEXT")
    private String respostaEstimulacaoAuditiva;

    // --- Evolução ---
    @Column(name = "evolucao_observada", columnDefinition = "TEXT")
    private String evolucaoObservada;

    @Column(columnDefinition = "TEXT")
    private String intercorrencias;

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
