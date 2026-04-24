package br.com.fonosystem.controller;

import br.com.fonosystem.dto.AvaliacaoRequest;
import br.com.fonosystem.model.Avaliacao;
import br.com.fonosystem.model.PlanoTerapeutico;
import br.com.fonosystem.model.enums.StatusPlano;
import br.com.fonosystem.repository.PlanoTerapeuticoRepository;
import br.com.fonosystem.service.AvaliacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;
    private final PlanoTerapeuticoRepository planoRepository;

    @GetMapping("/v1/pacientes/{pacienteId}/avaliacoes")
    public ResponseEntity<List<Avaliacao>> listar(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(avaliacaoService.listarPorPaciente(pacienteId));
    }

    @PostMapping("/v1/pacientes/{pacienteId}/avaliacoes")
    public ResponseEntity<Avaliacao> criar(@PathVariable Long pacienteId,
                                            @Valid @RequestBody AvaliacaoRequest request) {
        request.setPacienteId(pacienteId);
        return ResponseEntity.status(HttpStatus.CREATED).body(avaliacaoService.criar(request));
    }

    @PutMapping("/v1/avaliacoes/{id}")
    public ResponseEntity<Avaliacao> atualizar(@PathVariable Long id,
                                                @Valid @RequestBody AvaliacaoRequest request) {
        return ResponseEntity.ok(avaliacaoService.atualizar(id, request));
    }

    @GetMapping("/v1/avaliacoes/{id}/plano")
    public ResponseEntity<List<PlanoTerapeutico>> listarPlano(@PathVariable Long id) {
        avaliacaoService.buscarPorId(id);
        return ResponseEntity.ok(planoRepository.findByAvaliacaoId(id));
    }

    @PutMapping("/v1/planos/{id}/status")
    public ResponseEntity<PlanoTerapeutico> atualizarStatusPlano(@PathVariable Long id,
                                                                   @RequestBody Map<String, String> body) {
        PlanoTerapeutico plano = planoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plano terapêutico não encontrado"));
        avaliacaoService.buscarPorId(plano.getAvaliacao().getId());
        plano.setStatus(StatusPlano.valueOf(body.get("status")));
        if (body.containsKey("progresso")) {
            plano.setProgresso(Integer.parseInt(body.get("progresso")));
        }
        return ResponseEntity.ok(planoRepository.save(plano));
    }
}
