package br.com.fonosystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "anamneses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Anamnese {

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

    // --- Queixa e histórico ---
    @Column(name = "queixa_principal", nullable = false, columnDefinition = "TEXT")
    private String queixaPrincipal;

    @Column(name = "historico_clinico", columnDefinition = "TEXT")
    private String historicoClinico;

    @Column(name = "historico_familiar", columnDefinition = "TEXT")
    private String historicoFamiliar;

    // --- Desenvolvimento ---
    @Column(name = "desenvolvimento_linguagem", columnDefinition = "TEXT")
    private String desenvolvimentoLinguagem;

    @Column(name = "desenvolvimento_motor", columnDefinition = "TEXT")
    private String desenvolvimentoMotor;

    // --- Campos TEA ---
    @Column(name = "diagnostico_tea", length = 20)
    private String diagnosticoTea;

    @Column(name = "nivel_espectro", length = 10)
    private String nivelEspectro;

    @Column(name = "usa_caa", length = 20)
    private String usaCaa;

    @Column(name = "tipo_caa", length = 100)
    private String tipoCaa;

    @Column(columnDefinition = "TEXT")
    private String hipersensibilidades;

    @Column(name = "profissionais_acompanham", columnDefinition = "TEXT")
    private String profissionaisAcompanham;

    @Column(name = "frequenta_escola", length = 30)
    private String frequentaEscola;

    // --- Campos Auditiva ---
    @Column(name = "tipo_perda_auditiva", length = 50)
    private String tipoPerdaAuditiva;

    @Column(name = "grau_perda", length = 30)
    private String grauPerda;

    @Column(name = "usa_dispositivo", length = 30)
    private String usaDispositivo;

    @Column(name = "tipo_dispositivo", length = 100)
    private String tipoDispositivo;

    @Column(name = "data_ativacao")
    private LocalDate dataAtivacao;

    @Column(name = "marca_modelo", length = 100)
    private String marcaModelo;

    // --- Metadados ---
    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
