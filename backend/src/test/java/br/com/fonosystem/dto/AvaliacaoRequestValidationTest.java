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

@DisplayName("AvaliacaoRequest — Validação de campos obrigatórios")
class AvaliacaoRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private AvaliacaoRequest criarRequestValido() {
        AvaliacaoRequest r = new AvaliacaoRequest();
        r.setTipoAvaliacao("INICIAL");
        r.setAreaEspecialidade("TEA");
        r.setDataAvaliacao(LocalDate.now());
        r.setSessoesPorSemana(2);
        return r;
    }

    @Test
    @DisplayName("Request válido não deve ter violações")
    void requestValido_SemViolacoes() {
        assertTrue(validator.validate(criarRequestValido()).isEmpty());
    }

    @Test
    @DisplayName("tipoAvaliacao null deve gerar violação")
    void tipoAvaliacao_Null() {
        AvaliacaoRequest r = criarRequestValido();
        r.setTipoAvaliacao(null);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("tipoAvaliacao em branco deve gerar violação")
    void tipoAvaliacao_Blank() {
        AvaliacaoRequest r = criarRequestValido();
        r.setTipoAvaliacao("  ");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("areaEspecialidade null deve gerar violação")
    void areaEspecialidade_Null() {
        AvaliacaoRequest r = criarRequestValido();
        r.setAreaEspecialidade(null);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("areaEspecialidade em branco deve gerar violação")
    void areaEspecialidade_Blank() {
        AvaliacaoRequest r = criarRequestValido();
        r.setAreaEspecialidade("  ");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("dataAvaliacao null deve gerar violação")
    void dataAvaliacao_Null() {
        AvaliacaoRequest r = criarRequestValido();
        r.setDataAvaliacao(null);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("dataAvaliacao futura deve gerar violação")
    void dataAvaliacao_Futura() {
        AvaliacaoRequest r = criarRequestValido();
        r.setDataAvaliacao(LocalDate.now().plusDays(1));
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("sessoesPorSemana = 0 deve gerar violação")
    void sessoesPorSemana_Zero() {
        AvaliacaoRequest r = criarRequestValido();
        r.setSessoesPorSemana(0);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("sessoesPorSemana = 8 deve gerar violação")
    void sessoesPorSemana_AcimaMaximo() {
        AvaliacaoRequest r = criarRequestValido();
        r.setSessoesPorSemana(8);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("sessoesPorSemana null deve ser aceito (é opcional)")
    void sessoesPorSemana_Null_Aceito() {
        AvaliacaoRequest r = criarRequestValido();
        r.setSessoesPorSemana(null);
        Set<ConstraintViolation<AvaliacaoRequest>> v = validator.validate(r);
        assertTrue(v.stream().noneMatch(vi -> vi.getPropertyPath().toString().equals("sessoesPorSemana")));
    }

    @Test
    @DisplayName("hipoteseDiagnostica excedendo 2000 deve gerar violação")
    void hipoteseDiagnostica_MuitoLonga() {
        AvaliacaoRequest r = criarRequestValido();
        r.setHipoteseDiagnostica("A".repeat(2001));
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("Request vazio deve ter múltiplas violações")
    void requestVazio_MultiViolacoes() {
        Set<ConstraintViolation<AvaliacaoRequest>> v = validator.validate(new AvaliacaoRequest());
        // tipoAvaliacao, areaEspecialidade, dataAvaliacao
        assertTrue(v.size() >= 3, "Deveria ter ao menos 3 violações, encontrou: " + v.size());
    }
}
