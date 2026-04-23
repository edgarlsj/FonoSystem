package br.com.fonosystem.repository;

import br.com.fonosystem.model.Paciente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    @Query(value = "SELECT * FROM pacientes p WHERE " +
           "(:nome IS NULL OR lower(p.nome_completo) LIKE lower(CONCAT('%', CAST(:nome AS TEXT), '%'))) AND " +
           "(:status IS NULL OR p.status = CAST(:status AS TEXT)) AND " +
           "p.deleted_at IS NULL",
           countQuery = "SELECT count(*) FROM pacientes p WHERE " +
           "(:nome IS NULL OR lower(p.nome_completo) LIKE lower(CONCAT('%', CAST(:nome AS TEXT), '%'))) AND " +
           "(:status IS NULL OR p.status = CAST(:status AS TEXT)) AND " +
           "p.deleted_at IS NULL",
           nativeQuery = true)
    Page<Paciente> findByFilters(@Param("nome") String nome,
                                  @Param("status") String status,
                                  Pageable pageable);

    long countByStatus(String status);

    boolean existsByCpf(String cpf);
}
