package br.com.fonosystem.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("AnamneseRequest — Validação de campos obrigatórios")
class AnamneseRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private AnamneseRequest criarRequestValido() {
        AnamneseRequest request = new AnamneseRequest();
        request.setQueixaPrincipal("Dificuldade de comunicação verbal");
        return request;
    }

    @Test
    @DisplayName("Request válido não deve ter violações")
    void requestValido_SemViolacoes() {
        Set<ConstraintViolation<AnamneseRequest>> v = validator.validate(criarRequestValido());
        assertTrue(v.isEmpty(), "Não deveria ter violações: " + v);
    }

    @Test
    @DisplayName("queixaPrincipal null deve gerar violação")
    void queixaPrincipal_Null() {
        AnamneseRequest r = criarRequestValido();
        r.setQueixaPrincipal(null);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("queixaPrincipal em branco deve gerar violação")
    void queixaPrincipal_Blank() {
        AnamneseRequest r = criarRequestValido();
        r.setQueixaPrincipal("   ");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("queixaPrincipal excedendo 1000 caracteres deve gerar violação")
    void queixaPrincipal_MuitoLonga() {
        AnamneseRequest r = criarRequestValido();
        r.setQueixaPrincipal("A".repeat(1001));
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("historicoClinico excedendo 3000 caracteres deve gerar violação")
    void historicoClinico_MuitoLongo() {
        AnamneseRequest r = criarRequestValido();
        r.setHistoricoClinico("A".repeat(3001));
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("historicoFamiliar excedendo 2000 caracteres deve gerar violação")
    void historicoFamiliar_MuitoLongo() {
        AnamneseRequest r = criarRequestValido();
        r.setHistoricoFamiliar("A".repeat(2001));
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("observacoes excedendo 2000 caracteres deve gerar violação")
    void observacoes_MuitoLongo() {
        AnamneseRequest r = criarRequestValido();
        r.setObservacoes("A".repeat(2001));
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("dataAtivacao futura deve gerar violação")
    void dataAtivacao_Futura() {
        AnamneseRequest r = criarRequestValido();
        r.setDataAtivacao(LocalDate.now().plusDays(1));
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("dataAtivacao passada deve ser aceita")
    void dataAtivacao_Passada() {
        AnamneseRequest r = criarRequestValido();
        r.setDataAtivacao(LocalDate.of(2024, 1, 15));
        assertTrue(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("Request vazio deve ter violação em queixaPrincipal")
    void requestVazio_DeveTerViolacao() {
        Set<ConstraintViolation<AnamneseRequest>> v = validator.validate(new AnamneseRequest());
        assertFalse(v.isEmpty());
        assertTrue(v.stream().anyMatch(vi -> vi.getPropertyPath().toString().equals("queixaPrincipal")));
    }
}
