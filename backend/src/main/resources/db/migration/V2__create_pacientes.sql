-- V2: Tabela de pacientes
CREATE TABLE pacientes (
    id                    BIGSERIAL    PRIMARY KEY,
    nome_completo         VARCHAR(200) NOT NULL,
    data_nascimento       DATE         NOT NULL,
    cpf                   VARCHAR(14)  UNIQUE,
    sexo                  VARCHAR(10)  NOT NULL,
    telefone              VARCHAR(20),
    email                 VARCHAR(200),
    nome_responsavel      VARCHAR(200) NOT NULL,
    telefone_responsavel  VARCHAR(20)  NOT NULL,
    email_responsavel     VARCHAR(200),
    grau_parentesco       VARCHAR(50),
    convenio              VARCHAR(100),
    numero_convenio       VARCHAR(50),
    tipo_atendimento      VARCHAR(20)  NOT NULL DEFAULT 'CONVENIO',
    status                VARCHAR(10)  NOT NULL DEFAULT 'ATIVO',
    data_consentimento    TIMESTAMP,
    profissional_id       BIGINT       REFERENCES users(id),
    created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted_at            TIMESTAMP
);

CREATE INDEX idx_pacientes_nome ON pacientes(nome_completo);
CREATE INDEX idx_pacientes_status ON pacientes(status);
CREATE INDEX idx_pacientes_profissional ON pacientes(profissional_id);
