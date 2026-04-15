package br.com.fonosystem.service;

import br.com.fonosystem.dto.PrescricaoRequest;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.model.Prescricao;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.PacienteRepository;
import br.com.fonosystem.repository.PrescricaoRepository;
import br.com.fonosystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescricaoService {

    private final PrescricaoRepository prescricaoRepository;
    private final PacienteRepository pacienteRepository;
    private final UserRepository userRepository;
    private final PdfService pdfService;

    public List<Prescricao> listarPorPaciente(Long pacienteId) {
        return prescricaoRepository.findByPacienteIdOrderByDataPrescricaoDesc(pacienteId);
    }

    public Prescricao buscarPorId(Long id) {
        return prescricaoRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescrição não encontrada: " + id));
    }

    @Transactional
    public Prescricao criar(PrescricaoRequest request) {
        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User profissional = userRepository.findByEmail(email).orElseThrow();

        Prescricao prescricao = Prescricao.builder()
                .paciente(paciente)
                .profissional(profissional)
                .dataPrescricao(request.getDataPrescricao())
                .titulo(request.getTitulo())
                .descricaoExercicios(request.getDescricaoExercicios())
                .observacoes(request.getObservacoes())
                .build();

        return prescricaoRepository.save(prescricao);
    }

    @Transactional
    public Prescricao atualizar(Long id, PrescricaoRequest request) {
        Prescricao prescricao = buscarPorId(id);

        prescricao.setDataPrescricao(request.getDataPrescricao());
        prescricao.setTitulo(request.getTitulo());
        prescricao.setDescricaoExercicios(request.getDescricaoExercicios());
        prescricao.setObservacoes(request.getObservacoes());

        return prescricaoRepository.save(prescricao);
    }

    public byte[] gerarPdf(Long prescricaoId) {
        Prescricao prescricao = buscarPorId(prescricaoId);
        return pdfService.gerarPrescricaoPdf(prescricao);
    }
}
