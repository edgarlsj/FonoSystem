package br.com.fonosystem.controller;

import br.com.fonosystem.dto.AgendamentoRequest;
import br.com.fonosystem.dto.AgendamentoRecorrenteRequest;
import br.com.fonosystem.dto.AgendamentoResponse;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.UserRepository;
import br.com.fonosystem.service.AgendamentoService;
import br.com.fonosystem.service.LogService;
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
public class AgendamentoController {

    private final AgendamentoService agendamentoService;
    private final LogService logService;
    private final UserRepository userRepository;

    @GetMapping("/v1/agendamentos")
    public ResponseEntity<List<AgendamentoResponse>> listarPorDia(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        LocalDate dia = data != null ? data : LocalDate.now();
        return ResponseEntity.ok(agendamentoService.listarPorDia(dia));
    }

    @GetMapping("/v1/agendamentos/relatorio")
    public ResponseEntity<List<AgendamentoResponse>> relatorio(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(agendamentoService.listarPorPeriodo(inicio, fim));
    }

    @GetMapping("/v1/pacientes/{pacienteId}/agendamentos")
    public ResponseEntity<List<AgendamentoResponse>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(agendamentoService.listarPorPaciente(pacienteId));
    }

    @GetMapping("/v1/agendamentos/{id}")
    public ResponseEntity<AgendamentoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(agendamentoService.buscarPorId(id));
    }

    @PostMapping("/v1/pacientes/{pacienteId}/agendamentos")
    public ResponseEntity<AgendamentoResponse> criar(@PathVariable Long pacienteId,
                                                      @Valid @RequestBody AgendamentoRequest request,
                                                      Authentication authentication) {
        request.setPacienteId(pacienteId);
        AgendamentoResponse ag = agendamentoService.criar(request);

        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "CRIOU", "AGENDAMENTO", ag.getId(),
                "Agendamento criado para paciente ID: " + pacienteId, null, user));

        return ResponseEntity.status(HttpStatus.CREATED).body(ag);
    }

    @PostMapping("/v1/pacientes/{pacienteId}/agendamentos/recorrente")
    public ResponseEntity<List<AgendamentoResponse>> criarRecorrente(@PathVariable Long pacienteId,
                                                                      @Valid @RequestBody AgendamentoRecorrenteRequest request,
                                                                      Authentication authentication) {
        request.setPacienteId(pacienteId);
        List<AgendamentoResponse> agendamentos = agendamentoService.criarRecorrente(request);

        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "CRIOU", "AGENDAMENTO", pacienteId,
                "Criou " + agendamentos.size() + " agendamentos recorrentes para paciente ID: " + pacienteId, null, user));

        return ResponseEntity.status(HttpStatus.CREATED).body(agendamentos);
    }

    @PutMapping("/v1/agendamentos/{id}")
    public ResponseEntity<AgendamentoResponse> atualizar(@PathVariable Long id,
                                                          @Valid @RequestBody AgendamentoRequest request,
                                                          Authentication authentication) {
        AgendamentoResponse ag = agendamentoService.atualizar(id, request);

        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "ATUALIZOU", "AGENDAMENTO", id,
                "Agendamento ID " + id + " atualizado", null, user));

        return ResponseEntity.ok(ag);
    }

    @PatchMapping("/v1/agendamentos/{id}/faltou")
    public ResponseEntity<AgendamentoResponse> marcarFaltou(@PathVariable Long id,
                                                             Authentication authentication) {
        AgendamentoResponse ag = agendamentoService.marcarFaltou(id);

        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "FALTOU", "AGENDAMENTO", id,
                "Paciente faltou ao agendamento ID: " + id, null, user));

        return ResponseEntity.ok(ag);
    }

    @PatchMapping("/v1/agendamentos/{id}/cancelar")
    public ResponseEntity<AgendamentoResponse> cancelar(@PathVariable Long id,
                                                         Authentication authentication) {
        AgendamentoResponse ag = agendamentoService.cancelar(id);

        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "CANCELOU", "AGENDAMENTO", id,
                "Agendamento ID " + id + " cancelado", null, user));

        return ResponseEntity.ok(ag);
    }

    @DeleteMapping("/v1/agendamentos/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id, Authentication authentication) {
        agendamentoService.excluir(id);

        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "EXCLUIU", "AGENDAMENTO", id,
                "Agendamento ID " + id + " excluído", null, user));

        return ResponseEntity.noContent().build();
    }
}
