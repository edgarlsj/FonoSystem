package br.com.fonosystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "logs", indexes = {
    @Index(name = "idx_logs_usuario", columnList = "usuario_id"),
    @Index(name = "idx_logs_entidade", columnList = "entidade"),
    @Index(name = "idx_logs_acao", columnList = "acao"),
    @Index(name = "idx_logs_data", columnList = "data_criacao")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Log {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String acao; // CRIOU, ATUALIZOU, DELETOU, DESATIVOU, ATIVOU

    @Column(nullable = false, length = 50)
    private String entidade; // PACIENTE, PRESCRICAO, RELATORIO, etc

    @Column(nullable = false)
    private Long entidadeId; // ID da entidade afetada

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao; // Descrição da alteração

    @Column(name = "detalhes", columnDefinition = "TEXT")
    private String detalhes; // Dados anteriores/novos em JSON

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private User usuario;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @CreationTimestamp
    @Column(name = "data_criacao", updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;
}
