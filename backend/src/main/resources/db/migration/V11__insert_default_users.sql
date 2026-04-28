-- V11: Usuários padrão do sistema (admin123)
INSERT INTO users (nome, email, senha_hash, perfil, ativo)
VALUES
    ('Administrator',              'admin@fonosystem.com',   '$2a$10$zfKVTy0SnVSGdnfQxvLZLOTnJJwHb5EtL6h.B7PFQq4M8eevMOlCK', 'ADMIN',          true),
    ('Dra. Viviane Cardoso da Silva', 'viviane@fonosystem.com', '$2a$10$zfKVTy0SnVSGdnfQxvLZLOTnJJwHb5EtL6h.B7PFQq4M8eevMOlCK', 'FONOAUDIOLOGO', true)
ON CONFLICT (email) DO NOTHING;
