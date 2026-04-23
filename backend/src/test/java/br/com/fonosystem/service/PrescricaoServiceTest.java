package br.com.fonosystem.service;

import br.com.fonosystem.dto.PrescricaoRequest;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.model.Prescricao;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.PacienteRepository;
import br.com.fonosystem.repository.PrescricaoRepository;
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
class PrescricaoServiceTest {

    @Mock
    private PrescricaoRepository prescricaoRepository;

    @Mock
    private PacienteService pacienteService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PdfService pdfService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private PrescricaoService prescricaoService;

    private Paciente paciente;
    private User profissional;
    private Prescricao prescricao;
    private PrescricaoRequest request;

    @BeforeEach
    void setUp() {
        paciente = Paciente.builder().id(1L).build();
        profissional = User.builder().id(2L).email("medico@teste.com").build();

        prescricao = Prescricao.builder()
                .id(1L)
                .paciente(paciente)
                .profissional(profissional)
                .titulo("Exercícios Vocais")
                .build();

        request = new PrescricaoRequest();
        request.setPacienteId(1L);
        request.setTitulo("Exercícios Vocais Adicionais");

        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listarPorPaciente_ShouldReturnList() {
        when(prescricaoRepository.findByPacienteIdOrderByDataPrescricaoDesc(1L)).thenReturn(List.of(prescricao));

        List<Prescricao> result = prescricaoService.listarPorPaciente(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(prescricaoRepository, times(1)).findByPacienteIdOrderByDataPrescricaoDesc(1L);
    }

    @Test
    void buscarPorId_WhenExists_ShouldReturnPrescricao() {
        when(prescricaoRepository.findByIdWithRelations(1L)).thenReturn(Optional.of(prescricao));

        Prescricao result = prescricaoService.buscarPorId(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void buscarPorId_WhenNotExists_ShouldThrowException() {
        when(prescricaoRepository.findByIdWithRelations(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> prescricaoService.buscarPorId(99L));
    }

    @Test
    void criar_WhenValid_ShouldSavePrescricao() {
        when(pacienteService.buscarEntidadePorId(1L)).thenReturn(paciente);
        when(prescricaoRepository.save(any(Prescricao.class))).thenReturn(prescricao);

        Prescricao result = prescricaoService.criar(request);

        assertNotNull(result);
        verify(prescricaoRepository, times(1)).save(any(Prescricao.class));
    }

    @Test
    void criar_WhenPacienteNotFound_ShouldThrowException() {
        when(pacienteService.buscarEntidadePorId(1L)).thenThrow(new ResourceNotFoundException("Paciente não encontrado"));

        assertThrows(ResourceNotFoundException.class, () -> prescricaoService.criar(request));
        verify(prescricaoRepository, never()).save(any());
    }

    @Test
    void atualizar_WhenExists_ShouldUpdateFields() {
        when(prescricaoRepository.findByIdWithRelations(1L)).thenReturn(Optional.of(prescricao));
        when(prescricaoRepository.save(any(Prescricao.class))).thenReturn(prescricao);

        Prescricao result = prescricaoService.atualizar(1L, request);

        assertNotNull(result);
        assertEquals("Exercícios Vocais Adicionais", prescricao.getTitulo());
        verify(prescricaoRepository, times(1)).save(prescricao);
    }

    @Test
    void gerarPdf_ShouldCallPdfService() {
        when(prescricaoRepository.findByIdWithRelations(1L)).thenReturn(Optional.of(prescricao));
        byte[] expectedPdf = new byte[]{1, 2, 3};
        when(pdfService.gerarPrescricaoPdf(prescricao)).thenReturn(expectedPdf);

        byte[] result = prescricaoService.gerarPdf(1L);

        assertNotNull(result);
        assertArrayEquals(expectedPdf, result);
        verify(pdfService, times(1)).gerarPrescricaoPdf(prescricao);
    }
}
