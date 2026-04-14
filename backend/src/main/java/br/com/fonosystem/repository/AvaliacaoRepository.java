package br.com.fonosystem.repository;

import br.com.fonosystem.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findByPacienteIdOrderByDataAvaliacaoDesc(Long pacienteId);
}
