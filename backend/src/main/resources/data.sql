-- =============================================
-- DADOS SIMULADOS — FonoSystem (H2)
-- =============================================

-- Usuários são criados pelo DataInitializer.java
-- Login: viviane@fonosystem.com / admin123
-- Login: carlos@fonosystem.com / admin123

-- Pacientes
INSERT INTO pacientes (nome_completo, data_nascimento, cpf, sexo, telefone, nome_responsavel, telefone_responsavel, convenio, tipo_atendimento, status, profissional_id, data_consentimento) VALUES
('Arthur Lima Santos', '2019-03-15', '123.456.789-01', 'MASCULINO', '(11) 98765-4321', 'Carla Santos', '(11) 98765-4321', 'Unimed', 'CONVENIO', 'ATIVO', 1, CURRENT_TIMESTAMP);
INSERT INTO pacientes (nome_completo, data_nascimento, cpf, sexo, telefone, nome_responsavel, telefone_responsavel, convenio, tipo_atendimento, status, profissional_id, data_consentimento) VALUES
('Sofia Rodrigues', '2021-06-22', '234.567.890-12', 'FEMININO', '(11) 91234-5678', 'Ana Rodrigues', '(11) 91234-5678', 'Bradesco Saúde', 'CONVENIO', 'ATIVO', 1, CURRENT_TIMESTAMP);
INSERT INTO pacientes (nome_completo, data_nascimento, cpf, sexo, telefone, nome_responsavel, telefone_responsavel, convenio, tipo_atendimento, status, profissional_id, data_consentimento) VALUES
('Pedro Henrique Costa', '2017-11-08', '345.678.901-23', 'MASCULINO', '(11) 97654-3210', 'Marcos Costa', '(11) 97654-3210', 'SulAmérica', 'CONVENIO', 'ATIVO', 1, CURRENT_TIMESTAMP);
INSERT INTO pacientes (nome_completo, data_nascimento, cpf, sexo, telefone, nome_responsavel, telefone_responsavel, convenio, tipo_atendimento, status, profissional_id, data_consentimento) VALUES
('Laura Mendes', '2022-01-14', '456.789.012-34', 'FEMININO', '(11) 96543-2109', 'Fernanda Mendes', '(11) 96543-2109', 'Amil', 'CONVENIO', 'ATIVO', 2, CURRENT_TIMESTAMP);
INSERT INTO pacientes (nome_completo, data_nascimento, cpf, sexo, telefone, nome_responsavel, telefone_responsavel, tipo_atendimento, status, profissional_id, data_consentimento) VALUES
('Miguel Oliveira', '2020-08-30', '567.890.123-45', 'MASCULINO', '(11) 95432-1098', 'Roberto Oliveira', '(11) 95432-1098', 'PARTICULAR', 'ATIVO', 2, CURRENT_TIMESTAMP);
INSERT INTO pacientes (nome_completo, data_nascimento, cpf, sexo, telefone, nome_responsavel, telefone_responsavel, convenio, tipo_atendimento, status, profissional_id, data_consentimento) VALUES
('Helena Barbosa', '2023-04-02', '678.901.234-56', 'FEMININO', '(11) 94321-0987', 'Juliana Barbosa', '(11) 94321-0987', 'Unimed', 'CONVENIO', 'ATIVO', 1, CURRENT_TIMESTAMP);

-- Anamneses
INSERT INTO anamneses (paciente_id, profissional_id, queixa_principal, historico_clinico, desenvolvimento_linguagem, diagnostico_tea, nivel_espectro, usa_caa, tipo_caa) VALUES
(1, 1, 'Atraso na fala, dificuldade de interação social e comportamentos repetitivos.', 'Nasceu a termo, sem intercorrências. Diagnóstico de TEA aos 3 anos.', 'Primeiras palavras aos 2 anos e meio. Vocabulário restrito.', 'Sim', 'Nivel 2', 'Sim', 'PECS + LetMeTalk');
INSERT INTO anamneses (paciente_id, profissional_id, queixa_principal, historico_clinico, desenvolvimento_linguagem, tipo_perda_auditiva, grau_perda, usa_dispositivo, tipo_dispositivo, data_ativacao) VALUES
(2, 1, 'Deficiência auditiva severa bilateral, em reabilitação pós-ativação de implante coclear.', 'Perda auditiva detectada no teste da orelhinha. IC bilateral ativado em janeiro/2025.', 'Balbucio tardio. Responde a sons ambientais após IC.', 'Neurossensorial', 'Severa', 'Sim', 'Implante Coclear', '2025-01-15');
INSERT INTO anamneses (paciente_id, profissional_id, queixa_principal, diagnostico_tea, nivel_espectro, tipo_perda_auditiva, usa_dispositivo, tipo_dispositivo) VALUES
(3, 1, 'Diagnóstico de TEA nível 1 com perda auditiva leve. Dificuldade na articulação de fonemas.', 'Sim', 'Nivel 1', 'Condutiva', 'Sim', 'AASI');

-- Avaliações
INSERT INTO avaliacoes (paciente_id, profissional_id, tipo_avaliacao, area_especialidade, instrumento_avaliacao, abordagem_terapeutica, sessoes_por_semana, data_avaliacao, hipotese_diagnostica, resultados) VALUES
(1, 1, 'Avaliação Inicial', 'TEA', 'CARS-2 + VB-MAPP', 'ABA + PECS', 3, '2026-03-15', 'TEA Nível 2 com comprometimento em comunicação funcional e interação social.', 'CARS-2: Pontuação 38 (TEA moderado). VB-MAPP: Mando nível 2, Tato nível 1.');
INSERT INTO avaliacoes (paciente_id, profissional_id, tipo_avaliacao, area_especialidade, instrumento_avaliacao, abordagem_terapeutica, sessoes_por_semana, data_avaliacao, hipotese_diagnostica, resultados) VALUES
(2, 1, 'Reavaliação', 'Reabilitação Auditiva', 'IT-MAIS + Escala MUSS', 'Aurioral', 2, '2026-04-11', 'Deficiência auditiva severa bilateral em reabilitação pós IC. Boa detecção de sons em campo aberto.', 'IT-MAIS: 72/40 pontos. MUSS: 8/10. Detecta voz humana a 2m de distância.');

-- Planos Terapêuticos
INSERT INTO planos_terapeuticos (avaliacao_id, objetivo, estrategia, prazo, progresso, status) VALUES
(1, 'Uso espontâneo de CAA para pedido de objeto', 'Treino com PECS fase III + reforço natural', '2026-06-15', 45, 'EM_ANDAMENTO');
INSERT INTO planos_terapeuticos (avaliacao_id, objetivo, estrategia, prazo, progresso, status) VALUES
(1, 'Contato visual funcional por 3 segundos em troca comunicativa', 'DTT + NET com reforço diferencial', '2026-05-30', 70, 'EM_ANDAMENTO');
INSERT INTO planos_terapeuticos (avaliacao_id, objetivo, estrategia, prazo, progresso, status) VALUES
(1, 'Tolerar 3 texturas alimentares novas', 'Dessensibilização gradual + economia de fichas', '2026-07-01', 100, 'ATINGIDO');
INSERT INTO planos_terapeuticos (avaliacao_id, objetivo, estrategia, prazo, progresso, status) VALUES
(2, 'Detectar sons do ambiente a 1 metro de distância com IC', 'Treino de detecção com Ling-6 sounds', '2026-05-15', 100, 'ATINGIDO');
INSERT INTO planos_terapeuticos (avaliacao_id, objetivo, estrategia, prazo, progresso, status) VALUES
(2, 'Discriminação de pares mínimos (CVC)', 'Jogo de pares mínimos auditivos com figuras', '2026-07-30', 40, 'EM_ANDAMENTO');

-- Relatórios Diários — hoje
INSERT INTO relatorios_diarios (paciente_id, profissional_id, data_sessao, hora_inicio, hora_fim, atividades_realizadas, meta_trabalhada, percentual_acerto, nivel_engajamento, uso_caa_sessao, recurso_caa_utilizado, evolucao_observada, intercorrencias, orientacoes_familia) VALUES
(1, 1, CURRENT_DATE, '08:00', '09:00',
 'Jogo de pareamento com figuras do PECS, rotina de lanche com nomeação, uso do app para pedir brinquedo preferido.',
 'Uso espontâneo de CAA para pedido de objeto',
 68.00, 4, TRUE, 'PECS + LetMeTalk',
 'Iniciou 3 pedidos espontâneos com o app sem pista física. Melhor que na semana anterior (1 pedido espontâneo).',
 'Crise aos 40 min por troca de atividade. Resolvida com objeto de transição.',
 'Disponibilizar o tablet com o app durante as refeições para generalização.');

INSERT INTO relatorios_diarios (paciente_id, profissional_id, data_sessao, hora_inicio, hora_fim, atividades_realizadas, meta_trabalhada, percentual_acerto, resposta_estimulacao_auditiva, evolucao_observada, orientacoes_familia) VALUES
(2, 1, CURRENT_DATE, '10:00', '10:50',
 'Jogo de pares mínimos (pal/bal, faz/vaz), atividade com figuras e nomeação auditiva sem pista visual.',
 'Discriminação de pares mínimos (CVC)',
 75.00,
 'Resposta consistente para sons de Ling-6 a 1,5m. Discriminação pal/bal: 80%. Reconhecimento de nome sem pista visual: consistente.',
 'Ganho significativo na discriminação auditiva. Resposta consistente ao nome sem pista visual.',
 'Manter uso do IC durante todas as atividades em casa. Reforçar nomeação de objetos do cotidiano.');

INSERT INTO relatorios_diarios (paciente_id, profissional_id, data_sessao, hora_inicio, hora_fim, atividades_realizadas, meta_trabalhada, percentual_acerto, nivel_engajamento, uso_caa_sessao, evolucao_observada, orientacoes_familia) VALUES
(3, 1, CURRENT_DATE, '11:00', '11:50',
 'Treino articulatório com espelho, atividade de consciência fonológica, jogo de rimas.',
 'Produção correta do fonema /r/ em posição inicial',
 55.00, 5, FALSE,
 'Conseguiu produzir /r/ inicial em 6 de 11 tentativas. Boa motivação com jogo de rimas.',
 'Praticar palavras com /r/ inicial durante brincadeiras em casa (rato, rei, rio, roda).');
