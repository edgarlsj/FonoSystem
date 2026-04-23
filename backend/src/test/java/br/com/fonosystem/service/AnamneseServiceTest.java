package br.com.fonosystem.service;

import br.com.fonosystem.dto.AnamneseRequest;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Anamnese;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.AnamneseRepository;
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
class AnamneseServiceTest {

    @Mock
    private AnamneseRepository anamneseRepository;

    @Mock
    private PacienteRepository pacienteRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AnamneseService anamneseService;

    private Paciente paciente;
    private User profissional;
    private Anamnese anamnese;
    private AnamneseRequest request;

    @BeforeEach
    void setUp() {
        paciente = Paciente.builder().id(1L).nomeCompleto("Joãozinho").build();
        profissional = User.builder().id(2L).email("fono@fono.com").build();

        anamnese = Anamnese.builder()
                .id(100L)
                .paciente(paciente)
                .profissional(profissional)
                .queixaPrincipal("Atraso na fala")
                .build();

        request = new AnamneseRequest();
        request.setPacienteId(1L);
        request.setQueixaPrincipal("Atraso na fala leve");

        // Configuração padrão do SecurityContext para não quebrar testes que dependam dele
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listarPorPaciente_ShouldReturnAnamneseList() {
        when(anamneseRepository.findByPacienteIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(anamnese));

        List<Anamnese> result = anamneseService.listarPorPaciente(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Atraso na fala", result.get(0).getQueixaPrincipal());
        verify(anamneseRepository, times(1)).findByPacienteIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void buscarPorId_WhenExists_ShouldReturnAnamnese() {
        when(anamneseRepository.findById(100L)).thenReturn(Optional.of(anamnese));

        Anamnese result = anamneseService.buscarPorId(100L);

        assertNotNull(result);
        assertEquals(100L, result.getId());
    }

    @Test
    void buscarPorId_WhenNotExists_ShouldThrowException() {
        when(anamneseRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> anamneseService.buscarPorId(99L));
    }

    @Test
    void criar_WhenValid_ShouldCreateAndReturnAnamnese() {
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(paciente));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("fono@fono.com");
        when(userRepository.findByEmail("fono@fono.com")).thenReturn(Optional.of(profissional));
        
        when(anamneseRepository.save(any(Anamnese.class))).thenAnswer(invocation -> {
            Anamnese saved = invocation.getArgument(0);
            saved.setId(101L);
            return saved;
        });

        Anamnese result = anamneseService.criar(request);

        assertNotNull(result);
        assertEquals(101L, result.getId());
        assertEquals("Atraso na fala leve", result.getQueixaPrincipal());
        assertEquals(paciente, result.getPaciente());
        assertEquals(profissional, result.getProfissional());
    }

    @Test
    void criar_WhenPacienteNotFound_ShouldThrowException() {
        when(pacienteRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> anamneseService.criar(request));
        verify(anamneseRepository, never()).save(any());
    }

    @Test
    void atualizar_WhenExists_ShouldUpdateFields() {
        when(anamneseRepository.findById(100L)).thenReturn(Optional.of(anamnese));
        when(anamneseRepository.save(any(Anamnese.class))).thenReturn(anamnese);

        Anamnese result = anamneseService.atualizar(100L, request);

        assertNotNull(result);
        assertEquals("Atraso na fala leve", result.getQueixaPrincipal());
        verify(anamneseRepository, times(1)).save(anamnese);
    }

    @Test
    void atualizar_WhenNotExists_ShouldThrowException() {
        when(anamneseRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> anamneseService.atualizar(99L, request));
        verify(anamneseRepository, never()).save(any());
    }
}
