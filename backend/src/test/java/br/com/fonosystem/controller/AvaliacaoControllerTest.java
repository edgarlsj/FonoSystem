package br.com.fonosystem.controller;

import br.com.fonosystem.dto.AvaliacaoRequest;
import br.com.fonosystem.model.Avaliacao;
import br.com.fonosystem.service.AvaliacaoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AvaliacaoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AvaliacaoService avaliacaoService;

    private AvaliacaoRequest request;
    private Avaliacao avaliacao;

    @BeforeEach
    void setUp() {
        request = new AvaliacaoRequest();
        request.setTipoAvaliacao("INICIAL");
        request.setAreaEspecialidade("TEA");
        request.setInstrumentoAvaliacao("CARS");
        request.setDataAvaliacao(LocalDate.now());
        request.setResultados("{\"totalScore\": 30}");

        avaliacao = Avaliacao.builder()
                .id(1L)
                .tipoAvaliacao("INICIAL")
                .areaEspecialidade("TEA")
                .instrumentoAvaliacao("CARS")
                .dataAvaliacao(LocalDate.now())
                .resultados("{\"totalScore\": 30}")
                .build();
    }

    @Test
    @WithMockUser
    void criar_WhenValid_ShouldReturnCreated() throws Exception {
        when(avaliacaoService.criar(any(AvaliacaoRequest.class))).thenReturn(avaliacao);

        mockMvc.perform(post("/v1/pacientes/1/avaliacoes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.instrumentoAvaliacao").value("CARS"));
    }

    @Test
    @WithMockUser
    void listar_ShouldReturnOk() throws Exception {
        when(avaliacaoService.listarPorPaciente(1L)).thenReturn(List.of(avaliacao));

        mockMvc.perform(get("/v1/pacientes/1/avaliacoes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].tipoAvaliacao").value("INICIAL"));
    }

    @Test
    @WithMockUser
    void atualizar_WhenValid_ShouldReturnOk() throws Exception {
        when(avaliacaoService.atualizar(eq(1L), any(AvaliacaoRequest.class))).thenReturn(avaliacao);

        mockMvc.perform(put("/v1/avaliacoes/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.instrumentoAvaliacao").value("CARS"));
    }

    @Test
    void criar_WhenUnauthenticated_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(post("/v1/pacientes/1/avaliacoes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
