-- V11: Fix nome_completo column type in pacientes table
-- Change from bytea to VARCHAR to allow lower() function in queries

ALTER TABLE pacientes
ALTER COLUMN nome_completo TYPE VARCHAR(200) USING nome_completo::text;
