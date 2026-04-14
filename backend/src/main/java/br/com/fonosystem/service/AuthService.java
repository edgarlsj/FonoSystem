package br.com.fonosystem.service;

import br.com.fonosystem.dto.LoginRequest;
import br.com.fonosystem.dto.LoginResponse;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.UserRepository;
import br.com.fonosystem.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        String token = jwtUtils.generateToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .nome(user.getNome())
                .email(user.getEmail())
                .perfil(user.getPerfil().name())
                .build();
    }

    public LoginResponse refresh(String refreshToken) {
        String email = jwtUtils.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        if (!jwtUtils.isTokenValid(refreshToken, userDetails)) {
            throw new br.com.fonosystem.exception.BusinessException("Refresh token inválido ou expirado");
        }

        User user = userRepository.findByEmail(email).orElseThrow();
        String newToken = jwtUtils.generateToken(userDetails);

        return LoginResponse.builder()
                .token(newToken)
                .refreshToken(refreshToken)
                .nome(user.getNome())
                .email(user.getEmail())
                .perfil(user.getPerfil().name())
                .build();
    }
}
