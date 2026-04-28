package br.com.fonosystem.repository;

import br.com.fonosystem.model.Paciente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    @Query(value = "SELECT * FROM pacientes p WHERE " +
           "p.profissional_id = :profissionalId AND " +
           "(:nome IS NULL OR lower(p.nome_completo) LIKE lower(CONCAT('%', CAST(:nome AS TEXT), '%'))) AND " +
           "(:status IS NULL OR p.status = CAST(:status AS TEXT))",
           countQuery = "SELECT count(*) FROM pacientes p WHERE " +
           "p.profissional_id = :profissionalId AND " +
           "(:nome IS NULL OR lower(p.nome_completo) LIKE lower(CONCAT('%', CAST(:nome AS TEXT), '%'))) AND " +
           "(:status IS NULL OR p.status = CAST(:status AS TEXT))",
           nativeQuery = true)
    Page<Paciente> findByFilters(@Param("nome") String nome,
                                  @Param("status") String status,
                                  @Param("profissionalId") Long profissionalId,
                                  Pageable pageable);

    long countByStatusAndProfissionalId(String status, Long profissionalId);

    boolean existsByCpf(String cpf);
}
