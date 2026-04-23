package br.com.fonosystem.service;

import br.com.fonosystem.dto.LoginRequest;
import br.com.fonosystem.dto.LoginResponse;
import br.com.fonosystem.exception.BusinessException;
import br.com.fonosystem.model.User;
import br.com.fonosystem.model.enums.Perfil;
import br.com.fonosystem.repository.UserRepository;
import br.com.fonosystem.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    private User user;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .nome("Test User")
                .email("test@test.com")
                .senhaHash("hash")
                .perfil(Perfil.FONOAUDIOLOGO)
                .numeroConselho("1234")
                .ativo(true)
                .build();

        userDetails = org.springframework.security.core.userdetails.User
                .withUsername("test@test.com")
                .password("hash")
                .roles("FONOAUDIOLOGO")
                .build();
    }

    @Test
    void login_WhenCredentialsAreValid_ShouldReturnLoginResponse() {
        LoginRequest request = new LoginRequest("test@test.com", "123456");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
        when(userDetailsService.loadUserByUsername("test@test.com")).thenReturn(userDetails);
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(jwtUtils.generateToken(userDetails)).thenReturn("accessToken");
        when(jwtUtils.generateRefreshToken(userDetails)).thenReturn("refreshToken");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("accessToken", response.getToken());
        assertEquals("refreshToken", response.getRefreshToken());
        assertEquals("test@test.com", response.getEmail());
        assertEquals("FONOAUDIOLOGO", response.getPerfil());
        
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void refresh_WhenTokenIsValid_ShouldReturnNewToken() {
        String oldRefreshToken = "oldRefreshToken";

        when(jwtUtils.extractUsername(oldRefreshToken)).thenReturn("test@test.com");
        when(userDetailsService.loadUserByUsername("test@test.com")).thenReturn(userDetails);
        when(jwtUtils.isTokenValid(oldRefreshToken, userDetails)).thenReturn(true);
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(jwtUtils.generateToken(userDetails)).thenReturn("newAccessToken");

        LoginResponse response = authService.refresh(oldRefreshToken);

        assertNotNull(response);
        assertEquals("newAccessToken", response.getToken());
        assertEquals(oldRefreshToken, response.getRefreshToken());
        assertEquals("test@test.com", response.getEmail());
    }

    @Test
    void refresh_WhenTokenIsInvalid_ShouldThrowException() {
        String invalidToken = "invalidToken";

        when(jwtUtils.extractUsername(invalidToken)).thenReturn("test@test.com");
        when(userDetailsService.loadUserByUsername("test@test.com")).thenReturn(userDetails);
        when(jwtUtils.isTokenValid(invalidToken, userDetails)).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class, () -> authService.refresh(invalidToken));
        assertEquals("Refresh token inválido ou expirado", exception.getMessage());
        verify(jwtUtils, never()).generateToken(any(UserDetails.class));
    }
}
