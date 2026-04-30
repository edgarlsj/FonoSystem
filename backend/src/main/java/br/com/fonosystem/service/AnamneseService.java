package br.com.fonosystem.service;

import br.com.fonosystem.dto.AnamneseRequest;
import br.com.fonosystem.dto.AnamnesePdfResult;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Anamnese;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.AnamneseRepository;
import br.com.fonosystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnamneseService {

    private final AnamneseRepository anamneseRepository;
    private final PacienteService pacienteService;
    private final UserRepository userRepository;
    private final PdfService pdfService;

    public List<Anamnese> listarPorPaciente(Long pacienteId) {
        // Valida se o paciente pertence ao usuário logado
        pacienteService.buscarPorId(pacienteId);
        return anamneseRepository.findByPacienteIdOrderByCreatedAtDesc(pacienteId);
    }

    public Anamnese buscarPorId(Long id) {
        Anamnese anamnese = anamneseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Anamnese não encontrada: " + id));
        // Valida se o paciente da anamnese pertence ao profissional
        pacienteService.buscarPorId(anamnese.getPaciente().getId());
        return anamnese;
    }

    @Transactional
    public Anamnese criar(AnamneseRequest request) {
        Paciente paciente = pacienteService.buscarEntidadePorId(request.getPacienteId());
        User profissional = paciente.getProfissional();

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
                .alergias(request.getAlergias())
                .medicacoes(request.getMedicacoes())
                .nomeMae(request.getNomeMae())
                .dataNascMae(request.getDataNascMae())
                .telefoneMae(request.getTelefoneMae())
                .profissaoMae(request.getProfissaoMae())
                .nomePai(request.getNomePai())
                .dataNascPai(request.getDataNascPai())
                .telefonePai(request.getTelefonePai())
                .profissaoPai(request.getProfissaoPai())
                .irmaos(request.getIrmaos())
                .outrosFamiliares(request.getOutrosFamiliares())
                .periodoCuidadores(request.getPeriodoCuidadores())
                .semanasGestacao(request.getSemanasGestacao())
                .tipoParto(request.getTipoParto())
                .intercorrenciasParto(request.getIntercorrenciasParto())
                .testeOrelhinha(request.getTesteOrelhinha())
                .testeLinguinha(request.getTesteLinguinha())
                .amamentacaoChupeta(request.getAmamentacaoChupeta())
                .histPerdaAuditiva(request.getHistPerdaAuditiva())
                .histTranstornosNeurologicos(request.getHistTranstornosNeurologicos())
                .histConvulsoes(request.getHistConvulsoes())
                .histMalformacaoFetal(request.getHistMalformacaoFetal())
                .histGagueira(request.getHistGagueira())
                .histOutros(request.getHistOutros())
                .idadeFirmouPescoco(request.getIdadeFirmouPescoco())
                .idadeSentou(request.getIdadeSentou())
                .idadeEngatinhou(request.getIdadeEngatinhou())
                .idadeAndou(request.getIdadeAndou())
                .maoReferencia(request.getMaoReferencia())
                .andaPontaPe(request.getAndaPontaPe())
                .autonomiaVestir(request.getAutonomiaVestir())
                .sentaW(request.getSentaW())
                .idadeBalbuciou(request.getIdadeBalbuciou())
                .idadePrimeirasPalavras(request.getIdadePrimeirasPalavras())
                .gagueja(request.getGagueja())
                .comunicacaoAtual(request.getComunicacaoAtual())
                .trocasFala(request.getTrocasFala())
                .rotinaSono(request.getRotinaSono())
                .rotinaAlimentacao(request.getRotinaAlimentacao())
                .restricaoAlimentar(request.getRestricaoAlimentar())
                .rotinaSocializacao(request.getRotinaSocializacao())
                .build();

        return anamneseRepository.save(anamnese);
    }

    @Transactional
    public Anamnese atualizar(Long id, AnamneseRequest request) {
        Anamnese anamnese = anamneseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Anamnese não encontrada: " + id));

        anamnese.setQueixaPrincipal(request.getQueixaPrincipal());
        anamnese.setHistoricoClinico(request.getHistoricoClinico());
        anamnese.setHistoricoFamiliar(request.getHistoricoFamiliar());
        anamnese.setDesenvolvimentoLinguagem(request.getDesenvolvimentoLinguagem());
        anamnese.setDesenvolvimentoMotor(request.getDesenvolvimentoMotor());
        anamnese.setDiagnosticoTea(request.getDiagnosticoTea());
        anamnese.setNivelEspectro(request.getNivelEspectro());
        anamnese.setUsaCaa(request.getUsaCaa());
        anamnese.setTipoCaa(request.getTipoCaa());
        anamnese.setHipersensibilidades(request.getHipersensibilidades());
        anamnese.setProfissionaisAcompanham(request.getProfissionaisAcompanham());
        anamnese.setFrequentaEscola(request.getFrequentaEscola());
        anamnese.setTipoPerdaAuditiva(request.getTipoPerdaAuditiva());
        anamnese.setGrauPerda(request.getGrauPerda());
        anamnese.setUsaDispositivo(request.getUsaDispositivo());
        anamnese.setTipoDispositivo(request.getTipoDispositivo());
        anamnese.setDataAtivacao(request.getDataAtivacao());
        anamnese.setMarcaModelo(request.getMarcaModelo());
        anamnese.setObservacoes(request.getObservacoes());
        
        anamnese.setAlergias(request.getAlergias());
        anamnese.setMedicacoes(request.getMedicacoes());
        anamnese.setNomeMae(request.getNomeMae());
        anamnese.setDataNascMae(request.getDataNascMae());
        anamnese.setTelefoneMae(request.getTelefoneMae());
        anamnese.setProfissaoMae(request.getProfissaoMae());
        anamnese.setNomePai(request.getNomePai());
        anamnese.setDataNascPai(request.getDataNascPai());
        anamnese.setTelefonePai(request.getTelefonePai());
        anamnese.setProfissaoPai(request.getProfissaoPai());
        anamnese.setIrmaos(request.getIrmaos());
        anamnese.setOutrosFamiliares(request.getOutrosFamiliares());
        anamnese.setPeriodoCuidadores(request.getPeriodoCuidadores());
        anamnese.setSemanasGestacao(request.getSemanasGestacao());
        anamnese.setTipoParto(request.getTipoParto());
        anamnese.setIntercorrenciasParto(request.getIntercorrenciasParto());
        anamnese.setTesteOrelhinha(request.getTesteOrelhinha());
        anamnese.setTesteLinguinha(request.getTesteLinguinha());
        anamnese.setAmamentacaoChupeta(request.getAmamentacaoChupeta());
        anamnese.setHistPerdaAuditiva(request.getHistPerdaAuditiva());
        anamnese.setHistTranstornosNeurologicos(request.getHistTranstornosNeurologicos());
        anamnese.setHistConvulsoes(request.getHistConvulsoes());
        anamnese.setHistMalformacaoFetal(request.getHistMalformacaoFetal());
        anamnese.setHistGagueira(request.getHistGagueira());
        anamnese.setHistOutros(request.getHistOutros());
        anamnese.setIdadeFirmouPescoco(request.getIdadeFirmouPescoco());
        anamnese.setIdadeSentou(request.getIdadeSentou());
        anamnese.setIdadeEngatinhou(request.getIdadeEngatinhou());
        anamnese.setIdadeAndou(request.getIdadeAndou());
        anamnese.setMaoReferencia(request.getMaoReferencia());
        anamnese.setAndaPontaPe(request.getAndaPontaPe());
        anamnese.setAutonomiaVestir(request.getAutonomiaVestir());
        anamnese.setSentaW(request.getSentaW());
        anamnese.setIdadeBalbuciou(request.getIdadeBalbuciou());
        anamnese.setIdadePrimeirasPalavras(request.getIdadePrimeirasPalavras());
        anamnese.setGagueja(request.getGagueja());
        anamnese.setComunicacaoAtual(request.getComunicacaoAtual());
        anamnese.setTrocasFala(request.getTrocasFala());
        anamnese.setRotinaSono(request.getRotinaSono());
        anamnese.setRotinaAlimentacao(request.getRotinaAlimentacao());
        anamnese.setRestricaoAlimentar(request.getRestricaoAlimentar());
        anamnese.setRotinaSocializacao(request.getRotinaSocializacao());

        return anamneseRepository.save(anamnese);
    }

    @Transactional
    public AnamnesePdfResult gerarPdf(Long pacienteId) {
        pacienteService.buscarPorId(pacienteId);

        List<Anamnese> anamneses = anamneseRepository.findByPacienteIdOrderByCreatedAtDesc(pacienteId);
        if (anamneses.isEmpty()) {
            throw new ResourceNotFoundException("Nenhuma anamnese encontrada para o paciente: " + pacienteId);
        }

        Anamnese anamnese = anamneses.get(0);
        byte[] bytes = pdfService.gerarAnamnesePdf(anamnese);

        String nomePaciente = anamnese.getPacienteNome() != null
                ? anamnese.getPacienteNome().replaceAll("[^a-zA-ZÀ-ú0-9 ]", "").trim().replace(" ", "_")
                : "Paciente";
        String data = anamnese.getCreatedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        String filename = "Anamnese_" + nomePaciente + "_" + data + ".pdf";

        return new AnamnesePdfResult(bytes, filename);
    }
}
