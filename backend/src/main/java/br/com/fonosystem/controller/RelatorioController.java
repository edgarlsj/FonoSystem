package br.com.fonosystem.controller;

import br.com.fonosystem.dto.RelatorioRequest;
import br.com.fonosystem.model.RelatorioDiario;
import br.com.fonosystem.model.User;
import br.com.fonosystem.service.RelatorioService;
import br.com.fonosystem.service.LogService;
import br.com.fonosystem.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioService relatorioService;
    private final LogService logService;
    private final UserRepository userRepository;

    @GetMapping("/v1/pacientes/{pacienteId}/relatorios")
    public ResponseEntity<List<RelatorioDiario>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(relatorioService.listarPorPaciente(pacienteId));
    }

    @PostMapping("/v1/pacientes/{pacienteId}/relatorios")
    public ResponseEntity<RelatorioDiario> criar(@PathVariable Long pacienteId,
                                                   @Valid @RequestBody RelatorioRequest request,
                                                   Authentication authentication) {
        request.setPacienteId(pacienteId);
        RelatorioDiario response = relatorioService.criar(request);

        // Registrar log
        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "CRIOU",
                "RELATORIO",
                response.getId(),
                "Relatório criado para " + response.getPacienteNome(),
                request,
                user
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

    @GetMapping("/v1/relatorios/{id}")
    public ResponseEntity<RelatorioDiario> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(relatorioService.buscarPorId(id));
    }

    @PutMapping("/v1/relatorios/{id}")
    public ResponseEntity<RelatorioDiario> atualizar(@PathVariable Long id,
                                                      @Valid @RequestBody RelatorioRequest request,
                                                      Authentication authentication) {
        RelatorioDiario response = relatorioService.atualizar(id, request);

        // Registrar log
        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "ATUALIZOU",
                "RELATORIO",
                id,
                "Relatório atualizado para " + response.getPacienteNome(),
                request,
                user
        ));

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/v1/relatorios/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        relatorioService.excluir(id);
    }
}
