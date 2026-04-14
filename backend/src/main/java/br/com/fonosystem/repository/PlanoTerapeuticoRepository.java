package br.com.fonosystem.repository;

import br.com.fonosystem.model.PlanoTerapeutico;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlanoTerapeuticoRepository extends JpaRepository<PlanoTerapeutico, Long> {
    List<PlanoTerapeutico> findByAvaliacaoId(Long avaliacaoId);
}
