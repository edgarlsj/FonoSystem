package br.com.fonosystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data @Builder @AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String token;
    private String refreshToken;
    private String nome;
    private String email;
    private String perfil;
    private String numeroConselho;
}
