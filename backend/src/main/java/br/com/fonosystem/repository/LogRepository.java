package br.com.fonosystem.repository;

import br.com.fonosystem.model.Log;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface LogRepository extends JpaRepository<Log, Long> {

    @Query("SELECT l FROM Log l WHERE " +
           "(:acao IS NULL OR l.acao = :acao) AND " +
           "(:entidade IS NULL OR l.entidade = :entidade) AND " +
           "(:datainicio IS NULL OR l.dataCriacao >= :datainicio) AND " +
           "(:datafim IS NULL OR l.dataCriacao <= :datafim) " +
           "ORDER BY l.dataCriacao DESC")
    Page<Log> findByFilters(@Param("acao") String acao,
                            @Param("entidade") String entidade,
                            @Param("datainicio") LocalDateTime datainicio,
                            @Param("datafim") LocalDateTime datafim,
                            Pageable pageable);

    Page<Log> findByEntidadeAndEntidadeId(String entidade, Long entidadeId, Pageable pageable);

    List<Log> findByEntidadeAndAcaoOrderByDataCriacaoDesc(String entidade, String acao);
}
