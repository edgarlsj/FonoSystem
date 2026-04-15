package br.com.fonosystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AnamneseRequest {

    // Setado pelo controller via path variable, não precisa de validação
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

    @Size(max = 2000, message = "Observações deve ter no máximo 2000 caracteres")
    private String observacoes;
}
