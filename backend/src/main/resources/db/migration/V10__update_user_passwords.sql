-- V10: Atualizar usuários com senhas válidas para BCrypt strength 10
DELETE FROM users;

INSERT INTO users (nome, email, senha_hash, perfil, ativo)
VALUES (
    'Test User',
    'test@fonosystem.com',
    '$2a$10$nOUIs5kJ7naTuTFkWK1h.OPST9/PgBkqquzi.Ss7KqUgO8/LLH5Zm',
    'ADMIN',
    true
);

INSERT INTO users (nome, email, senha_hash, perfil, ativo)
VALUES (
    'Dra. Viviane Cardoso da Silva',
    'viviane@fonosystem.com',
    '$2a$10$nOUIs5kJ7naTuTFkWK1h.OPST9/PgBkqquzi.Ss7KqUgO8/LLH5Zm',
    'FONOAUDIOLOGO',
    true
);
