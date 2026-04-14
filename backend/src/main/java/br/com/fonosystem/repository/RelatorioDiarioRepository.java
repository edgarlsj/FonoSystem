package br.com.fonosystem.repository;

import br.com.fonosystem.model.RelatorioDiario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RelatorioDiarioRepository extends JpaRepository<RelatorioDiario, Long> {

    @Query("SELECT r FROM RelatorioDiario r JOIN FETCH r.paciente JOIN FETCH r.profissional WHERE r.paciente.id = :pacienteId ORDER BY r.dataSessao DESC")
    List<RelatorioDiario> findByPacienteIdOrderByDataSessaoDesc(@Param("pacienteId") Long pacienteId);

    @Query("SELECT r FROM RelatorioDiario r JOIN FETCH r.paciente JOIN FETCH r.profissional WHERE r.dataSessao = :dataSessao ORDER BY r.horaInicio")
    List<RelatorioDiario> findByDataSessaoOrderByHoraInicio(@Param("dataSessao") LocalDate dataSessao);

    @Query("SELECT r FROM RelatorioDiario r JOIN FETCH r.paciente JOIN FETCH r.profissional WHERE r.paciente.id = :pacienteId AND r.dataSessao BETWEEN :inicio AND :fim ORDER BY r.dataSessao")
    List<RelatorioDiario> findByPacienteIdAndDataSessaoBetween(@Param("pacienteId") Long pacienteId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT r FROM RelatorioDiario r JOIN FETCH r.paciente JOIN FETCH r.profissional WHERE r.id = :id")
    java.util.Optional<RelatorioDiario> findByIdWithFetch(@Param("id") Long id);
}
