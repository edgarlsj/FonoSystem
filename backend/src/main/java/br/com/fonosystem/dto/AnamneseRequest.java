package br.com.fonosystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AnamneseRequest {

    // Setado pelo controller via path variable, não precisa de validação o
    private Long pacienteId;

    @NotBlank(message = "Queixa principal é obrigatória")
    @Size(max = 1000, message = "Queixa principal deve ter no máximo 1000 caracteres")
    private String queixaPrincipal;

    @Size(max = 3000, message = "Histórico clínico deve ter no máximo 3000 caracteres")
    private String historicoClinico;

    @Size(max = 2000, message = "Histórico familiar deve ter no máximo 2000 caracteres")
    private String historicoFamiliar;

    @Size(max = 2000, message = "Desenvolvimento da linguagem deve ter no máximo 2000 caracteres")
    private String desenvolvimentoLinguagem;

    @Size(max = 2000, message = "Desenvolvimento motor deve ter no máximo 2000 caracteres")
    private String desenvolvimentoMotor;

    // TEA
    private String diagnosticoTea;
    private String nivelEspectro;
    private String usaCaa;
    private String tipoCaa;

    @Size(max = 1000, message = "Hipersensibilidades deve ter no máximo 1000 caracteres")
    private String hipersensibilidades;

    private String profissionaisAcompanham;
    private String frequentaEscola;

    // Auditiva
    private String tipoPerdaAuditiva;
    private String grauPerda;
    private String usaDispositivo;
    private String tipoDispositivo;

    @PastOrPresent(message = "Data de ativação não pode ser futura")
    private LocalDate dataAtivacao;

    private String marcaModelo;

    // --- Novos Campos Fonoaudiológicos ---
    private String alergias;
    private String medicacoes;
    private String nomeMae;
    private String dataNascMae;
    private String telefoneMae;
    private String profissaoMae;
    private String nomePai;
    private String dataNascPai;
    private String telefonePai;
    private String profissaoPai;
    private String irmaos;
    private String outrosFamiliares;
    private String periodoCuidadores;

    private String semanasGestacao;
    private String tipoParto;
    private String intercorrenciasParto;
    private String testeOrelhinha;
    private String testeLinguinha;
    private String amamentacaoChupeta;

    private Boolean histPerdaAuditiva;
    private Boolean histTranstornosNeurologicos;
    private Boolean histConvulsoes;
    private Boolean histMalformacaoFetal;
    private Boolean histGagueira;
    private String histOutros;

    private String idadeFirmouPescoco;
    private String idadeSentou;
    private String idadeEngatinhou;
    private String idadeAndou;
    private String maoReferencia;
    private String andaPontaPe;
    private String autonomiaVestir;
    private String sentaW;

    private String idadeBalbuciou;
    private String idadePrimeirasPalavras;
    private String gagueja;
    private String comunicacaoAtual;
    private String trocasFala;

    private String rotinaSono;
    private String rotinaAlimentacao;
    private String restricaoAlimentar;
    private String rotinaSocializacao;

    @Size(max = 2000, message = "Observações deve ter no máximo 2000 caracteres")
    private String observacoes;
}
