-- V1: Tabela de usuários do sistema
CREATE TABLE users (
    id          BIGSERIAL    PRIMARY KEY,
    nome        VARCHAR(150) NOT NULL,
    email       VARCHAR(200) NOT NULL UNIQUE,
    senha_hash  VARCHAR(255) NOT NULL,
    perfil      VARCHAR(20)  NOT NULL DEFAULT 'FONOAUDIOLOGO',
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Usuário admin padrão (senha: admin123)
INSERT INTO users (nome, email, senha_hash, perfil)
VALUES ('Dra. Viviane Cardoso da Silva', 'viviane@fonosystem.com',
        '$2a$12$LJ3mFGMBJxHGq3Y5ZN1RVuqJGhKF.1xBx8xvTiXxJx6HJB5FZWF9a',
        'ADMIN');
