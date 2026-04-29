package br.com.fonosystem.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("LoginRequest — Validação de campos obrigatórios")
class LoginRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Request válido não deve ter violações")
    void requestValido_SemViolacoes() {
        LoginRequest r = new LoginRequest("user@test.com", "senha123");
        assertTrue(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("email null deve gerar violação")
    void email_Null() {
        LoginRequest r = new LoginRequest(null, "senha123");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("email em branco deve gerar violação")
    void email_Blank() {
        LoginRequest r = new LoginRequest("  ", "senha123");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("email inválido deve gerar violação")
    void email_Invalido() {
        LoginRequest r = new LoginRequest("nao-e-email", "senha123");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("senha null deve gerar violação")
    void senha_Null() {
        LoginRequest r = new LoginRequest("user@test.com", null);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("senha em branco deve gerar violação")
    void senha_Blank() {
        LoginRequest r = new LoginRequest("user@test.com", "   ");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("Request vazio deve ter violações em email e senha")
    void requestVazio_MultiViolacoes() {
        LoginRequest r = new LoginRequest(null, null);
        Set<ConstraintViolation<LoginRequest>> v = validator.validate(r);
        assertTrue(v.size() >= 2, "Deveria ter ao menos 2 violações, encontrou: " + v.size());
    }
}
