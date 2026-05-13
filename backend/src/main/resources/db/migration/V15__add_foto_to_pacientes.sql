-- Adicionar suporte para fotos de pacientes
ALTER TABLE pacientes ADD COLUMN foto BYTEA;
ALTER TABLE pacientes ADD COLUMN foto_tipo_mime VARCHAR(50);
ALTER TABLE pacientes ADD COLUMN foto_tamanho_bytes BIGINT;

-- Índice para melhor performance ao buscar pacientes com foto
CREATE INDEX idx_pacientes_foto ON pacientes(id) WHERE foto IS NOT NULL;
