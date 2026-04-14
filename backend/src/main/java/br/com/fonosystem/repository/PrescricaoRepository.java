package br.com.fonosystem.repository;

import br.com.fonosystem.model.Prescricao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PrescricaoRepository extends JpaRepository<Prescricao, Long> {

    @Query("SELECT p FROM Prescricao p JOIN FETCH p.paciente JOIN FETCH p.profissional WHERE p.paciente.id = :pacienteId ORDER BY p.dataPrescricao DESC")
    List<Prescricao> findByPacienteIdOrderByDataPrescricaoDesc(@Param("pacienteId") Long pacienteId);

    @Query("SELECT p FROM Prescricao p JOIN FETCH p.paciente JOIN FETCH p.profissional WHERE p.id = :id")
    Optional<Prescricao> findByIdWithRelations(@Param("id") Long id);
}
