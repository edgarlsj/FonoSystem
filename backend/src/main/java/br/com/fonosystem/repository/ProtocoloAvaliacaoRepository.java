package br.com.fonosystem.repository;

import br.com.fonosystem.model.ProtocoloAvaliacao;
import br.com.fonosystem.model.enums.TipoProtocolo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProtocoloAvaliacaoRepository extends JpaRepository<ProtocoloAvaliacao, Long> {

    List<ProtocoloAvaliacao> findByPacienteIdOrderByDataAplicacaoDesc(Long pacienteId);

    List<ProtocoloAvaliacao> findByPacienteIdAndTipoOrderByDataAplicacaoDesc(Long pacienteId, TipoProtocolo tipo);
}
