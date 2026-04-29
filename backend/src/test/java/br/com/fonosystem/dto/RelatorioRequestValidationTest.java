package br.com.fonosystem.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("RelatorioRequest — Validação de campos obrigatórios")
class RelatorioRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private RelatorioRequest criarRequestValido() {
        RelatorioRequest r = new RelatorioRequest();
        r.setDataSessao(LocalDate.now());
        r.setHoraInicio(LocalTime.of(8, 0));
        r.setHoraFim(LocalTime.of(9, 0));
        r.setAtividadesRealizadas("Treino de articulação com cartões");
        r.setMetaTrabalhada("Produzir fonema /r/ em palavras");
        return r;
    }

    @Test
    @DisplayName("Request válido não deve ter violações")
    void requestValido_SemViolacoes() {
        assertTrue(validator.validate(criarRequestValido()).isEmpty());
    }

    @Test
    @DisplayName("dataSessao null deve gerar violação")
    void dataSessao_Null() {
        RelatorioRequest r = criarRequestValido();
        r.setDataSessao(null);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("horaInicio null deve gerar violação")
    void horaInicio_Null() {
        RelatorioRequest r = criarRequestValido();
        r.setHoraInicio(null);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("horaFim null deve gerar violação")
    void horaFim_Null() {
        RelatorioRequest r = criarRequestValido();
        r.setHoraFim(null);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("atividadesRealizadas null deve gerar violação")
    void atividadesRealizadas_Null() {
        RelatorioRequest r = criarRequestValido();
        r.setAtividadesRealizadas(null);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("atividadesRealizadas em branco deve gerar violação")
    void atividadesRealizadas_Blank() {
        RelatorioRequest r = criarRequestValido();
        r.setAtividadesRealizadas("  ");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("metaTrabalhada null deve gerar violação")
    void metaTrabalhada_Null() {
        RelatorioRequest r = criarRequestValido();
        r.setMetaTrabalhada(null);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("metaTrabalhada em branco deve gerar violação")
    void metaTrabalhada_Blank() {
        RelatorioRequest r = criarRequestValido();
        r.setMetaTrabalhada("  ");
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("percentualAcerto negativo deve gerar violação")
    void percentualAcerto_Negativo() {
        RelatorioRequest r = criarRequestValido();
        r.setPercentualAcerto(new BigDecimal("-1"));
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("percentualAcerto acima de 100 deve gerar violação")
    void percentualAcerto_AcimaMaximo() {
        RelatorioRequest r = criarRequestValido();
        r.setPercentualAcerto(new BigDecimal("100.01"));
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("percentualAcerto válido (75.5) deve ser aceito")
    void percentualAcerto_Valido() {
        RelatorioRequest r = criarRequestValido();
        r.setPercentualAcerto(new BigDecimal("75.5"));
        assertTrue(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("nivelEngajamento = 0 deve gerar violação (mínimo 1)")
    void nivelEngajamento_Zero() {
        RelatorioRequest r = criarRequestValido();
        r.setNivelEngajamento((short) 0);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("nivelEngajamento = 6 deve gerar violação (máximo 5)")
    void nivelEngajamento_AcimaMaximo() {
        RelatorioRequest r = criarRequestValido();
        r.setNivelEngajamento((short) 6);
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("nivelEngajamento = 3 deve ser aceito")
    void nivelEngajamento_Valido() {
        RelatorioRequest r = criarRequestValido();
        r.setNivelEngajamento((short) 3);
        assertTrue(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("atividadesRealizadas excedendo 2000 caracteres deve gerar violação")
    void atividadesRealizadas_MuitoLonga() {
        RelatorioRequest r = criarRequestValido();
        r.setAtividadesRealizadas("A".repeat(2001));
        assertFalse(validator.validate(r).isEmpty());
    }

    @Test
    @DisplayName("Request vazio deve ter múltiplas violações")
    void requestVazio_MultiViolacoes() {
        Set<ConstraintViolation<RelatorioRequest>> v = validator.validate(new RelatorioRequest());
        // dataSessao, horaInicio, horaFim, atividadesRealizadas, metaTrabalhada
        assertTrue(v.size() >= 5, "Deveria ter ao menos 5 violações, encontrou: " + v.size());
    }
}
