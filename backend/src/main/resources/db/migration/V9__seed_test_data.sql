-- V9: Dados de teste iniciais
-- Vinculando dados à Dra. Viviane (assumindo que o ID dela seja 2, ou buscando pelo email)

DO $$
DECLARE
    v_id_viviane BIGINT;
    v_id_arthur BIGINT;
    v_id_sofia BIGINT;
    v_id_pedro BIGINT;
    v_id_aval_arthur BIGINT;
    v_id_aval_sofia BIGINT;
BEGIN
    SELECT id INTO v_id_viviane FROM users WHERE email = 'viviane@fonosystem.com';

    IF v_id_viviane IS NULL THEN
        RAISE NOTICE 'Usuário viviane@fonosystem.com não encontrado, pulando seed de dados.';
        RETURN;
    END IF;

    -- PACIENTES
    INSERT INTO pacientes (nome_completo, data_nascimento, cpf, sexo, telefone, nome_responsavel, telefone_responsavel, convenio, tipo_atendimento, status, profissional_id, data_consentimento)
    VALUES ('Arthur Lima Santos', '2019-03-15', '123.456.789-01', 'MASCULINO', '(11) 98765-4321', 'Carla Santos', '(11) 98765-4321', 'Unimed', 'CONVENIO', 'ATIVO', v_id_viviane, NOW())
    RETURNING id INTO v_id_arthur;

    INSERT INTO pacientes (nome_completo, data_nascimento, cpf, sexo, telefone, nome_responsavel, telefone_responsavel, convenio, tipo_atendimento, status, profissional_id, data_consentimento)
    VALUES ('Sofia Rodrigues', '2021-06-22', '234.567.890-12', 'FEMININO', '(11) 91234-5678', 'Ana Rodrigues', '(11) 91234-5678', 'Bradesco Saúde', 'CONVENIO', 'ATIVO', v_id_viviane, NOW())
    RETURNING id INTO v_id_sofia;

    INSERT INTO pacientes (nome_completo, data_nascimento, cpf, sexo, telefone, nome_responsavel, telefone_responsavel, convenio, tipo_atendimento, status, profissional_id, data_consentimento)
    VALUES ('Pedro Henrique Costa', '2017-11-08', '345.678.901-23', 'MASCULINO', '(11) 97654-3210', 'Marcos Costa', '(11) 97654-3210', 'SulAmérica', 'CONVENIO', 'ATIVO', v_id_viviane, NOW())
    RETURNING id INTO v_id_pedro;

    -- ANAMNESES
    INSERT INTO anamneses (paciente_id, profissional_id, queixa_principal, historico_clinico, desenvolvimento_linguagem, diagnostico_tea, nivel_espectro, usa_caa, tipo_caa)
    VALUES (v_id_arthur, v_id_viviane, 'Atraso na fala e dificuldade de integração.', 'Nasceu a termo. TEA aos 3 anos.', 'Primeiras palavras aos 2 anos e meio.', 'Sim', 'Nivel 2', 'Sim', 'PECS');

    INSERT INTO anamneses (paciente_id, profissional_id, queixa_principal, historico_clinico, desenvolvimento_linguagem, tipo_perda_auditiva, grau_perda, usa_dispositivo, tipo_dispositivo, data_ativacao)
    VALUES (v_id_sofia, v_id_viviane, 'Deficiência auditiva severa bilateral.', 'Perda detectada no teste da orelhinha.', 'Balbucio tardio.', 'Neurossensorial', 'Severa', 'Sim', 'Implante Coclear', '2025-01-15');

    -- AVALIAÇÕES
    INSERT INTO avaliacoes (paciente_id, profissional_id, tipo_avaliacao, area_especialidade, instrumento_avaliacao, abordagem_terapeutica, sessoes_por_semana, data_avaliacao, hipotese_diagnostica, resultados)
    VALUES (v_id_arthur, v_id_viviane, 'Avaliação Inicial', 'TEA', 'VB-MAPP', 'ABA', 3, '2026-03-15', 'TEA Nível 2', 'Mando nível 2, Tato nível 1.')
    RETURNING id INTO v_id_aval_arthur;

    INSERT INTO avaliacoes (paciente_id, profissional_id, tipo_avaliacao, area_especialidade, instrumento_avaliacao, abordagem_terapeutica, sessoes_por_semana, data_avaliacao, hipotese_diagnostica, resultados)
    VALUES (v_id_sofia, v_id_viviane, 'Reavaliação', 'Reab. Auditiva', 'IT-MAIS', 'Aurioral', 2, '2026-04-11', 'Reabilitação pós IC', 'Detecta voz humana a 2m.')
    RETURNING id INTO v_id_aval_sofia;

    -- PLANOS TERAPÊUTICOS
    INSERT INTO planos_terapeuticos (avaliacao_id, objetivo, estrategia, prazo, progresso, status)
    VALUES (v_id_aval_arthur, 'Uso espontâneo de CAA', 'Treino com PECS', '2026-06-15', 45, 'EM_ANDAMENTO');

    INSERT INTO planos_terapeuticos (avaliacao_id, objetivo, estrategia, prazo, progresso, status)
    VALUES (v_id_aval_sofia, 'Detectar sons do ambiente', 'Ling-6 sounds', '2026-05-15', 100, 'ATINGIDO');

    -- RELATÓRIOS DIÁRIOS
    INSERT INTO relatorios_diarios (paciente_id, profissional_id, data_sessao, hora_inicio, hora_fim, atividades_realizadas, meta_trabalhada, percentual_acerto, nivel_engajamento, uso_caa_sessao, evolucao_observada)
    VALUES (v_id_arthur, v_id_viviane, CURRENT_DATE, '08:00', '09:00', 'Pareamento PECS e rotina de lanche.', 'Uso espontâneo de CAA', 68.00, 4, true, 'Melhor que semana anterior.');

    INSERT INTO relatorios_diarios (paciente_id, profissional_id, data_sessao, hora_inicio, hora_fim, atividades_realizadas, meta_trabalhada, percentual_acerto, nivel_engajamento, uso_caa_sessao, resposta_estimulacao_auditiva)
    VALUES (v_id_sofia, v_id_viviane, CURRENT_DATE, '10:00', '10:50', 'Pares mínimos e nomeação auditiva.', 'Discriminação de pares mínimos', 75.00, 5, false, 'Ling-6 a 1,5m consistente.');

END $$;
