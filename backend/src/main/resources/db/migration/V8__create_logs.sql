CREATE TABLE logs (
    id BIGSERIAL PRIMARY KEY,
    acao VARCHAR(50) NOT NULL,
    entidade VARCHAR(50) NOT NULL,
    entidade_id BIGINT NOT NULL,
    descricao TEXT,
    detalhes TEXT,
    usuario_id BIGINT,
    ip_address VARCHAR(50),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    observacoes TEXT,
    FOREIGN KEY (usuario_id) REFERENCES users(id)
);

CREATE INDEX idx_logs_usuario ON logs(usuario_id);
CREATE INDEX idx_logs_entidade ON logs(entidade);
CREATE INDEX idx_logs_acao ON logs(acao);
CREATE INDEX idx_logs_data ON logs(data_criacao);
