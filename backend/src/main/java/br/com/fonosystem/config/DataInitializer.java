package br.com.fonosystem.config;

import br.com.fonosystem.model.User;
import br.com.fonosystem.model.enums.Perfil;
import br.com.fonosystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_PASSWORD:admin123}")
    private String adminPassword;

    @Value("${VIVIANE_PASSWORD:admin123}")
    private String vivianePassword;

    @Bean
    CommandLineRunner initData(UserRepository userRepository) {
        return args -> {
            if (!userRepository.existsByEmail("admin@fonosystem.com")) {
                log.info("=== Criando usuários padrão ===");

                User admin = User.builder()
                        .nome("Admin Master")
                        .email("admin@fonosystem.com")
                        .senhaHash(passwordEncoder.encode(adminPassword))
                        .perfil(Perfil.ADMIN)
                        .ativo(true)
                        .build();

                userRepository.save(admin);
                log.info("✓ Admin criado: admin@fonosystem.com");
            }

            if (!userRepository.existsByEmail("viviane@fonosystem.com")) {
                User viviane = User.builder()
                        .nome("Dra. Viviane Cardoso da Silva")
                        .email("viviane@fonosystem.com")
                        .senhaHash(passwordEncoder.encode(vivianePassword))
                        .perfil(Perfil.FONOAUDIOLOGO)
                        .numeroConselho("CRFa 2-12345")
                        .ativo(true)
                        .build();

                userRepository.save(viviane);
                log.info("✓ Usuário viviane@fonosystem.com criado com sucesso");
            }
        };
    }
}
