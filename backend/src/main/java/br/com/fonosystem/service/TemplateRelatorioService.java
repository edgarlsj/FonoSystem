package br.com.fonosystem.service;

import br.com.fonosystem.dto.TemplateRelatorioRequest;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.TemplateRelatorio;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.TemplateRelatorioRepository;
import br.com.fonosystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateRelatorioService {

    private final TemplateRelatorioRepository templateRepository;
    private final UserRepository userRepository;

    private Long obterProfissionalIdLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + email))
                .getId();
    }

    private User obterUsuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + email));
    }

    private void validarPropriedade(TemplateRelatorio template) {
        Long profissionalId = obterProfissionalIdLogado();
        if (!template.getProfissional().getId().equals(profissionalId)) {
            throw new AccessDeniedException("Acesso negado ao template");
        }
    }

    public List<TemplateRelatorio> listar() {
        Long profissionalId = obterProfissionalIdLogado();
        return templateRepository.findByProfissionalIdOrderByNomeAsc(profissionalId);
    }

    public TemplateRelatorio obter(Long id) {
        Long profissionalId = obterProfissionalIdLogado();
        TemplateRelatorio template = templateRepository.findByIdAndProfissionalId(profissionalId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Template não encontrado: " + id));
        return template;
    }

    @Transactional
    public TemplateRelatorio criar(TemplateRelatorioRequest request) {
        User profissional = obterUsuarioLogado();

        TemplateRelatorio template = TemplateRelatorio.builder()
                .profissional(profissional)
                .nome(request.getNome())
                .metaTrabalhada(request.getMetaTrabalhada())
                .atividadesRealizadas(request.getAtividadesRealizadas())
                .evolucaoObservada(request.getEvolucaoObservada())
                .orientacoesFamilia(request.getOrientacoesFamilia())
                .planejamentoProximaSessao(request.getPlanejamentoProximaSessao())
                .build();

        return templateRepository.save(template);
    }

    @Transactional
    public TemplateRelatorio atualizar(Long id, TemplateRelatorioRequest request) {
        TemplateRelatorio template = obter(id);
        validarPropriedade(template);

        template.setNome(request.getNome());
        template.setMetaTrabalhada(request.getMetaTrabalhada());
        template.setAtividadesRealizadas(request.getAtividadesRealizadas());
        template.setEvolucaoObservada(request.getEvolucaoObservada());
        template.setOrientacoesFamilia(request.getOrientacoesFamilia());
        template.setPlanejamentoProximaSessao(request.getPlanejamentoProximaSessao());

        return templateRepository.save(template);
    }

    @Transactional
    public void deletar(Long id) {
        TemplateRelatorio template = obter(id);
        validarPropriedade(template);
        templateRepository.deleteById(id);
    }
}
