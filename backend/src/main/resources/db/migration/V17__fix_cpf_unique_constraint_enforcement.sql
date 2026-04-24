-- V17: Remover constraint UNIQUE antiga de CPF e criar índice que permite múltiplos NULLs
-- Drop all existing constraints and indexes on pacientes.cpf
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_cpf_unique;
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_cpf_key;
DROP INDEX IF EXISTS pacientes_cpf_key;

-- Remove duplicate empty CPF entries (keep only the first one, soft delete others)
WITH cte AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY (CASE WHEN cpf IS NULL OR cpf = '' THEN 1 ELSE 0 END) ORDER BY id) AS rn
    FROM pacientes
    WHERE cpf IS NULL OR cpf = ''
)
UPDATE pacientes
SET deleted_at = NOW()
WHERE id IN (SELECT id FROM cte WHERE rn > 1 AND (cpf IS NULL OR cpf = ''));

-- Create new index that allows multiple NULL values
CREATE UNIQUE INDEX pacientes_cpf_key ON pacientes(cpf) WHERE cpf IS NOT NULL AND deleted_at IS NULL;
