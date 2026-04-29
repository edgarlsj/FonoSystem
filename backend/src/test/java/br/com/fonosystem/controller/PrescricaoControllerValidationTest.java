package br.com.fonosystem.controller;

import br.com.fonosystem.dto.PrescricaoRequest;
import br.com.fonosystem.service.PrescricaoService;
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
@DisplayName("PrescricaoController — Testes de validação HTTP 400")
class PrescricaoControllerValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PrescricaoService prescricaoService;

    @Test
    @WithMockUser
    @DisplayName("POST com body vazio deve retornar 400")
    void criar_BodyVazio_400() throws Exception {
        mockMvc.perform(post("/v1/pacientes/1/prescricoes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Dados inválidos"))
                .andExpect(jsonPath("$.campos.dataPrescricao").exists())
                .andExpect(jsonPath("$.campos.titulo").exists())
                .andExpect(jsonPath("$.campos.descricaoExercicios").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("POST com descricaoExercicios null deve retornar 400 (BUG CORRIGIDO)")
    void criar_SemDescricao_400() throws Exception {
        PrescricaoRequest r = new PrescricaoRequest();
        r.setDataPrescricao(LocalDate.now());
        r.setTitulo("Exercícios de articulação");
        // descricaoExercicios propositalmente null

        mockMvc.perform(post("/v1/pacientes/1/prescricoes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.descricaoExercicios").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("POST com dataPrescricao futura deve retornar 400")
    void criar_DataFutura_400() throws Exception {
        PrescricaoRequest r = new PrescricaoRequest();
        r.setDataPrescricao(LocalDate.now().plusDays(1));
        r.setTitulo("Exercícios");
        r.setDescricaoExercicios("Repetir fonema /r/");

        mockMvc.perform(post("/v1/pacientes/1/prescricoes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.dataPrescricao").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("POST com titulo em branco deve retornar 400")
    void criar_TituloBlank_400() throws Exception {
        PrescricaoRequest r = new PrescricaoRequest();
        r.setDataPrescricao(LocalDate.now());
        r.setTitulo("  ");
        r.setDescricaoExercicios("Repetir fonema /r/");

        mockMvc.perform(post("/v1/pacientes/1/prescricoes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.titulo").exists());
    }
}
