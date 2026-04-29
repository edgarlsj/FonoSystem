package br.com.fonosystem.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("PacienteRequest — Validação de campos obrigatórios")
class PacienteRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private PacienteRequest criarRequestValido() {
        PacienteRequest request = new PacienteRequest();
        request.setNomeCompleto("João Silva Santos");
        request.setDataNascimento(LocalDate.of(2015, 5, 10));
        request.setSexo("M");
        request.setNomeResponsavel("Maria Silva Santos");
        request.setTelefoneResponsavel("(65) 99999-1234");
        request.setConsentimentoLgpd(true);
        return request;
    }

    @Test
    @DisplayName("Request válido não deve ter violações")
    void requestValido_SemViolacoes() {
        PacienteRequest request = criarRequestValido();
        Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Request válido não deveria ter violações, mas encontrou: " + violations);
    }

    // ========== nomeCompleto ==========
    @Nested
    @DisplayName("Campo: nomeCompleto")
    class NomeCompletoTests {

        @Test
        @DisplayName("nomeCompleto null deve gerar violação")
        void nomeCompleto_Null() {
            PacienteRequest request = criarRequestValido();
            request.setNomeCompleto(null);
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("nomeCompleto")));
        }

        @Test
        @DisplayName("nomeCompleto em branco deve gerar violação")
        void nomeCompleto_Blank() {
            PacienteRequest request = criarRequestValido();
            request.setNomeCompleto("   ");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("nomeCompleto")));
        }

        @Test
        @DisplayName("nomeCompleto com menos de 3 caracteres deve gerar violação")
        void nomeCompleto_MuitoCurto() {
            PacienteRequest request = criarRequestValido();
            request.setNomeCompleto("AB");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("nomeCompleto")));
        }

        @Test
        @DisplayName("nomeCompleto com mais de 150 caracteres deve gerar violação")
        void nomeCompleto_MuitoLongo() {
            PacienteRequest request = criarRequestValido();
            request.setNomeCompleto("A".repeat(151));
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("nomeCompleto")));
        }
    }

    // ========== dataNascimento ==========
    @Nested
    @DisplayName("Campo: dataNascimento")
    class DataNascimentoTests {

        @Test
        @DisplayName("dataNascimento null deve gerar violação")
        void dataNascimento_Null() {
            PacienteRequest request = criarRequestValido();
            request.setDataNascimento(null);
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("dataNascimento")));
        }

        @Test
        @DisplayName("dataNascimento futura deve gerar violação")
        void dataNascimento_Futura() {
            PacienteRequest request = criarRequestValido();
            request.setDataNascimento(LocalDate.now().plusDays(1));
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("dataNascimento")));
        }
    }

    // ========== sexo ==========
    @Nested
    @DisplayName("Campo: sexo")
    class SexoTests {

        @Test
        @DisplayName("sexo null deve gerar violação")
        void sexo_Null() {
            PacienteRequest request = criarRequestValido();
            request.setSexo(null);
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("sexo")));
        }

        @Test
        @DisplayName("sexo em branco deve gerar violação")
        void sexo_Blank() {
            PacienteRequest request = criarRequestValido();
            request.setSexo("  ");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("sexo")));
        }

        @Test
        @DisplayName("sexo com valor inválido deve gerar violação")
        void sexo_ValorInvalido() {
            PacienteRequest request = criarRequestValido();
            request.setSexo("X");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("sexo")));
        }

        @Test
        @DisplayName("sexo 'M' deve ser válido")
        void sexo_M_Valido() {
            PacienteRequest request = criarRequestValido();
            request.setSexo("M");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertTrue(violations.stream().noneMatch(v -> v.getPropertyPath().toString().equals("sexo")));
        }

        @Test
        @DisplayName("sexo 'F' deve ser válido")
        void sexo_F_Valido() {
            PacienteRequest request = criarRequestValido();
            request.setSexo("F");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertTrue(violations.stream().noneMatch(v -> v.getPropertyPath().toString().equals("sexo")));
        }

        @Test
        @DisplayName("sexo 'O' deve ser válido")
        void sexo_O_Valido() {
            PacienteRequest request = criarRequestValido();
            request.setSexo("O");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertTrue(violations.stream().noneMatch(v -> v.getPropertyPath().toString().equals("sexo")));
        }
    }

    // ========== nomeResponsavel ==========
    @Nested
    @DisplayName("Campo: nomeResponsavel")
    class NomeResponsavelTests {

        @Test
        @DisplayName("nomeResponsavel null deve gerar violação")
        void nomeResponsavel_Null() {
            PacienteRequest request = criarRequestValido();
            request.setNomeResponsavel(null);
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("nomeResponsavel")));
        }

        @Test
        @DisplayName("nomeResponsavel em branco deve gerar violação")
        void nomeResponsavel_Blank() {
            PacienteRequest request = criarRequestValido();
            request.setNomeResponsavel("  ");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("nomeResponsavel")));
        }

        @Test
        @DisplayName("nomeResponsavel muito curto deve gerar violação")
        void nomeResponsavel_MuitoCurto() {
            PacienteRequest request = criarRequestValido();
            request.setNomeResponsavel("AB");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("nomeResponsavel")));
        }
    }

    // ========== telefoneResponsavel ==========
    @Nested
    @DisplayName("Campo: telefoneResponsavel")
    class TelefoneResponsavelTests {

        @Test
        @DisplayName("telefoneResponsavel null deve gerar violação")
        void telefoneResponsavel_Null() {
            PacienteRequest request = criarRequestValido();
            request.setTelefoneResponsavel(null);
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("telefoneResponsavel")));
        }

        @Test
        @DisplayName("telefoneResponsavel em branco deve gerar violação")
        void telefoneResponsavel_Blank() {
            PacienteRequest request = criarRequestValido();
            request.setTelefoneResponsavel("   ");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("telefoneResponsavel")));
        }

        @Test
        @DisplayName("telefoneResponsavel com formato inválido deve gerar violação")
        void telefoneResponsavel_FormatoInvalido() {
            PacienteRequest request = criarRequestValido();
            request.setTelefoneResponsavel("abc-defg");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("telefoneResponsavel")));
        }

        @Test
        @DisplayName("telefoneResponsavel com formato válido (65) 99999-1234")
        void telefoneResponsavel_FormatoValido() {
            PacienteRequest request = criarRequestValido();
            request.setTelefoneResponsavel("(65) 99999-1234");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertTrue(violations.stream().noneMatch(v -> v.getPropertyPath().toString().equals("telefoneResponsavel")));
        }
    }

    // ========== cpf ==========
    @Nested
    @DisplayName("Campo: cpf (opcional mas com formato)")
    class CpfTests {

        @Test
        @DisplayName("cpf null deve ser aceito (é opcional)")
        void cpf_Null_Aceito() {
            PacienteRequest request = criarRequestValido();
            request.setCpf(null);
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertTrue(violations.stream().noneMatch(v -> v.getPropertyPath().toString().equals("cpf")));
        }

        @Test
        @DisplayName("cpf vazio deve ser aceito (é opcional)")
        void cpf_Vazio_Aceito() {
            PacienteRequest request = criarRequestValido();
            request.setCpf("");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertTrue(violations.stream().noneMatch(v -> v.getPropertyPath().toString().equals("cpf")));
        }

        @Test
        @DisplayName("cpf com formato inválido deve gerar violação")
        void cpf_FormatoInvalido() {
            PacienteRequest request = criarRequestValido();
            request.setCpf("12345");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("cpf")));
        }

        @Test
        @DisplayName("cpf com formato válido 11 dígitos deve ser aceito")
        void cpf_FormatoValido_SemMascara() {
            PacienteRequest request = criarRequestValido();
            request.setCpf("12345678901");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertTrue(violations.stream().noneMatch(v -> v.getPropertyPath().toString().equals("cpf")));
        }

        @Test
        @DisplayName("cpf com formato válido 000.000.000-00 deve ser aceito")
        void cpf_FormatoValido_ComMascara() {
            PacienteRequest request = criarRequestValido();
            request.setCpf("123.456.789-01");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertTrue(violations.stream().noneMatch(v -> v.getPropertyPath().toString().equals("cpf")));
        }
    }

    // ========== email ==========
    @Nested
    @DisplayName("Campo: email (opcional mas com formato)")
    class EmailTests {

        @Test
        @DisplayName("email null deve ser aceito (é opcional)")
        void email_Null_Aceito() {
            PacienteRequest request = criarRequestValido();
            request.setEmail(null);
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertTrue(violations.stream().noneMatch(v -> v.getPropertyPath().toString().equals("email")));
        }

        @Test
        @DisplayName("email inválido deve gerar violação")
        void email_Invalido() {
            PacienteRequest request = criarRequestValido();
            request.setEmail("nao-e-email");
            Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);
            assertFalse(violations.isEmpty());
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
        }
    }

    // ========== Teste de múltiplos campos inválidos ==========
    @Test
    @DisplayName("Múltiplos campos obrigatórios null devem gerar múltiplas violações")
    void multiplosNulls_MultiViolacoes() {
        PacienteRequest request = new PacienteRequest(); // tudo null/default
        Set<ConstraintViolation<PacienteRequest>> violations = validator.validate(request);

        // Pelo menos nomeCompleto, dataNascimento, sexo, nomeResponsavel, telefoneResponsavel
        assertTrue(violations.size() >= 5,
                "Deveria ter pelo menos 5 violações, mas encontrou " + violations.size() + ": " + violations);
    }
}
