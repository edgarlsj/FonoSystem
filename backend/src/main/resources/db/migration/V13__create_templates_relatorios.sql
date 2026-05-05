-- V13: Tabela de templates de relatórios diários
CREATE TABLE templates_relatorios (
    id                              BIGSERIAL    PRIMARY KEY,
    profissional_id                 BIGINT       NOT NULL REFERENCES users(id),
    nome                            VARCHAR(200) NOT NULL,
    meta_trabalhada                 TEXT,
    atividades_realizadas           TEXT,
    evolucao_observada              TEXT,
    orientacoes_familia             TEXT,
    planejamento_proxima_sessao     TEXT,
    created_at                      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_profissional ON templates_relatorios(profissional_id);
