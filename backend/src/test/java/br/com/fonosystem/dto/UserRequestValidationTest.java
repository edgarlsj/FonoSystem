package br.com.fonosystem.dto;

import br.com.fonosystem.model.enums.Perfil;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("UserRequest — Validação de campos obrigatórios")
class UserRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private UserRequest criarRequestValido() {
        return UserRequest.builder()
                .nome("Maria Fonoaudióloga")
                .email("maria@fonosystem.com")
                .senha("senhasegura123")
                .perfil(Perfil.FONOAUDIOLOGO)
                .build();
    }

    @Test
    @DisplayName("Request válido não deve ter violações")
    void requestValido_SemViolacoes() {
        assertTrue(validator.validate(criarRequestValido()).isEmpty());
    }

    @Test
    @DisplayName("nome null deve gerar violação")
    void nome_Null() {
        UserRequest r = criarRequestValido();
        r.setNome(null);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("nome em branco deve gerar violação")
    void nome_Blank() {
        UserRequest r = criarRequestValido();
        r.setNome("  ");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("nome com menos de 3 caracteres deve gerar violação")
    void nome_MuitoCurto() {
        UserRequest r = criarRequestValido();
        r.setNome("AB");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("email null deve gerar violação")
    void email_Null() {
        UserRequest r = criarRequestValido();
        r.setEmail(null);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("email em branco deve gerar violação")
    void email_Blank() {
        UserRequest r = criarRequestValido();
        r.setEmail("  ");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("email inválido deve gerar violação")
    void email_Invalido() {
        UserRequest r = criarRequestValido();
        r.setEmail("nao-e-email");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("perfil null deve gerar violação")
    void perfil_Null() {
        UserRequest r = criarRequestValido();
        r.setPerfil(null);
        Set<ConstraintViolation<UserRequest>> v = validator.validate(r);
        assertFalse(v.isEmpty());
        assertTrue(v.stream().anyMatch(vi -> vi.getPropertyPath().toString().equals("perfil")));
    }

    @Test
    @DisplayName("senha com menos de 8 caracteres deve gerar violação")
    void senha_MuitoCurta() {
        UserRequest r = criarRequestValido();
        r.setSenha("1234567");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("senha null deve ser aceita (para update sem alterar senha)")
    void senha_Null_Aceita() {
        UserRequest r = criarRequestValido();
        r.setSenha(null);
        Set<ConstraintViolation<UserRequest>> v = validator.validate(r);
        assertTrue(v.stream().noneMatch(vi -> vi.getPropertyPath().toString().equals("senha")));
    }

    @Test
    @DisplayName("Request vazio deve ter múltiplas violações")
    void requestVazio_MultiViolacoes() {
        UserRequest r = UserRequest.builder().build();
        Set<ConstraintViolation<UserRequest>> v = validator.validate(r);
        // nome, email, perfil
        assertTrue(v.size() >= 3, "Deveria ter ao menos 3 violações, encontrou: " + v.size());
    }
}
