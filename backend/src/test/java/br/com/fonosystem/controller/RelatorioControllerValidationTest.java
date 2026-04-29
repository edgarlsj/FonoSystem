package br.com.fonosystem.controller;

import br.com.fonosystem.dto.RelatorioRequest;
import br.com.fonosystem.service.RelatorioService;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("RelatorioController — Testes de validação HTTP 400")
class RelatorioControllerValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RelatorioService relatorioService;

    @Test
    @WithMockUser
    @DisplayName("POST com body vazio deve retornar 400 com campos obrigatórios")
    void criar_BodyVazio_400() throws Exception {
        mockMvc.perform(post("/v1/pacientes/1/relatorios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Dados inválidos"))
                .andExpect(jsonPath("$.campos.dataSessao").exists())
                .andExpect(jsonPath("$.campos.horaInicio").exists())
                .andExpect(jsonPath("$.campos.horaFim").exists())
                .andExpect(jsonPath("$.campos.atividadesRealizadas").exists())
                .andExpect(jsonPath("$.campos.metaTrabalhada").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("POST com percentualAcerto negativo deve retornar 400")
    void criar_PercentualNegativo_400() throws Exception {
        RelatorioRequest r = criarRequestValido();
        r.setPercentualAcerto(new BigDecimal("-1"));

        mockMvc.perform(post("/v1/pacientes/1/relatorios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.percentualAcerto").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("POST com percentualAcerto acima de 100 deve retornar 400")
    void criar_PercentualAcima100_400() throws Exception {
        RelatorioRequest r = criarRequestValido();
        r.setPercentualAcerto(new BigDecimal("100.01"));

        mockMvc.perform(post("/v1/pacientes/1/relatorios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.percentualAcerto").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("POST com nivelEngajamento = 0 deve retornar 400")
    void criar_EngajamentoZero_400() throws Exception {
        RelatorioRequest r = criarRequestValido();
        r.setNivelEngajamento((short) 0);

        mockMvc.perform(post("/v1/pacientes/1/relatorios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nivelEngajamento").exists());
    }

    @Test
    @WithMockUser
    @DisplayName("POST com atividadesRealizadas em branco deve retornar 400")
    void criar_AtividadesBlank_400() throws Exception {
        RelatorioRequest r = criarRequestValido();
        r.setAtividadesRealizadas("  ");

        mockMvc.perform(post("/v1/pacientes/1/relatorios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.atividadesRealizadas").exists());
    }

    private RelatorioRequest criarRequestValido() {
        RelatorioRequest r = new RelatorioRequest();
        r.setDataSessao(LocalDate.now());
        r.setHoraInicio(LocalTime.of(8, 0));
        r.setHoraFim(LocalTime.of(9, 0));
        r.setAtividadesRealizadas("Treino de articulação");
        r.setMetaTrabalhada("Produzir fonema /r/");
        return r;
    }
}
