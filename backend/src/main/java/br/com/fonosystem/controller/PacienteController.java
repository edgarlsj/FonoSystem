package br.com.fonosystem.controller;

import br.com.fonosystem.dto.PacienteRequest;
import br.com.fonosystem.dto.PacienteResponse;
import br.com.fonosystem.model.User;
import br.com.fonosystem.service.PacienteService;
import br.com.fonosystem.service.LogService;
import br.com.fonosystem.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/v1/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;
    private final LogService logService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<PacienteResponse>> listar(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "nomeCompleto", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(pacienteService.listar(nome, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PacienteResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pacienteService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PacienteResponse> criar(@Valid @RequestBody PacienteRequest request, Authentication authentication) {
        PacienteResponse response = pacienteService.criar(request);

        // Registrar log
        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "CRIOU",
                "PACIENTE",
                response.getId(),
                "Paciente criado: " + response.getNomeCompleto(),
                request,
                user
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PacienteResponse> atualizar(@PathVariable Long id,
                                                       @Valid @RequestBody PacienteRequest request,
                                                       Authentication authentication) {
        PacienteResponse response = pacienteService.atualizar(id, request);

        // Registrar log
        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "ATUALIZOU",
                "PACIENTE",
                id,
                "Paciente atualizado: " + response.getNomeCompleto(),
                request,
                user
        ));

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> alterarStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication authentication) {
        String novoStatus = body.get("status");
        PacienteResponse paciente = pacienteService.buscarPorId(id);
        pacienteService.alterarStatus(id, novoStatus);

        // Registrar log
        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        String nomePaciente = paciente.getNomeCompleto();
        usuario.ifPresent(user -> logService.registrar(
                novoStatus.equals("ATIVO") ? "ATIVOU" : "DESATIVOU",
                "PACIENTE",
                id,
                (novoStatus.equals("ATIVO") ? "Paciente ativado: " : "Paciente desativado: ") + nomePaciente,
                body,
                user
        ));

        return ResponseEntity.noContent().build();
    }
}
