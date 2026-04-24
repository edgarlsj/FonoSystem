-- V18: Converter CPFs vazios em NULL e remover duplicados
-- Primeiro, converter strings vazias em NULL
UPDATE pacientes SET cpf = NULL WHERE cpf = '' OR cpf IS NULL;

-- Remover duplicate empty CPF entries (soft delete, keep only the first one)
WITH cte AS (
    SELECT id,
           ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM pacientes
    WHERE cpf IS NULL AND deleted_at IS NULL
)
UPDATE pacientes
SET deleted_at = NOW()
WHERE id IN (SELECT id FROM cte WHERE rn > 1);

-- Drop old indexes and constraints
DROP INDEX IF EXISTS pacientes_cpf_key;
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_cpf_unique;
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_cpf_key;

-- Create new index that allows multiple NULL values
CREATE UNIQUE INDEX pacientes_cpf_key ON pacientes(cpf) WHERE cpf IS NOT NULL AND deleted_at IS NULL;
