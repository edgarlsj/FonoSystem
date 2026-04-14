package br.com.fonosystem.service;

import br.com.fonosystem.dto.PacienteRequest;
import br.com.fonosystem.dto.PacienteResponse;
import br.com.fonosystem.exception.BusinessException;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    public Page<PacienteResponse> listar(String nome, String status, Pageable pageable) {
        return pacienteRepository.findByFilters(nome, status, pageable)
                .map(PacienteResponse::fromEntity);
    }

    public PacienteResponse buscarPorId(Long id) {
        Paciente paciente = findById(id);
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

        Paciente paciente = Paciente.builder()
                .nomeCompleto(request.getNomeCompleto())
                .dataNascimento(request.getDataNascimento())
                .cpf(request.getCpf())
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
                .dataConsentimento(LocalDateTime.now())
                .build();

        return PacienteResponse.fromEntity(pacienteRepository.save(paciente));
    }

    @Transactional
    public PacienteResponse atualizar(Long id, PacienteRequest request) {
        Paciente paciente = findById(id);

        paciente.setNomeCompleto(request.getNomeCompleto());
        paciente.setDataNascimento(request.getDataNascimento());
        paciente.setCpf(request.getCpf());
        paciente.setSexo(request.getSexo());
        paciente.setTelefone(request.getTelefone());
        paciente.setEmail(request.getEmail());
        paciente.setNomeResponsavel(request.getNomeResponsavel());
        paciente.setTelefoneResponsavel(request.getTelefoneResponsavel());
        paciente.setConvenio(request.getConvenio());
        paciente.setNumeroConvenio(request.getNumeroConvenio());
        paciente.setTipoAtendimento(request.getTipoAtendimento());

        return PacienteResponse.fromEntity(pacienteRepository.save(paciente));
    }

    @Transactional
    public void alterarStatus(Long id, String novoStatus) {
        Paciente paciente = findById(id);
        paciente.setStatus(novoStatus);
        if ("INATIVO".equals(novoStatus)) {
            paciente.setDeletedAt(LocalDateTime.now());
        } else {
            paciente.setDeletedAt(null);
        }
        pacienteRepository.save(paciente);
    }

    public long contarAtivos() {
        return pacienteRepository.countByStatus("ATIVO");
    }

    private Paciente findById(Long id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado: " + id));
    }
}
