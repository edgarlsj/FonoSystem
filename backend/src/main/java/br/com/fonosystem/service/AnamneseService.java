package br.com.fonosystem.service;

import br.com.fonosystem.dto.AnamneseRequest;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Anamnese;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.AnamneseRepository;
import br.com.fonosystem.repository.PacienteRepository;
import br.com.fonosystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnamneseService {

    private final AnamneseRepository anamneseRepository;
    private final PacienteRepository pacienteRepository;
    private final UserRepository userRepository;

    public List<Anamnese> listarPorPaciente(Long pacienteId) {
        return anamneseRepository.findByPacienteIdOrderByCreatedAtDesc(pacienteId);
    }

    public Anamnese buscarPorId(Long id) {
        return anamneseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Anamnese não encontrada: " + id));
    }

    @Transactional
    public Anamnese criar(AnamneseRequest request) {
        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User profissional = userRepository.findByEmail(email).orElseThrow();

        Anamnese anamnese = Anamnese.builder()
                .paciente(paciente)
                .profissional(profissional)
                .queixaPrincipal(request.getQueixaPrincipal())
                .historicoClinico(request.getHistoricoClinico())
                .historicoFamiliar(request.getHistoricoFamiliar())
                .desenvolvimentoLinguagem(request.getDesenvolvimentoLinguagem())
                .desenvolvimentoMotor(request.getDesenvolvimentoMotor())
                .diagnosticoTea(request.getDiagnosticoTea())
                .nivelEspectro(request.getNivelEspectro())
                .usaCaa(request.getUsaCaa())
                .tipoCaa(request.getTipoCaa())
                .hipersensibilidades(request.getHipersensibilidades())
                .profissionaisAcompanham(request.getProfissionaisAcompanham())
                .frequentaEscola(request.getFrequentaEscola())
                .tipoPerdaAuditiva(request.getTipoPerdaAuditiva())
                .grauPerda(request.getGrauPerda())
                .usaDispositivo(request.getUsaDispositivo())
                .tipoDispositivo(request.getTipoDispositivo())
                .dataAtivacao(request.getDataAtivacao())
                .marcaModelo(request.getMarcaModelo())
                .observacoes(request.getObservacoes())
                .build();

        return anamneseRepository.save(anamnese);
    }
}
