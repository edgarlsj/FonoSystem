package br.com.fonosystem.controller;

import br.com.fonosystem.dto.AnamneseRequest;
import br.com.fonosystem.model.Anamnese;
import br.com.fonosystem.service.AnamneseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/pacientes/{pacienteId}/anamneses")
@RequiredArgsConstructor
public class AnamneseController {

    private final AnamneseService anamneseService;

    @GetMapping
    public ResponseEntity<List<Anamnese>> listar(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(anamneseService.listarPorPaciente(pacienteId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Anamnese> buscarPorId(@PathVariable Long pacienteId, @PathVariable Long id) {
        return ResponseEntity.ok(anamneseService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Anamnese> criar(@PathVariable Long pacienteId,
                                           @Valid @RequestBody AnamneseRequest request) {
        request.setPacienteId(pacienteId);
        return ResponseEntity.status(HttpStatus.CREATED).body(anamneseService.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Anamnese> atualizar(@PathVariable Long pacienteId,
                                               @PathVariable Long id,
                                               @Valid @RequestBody AnamneseRequest request) {
        request.setPacienteId(pacienteId);
        return ResponseEntity.ok(anamneseService.atualizar(id, request));
    }
}
