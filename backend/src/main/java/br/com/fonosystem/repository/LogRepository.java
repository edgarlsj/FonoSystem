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

    @Query(value = "SELECT l.* FROM logs l WHERE " +
           "(:acao IS NULL OR l.acao = CAST(:acao AS TEXT)) AND " +
           "(:entidade IS NULL OR l.entidade = CAST(:entidade AS TEXT)) AND " +
           "(CAST(:datainicio AS TIMESTAMP) IS NULL OR l.data_criacao >= CAST(:datainicio AS TIMESTAMP)) AND " +
           "(CAST(:datafim AS TIMESTAMP) IS NULL OR l.data_criacao <= CAST(:datafim AS TIMESTAMP))",
           countQuery = "SELECT count(*) FROM logs l WHERE " +
           "(:acao IS NULL OR l.acao = CAST(:acao AS TEXT)) AND " +
           "(:entidade IS NULL OR l.entidade = CAST(:entidade AS TEXT)) AND " +
           "(CAST(:datainicio AS TIMESTAMP) IS NULL OR l.data_criacao >= CAST(:datainicio AS TIMESTAMP)) AND " +
           "(CAST(:datafim AS TIMESTAMP) IS NULL OR l.data_criacao <= CAST(:datafim AS TIMESTAMP))",
           nativeQuery = true)
    Page<Log> findByFilters(@Param("acao") String acao,
                            @Param("entidade") String entidade,
                            @Param("datainicio") LocalDateTime datainicio,
                            @Param("datafim") LocalDateTime datafim,
                            Pageable pageable);

    Page<Log> findByEntidadeAndEntidadeId(String entidade, Long entidadeId, Pageable pageable);

    List<Log> findByEntidadeAndAcaoOrderByDataCriacaoDesc(String entidade, String acao);
}
