-- Remove deprecated fields from relatorios_diarios table
ALTER TABLE relatorios_diarios DROP COLUMN percentual_acerto;
ALTER TABLE relatorios_diarios DROP COLUMN nivel_engajamento;
