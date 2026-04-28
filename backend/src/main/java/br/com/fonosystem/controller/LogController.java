package br.com.fonosystem.controller;

import br.com.fonosystem.model.Log;
import br.com.fonosystem.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/v1/logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'FONOAUDIOLOGO')")
public class LogController {

    private final LogService logService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Page<Log>> listar(
            @RequestParam(required = false) String acao,
            @RequestParam(required = false) String entidade,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @PageableDefault(size = 20, sort = "data_criacao", direction = Sort.Direction.DESC) Pageable pageable) {

        LocalDateTime dataInicioTime = dataInicio != null ? dataInicio.atStartOfDay() : null;
        LocalDateTime dataFimTime = dataFim != null ? dataFim.atTime(LocalTime.MAX) : null;

        return ResponseEntity.ok(logService.listar(acao, entidade, dataInicioTime, dataFimTime, pageable));
    }

    @GetMapping("/entidade/{entidade}/{entidadeId}")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<Log>> listarPorEntidade(
            @PathVariable String entidade,
            @PathVariable Long entidadeId,
            @PageableDefault(size = 20, sort = "data_criacao", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(logService.listarPorEntidade(entidade, entidadeId, pageable));
    }
}
