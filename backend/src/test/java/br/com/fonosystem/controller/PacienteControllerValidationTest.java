package br.com.fonosystem.controller;

import br.com.fonosystem.dto.PacienteRequest;
import br.com.fonosystem.service.PacienteService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("PacienteController — Testes de validação HTTP 400")
class PacienteControllerValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PacienteService pacienteService;

    @Test
    @WithMockUser
    @DisplayName("POST com body vazio deve retornar 400 com campos de erro")
    void criar_BodyVazio_400() throws Exception {
        mockMvc.perform(post("/v1/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Dados inválidos"))
                .andExpect(jsonPath("$.campos").isMap())
                .andExpect(jsonPath("$.campos.nomeCompleto").exists())
                .andExpect(jsonPath("$.campos.dataNascimento").exists())
                .andExpect(jsonPath("$.campos.sexo").exists())
                .andExpect(jsonPath("$.campos.nomeResponsavel").exists())
                .andExpect(jsonPath("$.campos.telefoneResponsavel").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("POST com nomeCompleto ausente deve retornar 400")
    void criar_SemNome_400() throws Exception {
        PacienteRequest r = criarRequestValido();
        r.setNomeCompleto(null);

        mockMvc.perform(post("/v1/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nomeCompleto").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("POST com dataNascimento futura deve retornar 400")
    void criar_DataFutura_400() throws Exception {
        PacienteRequest r = criarRequestValido();
        r.setDataNascimento(LocalDate.now().plusDays(1));

        mockMvc.perform(post("/v1/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.dataNascimento").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("POST com sexo inválido deve retornar 400")
    void criar_SexoInvalido_400() throws Exception {
        PacienteRequest r = criarRequestValido();
        r.setSexo("X");

        mockMvc.perform(post("/v1/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.sexo").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("POST com CPF inválido deve retornar 400")
    void criar_CpfInvalido_400() throws Exception {
        PacienteRequest r = criarRequestValido();
        r.setCpf("12345");

        mockMvc.perform(post("/v1/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.cpf").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("POST com nomeCompleto muito curto deve retornar 400")
    void criar_NomeCurto_400() throws Exception {
        PacienteRequest r = criarRequestValido();
        r.setNomeCompleto("AB");

        mockMvc.perform(post("/v1/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nomeCompleto").exists());
    }

    @Test
    @DisplayName("POST sem autenticação deve retornar 403")
    void criar_SemAuth_403() throws Exception {
        mockMvc.perform(post("/v1/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    @DisplayName("Resposta RFC 7807 deve ter estrutura correta")
    void criar_Invalido_RFC7807() throws Exception {
        mockMvc.perform(post("/v1/pacientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").exists())
                .andExpect(jsonPath("$.detail").exists())
                .andExpect(jsonPath("$.status").value(400));
    }

    private PacienteRequest criarRequestValido() {
        PacienteRequest r = new PacienteRequest();
        r.setNomeCompleto("João Silva Santos");
        r.setDataNascimento(LocalDate.of(2015, 5, 10));
        r.setSexo("M");
        r.setNomeResponsavel("Maria Silva Santos");
        r.setTelefoneResponsavel("(65) 99999-1234");
        r.setConsentimentoLgpd(true);
        return r;
    }
}
