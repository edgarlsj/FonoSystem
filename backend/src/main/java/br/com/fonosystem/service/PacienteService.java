package br.com.fonosystem.service;

import br.com.fonosystem.dto.PacienteRequest;
import br.com.fonosystem.dto.PacienteResponse;
import br.com.fonosystem.exception.BusinessException;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.PacienteRepository;
import br.com.fonosystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final UserRepository userRepository;
    private final LogService logService;

    private static final long MAX_FOTO_SIZE = 2 * 1024 * 1024; // 2MB

    private User getUsuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    }

    public Page<PacienteResponse> listar(String nome, String status, Pageable pageable) {
        User user = getUsuarioLogado();
        return pacienteRepository.findByFilters(nome, status, user.getId(), pageable)
                .map(PacienteResponse::fromEntity);
    }

    public PacienteResponse buscarPorId(Long id) {
        Paciente paciente = buscarEntidadePorId(id);
        return PacienteResponse.fromEntity(paciente);
    }

    @Transactional
    public PacienteResponse criar(PacienteRequest request) {
        if (request.getCpf() != null && !request.getCpf().isEmpty()
                && pacienteRepository.existsByCpf(request.getCpf())) {
            throw new BusinessException("CPF já cadastrado");
        }

        if (!request.isConsentimentoLgpd()) {
            throw new BusinessException("Consentimento LGPD é obrigatório");
        }

        User user = getUsuarioLogado();

        Paciente paciente = Paciente.builder()
                .nomeCompleto(request.getNomeCompleto())
                .dataNascimento(request.getDataNascimento())
                .cpf(request.getCpf() != null && !request.getCpf().isEmpty() ? request.getCpf() : null)
                .sexo(request.getSexo())
                .telefone(request.getTelefone())
                .email(request.getEmail())
                .nomeResponsavel(request.getNomeResponsavel())
                .telefoneResponsavel(request.getTelefoneResponsavel())
                .emailResponsavel(request.getEmailResponsavel())
                .grauParentesco(request.getGrauParentesco())
                .convenio(request.getConvenio())
                .numeroConvenio(request.getNumeroConvenio())
                .tipoAtendimento(request.getTipoAtendimento() != null ? request.getTipoAtendimento() : "CONVENIO")
                .status("ATIVO")
                .endereco(request.getEndereco())
                .bairro(request.getBairro())
                .cidadeUf(request.getCidadeUf())
                .contatoEmergencia(request.getContatoEmergencia())
                .dataConsentimento(LocalDateTime.now())
                .profissional(user)
                .build();

        return PacienteResponse.fromEntity(pacienteRepository.save(paciente));
    }

    @Transactional
    public PacienteResponse atualizar(Long id, PacienteRequest request) {
        Paciente paciente = buscarEntidadePorId(id);

        paciente.setNomeCompleto(request.getNomeCompleto());
        paciente.setDataNascimento(request.getDataNascimento());
        paciente.setCpf(request.getCpf() != null && !request.getCpf().isEmpty() ? request.getCpf() : null);
        paciente.setSexo(request.getSexo());
        paciente.setTelefone(request.getTelefone());
        paciente.setEmail(request.getEmail());
        paciente.setNomeResponsavel(request.getNomeResponsavel());
        paciente.setTelefoneResponsavel(request.getTelefoneResponsavel());
        paciente.setConvenio(request.getConvenio());
        paciente.setNumeroConvenio(request.getNumeroConvenio());
        paciente.setTipoAtendimento(request.getTipoAtendimento());
        
        paciente.setEndereco(request.getEndereco());
        paciente.setBairro(request.getBairro());
        paciente.setCidadeUf(request.getCidadeUf());
        paciente.setContatoEmergencia(request.getContatoEmergencia());

        return PacienteResponse.fromEntity(pacienteRepository.save(paciente));
    }

    @Transactional
    public void alterarStatus(Long id, String novoStatus) {
        Paciente paciente = buscarEntidadePorId(id);
        paciente.setStatus(novoStatus);
        if ("INATIVO".equals(novoStatus)) {
            paciente.setDeletedAt(LocalDateTime.now());
        } else {
            paciente.setDeletedAt(null);
        }
        pacienteRepository.save(paciente);
    }

    public long contarAtivos() {
        User user = getUsuarioLogado();
        return pacienteRepository.countByStatusAndProfissionalId("ATIVO", user.getId());
    }

    public Paciente buscarEntidadePorId(Long id) {
        User user = getUsuarioLogado();
        Paciente paciente = pacienteRepository.findByIdWithProfissional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado: " + id));

        if (!paciente.getProfissional().getId().equals(user.getId())) {
            throw new AccessDeniedException("Acesso negado: o paciente não pertence a este profissional.");
        }

        return paciente;
    }

    @Transactional
    public void adicionarFoto(Long pacienteId, MultipartFile arquivo) throws IllegalAccessException {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("Arquivo de foto não pode estar vazio");
        }

        if (arquivo.getSize() > MAX_FOTO_SIZE) {
            throw new IllegalArgumentException("Foto não pode ser maior que 2MB. Tamanho atual: " + (arquivo.getSize() / 1024) + "KB");
        }

        Paciente paciente = buscarEntidadePorId(pacienteId);

        try {
            paciente.setFoto(arquivo.getBytes());
            paciente.setFotoTipoMime(arquivo.getContentType());
            paciente.setFotoTamanhoBytes(arquivo.getSize());

            pacienteRepository.save(paciente);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Erro ao processar arquivo de foto", e);
        }
    }

    @Transactional
    public void removerFoto(Long pacienteId) {
        Paciente paciente = buscarEntidadePorId(pacienteId);

        paciente.setFoto(null);
        paciente.setFotoTipoMime(null);
        paciente.setFotoTamanhoBytes(null);

        pacienteRepository.save(paciente);
    }

    public boolean temFoto(Long pacienteId) {
        return pacienteRepository.findById(pacienteId)
                .map(p -> p.getFoto() != null && p.getFoto().length > 0)
                .orElse(false);
    }
}
