-- V14: Tabela de documentos
CREATE TABLE documentos (
    id                      BIGSERIAL    PRIMARY KEY,
    paciente_id             BIGINT       NOT NULL REFERENCES pacientes(id),
    profissional_id         BIGINT       NOT NULL REFERENCES users(id),
    nome_arquivo            VARCHAR(200) NOT NULL,
    nome_profissional       VARCHAR(200) NOT NULL,
    especialidade           VARCHAR(100),
    descricao               TEXT,
    tipo_mime               VARCHAR(50),
    tamanho_bytes           BIGINT,
    conteudo                BYTEA,
    data_anexacao           TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documentos_paciente ON documentos(paciente_id);
CREATE INDEX idx_documentos_profissional ON documentos(profissional_id);
CREATE INDEX idx_documentos_data ON documentos(data_anexacao);
