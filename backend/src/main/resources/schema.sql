-- Schema para H2 (MODE=PostgreSQL)
-- Users
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(150) NOT NULL,
    email       VARCHAR(200) NOT NULL UNIQUE,
    senha_hash  VARCHAR(255) NOT NULL,
    perfil      VARCHAR(20)  NOT NULL DEFAULT 'FONOAUDIOLOGO',
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
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
    created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at            TIMESTAMP
);

-- Anamneses
CREATE TABLE IF NOT EXISTS anamneses (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    paciente_id             BIGINT    NOT NULL REFERENCES pacientes(id),
    profissional_id         BIGINT    NOT NULL REFERENCES users(id),
    queixa_principal        CLOB      NOT NULL,
    historico_clinico       CLOB,
    historico_familiar      CLOB,
    desenvolvimento_linguagem CLOB,
    desenvolvimento_motor     CLOB,
    diagnostico_tea         VARCHAR(20),
    nivel_espectro          VARCHAR(10),
    usa_caa                 VARCHAR(20),
    tipo_caa                VARCHAR(100),
    hipersensibilidades     CLOB,
    profissionais_acompanham CLOB,
    frequenta_escola        VARCHAR(30),
    tipo_perda_auditiva     VARCHAR(50),
    grau_perda              VARCHAR(30),
    usa_dispositivo         VARCHAR(30),
    tipo_dispositivo        VARCHAR(100),
    data_ativacao           DATE,
    marca_modelo            VARCHAR(100),
    observacoes             CLOB,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    paciente_id           BIGINT       NOT NULL REFERENCES pacientes(id),
    profissional_id       BIGINT       NOT NULL REFERENCES users(id),
    tipo_avaliacao        VARCHAR(30)  NOT NULL,
    area_especialidade    VARCHAR(30)  NOT NULL,
    instrumento_avaliacao VARCHAR(200),
    abordagem_terapeutica VARCHAR(50),
    sessoes_por_semana    INTEGER      DEFAULT 2,
    data_avaliacao        DATE         NOT NULL,
    hipotese_diagnostica  CLOB,
    resultados            CLOB,
    orientacoes_familia   CLOB,
    observacoes           CLOB,
    created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Planos Terapêuticos
CREATE TABLE IF NOT EXISTS planos_terapeuticos (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    avaliacao_id   BIGINT      NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
    objetivo       CLOB        NOT NULL,
    estrategia     CLOB,
    prazo          DATE,
    progresso      INTEGER     DEFAULT 0,
    status         VARCHAR(20) NOT NULL DEFAULT 'EM_ANDAMENTO',
    created_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Relatórios Diários
CREATE TABLE IF NOT EXISTS relatorios_diarios (
    id                             BIGINT AUTO_INCREMENT PRIMARY KEY,
    paciente_id                    BIGINT       NOT NULL REFERENCES pacientes(id),
    profissional_id                BIGINT       NOT NULL REFERENCES users(id),
    data_sessao                    DATE         NOT NULL,
    hora_inicio                    TIME         NOT NULL,
    hora_fim                       TIME         NOT NULL,
    atividades_realizadas          CLOB         NOT NULL,
    meta_trabalhada                CLOB         NOT NULL,
    percentual_acerto              DECIMAL(5,2),
    nivel_engajamento              SMALLINT,
    uso_caa_sessao                 BOOLEAN      DEFAULT FALSE,
    recurso_caa_utilizado          VARCHAR(100),
    resposta_estimulacao_auditiva  CLOB,
    evolucao_observada             CLOB,
    intercorrencias                CLOB,
    orientacoes_familia            CLOB,
    planejamento_proxima_sessao    CLOB,
    created_at                     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
