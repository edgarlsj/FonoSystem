package br.com.fonosystem.repository;

import br.com.fonosystem.model.Anamnese;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnamneseRepository extends JpaRepository<Anamnese, Long> {
    List<Anamnese> findByPacienteIdOrderByCreatedAtDesc(Long pacienteId);
}
