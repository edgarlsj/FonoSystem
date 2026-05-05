package br.com.fonosystem.controller;

import br.com.fonosystem.dto.TemplateRelatorioRequest;
import br.com.fonosystem.model.TemplateRelatorio;
import br.com.fonosystem.model.User;
import br.com.fonosystem.service.TemplateRelatorioService;
import br.com.fonosystem.service.LogService;
import br.com.fonosystem.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class TemplateRelatorioController {

    private final TemplateRelatorioService templateService;
    private final LogService logService;
    private final UserRepository userRepository;

    @GetMapping("/v1/templates-relatorio")
    public ResponseEntity<List<TemplateRelatorio>> listar() {
        return ResponseEntity.ok(templateService.listar());
    }

    @PostMapping("/v1/templates-relatorio")
    public ResponseEntity<TemplateRelatorio> criar(
            @Valid @RequestBody TemplateRelatorioRequest request,
            Authentication authentication) {
        TemplateRelatorio template = templateService.criar(request);

        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "CRIOU",
                "TEMPLATE_RELATORIO",
                template.getId(),
                "Template criado: " + template.getNome(),
                request,
                user
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(template);
    }

    @GetMapping("/v1/templates-relatorio/{id}")
    public ResponseEntity<TemplateRelatorio> obter(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.obter(id));
    }

    @PutMapping("/v1/templates-relatorio/{id}")
    public ResponseEntity<TemplateRelatorio> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody TemplateRelatorioRequest request,
            Authentication authentication) {
        TemplateRelatorio template = templateService.atualizar(id, request);

        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "ATUALIZOU",
                "TEMPLATE_RELATORIO",
                template.getId(),
                "Template atualizado: " + template.getNome(),
                request,
                user
        ));

        return ResponseEntity.ok(template);
    }

    @DeleteMapping("/v1/templates-relatorio/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long id,
            Authentication authentication) {
        TemplateRelatorio template = templateService.obter(id);
        templateService.deletar(id);

        Optional<User> usuario = userRepository.findByEmail(authentication.getName());
        usuario.ifPresent(user -> logService.registrar(
                "DELETOU",
                "TEMPLATE_RELATORIO",
                id,
                "Template deletado: " + template.getNome(),
                null,
                user
        ));

        return ResponseEntity.noContent().build();
    }
}
