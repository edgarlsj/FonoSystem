import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface FolhaEvolucaoProps {
  dadosAgrupados: Map<string, any[]>
  onFechar: () => void
  onRegistrarSessao?: () => void
}

export default function FolhaEvolucao({ dadosAgrupados, onFechar, onRegistrarSessao }: FolhaEvolucaoProps) {
  const dataAtual = format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })

  const handlePrint = () => {
    const content = document.getElementById('folha-evolucao-content')
    if (!content) return

    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) return

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Folha de Evolução</title>
  <meta charset="utf-8">
  <style>
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
    @page { size: A4; margin: 15mm; }
    html, body { margin: 0; padding: 0; background: white; }
    body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333; }
    body > div { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
    h1 { margin: 0 0 4px 0; font-size: 20px; text-align: center; font-weight: bold; }
    h2 { margin: 0; font-size: 16px; font-weight: bold; color: #1F2937; }
    h3 { margin: 0; font-size: 12px; font-weight: bold; color: #111827; }
    p { margin: 0; white-space: pre-wrap; }
    label { display: block; }
  </style>
</head>
<body>${content.innerHTML}</body>
</html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 300)
  }

  return (
    <div className="modal-overlay active">
      <div className="modal" style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">Folha de Evolução</h2>
          <button className="modal-close" onClick={onFechar} type="button">×</button>
        </div>

        <div id="folha-evolucao-content" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.6', color: '#333', maxWidth: '210mm' }}>
          {/* Cabeçalho do documento */}
          <div style={{ marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '12px' }}>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '20px', textAlign: 'center', fontWeight: 'bold' }}>
              Folha de Evolução
            </h1>
            <p style={{ margin: '0', textAlign: 'center', fontSize: '11px', color: '#666' }}>
              Gerado em {dataAtual}
            </p>
          </div>

          {/* Conteúdo por paciente */}
          {Array.from(dadosAgrupados.entries()).map(([pacienteNome, relatorios], idx) => (
            <div key={idx} style={{ marginBottom: '28px', marginTop: idx === 0 ? '0' : '20px', pageBreakInside: 'avoid' }}>
              {/* Título do paciente */}
              <div style={{ marginBottom: '12px', borderBottom: '2px solid #666', paddingBottom: '6px' }}>
                <h2 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#1F2937' }}>
                  {pacienteNome}
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#666' }}>
                  Total de sessões: <strong>{relatorios.length}</strong> •
                  Período: {format(parseISO(relatorios[0].dataSessao), 'dd/MM/yyyy', { locale: ptBR })} a {format(parseISO(relatorios[relatorios.length - 1].dataSessao), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>

              {/* Lista de relatórios do paciente */}
              {relatorios.map((rel, relIdx) => (
                <div key={relIdx} style={{ marginBottom: '16px', padding: '12px', background: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB', pageBreakInside: 'avoid' }}>
                  {/* Cabeçalho da sessão */}
                  <div style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #D1D5DB' }}>
                    <h3 style={{ margin: '0', fontSize: '12px', fontWeight: 'bold', color: '#111827' }}>
                      {format(parseISO(rel.dataSessao), 'dd/MM/yyyy', { locale: ptBR })} • {rel.horaInicio} - {rel.horaFim}
                    </h3>
                  </div>

                  {/* Campos do relatório */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                    {/* Meta Trabalhada */}
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '2px' }}>
                        Meta Trabalhada
                      </label>
                      <p style={{ margin: '0', fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>
                        {rel.metaTrabalhada || '—'}
                      </p>
                    </div>

                    {/* Atividades Realizadas */}
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '2px' }}>
                        Atividades Realizadas
                      </label>
                      <p style={{ margin: '0', fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>
                        {rel.atividadesRealizadas || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Evolução */}
                  {rel.evolucaoObservada && (
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '2px' }}>
                        Evolução Observada
                      </label>
                      <p style={{ margin: '0', fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>
                        {rel.evolucaoObservada}
                      </p>
                    </div>
                  )}

                  {/* Orientações e Planejamento em duas colunas */}
                  {(rel.orientacoesFamilia || rel.planejamentoProximaSessao) && (
                    <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {rel.orientacoesFamilia && (
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '2px' }}>
                            Orientações à Família
                          </label>
                          <p style={{ margin: '0', fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>
                            {rel.orientacoesFamilia}
                          </p>
                        </div>
                      )}

                      {rel.planejamentoProximaSessao && (
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '2px' }}>
                            Planejamento Próxima Sessão
                          </label>
                          <p style={{ margin: '0', fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>
                            {rel.planejamentoProximaSessao}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CAA e Intercorrências */}
                  {(rel.usoCaaSessao || rel.intercorrencias) && (
                    <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {rel.usoCaaSessao && (
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '2px' }}>
                            Uso de CAA
                          </label>
                          <p style={{ margin: '0', fontSize: '12px', color: '#374151', fontWeight: '600' }}>
                            ✅ Sim {rel.recursoCaaUtilizado && `(${rel.recursoCaaUtilizado})`}
                          </p>
                        </div>
                      )}

                      {rel.intercorrencias && (
                        <div>
                          <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '2px' }}>
                            Intercorrências
                          </label>
                          <p style={{ margin: '0', fontSize: '12px', color: '#374151', whiteSpace: 'pre-wrap' }}>
                            {rel.intercorrencias}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Rodapé */}
          <div style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #E5E7EB', textAlign: 'center', fontSize: '10px', color: '#9CA3AF' }}>
            <p style={{ margin: '0' }}>
              Folha de Evolução Clínica
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="form-actions" style={{ marginTop: '0', borderTop: '1px solid #E5E7EB' }}>
          <button type="button" className="btn btn-outline" onClick={onFechar}>
            Fechar
          </button>
          {onRegistrarSessao && (
            <button type="button" className="btn btn-outline" onClick={onRegistrarSessao}>
              + Registrar Sessão
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePrint}
          >
            🖨️ Imprimir / Salvar como PDF
          </button>
        </div>
      </div>

    </div>
  )
}
