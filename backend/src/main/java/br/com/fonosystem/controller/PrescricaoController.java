package br.com.fonosystem.controller;

import br.com.fonosystem.dto.PrescricaoRequest;
import br.com.fonosystem.model.Prescricao;
import br.com.fonosystem.service.PrescricaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PrescricaoController {

    private final PrescricaoService prescricaoService;

    @GetMapping("/v1/pacientes/{pacienteId}/prescricoes")
    public ResponseEntity<List<Prescricao>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(prescricaoService.listarPorPaciente(pacienteId));
    }

    @PostMapping("/v1/pacientes/{pacienteId}/prescricoes")
    public ResponseEntity<Prescricao> criar(@PathVariable Long pacienteId,
                                             @Valid @RequestBody PrescricaoRequest request) {
        request.setPacienteId(pacienteId);
        return ResponseEntity.status(HttpStatus.CREATED).body(prescricaoService.criar(request));
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
