CREATE TABLE agendamentos (
    id                BIGSERIAL PRIMARY KEY,
    paciente_id       BIGINT       NOT NULL REFERENCES pacientes(id),
    profissional_id   BIGINT       NOT NULL REFERENCES users(id),
    data_hora_inicio  TIMESTAMP    NOT NULL,
    duracao           INTEGER      NOT NULL DEFAULT 50,
    status            VARCHAR(20)  NOT NULL DEFAULT 'AGENDADO',
    observacoes       TEXT,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMP
);

CREATE INDEX idx_agendamentos_paciente     ON agendamentos(paciente_id);
CREATE INDEX idx_agendamentos_profissional ON agendamentos(profissional_id);
CREATE INDEX idx_agendamentos_data         ON agendamentos(data_hora_inicio);
