package br.com.fonosystem.service;

import br.com.fonosystem.dto.UserRequest;
import br.com.fonosystem.dto.UserResponse;
import br.com.fonosystem.exception.BusinessException;
import br.com.fonosystem.exception.ResourceNotFoundException;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LogService logService;

    @Transactional(readOnly = true)
    public Page<UserResponse> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return UserResponse.fromEntity(user);
    }

    public UserResponse create(UserRequest request, String emailAdmin) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email já cadastrado");
        }

        if (request.getSenha() == null || request.getSenha().isBlank()) {
            throw new BusinessException("Senha é obrigatória para novo usuário");
        }

        User user = User.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .senhaHash(passwordEncoder.encode(request.getSenha()))
                .perfil(request.getPerfil())
                .ativo(request.getAtivo() != null ? request.getAtivo() : true)
                .build();

        User saved = userRepository.save(user);

        Optional<User> admin = userRepository.findByEmail(emailAdmin);
        admin.ifPresent(user1 -> logService.registrar("CREATE", "USER", saved.getId(),
                "Novo usuário criado: " + saved.getEmail(), user1));

        log.info("✓ Usuário criado: {} ({})", saved.getNome(), saved.getEmail());
        return UserResponse.fromEntity(saved);
    }

    public UserResponse update(Long id, UserRequest request, String emailAdmin) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (!user.getEmail().equals(request.getEmail()) &&
            userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email já cadastrado");
        }

        user.setNome(request.getNome());
        user.setEmail(request.getEmail());
        user.setPerfil(request.getPerfil());
        user.setAtivo(request.getAtivo() != null ? request.getAtivo() : user.getAtivo());

        if (request.getSenha() != null && !request.getSenha().isBlank()) {
            user.setSenhaHash(passwordEncoder.encode(request.getSenha()));
        }

        User updated = userRepository.save(user);

        Optional<User> admin = userRepository.findByEmail(emailAdmin);
        admin.ifPresent(user1 -> logService.registrar("UPDATE", "USER", updated.getId(),
                "Usuário atualizado: " + updated.getEmail(), user1));

        log.info("✓ Usuário atualizado: {} ({})", updated.getNome(), updated.getEmail());
        return UserResponse.fromEntity(updated);
    }

    public UserResponse toggleStatus(Long id, String emailAdmin) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        user.setAtivo(!user.getAtivo());
        User updated = userRepository.save(user);

        Optional<User> admin = userRepository.findByEmail(emailAdmin);
        admin.ifPresent(user1 -> logService.registrar("UPDATE", "USER", updated.getId(),
                "Status alterado para: " + (updated.getAtivo() ? "ATIVO" : "INATIVO"), user1));

        log.info("✓ Status do usuário {} alterado para: {}", user.getEmail(),
                updated.getAtivo() ? "ATIVO" : "INATIVO");
        return UserResponse.fromEntity(updated);
    }

    public void delete(Long id, String emailAdmin) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        user.setAtivo(false);
        userRepository.save(user);

        Optional<User> admin = userRepository.findByEmail(emailAdmin);
        admin.ifPresent(user1 -> logService.registrar("DELETE", "USER", id,
                "Usuário deletado: " + user.getEmail(), user1));

        log.info("✓ Usuário deletado (soft): {} ({})", user.getNome(), user.getEmail());
    }
}
