package br.com.fonosystem.service;

import br.com.fonosystem.dto.UserRequest;
import br.com.fonosystem.dto.UserResponse;
import br.com.fonosystem.exception.BusinessException;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.User;
import br.com.fonosystem.model.enums.Perfil;
import br.com.fonosystem.repository.UserRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private LogService logService;

    @InjectMocks
    private UserService userService;

    private User adminUser;
    private User subjectUser;
    private UserRequest userRequest;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1L)
                .nome("Admin")
                .email("admin@test.com")
                .senhaHash("hash")
                .perfil(Perfil.ADMIN)
                .ativo(true)
                .build();

        subjectUser = User.builder()
                .id(2L)
                .nome("Fono")
                .email("fono@test.com")
                .senhaHash("hash")
                .perfil(Perfil.FONOAUDIOLOGO)
                .ativo(true)
                .build();

        userRequest = new UserRequest();
        userRequest.setNome("New Fono");
        userRequest.setEmail("newfono@test.com");
        userRequest.setSenha("123456");
        userRequest.setPerfil(Perfil.FONOAUDIOLOGO);
        userRequest.setAtivo(true);
    }

    @Test
    void findAll_ShouldReturnPageOfUserResponse() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> page = new PageImpl<>(List.of(adminUser, subjectUser));
        
        when(userRepository.findAll(pageable)).thenReturn(page);

        Page<UserResponse> result = userService.findAll(pageable);

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals("admin@test.com", result.getContent().get(0).getEmail());
        verify(userRepository, times(1)).findAll(pageable);
    }

    @Test
    void findById_WhenUserExists_ShouldReturnUserResponse() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        UserResponse result = userService.findById(1L);

        assertNotNull(result);
        assertEquals("Admin", result.getNome());
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void findById_WhenUserDoesNotExist_ShouldThrowException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.findById(99L));
        verify(userRepository, times(1)).findById(99L);
    }

    @Test
    void create_WhenEmailNotExists_ShouldCreateUser() {
        when(userRepository.existsByEmail(userRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(userRequest.getSenha())).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenReturn(subjectUser);
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));

        UserResponse result = userService.create(userRequest, "admin@test.com");

        assertNotNull(result);
        verify(userRepository, times(1)).save(any(User.class));
        verify(logService, times(1)).registrar(eq("CREATE"), eq("USER"), any(), anyString(), eq(adminUser));
    }

    @Test
    void create_WhenEmailExists_ShouldThrowBusinessException() {
        when(userRepository.existsByEmail(userRequest.getEmail())).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> userService.create(userRequest, "admin@test.com"));
        assertEquals("Email já cadastrado", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void create_WhenPasswordIsBlank_ShouldThrowBusinessException() {
        userRequest.setSenha("");
        when(userRepository.existsByEmail(userRequest.getEmail())).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class, () -> userService.create(userRequest, "admin@test.com"));
        assertEquals("Senha é obrigatória para novo usuário", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void update_WhenUserExists_ShouldUpdateUser() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(subjectUser));
        when(userRepository.existsByEmail(userRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(userRequest.getSenha())).thenReturn("newEncodedPass");
        when(userRepository.save(any(User.class))).thenReturn(subjectUser);
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));

        UserResponse result = userService.update(2L, userRequest, "admin@test.com");

        assertNotNull(result);
        verify(userRepository, times(1)).save(any(User.class));
        verify(logService, times(1)).registrar(eq("UPDATE"), eq("USER"), any(), anyString(), eq(adminUser));
    }

    @Test
    void toggleStatus_ShouldInvertAtivoFlag() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(subjectUser));
        subjectUser.setAtivo(true);
        when(userRepository.save(any(User.class))).thenReturn(subjectUser);
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));

        UserResponse result = userService.toggleStatus(2L, "admin@test.com");

        assertNotNull(result);
        assertFalse(subjectUser.getAtivo()); // it got inverted to false before save
        verify(userRepository, times(1)).save(subjectUser);
    }

    @Test
    void delete_ShouldSetAtivoToFalse() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(subjectUser));
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));

        userService.delete(2L, "admin@test.com");

        assertFalse(subjectUser.getAtivo());
        verify(userRepository, times(1)).save(subjectUser);
        verify(logService, times(1)).registrar(eq("DELETE"), eq("USER"), eq(2L), anyString(), eq(adminUser));
    }
}
