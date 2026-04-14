package br.com.fonosystem.config;

import br.com.fonosystem.model.*;
import br.com.fonosystem.model.enums.Perfil;
import br.com.fonosystem.model.enums.StatusPlano;
import br.com.fonosystem.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Slf4j
@Configuration
@RequiredArgsConstructor
@Profile("h2")
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initData(UserRepository userRepo,
                               PacienteRepository pacienteRepo,
                               AnamneseRepository anamneseRepo,
                               AvaliacaoRepository avaliacaoRepo,
                               PlanoTerapeuticoRepository planoRepo,
                               RelatorioDiarioRepository relatorioRepo) {
        return args -> {
            if (userRepo.count() > 0) return;

            log.info("=== Inicializando dados simulados (H2) ===");

            // ---- USERS ----
            User mariana = userRepo.save(User.builder()
                    .nome("Dra. Viviane Cardoso da Silva")
                    .email("viviane@fonosystem.com")
                    .senhaHash(passwordEncoder.encode("admin123"))
                    .perfil(Perfil.ADMIN)
                    .ativo(true)
                    .build());

            User carlos = userRepo.save(User.builder()
                    .nome("Dr. Carlos Mendes")
                    .email("carlos@fonosystem.com")
                    .senhaHash(passwordEncoder.encode("admin123"))
                    .perfil(Perfil.FONOAUDIOLOGO)
                    .ativo(true)
                    .build());

            // ---- PACIENTES ----
            Paciente arthur = pacienteRepo.save(Paciente.builder()
                    .nomeCompleto("Arthur Lima Santos")
                    .dataNascimento(LocalDate.of(2019, 3, 15))
                    .cpf("123.456.789-01").sexo("MASCULINO")
                    .telefone("(11) 98765-4321")
                    .nomeResponsavel("Carla Santos")
                    .telefoneResponsavel("(11) 98765-4321")
                    .convenio("Unimed").tipoAtendimento("CONVENIO")
                    .status("ATIVO").profissional(mariana)
                    .dataConsentimento(LocalDateTime.now())
                    .build());

            Paciente sofia = pacienteRepo.save(Paciente.builder()
                    .nomeCompleto("Sofia Rodrigues")
                    .dataNascimento(LocalDate.of(2021, 6, 22))
                    .cpf("234.567.890-12").sexo("FEMININO")
                    .telefone("(11) 91234-5678")
                    .nomeResponsavel("Ana Rodrigues")
                    .telefoneResponsavel("(11) 91234-5678")
                    .convenio("Bradesco Saúde").tipoAtendimento("CONVENIO")
                    .status("ATIVO").profissional(mariana)
                    .dataConsentimento(LocalDateTime.now())
                    .build());

            Paciente pedro = pacienteRepo.save(Paciente.builder()
                    .nomeCompleto("Pedro Henrique Costa")
                    .dataNascimento(LocalDate.of(2017, 11, 8))
                    .cpf("345.678.901-23").sexo("MASCULINO")
                    .telefone("(11) 97654-3210")
                    .nomeResponsavel("Marcos Costa")
                    .telefoneResponsavel("(11) 97654-3210")
                    .convenio("SulAmérica").tipoAtendimento("CONVENIO")
                    .status("ATIVO").profissional(mariana)
                    .dataConsentimento(LocalDateTime.now())
                    .build());

            pacienteRepo.save(Paciente.builder()
                    .nomeCompleto("Laura Mendes")
                    .dataNascimento(LocalDate.of(2022, 1, 14))
                    .cpf("456.789.012-34").sexo("FEMININO")
                    .telefone("(11) 96543-2109")
                    .nomeResponsavel("Fernanda Mendes")
                    .telefoneResponsavel("(11) 96543-2109")
                    .convenio("Amil").tipoAtendimento("CONVENIO")
                    .status("ATIVO").profissional(carlos)
                    .dataConsentimento(LocalDateTime.now())
                    .build());

            pacienteRepo.save(Paciente.builder()
                    .nomeCompleto("Miguel Oliveira")
                    .dataNascimento(LocalDate.of(2020, 8, 30))
                    .cpf("567.890.123-45").sexo("MASCULINO")
                    .telefone("(11) 95432-1098")
                    .nomeResponsavel("Roberto Oliveira")
                    .telefoneResponsavel("(11) 95432-1098")
                    .tipoAtendimento("PARTICULAR")
                    .status("ATIVO").profissional(carlos)
                    .dataConsentimento(LocalDateTime.now())
                    .build());

            pacienteRepo.save(Paciente.builder()
                    .nomeCompleto("Helena Barbosa")
                    .dataNascimento(LocalDate.of(2023, 4, 2))
                    .cpf("678.901.234-56").sexo("FEMININO")
                    .telefone("(11) 94321-0987")
                    .nomeResponsavel("Juliana Barbosa")
                    .telefoneResponsavel("(11) 94321-0987")
                    .convenio("Unimed").tipoAtendimento("CONVENIO")
                    .status("ATIVO").profissional(mariana)
                    .dataConsentimento(LocalDateTime.now())
                    .build());

            // ---- ANAMNESES ----
            anamneseRepo.save(Anamnese.builder()
                    .paciente(arthur).profissional(mariana)
                    .queixaPrincipal("Atraso na fala, dificuldade de interação social e comportamentos repetitivos.")
                    .historicoClinico("Nasceu a termo, sem intercorrências. Diagnóstico de TEA aos 3 anos.")
                    .desenvolvimentoLinguagem("Primeiras palavras aos 2 anos e meio. Vocabulário restrito.")
                    .diagnosticoTea("Sim").nivelEspectro("Nivel 2")
                    .usaCaa("Sim").tipoCaa("PECS + LetMeTalk")
                    .build());

            anamneseRepo.save(Anamnese.builder()
                    .paciente(sofia).profissional(mariana)
                    .queixaPrincipal("Deficiência auditiva severa bilateral, em reabilitação pós-ativação de IC.")
                    .historicoClinico("Perda auditiva detectada no teste da orelhinha. IC ativado em jan/2025.")
                    .desenvolvimentoLinguagem("Balbucio tardio. Responde a sons ambientais após IC.")
                    .tipoPerdaAuditiva("Neurossensorial").grauPerda("Severa")
                    .usaDispositivo("Sim").tipoDispositivo("Implante Coclear")
                    .dataAtivacao(LocalDate.of(2025, 1, 15))
                    .build());

            anamneseRepo.save(Anamnese.builder()
                    .paciente(pedro).profissional(mariana)
                    .queixaPrincipal("TEA nível 1 com perda auditiva leve. Dificuldade na articulação.")
                    .diagnosticoTea("Sim").nivelEspectro("Nivel 1")
                    .tipoPerdaAuditiva("Condutiva").usaDispositivo("Sim").tipoDispositivo("AASI")
                    .build());

            // ---- AVALIAÇÕES ----
            Avaliacao avalArthur = avaliacaoRepo.save(Avaliacao.builder()
                    .paciente(arthur).profissional(mariana)
                    .tipoAvaliacao("Avaliação Inicial").areaEspecialidade("TEA")
                    .instrumentoAvaliacao("CARS-2 + VB-MAPP")
                    .abordagemTerapeutica("ABA + PECS").sessoesPorSemana(3)
                    .dataAvaliacao(LocalDate.of(2026, 3, 15))
                    .hipoteseDiagnostica("TEA Nível 2 com comprometimento em comunicação funcional.")
                    .resultados("CARS-2: 38 (moderado). VB-MAPP: Mando nível 2, Tato nível 1.")
                    .build());

            Avaliacao avalSofia = avaliacaoRepo.save(Avaliacao.builder()
                    .paciente(sofia).profissional(mariana)
                    .tipoAvaliacao("Reavaliação").areaEspecialidade("Reab. Auditiva")
                    .instrumentoAvaliacao("IT-MAIS + Escala MUSS")
                    .abordagemTerapeutica("Aurioral").sessoesPorSemana(2)
                    .dataAvaliacao(LocalDate.of(2026, 4, 11))
                    .hipoteseDiagnostica("Reabilitação pós IC. Boa detecção de sons em campo aberto.")
                    .resultados("IT-MAIS: 72/40. MUSS: 8/10. Detecta voz humana a 2m.")
                    .build());

            // ---- PLANOS TERAPÊUTICOS ----
            planoRepo.save(PlanoTerapeutico.builder().avaliacao(avalArthur)
                    .objetivo("Uso espontâneo de CAA para pedido de objeto")
                    .estrategia("Treino com PECS fase III + reforço natural")
                    .prazo(LocalDate.of(2026, 6, 15)).progresso(45).status(StatusPlano.EM_ANDAMENTO).build());

            planoRepo.save(PlanoTerapeutico.builder().avaliacao(avalArthur)
                    .objetivo("Contato visual funcional por 3s em troca comunicativa")
                    .estrategia("DTT + NET com reforço diferencial")
                    .prazo(LocalDate.of(2026, 5, 30)).progresso(70).status(StatusPlano.EM_ANDAMENTO).build());

            planoRepo.save(PlanoTerapeutico.builder().avaliacao(avalArthur)
                    .objetivo("Tolerar 3 texturas alimentares novas")
                    .estrategia("Dessensibilização gradual + economia de fichas")
                    .prazo(LocalDate.of(2026, 7, 1)).progresso(100).status(StatusPlano.ATINGIDO).build());

            planoRepo.save(PlanoTerapeutico.builder().avaliacao(avalSofia)
                    .objetivo("Detectar sons do ambiente a 1m de distância com IC")
                    .estrategia("Treino de detecção com Ling-6 sounds")
                    .prazo(LocalDate.of(2026, 5, 15)).progresso(100).status(StatusPlano.ATINGIDO).build());

            planoRepo.save(PlanoTerapeutico.builder().avaliacao(avalSofia)
                    .objetivo("Discriminação de pares mínimos (CVC)")
                    .estrategia("Jogo de pares mínimos auditivos com figuras")
                    .prazo(LocalDate.of(2026, 7, 30)).progresso(40).status(StatusPlano.EM_ANDAMENTO).build());

            // ---- RELATÓRIOS DIÁRIOS (HOJE) ----
            LocalDate hoje = LocalDate.now();

            relatorioRepo.save(RelatorioDiario.builder()
                    .paciente(arthur).profissional(mariana)
                    .dataSessao(hoje).horaInicio(LocalTime.of(8, 0)).horaFim(LocalTime.of(9, 0))
                    .atividadesRealizadas("Pareamento PECS, rotina de lanche com nomeação, app para pedir brinquedo.")
                    .metaTrabalhada("Uso espontâneo de CAA para pedido de objeto")
                    .percentualAcerto(new BigDecimal("68.00")).nivelEngajamento((short) 4)
                    .usoCaaSessao(true).recursoCaaUtilizado("PECS + LetMeTalk")
                    .evolucaoObservada("3 pedidos espontâneos sem pista física. Melhor que semana anterior.")
                    .intercorrencias("Crise aos 40 min por troca de atividade. Resolvida com objeto de transição.")
                    .orientacoesFamilia("Disponibilizar tablet com app durante refeições para generalização.")
                    .build());

            relatorioRepo.save(RelatorioDiario.builder()
                    .paciente(sofia).profissional(mariana)
                    .dataSessao(hoje).horaInicio(LocalTime.of(10, 0)).horaFim(LocalTime.of(10, 50))
                    .atividadesRealizadas("Pares mínimos (pal/bal), figuras e nomeação auditiva sem pista visual.")
                    .metaTrabalhada("Discriminação de pares mínimos (CVC)")
                    .percentualAcerto(new BigDecimal("75.00"))
                    .respostaEstimulacaoAuditiva("Ling-6 a 1,5m consistente. Discriminação pal/bal: 80%.")
                    .evolucaoObservada("Ganho significativo na discriminação auditiva.")
                    .orientacoesFamilia("Manter IC em todas as atividades. Reforçar nomeação de objetos.")
                    .build());

            relatorioRepo.save(RelatorioDiario.builder()
                    .paciente(pedro).profissional(mariana)
                    .dataSessao(hoje).horaInicio(LocalTime.of(11, 0)).horaFim(LocalTime.of(11, 50))
                    .atividadesRealizadas("Treino articulatório com espelho, consciência fonológica, jogo de rimas.")
                    .metaTrabalhada("Produção correta do fonema /r/ em posição inicial")
                    .percentualAcerto(new BigDecimal("55.00")).nivelEngajamento((short) 5)
                    .usoCaaSessao(false)
                    .evolucaoObservada("Produziu /r/ inicial em 6 de 11 tentativas. Boa motivação.")
                    .orientacoesFamilia("Praticar palavras com /r/ inicial (rato, rei, rio, roda).")
                    .build());

            log.info("=== {} pacientes, 3 anamneses, 5 metas, 3 sessões criados ===",
                    pacienteRepo.count());
        };
    }
}
