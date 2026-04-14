CREATE TABLE prescricoes (
    id              BIGSERIAL       PRIMARY KEY,
    paciente_id     BIGINT          NOT NULL REFERENCES pacientes(id),
    profissional_id BIGINT          NOT NULL REFERENCES users(id),
    data_prescricao DATE            NOT NULL,
    titulo          VARCHAR(255)    NOT NULL,
    descricao_exercicios TEXT       NOT NULL,
    observacoes     TEXT,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescricoes_paciente ON prescricoes(paciente_id);
CREATE INDEX idx_prescricoes_profissional ON prescricoes(profissional_id);
