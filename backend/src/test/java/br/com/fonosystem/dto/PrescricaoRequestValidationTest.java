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

@DisplayName("PrescricaoRequest — Validação de campos obrigatórios")
class PrescricaoRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private PrescricaoRequest criarRequestValido() {
        PrescricaoRequest r = new PrescricaoRequest();
        r.setDataPrescricao(LocalDate.now());
        r.setTitulo("Exercícios de articulação");
        r.setDescricaoExercicios("Repetir fonema /r/ em frases curtas, 10x cada");
        return r;
    }

    @Test
    @DisplayName("Request válido não deve ter violações")
    void requestValido_SemViolacoes() {
        assertTrue(validator.validate(criarRequestValido()).isEmpty());
    }

    @Test
    @DisplayName("dataPrescricao null deve gerar violação")
    void dataPrescricao_Null() {
        PrescricaoRequest r = criarRequestValido();
        r.setDataPrescricao(null);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("dataPrescricao futura deve gerar violação")
    void dataPrescricao_Futura() {
        PrescricaoRequest r = criarRequestValido();
        r.setDataPrescricao(LocalDate.now().plusDays(1));
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("titulo null deve gerar violação")
    void titulo_Null() {
        PrescricaoRequest r = criarRequestValido();
        r.setTitulo(null);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("titulo em branco deve gerar violação")
    void titulo_Blank() {
        PrescricaoRequest r = criarRequestValido();
        r.setTitulo("  ");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("descricaoExercicios null deve gerar violação (BUG CORRIGIDO)")
    void descricaoExercicios_Null() {
        PrescricaoRequest r = criarRequestValido();
        r.setDescricaoExercicios(null);
        Set<ConstraintViolation<PrescricaoRequest>> v = validator.validate(r);
        assertFalse(v.isEmpty(), "descricaoExercicios null deveria gerar violação — campo obrigatório");
        assertTrue(v.stream().anyMatch(vi -> vi.getPropertyPath().toString().equals("descricaoExercicios")));
    }

    @Test
    @DisplayName("descricaoExercicios em branco deve gerar violação (BUG CORRIGIDO)")
    void descricaoExercicios_Blank() {
        PrescricaoRequest r = criarRequestValido();
        r.setDescricaoExercicios("   ");
        Set<ConstraintViolation<PrescricaoRequest>> v = validator.validate(r);
        assertFalse(v.isEmpty(), "descricaoExercicios em branco deveria gerar violação — campo obrigatório");
    }

    @Test
    @DisplayName("titulo excedendo 255 caracteres deve gerar violação")
    void titulo_MuitoLongo() {
        PrescricaoRequest r = criarRequestValido();
        r.setTitulo("A".repeat(256));
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("descricaoExercicios excedendo 5000 caracteres deve gerar violação")
    void descricaoExercicios_MuitoLonga() {
        PrescricaoRequest r = criarRequestValido();
        r.setDescricaoExercicios("A".repeat(5001));
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("Request vazio deve ter múltiplas violações")
    void requestVazio_MultiViolacoes() {
        Set<ConstraintViolation<PrescricaoRequest>> v = validator.validate(new PrescricaoRequest());
        // dataPrescricao, titulo, descricaoExercicios
        assertTrue(v.size() >= 3, "Deveria ter ao menos 3 violações, encontrou: " + v.size());
    }
}
