package br.com.fonosystem.service;

import br.com.fonosystem.dto.PacienteRequest;
import br.com.fonosystem.dto.PacienteResponse;
import br.com.fonosystem.exception.BusinessException;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.PacienteRepository;
import br.com.fonosystem.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PacienteServiceTest {

    @Mock
    private PacienteRepository pacienteRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private PacienteService pacienteService;

    private Paciente paciente;
    private PacienteRequest pacienteRequest;
    private User usuario;

    @BeforeEach
    void setUp() {
        usuario = User.builder().id(1L).email("test@example.com").build();

        paciente = Paciente.builder()
                .id(1L)
                .nomeCompleto("João Silva")
                .cpf("12345678901")
                .dataNascimento(LocalDate.of(2015, 5, 10))
                .status("ATIVO")
                .profissional(usuario)
                .dataConsentimento(LocalDateTime.now())
                .build();

        pacienteRequest = new PacienteRequest();
        pacienteRequest.setNomeCompleto("João Silva");
        pacienteRequest.setCpf("12345678901");
        pacienteRequest.setConsentimentoLgpd(true);
        pacienteRequest.setDataNascimento(LocalDate.of(2015, 5, 10));

        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("test@example.com");
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listar_ShouldReturnPageOfPacienteResponse() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Paciente> page = new PageImpl<>(List.of(paciente));

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(usuario));
        when(pacienteRepository.findByFilters(any(), any(), any(), eq(pageable))).thenReturn(page);

        Page<PacienteResponse> result = pacienteService.listar(null, null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("João Silva", result.getContent().get(0).getNomeCompleto());
        verify(pacienteRepository, times(1)).findByFilters(any(), any(), any(), eq(pageable));
    }

    @Test
    void buscarPorId_WhenExists_ShouldReturnResponse() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(usuario));
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(paciente));

        PacienteResponse result = pacienteService.buscarPorId(1L);

        assertNotNull(result);
        assertEquals("João Silva", result.getNomeCompleto());
        verify(pacienteRepository, times(1)).findById(1L);
    }

    @Test
    void buscarPorId_WhenNotExists_ShouldThrowException() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(usuario));
        when(pacienteRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> pacienteService.buscarPorId(99L));
        verify(pacienteRepository, times(1)).findById(99L);
    }

    @Test
    void criar_WhenValidRequest_ShouldCreatePaciente() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(usuario));
        when(pacienteRepository.existsByCpf(pacienteRequest.getCpf())).thenReturn(false);
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(paciente);

        PacienteResponse result = pacienteService.criar(pacienteRequest);

        assertNotNull(result);
        assertEquals("João Silva", result.getNomeCompleto());
        verify(pacienteRepository, times(1)).save(any(Paciente.class));
    }

    @Test
    void criar_WhenCpfExists_ShouldThrowException() {
        when(pacienteRepository.existsByCpf(pacienteRequest.getCpf())).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> pacienteService.criar(pacienteRequest));
        assertEquals("CPF já cadastrado", exception.getMessage());
        verify(pacienteRepository, never()).save(any(Paciente.class));
    }

    @Test
    void criar_WhenNoLgpdConsent_ShouldThrowException() {
        pacienteRequest.setConsentimentoLgpd(false);

        BusinessException exception = assertThrows(BusinessException.class, () -> pacienteService.criar(pacienteRequest));
        assertEquals("Consentimento LGPD é obrigatório", exception.getMessage());
        verify(pacienteRepository, never()).save(any(Paciente.class));
    }

    @Test
    void atualizar_WhenPacienteExists_ShouldUpdateDetails() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(usuario));
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(paciente));

        pacienteRequest.setNomeCompleto("João Silva Atualizado");
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(paciente); // paciente object was mutated

        PacienteResponse result = pacienteService.atualizar(1L, pacienteRequest);

        assertNotNull(result);
        assertEquals("João Silva Atualizado", paciente.getNomeCompleto());
        verify(pacienteRepository, times(1)).save(paciente);
    }

    @Test
    void alterarStatus_WhenInativo_ShouldSetDeletedAt() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(usuario));
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(paciente));

        pacienteService.alterarStatus(1L, "INATIVO");

        assertEquals("INATIVO", paciente.getStatus());
        assertNotNull(paciente.getDeletedAt());
        verify(pacienteRepository, times(1)).save(paciente);
    }

    @Test
    void alterarStatus_WhenAtivo_ShouldClearDeletedAt() {
        paciente.setStatus("INATIVO");
        paciente.setDeletedAt(LocalDateTime.now());
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(usuario));
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(paciente));

        pacienteService.alterarStatus(1L, "ATIVO");

        assertEquals("ATIVO", paciente.getStatus());
        assertNull(paciente.getDeletedAt());
        verify(pacienteRepository, times(1)).save(paciente);
    }
}
