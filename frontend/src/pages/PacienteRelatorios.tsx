import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'

export default function PacienteRelatorios() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState<any>(null)
  const [relatorios, setRelatorios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [relatorioVisualizar, setRelatorioVisualizar] = useState<any | null>(null)
  
  // Filtros
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [termoBusca, setTermoBusca] = useState('')

  useEffect(() => {
    carregarDados()
  }, [id, dataInicio, dataFim])

  const carregarDados = async () => {
    try {
      setLoading(true)
      
      // Carrega dados do paciente apenas na primeira vez ou se mudar ID
      if (!paciente) {
        const pacRes = await api.get(`/v1/pacientes/${id}`)
        setPaciente(pacRes.data)
      }

      // Se houver datas, usa o endpoint de evolução (filtro por data)
      // Caso contrário, carrega todos
      let url = `/v1/pacientes/${id}/relatorios`
      if (dataInicio && dataFim) {
        url = `/v1/pacientes/${id}/evolucao?inicio=${dataInicio}&fim=${dataFim}`
      }

      const { data } = await api.get(url)
      setRelatorios(data || [])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  const limparFiltros = () => {
    setDataInicio('')
    setDataFim('')
    setTermoBusca('')
  }

  const relatoriosFiltrados = relatorios.filter(rel => {
    if (!termoBusca) return true
    const busca = termoBusca.toLowerCase()
    return (
      rel.metaTrabalhada?.toLowerCase().includes(busca) ||
      rel.atividadesRealizadas?.toLowerCase().includes(busca) ||
      rel.evolucaoObservada?.toLowerCase().includes(busca)
    )
  })

  const handleVisualizar = async (relId: number) => {
    try {
      setLoading(true)
      const { data } = await api.get(`/v1/relatorios/${relId}`)
      setRelatorioVisualizar(data)
    } catch (err) {
      console.error('Erro ao carregar detalhes do relatório:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !paciente) {
    return <div style={{ textAlign: 'center', padding: '100px', color: '#6B7280' }}>Carregando histórico...</div>
  }

  return (
    <div>
      <div className="breadcrumb">
        <button onClick={() => navigate('/pacientes')} className="btn-link" style={{ padding: 0 }}>Pacientes</button>
        <span>›</span>
        <strong>{paciente?.nomeCompleto || 'Paciente'}</strong>
        <span>›</span> Histórico de Sessões
      </div>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>← Voltar</button>
          <div>
            <div className="page-title">Histórico de Sessões</div>
            <div className="page-subtitle">Todos os relatórios diários registrados</div>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="table-toolbar" style={{ marginBottom: '24px', background: 'white', padding: '16px', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr auto', gap: '16px', alignItems: 'end', width: '100%' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Data Início</label>
            <input type="date" className="form-control" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Data Fim</label>
            <input type="date" className="form-control" value={dataFim} onChange={e => setDataFim(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Buscar por Meta ou Atividade</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Digite para filtrar..." 
              value={termoBusca}
              onChange={e => setTermoBusca(e.target.value)}
            />
          </div>
          <button className="btn btn-outline" onClick={limparFiltros} style={{ whiteSpace: 'nowrap' }}>
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className="session-list">
        {relatoriosFiltrados.length === 0 ? (
          <div className="form-card" style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔎</div>
            <p>{relatorios.length === 0 ? "Nenhum relatório encontrado para este paciente." : "Nenhum resultado para os filtros aplicados."}</p>
            {(dataInicio || dataFim || termoBusca) && (
              <button className="btn-link" onClick={limparFiltros} style={{ marginTop: '12px' }}>Remover filtros</button>
            )}
          </div>
        ) : (
          relatoriosFiltrados.map((rel: any) => (
            <div className="session-card" key={rel.id}>
              <div className="session-card-header">
                <div>
                  <div className="session-patient">
                    {format(new Date(rel.dataSessao + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="session-time">{rel.horaInicio} – {rel.horaFim}</div>
                  <button 
                    className="btn-icon-secondary" 
                    title="Visualizar detalhes"
                    onClick={() => handleVisualizar(rel.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="session-body">
                <strong>Meta:</strong> {rel.metaTrabalhada}<br/>
                <strong>Atividades:</strong> {rel.atividadesRealizadas}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE VISUALIZAÇÃO */}
      <div className={`modal-overlay ${relatorioVisualizar ? 'active' : ''}`}>
        <div className="modal" style={{ maxWidth: '700px' }}>
          <div className="modal-header">
            <h2 className="modal-title">Detalhes da Sessão</h2>
            <button className="modal-close" onClick={() => setRelatorioVisualizar(null)}>×</button>
          </div>

          {relatorioVisualizar && (
            <div className="view-details">
              <div className="session-card-header" style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div className="session-patient" style={{ fontSize: '20px' }}>{relatorioVisualizar.pacienteNome}</div>
                  <div className="page-subtitle">Sessão em {format(new Date(relatorioVisualizar.dataSessao + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</div>
                </div>
                <div className="session-time" style={{ fontSize: '14px', padding: '6px 16px' }}>
                  {relatorioVisualizar.horaInicio} – {relatorioVisualizar.horaFim}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-card">
                  <div className="form-section-title"><div className="section-icon" />Objetivos e Atividades</div>
                  <div className="view-group">
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Meta Trabalhada</label>
                    <p style={{ margin: '4px 0 16px', fontSize: '14px', color: 'var(--gray-800)' }}>{relatorioVisualizar.metaTrabalhada}</p>
                    
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Atividades Realizadas</label>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--gray-800)', whiteSpace: 'pre-wrap' }}>{relatorioVisualizar.atividadesRealizadas}</p>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-card">
                    <div className="form-section-title"><div className="section-icon" />Desempenho</div>
                    <div className="session-metrics" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <div className="metric-label">Acerto</div>
                        <div className={`metric-value ${Number(relatorioVisualizar.percentualAcerto) >= 70 ? 'green' : 'blue'}`}>
                          {relatorioVisualizar.percentualAcerto != null ? `${relatorioVisualizar.percentualAcerto}%` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="metric-label">Engajamento</div>
                        <div className="engagement-dots" style={{ marginTop: '8px' }}>
                           {[1, 2, 3, 4, 5].map(v => (
                             <div key={v} className={`dot ${v <= (relatorioVisualizar.nivelEngajamento || 0) ? 'filled' : ''}`} />
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-card">
                    <div className="form-section-title"><div className="section-icon" />Comunicação Auxiliar</div>
                    <div className="view-group">
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)' }}>USO DE CAA</label>
                      <p style={{ margin: '4px 0', fontWeight: 600 }}>{relatorioVisualizar.usoCaaSessao ? '✅ Sim' : '❌ Não'}</p>
                      {relatorioVisualizar.recursoCaaUtilizado && (
                        <p style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Recurso: {relatorioVisualizar.recursoCaaUtilizado}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-card">
                  <div className="form-section-title"><div className="section-icon" />Evolução e Observações</div>
                  <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)' }}>EVOLUÇÃO OBSERVADA</label>
                      <p style={{ marginTop: '4px', fontSize: '13px' }}>{relatorioVisualizar.evolucaoObservada || 'Sem registros'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)' }}>INTERCORRÊNCIAS</label>
                      <p style={{ marginTop: '4px', fontSize: '13px' }}>{relatorioVisualizar.intercorrencias || 'Nenhuma intercorrência'}</p>
                    </div>
                  </div>
                </div>

                <div className="form-card section-auditiva">
                   <div className="form-section-title"><div className="section-icon" />Orientações e Próxima Sessão</div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--aud-600)' }}>ORIENTAÇÕES À FAMÍLIA</label>
                        <p style={{ marginTop: '4px', fontSize: '13px' }}>{relatorioVisualizar.orientacoesFamilia || 'Sem orientações específicas.'}</p>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--aud-600)' }}>PLANEJAMENTO PRÓXIMA SESSÃO</label>
                        <p style={{ marginTop: '4px', fontSize: '13px' }}>{relatorioVisualizar.planejamentoProximaSessao || 'A definir.'}</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" onClick={() => setRelatorioVisualizar(null)}>Fechar Visualização</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
