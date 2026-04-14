-- V6: Tabela de relatórios diários
CREATE TABLE relatorios_diarios (
    id                             BIGSERIAL    PRIMARY KEY,
    paciente_id                    BIGINT       NOT NULL REFERENCES pacientes(id),
    profissional_id                BIGINT       NOT NULL REFERENCES users(id),
    data_sessao                    DATE         NOT NULL,
    hora_inicio                    TIME         NOT NULL,
    hora_fim                       TIME         NOT NULL,
    atividades_realizadas          TEXT         NOT NULL,
    meta_trabalhada                TEXT         NOT NULL,

    -- TEA
    percentual_acerto              DECIMAL(5,2),
    nivel_engajamento              SMALLINT,
    uso_caa_sessao                 BOOLEAN      DEFAULT FALSE,
    recurso_caa_utilizado          VARCHAR(100),

    -- Auditiva
    resposta_estimulacao_auditiva  TEXT,

    -- Evolução
    evolucao_observada             TEXT,
    intercorrencias                TEXT,
    orientacoes_familia            TEXT,
    planejamento_proxima_sessao    TEXT,

    created_at                     TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at                     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_relatorios_paciente ON relatorios_diarios(paciente_id);
CREATE INDEX idx_relatorios_data ON relatorios_diarios(data_sessao);
CREATE INDEX idx_relatorios_profissional ON relatorios_diarios(profissional_id);
