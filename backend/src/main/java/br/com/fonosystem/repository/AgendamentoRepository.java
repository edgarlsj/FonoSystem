package br.com.fonosystem.repository;

import br.com.fonosystem.model.Agendamento;
import br.com.fonosystem.model.enums.StatusAgendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    @Query("SELECT a FROM Agendamento a JOIN FETCH a.paciente JOIN FETCH a.profissional " +
           "WHERE a.profissional.id = :profissionalId " +
           "AND a.dataHoraInicio BETWEEN :inicio AND :fim " +
           "AND a.deletedAt IS NULL " +
           "ORDER BY a.dataHoraInicio")
    List<Agendamento> findByProfissionalIdAndDia(
            @Param("profissionalId") Long profissionalId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim);

    @Query("SELECT a FROM Agendamento a JOIN FETCH a.paciente JOIN FETCH a.profissional " +
           "WHERE a.profissional.id = :profissionalId " +
           "AND a.paciente.id = :pacienteId " +
           "AND a.deletedAt IS NULL " +
           "ORDER BY a.dataHoraInicio DESC")
    List<Agendamento> findByProfissionalIdAndPacienteId(
            @Param("profissionalId") Long profissionalId,
            @Param("pacienteId") Long pacienteId);

    @Query("SELECT a FROM Agendamento a " +
           "WHERE a.paciente.id = :pacienteId " +
           "AND a.profissional.id = :profissionalId " +
           "AND a.dataHoraInicio BETWEEN :inicio AND :fim " +
           "AND a.status = :status " +
           "AND a.deletedAt IS NULL")
    Optional<Agendamento> findAgendadoNoDia(
            @Param("pacienteId") Long pacienteId,
            @Param("profissionalId") Long profissionalId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("status") StatusAgendamento status);

    @Query("SELECT a FROM Agendamento a JOIN FETCH a.paciente JOIN FETCH a.profissional " +
           "WHERE a.id = :id AND a.profissional.id = :profissionalId AND a.deletedAt IS NULL")
    Optional<Agendamento> findByIdAndProfissional(
            @Param("id") Long id,
            @Param("profissionalId") Long profissionalId);

    @Query("SELECT a FROM Agendamento a JOIN FETCH a.paciente JOIN FETCH a.profissional " +
           "WHERE a.profissional.id = :profissionalId " +
           "AND a.dataHoraInicio BETWEEN :inicio AND :fim " +
           "AND a.deletedAt IS NULL " +
           "ORDER BY a.dataHoraInicio")
    List<Agendamento> findByProfissionalIdAndPeriodo(
            @Param("profissionalId") Long profissionalId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim);
}
