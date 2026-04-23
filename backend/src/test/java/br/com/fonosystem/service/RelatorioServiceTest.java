package br.com.fonosystem.service;

import br.com.fonosystem.dto.RelatorioRequest;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.Paciente;
import br.com.fonosystem.model.RelatorioDiario;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.PacienteRepository;
import br.com.fonosystem.repository.RelatorioDiarioRepository;
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

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RelatorioServiceTest {

    @Mock
    private RelatorioDiarioRepository relatorioRepository;

    @Mock
    private PacienteService pacienteService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private RelatorioService relatorioService;

    private Paciente paciente;
    private User profissional;
    private RelatorioDiario relatorio;
    private RelatorioRequest request;

    @BeforeEach
    void setUp() {
        paciente = Paciente.builder().id(1L).build();
        profissional = User.builder().id(2L).email("medico@teste.com").build();

        relatorio = RelatorioDiario.builder()
                .id(1L)
                .paciente(paciente)
                .profissional(profissional)
                .dataSessao(LocalDate.now())
                .atividadesRealizadas("Terapia da fala")
                .build();

        request = new RelatorioRequest();
        request.setPacienteId(1L);
        request.setDataSessao(LocalDate.now());
        request.setAtividadesRealizadas("Terapia da fala ajustada");

        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listarPorPaciente_ShouldReturnList() {
        when(relatorioRepository.findByPacienteIdOrderByDataSessaoDesc(1L)).thenReturn(List.of(relatorio));

        List<RelatorioDiario> result = relatorioService.listarPorPaciente(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(relatorioRepository, times(1)).findByPacienteIdOrderByDataSessaoDesc(1L);
    }

    @Test
    void buscarPorId_WhenExists_ShouldReturnRelatorio() {
        when(relatorioRepository.findByIdWithFetch(1L)).thenReturn(Optional.of(relatorio));

        RelatorioDiario result = relatorioService.buscarPorId(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void buscarPorId_WhenNotExists_ShouldThrowException() {
        when(relatorioRepository.findByIdWithFetch(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> relatorioService.buscarPorId(99L));
    }

    @Test
    void buscarEvolucao_ShouldReturnList() {
        LocalDate inicio = LocalDate.now().minusDays(10);
        LocalDate fim = LocalDate.now();
        when(relatorioRepository.findByPacienteIdAndDataSessaoBetween(1L, inicio, fim)).thenReturn(List.of(relatorio));

        List<RelatorioDiario> result = relatorioService.buscarEvolucao(1L, inicio, fim);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(relatorioRepository, times(1)).findByPacienteIdAndDataSessaoBetween(1L, inicio, fim);
    }

    @Test
    void criar_WhenValid_ShouldSaveRelatorio() {
        when(pacienteService.buscarEntidadePorId(1L)).thenReturn(paciente);
        when(relatorioRepository.save(any(RelatorioDiario.class))).thenReturn(relatorio);

        RelatorioDiario result = relatorioService.criar(request);

        assertNotNull(result);
        verify(relatorioRepository, times(1)).save(any(RelatorioDiario.class));
    }

    @Test
    void criar_WhenPacienteNotFound_ShouldThrowException() {
        when(pacienteService.buscarEntidadePorId(1L)).thenThrow(new ResourceNotFoundException("Paciente não encontrado"));

        assertThrows(ResourceNotFoundException.class, () -> relatorioService.criar(request));
        verify(relatorioRepository, never()).save(any());
    }

    @Test
    void atualizar_WhenExists_ShouldUpdateFields() {
        when(relatorioRepository.findByIdWithFetch(1L)).thenReturn(Optional.of(relatorio));
        when(relatorioRepository.save(any(RelatorioDiario.class))).thenReturn(relatorio);

        RelatorioDiario result = relatorioService.atualizar(1L, request);

        assertNotNull(result);
        assertEquals("Terapia da fala ajustada", relatorio.getAtividadesRealizadas());
        verify(relatorioRepository, times(1)).save(relatorio);
    }

    @Test
    void excluir_WhenExists_ShouldDelete() {
        when(relatorioRepository.existsById(1L)).thenReturn(true);

        relatorioService.excluir(1L);

        verify(relatorioRepository, times(1)).deleteById(1L);
    }

    @Test
    void excluir_WhenNotExists_ShouldThrowException() {
        when(relatorioRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> relatorioService.excluir(99L));
        verify(relatorioRepository, never()).deleteById(anyLong());
    }
}
