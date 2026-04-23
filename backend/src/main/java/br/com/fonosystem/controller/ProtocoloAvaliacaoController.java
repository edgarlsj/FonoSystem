package br.com.fonosystem.controller;

import br.com.fonosystem.dto.ProtocoloAvaliacaoRequest;
import br.com.fonosystem.dto.ProtocoloAvaliacaoResponse;
import br.com.fonosystem.model.enums.TipoProtocolo;
import br.com.fonosystem.service.ProtocoloAvaliacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/pacientes/{pacienteId}/protocolos")
public class ProtocoloAvaliacaoController {

    private final ProtocoloAvaliacaoService service;

    @GetMapping
    public ResponseEntity<List<ProtocoloAvaliacaoResponse>> listar(
            @PathVariable Long pacienteId,
            @RequestParam(required = false) TipoProtocolo tipo) {

        List<ProtocoloAvaliacaoResponse> lista = tipo != null
                ? service.listarPorPacienteETipo(pacienteId, tipo)
                : service.listarPorPaciente(pacienteId);

        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProtocoloAvaliacaoResponse> buscar(@PathVariable Long pacienteId,
                                                              @PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ProtocoloAvaliacaoResponse> criar(@PathVariable Long pacienteId,
                                                             @Valid @RequestBody ProtocoloAvaliacaoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(pacienteId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProtocoloAvaliacaoResponse> atualizar(@PathVariable Long pacienteId,
                                                                  @PathVariable Long id,
                                                                  @Valid @RequestBody ProtocoloAvaliacaoRequest request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long pacienteId, @PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
