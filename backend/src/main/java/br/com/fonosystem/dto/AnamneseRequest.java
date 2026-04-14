package br.com.fonosystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AnamneseRequest {
    @NotNull(message = "Paciente é obrigatório")
    private Long pacienteId;

    @NotBlank(message = "Queixa principal é obrigatória")
    private String queixaPrincipal;

    private String historicoClinico;
    private String historicoFamiliar;
    private String desenvolvimentoLinguagem;
    private String desenvolvimentoMotor;

    // TEA
    private String diagnosticoTea;
    private String nivelEspectro;
    private String usaCaa;
    private String tipoCaa;
    private String hipersensibilidades;
    private String profissionaisAcompanham;
    private String frequentaEscola;

    // Auditiva
    private String tipoPerdaAuditiva;
    private String grauPerda;
    private String usaDispositivo;
    private String tipoDispositivo;
    private LocalDate dataAtivacao;
    private String marcaModelo;

    private String observacoes;
}
