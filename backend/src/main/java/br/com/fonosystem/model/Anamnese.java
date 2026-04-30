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

    @Transient
    @JsonIgnore
    public String getPacienteNome() {
        return paciente != null ? paciente.getNomeCompleto() : null;
    }

    @Transient
    @JsonIgnore
    public LocalDate getPacienteDataNascimento() {
        return paciente != null ? paciente.getDataNascimento() : null;
    }

    @Transient
    @JsonIgnore
    public String getProfissionalNome() {
        return profissional != null ? profissional.getNome() : null;
    }

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

    // --- Novos Campos Fonoaudiológicos ---
    @Column(columnDefinition = "TEXT")
    private String alergias;

    @Column(columnDefinition = "TEXT")
    private String medicacoes;

    @Column(name = "nome_mae", length = 200)
    private String nomeMae;

    @Column(name = "data_nasc_mae", length = 20)
    private String dataNascMae;

    @Column(name = "telefone_mae", length = 20)
    private String telefoneMae;

    @Column(name = "profissao_mae", length = 100)
    private String profissaoMae;

    @Column(name = "nome_pai", length = 200)
    private String nomePai;

    @Column(name = "data_nasc_pai", length = 20)
    private String dataNascPai;

    @Column(name = "telefone_pai", length = 20)
    private String telefonePai;

    @Column(name = "profissao_pai", length = 100)
    private String profissaoPai;

    @Column(columnDefinition = "TEXT")
    private String irmaos;

    @Column(name = "outros_familiares", columnDefinition = "TEXT")
    private String outrosFamiliares;

    @Column(name = "periodo_cuidadores", length = 100)
    private String periodoCuidadores;

    @Column(name = "semanas_gestacao", length = 50)
    private String semanasGestacao;

    @Column(name = "tipo_parto", length = 50)
    private String tipoParto;

    @Column(name = "intercorrencias_parto", columnDefinition = "TEXT")
    private String intercorrenciasParto;

    @Column(name = "teste_orelhinha", length = 50)
    private String testeOrelhinha;

    @Column(name = "teste_linguinha", length = 50)
    private String testeLinguinha;

    @Column(name = "amamentacao_chupeta", columnDefinition = "TEXT")
    private String amamentacaoChupeta;

    @Column(name = "hist_perda_auditiva")
    private Boolean histPerdaAuditiva;

    @Column(name = "hist_transtornos_neurologicos")
    private Boolean histTranstornosNeurologicos;

    @Column(name = "hist_convulsoes")
    private Boolean histConvulsoes;

    @Column(name = "hist_malformacao_fetal")
    private Boolean histMalformacaoFetal;

    @Column(name = "hist_gagueira")
    private Boolean histGagueira;

    @Column(name = "hist_outros", columnDefinition = "TEXT")
    private String histOutros;

    @Column(name = "idade_firmou_pescoco", length = 50)
    private String idadeFirmouPescoco;

    @Column(name = "idade_sentou", length = 50)
    private String idadeSentou;

    @Column(name = "idade_engatinhou", length = 50)
    private String idadeEngatinhou;

    @Column(name = "idade_andou", length = 50)
    private String idadeAndou;

    @Column(name = "mao_referencia", length = 50)
    private String maoReferencia;

    @Column(name = "anda_ponta_pe", length = 20)
    private String andaPontaPe;

    @Column(name = "autonomia_vestir", length = 20)
    private String autonomiaVestir;

    @Column(name = "senta_w", length = 20)
    private String sentaW;

    @Column(name = "idade_balbuciou", length = 50)
    private String idadeBalbuciou;

    @Column(name = "idade_primeiras_palavras", length = 50)
    private String idadePrimeirasPalavras;

    @Column(length = 20)
    private String gagueja;

    @Column(name = "comunicacao_atual", columnDefinition = "TEXT")
    private String comunicacaoAtual;

    @Column(name = "trocas_fala", columnDefinition = "TEXT")
    private String trocasFala;

    @Column(name = "rotina_sono", columnDefinition = "TEXT")
    private String rotinaSono;

    @Column(name = "rotina_alimentacao", columnDefinition = "TEXT")
    private String rotinaAlimentacao;

    @Column(name = "restricao_alimentar", columnDefinition = "TEXT")
    private String restricaoAlimentar;

    @Column(name = "rotina_socializacao", columnDefinition = "TEXT")
    private String rotinaSocializacao;

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
