-- Adicionar campos de endereco e contato na tabela pacientes
ALTER TABLE pacientes
    ADD COLUMN endereco VARCHAR(255),
    ADD COLUMN bairro VARCHAR(100),
    ADD COLUMN cidade_uf VARCHAR(100),
    ADD COLUMN contato_emergencia VARCHAR(100);

-- Adicionar novos campos detalhados na tabela anamneses
ALTER TABLE anamneses
    ADD COLUMN alergias TEXT,
    ADD COLUMN medicacoes TEXT,
    
    ADD COLUMN nome_mae VARCHAR(200),
    ADD COLUMN data_nasc_mae VARCHAR(20),
    ADD COLUMN telefone_mae VARCHAR(20),
    ADD COLUMN profissao_mae VARCHAR(100),
    
    ADD COLUMN nome_pai VARCHAR(200),
    ADD COLUMN data_nasc_pai VARCHAR(20),
    ADD COLUMN telefone_pai VARCHAR(20),
    ADD COLUMN profissao_pai VARCHAR(100),
    
    ADD COLUMN irmaos TEXT,
    ADD COLUMN outros_familiares TEXT,
    ADD COLUMN periodo_cuidadores VARCHAR(100),
    
    ADD COLUMN semanas_gestacao VARCHAR(50),
    ADD COLUMN tipo_parto VARCHAR(50),
    ADD COLUMN intercorrencias_parto TEXT,
    ADD COLUMN teste_orelhinha VARCHAR(50),
    ADD COLUMN teste_linguinha VARCHAR(50),
    ADD COLUMN amamentacao_chupeta TEXT,
    
    ADD COLUMN hist_perda_auditiva BOOLEAN DEFAULT FALSE,
    ADD COLUMN hist_transtornos_neurologicos BOOLEAN DEFAULT FALSE,
    ADD COLUMN hist_convulsoes BOOLEAN DEFAULT FALSE,
    ADD COLUMN hist_malformacao_fetal BOOLEAN DEFAULT FALSE,
    ADD COLUMN hist_gagueira BOOLEAN DEFAULT FALSE,
    ADD COLUMN hist_outros TEXT,
    
    ADD COLUMN idade_firmou_pescoco VARCHAR(50),
    ADD COLUMN idade_sentou VARCHAR(50),
    ADD COLUMN idade_engatinhou VARCHAR(50),
    ADD COLUMN idade_andou VARCHAR(50),
    ADD COLUMN mao_referencia VARCHAR(50),
    ADD COLUMN anda_ponta_pe VARCHAR(20),
    ADD COLUMN autonomia_vestir VARCHAR(20),
    ADD COLUMN senta_w VARCHAR(20),
    
    ADD COLUMN idade_balbuciou VARCHAR(50),
    ADD COLUMN idade_primeiras_palavras VARCHAR(50),
    ADD COLUMN gagueja VARCHAR(20),
    ADD COLUMN comunicacao_atual TEXT,
    ADD COLUMN trocas_fala TEXT,
    
    ADD COLUMN rotina_sono TEXT,
    ADD COLUMN rotina_alimentacao TEXT,
    ADD COLUMN restricao_alimentar TEXT,
    ADD COLUMN rotina_socializacao TEXT;
