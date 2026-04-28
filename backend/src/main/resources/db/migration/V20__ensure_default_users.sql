-- V11: Garantir que usuários padrão existem com senha correta (admin123)
-- Hash BCrypt de "admin123" com strength 10: $2a$10$zfKVTy0SnVSGdnfQxvLZLOTnJJwHb5EtL6h.B7PFQq4M8eevMOlCK

DELETE FROM users WHERE email IN ('test@fonosystem.com', 'viviane@fonosystem.com');

INSERT INTO users (nome, email, senha_hash, perfil, ativo)
VALUES (
    'Administrator',
    'admin@fonosystem.com',
    '$2a$10$zfKVTy0SnVSGdnfQxvLZLOTnJJwHb5EtL6h.B7PFQq4M8eevMOlCK',
    'ADMIN',
    true
);

INSERT INTO users (nome, email, senha_hash, perfil, ativo)
VALUES (
    'Dra. Viviane Cardoso da Silva',
    'viviane@fonosystem.com',
    '$2a$10$zfKVTy0SnVSGdnfQxvLZLOTnJJwHb5EtL6h.B7PFQq4M8eevMOlCK',
    'FONOAUDIOLOGO',
    true
);
