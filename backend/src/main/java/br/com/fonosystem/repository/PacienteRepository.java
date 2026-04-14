package br.com.fonosystem.repository;

import br.com.fonosystem.model.Paciente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    @Query("SELECT p FROM Paciente p WHERE p.deletedAt IS NULL AND " +
           "(:nome IS NULL OR LOWER(p.nomeCompleto) LIKE LOWER(CONCAT('%', :nome, '%'))) AND " +
           "(:status IS NULL OR p.status = :status)")
    Page<Paciente> findByFilters(@Param("nome") String nome,
                                  @Param("status") String status,
                                  Pageable pageable);

    long countByStatus(String status);

    boolean existsByCpf(String cpf);
}
