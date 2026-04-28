package br.com.fonosystem.service;

import br.com.fonosystem.model.Log;
import br.com.fonosystem.model.User;
import br.com.fonosystem.repository.LogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogService {

    private final LogRepository logRepository;
    private final ObjectMapper objectMapper;

    public void registrar(String acao, String entidade, Long entidadeId, String descricao, Object detalhes, User usuario) {
        try {
            Log log = Log.builder()
                    .acao(acao)
                    .entidade(entidade)
                    .entidadeId(entidadeId)
                    .descricao(descricao)
                    .detalhes(detalhes != null ? objectMapper.writeValueAsString(detalhes) : null)
                    .usuario(usuario)
                    .ipAddress(obterIpAddress())
                    .build();

            logRepository.save(log);
        } catch (Exception e) {
            log.error("Erro ao registrar log [{} {}#{}]: {}", acao, entidade, entidadeId, e.getMessage(), e);
        }
    }

    public void registrar(String acao, String entidade, Long entidadeId, String descricao, User usuario) {
        registrar(acao, entidade, entidadeId, descricao, null, usuario);
    }

    public Page<Log> listar(String acao, String entidade, LocalDateTime dataInicio, LocalDateTime dataFim, Pageable pageable) {
        return logRepository.findByFilters(acao, entidade, dataInicio, dataFim, pageable);
    }

    public Page<Log> listarPorEntidade(String entidade, Long entidadeId, Pageable pageable) {
        return logRepository.findByEntidadeAndEntidadeId(entidade, entidadeId, pageable);
    }

    private String obterIpAddress() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                String ip = attrs.getRequest().getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty()) {
                    ip = attrs.getRequest().getRemoteAddr();
                }
                return ip;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "DESCONHECIDO";
    }
}
