package br.com.fonosystem.service;

import br.com.fonosystem.dto.DocumentoRequest;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Documento;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.DocumentoRepository;
import br.com.fonosystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentoService {

    private final DocumentoRepository documentoRepo;
    private final PacienteService pacienteService;
    private final UserRepository userRepository;
    private final LogService logService;

    private User obterUsuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    }

    public List<Documento> listarPorPaciente(Long pacienteId) {
        pacienteService.buscarEntidadePorId(pacienteId);
        return documentoRepo.findByPacienteIdOrderByDataAnexacaoDesc(pacienteId);
    }

    public Documento buscarPorId(Long pacienteId, Long id) {
        pacienteService.buscarEntidadePorId(pacienteId);
        return documentoRepo.findByIdAndPacienteId(pacienteId, id)
            .orElseThrow(() -> new ResourceNotFoundException("Documento não encontrado"));
    }

    @Transactional
    public Documento criar(Long pacienteId, DocumentoRequest request,
                                       MultipartFile arquivo) throws IOException {
        Paciente paciente = pacienteService.buscarEntidadePorId(pacienteId);
        User usuarioLogado = obterUsuarioLogado();

        Documento doc = Documento.builder()
            .paciente(paciente)
            .profissional(usuarioLogado) // Quem está anexando
            .nomeArquivo(request.getNomeArquivo())
            .nomeProfissional(request.getNomeProfissional())
            .especialidade(request.getEspecialidade())
            .descricao(request.getDescricao())
            .tipoMime(arquivo.getContentType())
            .tamanhoBytes(arquivo.getSize())
            .conteudo(arquivo.getBytes())
            .build();

        Documento salvo = documentoRepo.save(doc);
        logService.registrar(
            "CRIOU",
            "DOCUMENTO_PROFISSIONAL",
            salvo.getId(),
            "Documento anexado ao paciente ID: " + pacienteId,
            null,
            usuarioLogado
        );
        return salvo;
    }

    @Transactional
    public void deletar(Long pacienteId, Long id) {
        pacienteService.buscarEntidadePorId(pacienteId);
        documentoRepo.findByIdAndPacienteId(pacienteId, id)
            .orElseThrow(() -> new ResourceNotFoundException("Documento não encontrado"));
        documentoRepo.deleteByIdAndPacienteId(id, pacienteId);

        User usuarioLogado = obterUsuarioLogado();
        logService.registrar(
            "DELETOU",
            "DOCUMENTO_PROFISSIONAL",
            id,
            "Documento removido do paciente ID: " + pacienteId,
            null,
            usuarioLogado
        );
    }
}
