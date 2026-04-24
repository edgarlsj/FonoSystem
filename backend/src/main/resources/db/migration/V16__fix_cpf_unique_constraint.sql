-- Remove a constraint UNIQUE que não permite múltiplos NULLs
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_cpf_key;

-- Cria um índice UNIQUE que ignora NULLs (permite múltiplos registros com CPF nulo)
CREATE UNIQUE INDEX pacientes_cpf_key ON pacientes(cpf) WHERE cpf IS NOT NULL;
