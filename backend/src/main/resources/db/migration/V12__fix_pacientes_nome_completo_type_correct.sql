-- V12: Fix nome_completo column type - correct version
-- Previous V11 failed, this uses correct PostgreSQL syntax

ALTER TABLE pacientes
ALTER COLUMN nome_completo SET DATA TYPE VARCHAR(200);
