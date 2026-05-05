package br.com.fonosystem.controller;

import br.com.fonosystem.dto.DocumentoRequest;
import br.com.fonosystem.model.Documento;
import br.com.fonosystem.service.DocumentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/v1/pacientes/{pacienteId}/documentos-profissionais")
@RequiredArgsConstructor
public class DocumentoController {

    private final DocumentoService service;

    @GetMapping
    public ResponseEntity<List<Documento>> listar(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(service.listarPorPaciente(pacienteId));
    }

    @PostMapping
    public ResponseEntity<Documento> criar(
        @PathVariable Long pacienteId,
        @RequestParam String nomeArquivo,
        @RequestParam String nomeProfissional,
        @RequestParam(required = false) String especialidade,
        @RequestParam(required = false) String descricao,
        @RequestPart("arquivo") MultipartFile arquivo) throws IOException {

        DocumentoRequest request = new DocumentoRequest();
        request.setNomeArquivo(nomeArquivo);
        request.setNomeProfissional(nomeProfissional);
        request.setEspecialidade(especialidade);
        request.setDescricao(descricao);

        Documento doc = service.criar(pacienteId, request, arquivo);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long pacienteId, @PathVariable Long id) {
        Documento doc = service.buscarPorId(pacienteId, id);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                   "attachment; filename=\"" + doc.getNomeArquivo() + "\"")
            .contentType(MediaType.parseMediaType(doc.getTipoMime()))
            .body(doc.getConteudo());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long pacienteId, @PathVariable Long id) {
        service.deletar(pacienteId, id);
        return ResponseEntity.noContent().build();
    }
}
