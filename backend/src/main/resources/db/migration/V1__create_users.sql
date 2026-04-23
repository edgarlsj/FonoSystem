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
