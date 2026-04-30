package br.com.fonosystem.repository;

import br.com.fonosystem.model.RelatorioDiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface RelatorioDiarioRepository extends JpaRepository<RelatorioDiario, Long> {

    @Query("SELECT r FROM RelatorioDiario r JOIN FETCH r.paciente JOIN FETCH r.profissional WHERE r.profissional.id = :profissionalId AND r.paciente.id = :pacienteId ORDER BY r.dataSessao DESC")
    List<RelatorioDiario> findByPacienteIdOrderByDataSessaoDesc(@Param("profissionalId") Long profissionalId, @Param("pacienteId") Long pacienteId);

    @Query("SELECT r FROM RelatorioDiario r JOIN FETCH r.paciente JOIN FETCH r.profissional WHERE r.profissional.id = :profissionalId AND r.dataSessao = :dataSessao ORDER BY r.horaInicio")
    List<RelatorioDiario> findByDataSessaoOrderByHoraInicio(@Param("profissionalId") Long profissionalId, @Param("dataSessao") LocalDate dataSessao);

    @Query("SELECT r FROM RelatorioDiario r JOIN FETCH r.paciente JOIN FETCH r.profissional WHERE r.profissional.id = :profissionalId AND r.paciente.id = :pacienteId AND r.dataSessao BETWEEN :inicio AND :fim ORDER BY r.dataSessao")
    List<RelatorioDiario> findByPacienteIdAndDataSessaoBetween(@Param("profissionalId") Long profissionalId, @Param("pacienteId") Long pacienteId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT r FROM RelatorioDiario r JOIN FETCH r.paciente JOIN FETCH r.profissional WHERE r.profissional.id = :profissionalId AND r.id = :id")
    java.util.Optional<RelatorioDiario> findByIdWithFetch(@Param("profissionalId") Long profissionalId, @Param("id") Long id);

    @Query("SELECT r FROM RelatorioDiario r JOIN FETCH r.paciente JOIN FETCH r.profissional " +
           "WHERE r.profissional.id = :profissionalId " +
           "AND (:pacienteId IS NULL OR r.paciente.id = :pacienteId) " +
           "AND (cast(:data as date) IS NULL OR r.dataSessao = :data) " +
           "AND (cast(:hora as time) IS NULL OR r.horaInicio = :hora) " +
           "ORDER BY r.dataSessao DESC, r.horaInicio DESC")
    List<RelatorioDiario> filtrar(@Param("profissionalId") Long profissionalId, @Param("pacienteId") Long pacienteId, @Param("data") LocalDate data, @Param("hora") LocalTime hora);
}
