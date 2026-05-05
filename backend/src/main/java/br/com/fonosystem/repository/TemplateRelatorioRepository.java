package br.com.fonosystem.repository;

import br.com.fonosystem.model.TemplateRelatorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TemplateRelatorioRepository extends JpaRepository<TemplateRelatorio, Long> {

    @Query("SELECT t FROM TemplateRelatorio t JOIN FETCH t.profissional WHERE t.profissional.id = :profissionalId ORDER BY t.nome ASC")
    List<TemplateRelatorio> findByProfissionalIdOrderByNomeAsc(@Param("profissionalId") Long profissionalId);

    @Query("SELECT t FROM TemplateRelatorio t JOIN FETCH t.profissional WHERE t.profissional.id = :profissionalId AND t.id = :id")
    Optional<TemplateRelatorio> findByIdAndProfissionalId(@Param("profissionalId") Long profissionalId, @Param("id") Long id);
}
