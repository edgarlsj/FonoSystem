-- V9: Tabela de protocolos de avaliação
CREATE TABLE protocolos_avaliacao (
    id              BIGSERIAL PRIMARY KEY,
    paciente_id     BIGINT NOT NULL REFERENCES pacientes(id),
    profissional_id BIGINT NOT NULL REFERENCES users(id),
    tipo            VARCHAR(10) NOT NULL,
    data_aplicacao  DATE NOT NULL,
    observacoes     TEXT,
    resultado_json  TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_protocolos_paciente ON protocolos_avaliacao(paciente_id);
