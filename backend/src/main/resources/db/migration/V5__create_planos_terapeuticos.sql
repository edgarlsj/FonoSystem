-- V5: Tabela de planos terapêuticos
CREATE TABLE planos_terapeuticos (
    id             BIGSERIAL   PRIMARY KEY,
    avaliacao_id   BIGINT      NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
    objetivo       TEXT        NOT NULL,
    estrategia     TEXT,
    prazo          DATE,
    progresso      INTEGER     DEFAULT 0,
    status         VARCHAR(20) NOT NULL DEFAULT 'EM_ANDAMENTO',
    created_at     TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_planos_avaliacao ON planos_terapeuticos(avaliacao_id);
