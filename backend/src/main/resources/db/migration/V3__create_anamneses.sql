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

    -- Metadados
    observacoes             TEXT,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_anamneses_paciente ON anamneses(paciente_id);
