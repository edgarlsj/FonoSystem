package br.com.fonosystem.repository;

import br.com.fonosystem.model.Documento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    @Query("SELECT d FROM Documento d JOIN FETCH d.paciente " +
           "WHERE d.paciente.id = :pacienteId ORDER BY d.dataAnexacao DESC")
    List<Documento> findByPacienteIdOrderByDataAnexacaoDesc(@Param("pacienteId") Long pacienteId);

    @Query("SELECT d FROM Documento d JOIN FETCH d.paciente " +
           "WHERE d.paciente.id = :pacienteId AND d.id = :id")
    Optional<Documento> findByIdAndPacienteId(@Param("pacienteId") Long pacienteId, @Param("id") Long id);

    void deleteByIdAndPacienteId(Long id, Long pacienteId);
}
