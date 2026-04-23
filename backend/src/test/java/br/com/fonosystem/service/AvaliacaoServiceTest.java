package br.com.fonosystem.service;

import br.com.fonosystem.dto.AvaliacaoRequest;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Avaliacao;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.AvaliacaoRepository;
import br.com.fonosystem.repository.PacienteRepository;
import br.com.fonosystem.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvaliacaoServiceTest {

    @Mock
    private AvaliacaoRepository avaliacaoRepository;

    @Mock
    private PacienteRepository pacienteRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AvaliacaoService avaliacaoService;

    private Paciente paciente;
    private User profissional;
    private Avaliacao avaliacao;
    private AvaliacaoRequest request;

    @BeforeEach
    void setUp() {
        paciente = Paciente.builder().id(1L).build();
        profissional = User.builder().id(2L).email("teste@teste.com").build();
        
        avaliacao = Avaliacao.builder()
                .id(1L)
                .paciente(paciente)
                .profissional(profissional)
                .tipoAvaliacao("Avaliação Inicial")
                .build();

        request = new AvaliacaoRequest();
        request.setPacienteId(1L);
        request.setTipoAvaliacao("Avaliação de Linguagem");

        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listarPorPaciente_ShouldReturnList() {
        when(avaliacaoRepository.findByPacienteIdOrderByDataAvaliacaoDesc(1L)).thenReturn(List.of(avaliacao));

        List<Avaliacao> result = avaliacaoService.listarPorPaciente(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(avaliacaoRepository, times(1)).findByPacienteIdOrderByDataAvaliacaoDesc(1L);
    }

    @Test
    void buscarPorId_WhenExists_ShouldReturnAvaliacao() {
        when(avaliacaoRepository.findById(1L)).thenReturn(Optional.of(avaliacao));

        Avaliacao result = avaliacaoService.buscarPorId(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void buscarPorId_WhenNotExists_ShouldThrowException() {
        when(avaliacaoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> avaliacaoService.buscarPorId(99L));
    }

    @Test
    void criar_WhenValid_ShouldSaveAvaliacao() {
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(paciente));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("teste@teste.com");
        when(userRepository.findByEmail("teste@teste.com")).thenReturn(Optional.of(profissional));
        when(avaliacaoRepository.save(any(Avaliacao.class))).thenReturn(avaliacao);

        Avaliacao result = avaliacaoService.criar(request);

        assertNotNull(result);
        verify(avaliacaoRepository, times(1)).save(any(Avaliacao.class));
    }

    @Test
    void criar_WhenPacienteNotFound_ShouldThrowException() {
        when(pacienteRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> avaliacaoService.criar(request));
        verify(avaliacaoRepository, never()).save(any());
    }

    @Test
    void atualizar_WhenExists_ShouldUpdateFields() {
        when(avaliacaoRepository.findById(1L)).thenReturn(Optional.of(avaliacao));
        when(avaliacaoRepository.save(any(Avaliacao.class))).thenReturn(avaliacao);

        Avaliacao result = avaliacaoService.atualizar(1L, request);

        assertNotNull(result);
        assertEquals("Avaliação de Linguagem", avaliacao.getTipoAvaliacao());
        verify(avaliacaoRepository, times(1)).save(avaliacao);
    }
}
