-- V4: Tabela de avaliações
CREATE TABLE avaliacoes (
    id                    BIGSERIAL    PRIMARY KEY,
    paciente_id           BIGINT       NOT NULL REFERENCES pacientes(id),
    profissional_id       BIGINT       NOT NULL REFERENCES users(id),
    tipo_avaliacao        VARCHAR(30)  NOT NULL,
    area_especialidade    VARCHAR(30)  NOT NULL,
    instrumento_avaliacao VARCHAR(200),
    abordagem_terapeutica VARCHAR(50),
    sessoes_por_semana    INTEGER      DEFAULT 2,
    data_avaliacao        DATE         NOT NULL,
    hipotese_diagnostica  TEXT,
    resultados            TEXT,
    orientacoes_familia   TEXT,
    observacoes           TEXT,
    created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_avaliacoes_paciente ON avaliacoes(paciente_id);
