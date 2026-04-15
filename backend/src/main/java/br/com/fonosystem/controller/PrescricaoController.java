package br.com.fonosystem.controller;

import br.com.fonosystem.dto.PrescricaoRequest;
import br.com.fonosystem.model.Prescricao;
import br.com.fonosystem.model.User;
import br.com.fonosystem.service.PrescricaoService;
import br.com.fonosystem.service.LogService;
import br.com.fonosystem.repository.UserRepository;
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
@RequiredArgsConstructor
public class PrescricaoController {

    private final PrescricaoService prescricaoService;
    private final LogService logService;
    private final UserRepository userRepository;

    @GetMapping("/v1/pacientes/{pacienteId}/prescricoes")
    public ResponseEntity<List<Prescricao>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(prescricaoService.listarPorPaciente(pacienteId));
    }

    @PostMapping("/v1/pacientes/{pacienteId}/prescricoes")
    public ResponseEntity<Prescricao> criar(@PathVariable Long pacienteId,
                                             @Valid @RequestBody PrescricaoRequest request,
                                             Authentication authentication) {
        request.setPacienteId(pacienteId);
        Prescricao response = prescricaoService.criar(request);

        // Registrar log
        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "CRIOU",
                "PRESCRICAO",
                response.getId(),
                "Prescrição criada para " + response.getPacienteNome() + ": " + response.getTitulo(),
                request,
                user
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/v1/prescricoes/{id}")
    public ResponseEntity<Prescricao> atualizar(@PathVariable Long id,
                                                @Valid @RequestBody PrescricaoRequest request,
                                                Authentication authentication) {
        Prescricao response = prescricaoService.atualizar(id, request);

        // Registrar log
        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "ATUALIZOU",
                "PRESCRICAO",
                id,
                "Prescrição atualizada para " + response.getPacienteNome() + ": " + response.getTitulo(),
                request,
                user
        ));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/v1/prescricoes/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        byte[] pdf = prescricaoService.gerarPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "prescricao_" + id + ".pdf");
        headers.setContentLength(pdf.length);

        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
