-- V3: Tabela de anamneses
CREATE TABLE anamneses (
    id                      BIGSERIAL PRIMARY KEY,
    paciente_id             BIGINT    NOT NULL REFERENCES pacientes(id),
    profissional_id         BIGINT    NOT NULL REFERENCES users(id),

    -- Queixa e histórico
    queixa_principal        TEXT      NOT NULL,
    historico_clinico       TEXT,
    historico_familiar      TEXT,

    -- Desenvolvimento
    desenvolvimento_linguagem TEXT,
    desenvolvimento_motor     TEXT,

    -- Campos TEA
    diagnostico_tea         VARCHAR(20),
    nivel_espectro          VARCHAR(10),
    usa_caa                 VARCHAR(20),
    tipo_caa                VARCHAR(100),
    hipersensibilidades     TEXT,
    profissionais_acompanham TEXT,
    frequenta_escola        VARCHAR(30),

    -- Campos Auditiva
    tipo_perda_auditiva     VARCHAR(50),
    grau_perda              VARCHAR(30),
    usa_dispositivo         VARCHAR(30),
    tipo_dispositivo        VARCHAR(100),
    data_ativacao           DATE,
    marca_modelo            VARCHAR(100),

    -- Saúde geral
    alergias                TEXT,
    medicacoes              TEXT,

    -- Família
    nome_mae                VARCHAR(200),
    data_nasc_mae           VARCHAR(20),
    telefone_mae            VARCHAR(20),
    profissao_mae           VARCHAR(100),
    nome_pai                VARCHAR(200),
    data_nasc_pai           VARCHAR(20),
    telefone_pai            VARCHAR(20),
    profissao_pai           VARCHAR(100),
    irmaos                  TEXT,
    outros_familiares       TEXT,
    periodo_cuidadores      VARCHAR(100),

    -- Gestação e nascimento
    semanas_gestacao        VARCHAR(50),
    tipo_parto              VARCHAR(50),
    intercorrencias_parto   TEXT,
    teste_orelhinha         VARCHAR(50),
    teste_linguinha         VARCHAR(50),
    amamentacao_chupeta     TEXT,

    -- Histórico familiar
    hist_perda_auditiva               BOOLEAN DEFAULT FALSE,
    hist_transtornos_neurologicos     BOOLEAN DEFAULT FALSE,
    hist_convulsoes                   BOOLEAN DEFAULT FALSE,
    hist_malformacao_fetal            BOOLEAN DEFAULT FALSE,
    hist_gagueira                     BOOLEAN DEFAULT FALSE,
    hist_outros                       TEXT,

    -- Desenvolvimento motor
    idade_firmou_pescoco    VARCHAR(50),
    idade_sentou            VARCHAR(50),
    idade_engatinhou        VARCHAR(50),
    idade_andou             VARCHAR(50),
    mao_referencia          VARCHAR(50),
    anda_ponta_pe           VARCHAR(20),
    autonomia_vestir        VARCHAR(20),
    senta_w                 VARCHAR(20),

    -- Desenvolvimento de linguagem
    idade_balbuciou         VARCHAR(50),
    idade_primeiras_palavras VARCHAR(50),
    gagueja                 VARCHAR(20),
    comunicacao_atual       TEXT,
    trocas_fala             TEXT,

    -- Rotina
    rotina_sono             TEXT,
    rotina_alimentacao      TEXT,
    restricao_alimentar     TEXT,
    rotina_socializacao     TEXT,

    -- Metadados
    observacoes             TEXT,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_anamneses_paciente ON anamneses(paciente_id);
