package br.com.fonosystem.controller;

import br.com.fonosystem.dto.AnamneseRequest;
import br.com.fonosystem.dto.AnamnesePdfResult;
import br.com.fonosystem.model.Anamnese;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.UserRepository;
import br.com.fonosystem.service.AnamneseService;
import br.com.fonosystem.service.LogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/v1/pacientes/{pacienteId}/anamneses")
@RequiredArgsConstructor
public class AnamneseController {

    private final AnamneseService anamneseService;
    private final LogService logService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Anamnese>> listar(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(anamneseService.listarPorPaciente(pacienteId));
    }
   // get
    @GetMapping("/{id}")
    public ResponseEntity<Anamnese> buscarPorId(@PathVariable Long pacienteId, @PathVariable Long id) {
        return ResponseEntity.ok(anamneseService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Anamnese> criar(@PathVariable Long pacienteId,
                                           @Valid @RequestBody AnamneseRequest request,
                                           Authentication authentication) {
        request.setPacienteId(pacienteId);
        Anamnese anamnese = anamneseService.criar(request);

        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "CRIOU",
                "ANAMNESE",
                anamnese.getId(),
                "Anamnese criada para paciente ID: " + pacienteId,
                null,
                user
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(anamnese);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Anamnese> atualizar(@PathVariable Long pacienteId,
                                               @PathVariable Long id,
                                               @Valid @RequestBody AnamneseRequest request,
                                               Authentication authentication) {
        request.setPacienteId(pacienteId);
        Anamnese anamnese = anamneseService.atualizar(id, request);

        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "ATUALIZOU",
                "ANAMNESE",
                id,
                "Anamnese ID " + id + " atualizada",
                null,
                user
        ));

        return ResponseEntity.ok(anamnese);
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long pacienteId) {
        AnamnesePdfResult result = anamneseService.gerarPdf(pacienteId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", result.filename());
        headers.setContentLength(result.bytes().length);

        return ResponseEntity.ok().headers(headers).body(result.bytes());
    }
}
