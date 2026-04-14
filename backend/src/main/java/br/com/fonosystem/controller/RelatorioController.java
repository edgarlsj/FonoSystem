package br.com.fonosystem.controller;

import br.com.fonosystem.dto.RelatorioRequest;
import br.com.fonosystem.model.RelatorioDiario;
import br.com.fonosystem.service.RelatorioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioService relatorioService;

    @GetMapping("/v1/pacientes/{pacienteId}/relatorios")
    public ResponseEntity<List<RelatorioDiario>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(relatorioService.listarPorPaciente(pacienteId));
    }

    @PostMapping("/v1/pacientes/{pacienteId}/relatorios")
    public ResponseEntity<RelatorioDiario> criar(@PathVariable Long pacienteId,
                                                   @Valid @RequestBody RelatorioRequest request) {
        request.setPacienteId(pacienteId);
        return ResponseEntity.status(HttpStatus.CREATED).body(relatorioService.criar(request));
    }

    @GetMapping("/v1/relatorios")
    public ResponseEntity<List<RelatorioDiario>> listarPorData(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(relatorioService.listarPorData(data));
    }

    @GetMapping("/v1/pacientes/{pacienteId}/evolucao")
    public ResponseEntity<List<RelatorioDiario>> evolucao(
            @PathVariable Long pacienteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(relatorioService.buscarEvolucao(pacienteId, inicio, fim));
    }
}
