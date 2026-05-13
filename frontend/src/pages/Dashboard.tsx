import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'

type StatusAgendamento = 'AGENDADO' | 'REALIZADO' | 'FALTOU' | 'CANCELADO'

interface Agendamento {
  id: number
  pacienteId: number
  pacienteNome: string
  dataHoraInicio: string
  duracao: number
  status: StatusAgendamento
  observacoes?: string
}

interface Paciente {
  id: number
  nomeCompleto: string
  idade: number
  status: string
  tipoAtendimento: string
  convenio?: string
  telefone: string
}

interface Relatorio {
  id: number
  paciente: { id: number; nomeCompleto: string }
  pacienteId?: number
  pacienteNome?: string
  dataSessao: string
  horaInicio: string
  horaFim: string
  metaTrabalhada: string
  atividadesRealizadas?: string
  evolucaoObservada?: string
}

interface UltimaSessao {
  orientacoesFamilia?: string
  planejamentoProximaSessao?: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [totalPacientes, setTotalPacientes] = useState(0)
  const [ativos, setAtivos] = useState(0)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [sessoesHoje, setSessoesHoje] = useState<Relatorio[]>([])
  const [agendamentosHoje, setAgendamentosHoje] = useState<Agendamento[]>([])
  const [ultimasSessoes, setUltimasSessoes] = useState<Record<number, UltimaSessao>>({})
  const [loading, setLoading] = useState(true)
  const [relatorioVisualizar, setRelatorioVisualizar] = useState<any | null>(null)

  const handleVisualizar = async (id: number) => {
    try {
      setLoading(true)
      const { data } = await api.get(`/v1/relatorios/${id}`)
      setRelatorioVisualizar(data)
    } catch (err) {
      console.error('Erro ao carregar relatório', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const pacRes = await api.get('/v1/pacientes?size=100&sort=nome_completo,asc')
        const lista: Paciente[] = pacRes.data.content || []
        setTotalPacientes(pacRes.data.totalElements || lista.length)
        setAtivos(lista.filter((p: Paciente) => p.status === 'ATIVO').length)
        setPacientes(lista.slice(0, 6))

        const hoje = new Date().toISOString().split('T')[0]

        try {
          const relRes = await api.get(`/v1/relatorios?data=${hoje}`)
          setSessoesHoje(relRes.data || [])
        } catch {
          setSessoesHoje([])
        }

        try {
          const agRes = await api.get(`/v1/agendamentos?data=${hoje}`)
          const ags: Agendamento[] = agRes.data || []
          setAgendamentosHoje(ags)

          const agendados = ags.filter(a => a.status === 'AGENDADO')
          const resultados = await Promise.allSettled(
            agendados.map(a => api.get(`/v1/pacientes/${a.pacienteId}/relatorios/ultimo`))
          )
          const map: Record<number, UltimaSessao> = {}
          agendados.forEach((a, i) => {
            const r = resultados[i]
            if (r.status === 'fulfilled' && r.value.data) {
              map[a.pacienteId] = {
                orientacoesFamilia: r.value.data.orientacoesFamilia,
                planejamentoProximaSessao: r.value.data.planejamentoProximaSessao,
              }
            }
          })
          setUltimasSessoes(map)
        } catch {
          setAgendamentosHoje([])
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Visão geral do sistema</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card blue">
          <div className="stat-label">Total de Pacientes</div>
          <div className="stat-value">{loading ? '...' : totalPacientes}</div>
          <div className="stat-sub">Pacientes cadastrados</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Pacientes Ativos</div>
          <div className="stat-value">{loading ? '...' : ativos}</div>
          <div className="stat-sub">Em acompanhamento</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Atendimentos Hoje</div>
          <div className="stat-value">{loading ? '...' : agendamentosHoje.filter(a => a.status === 'AGENDADO').length}</div>
          <div className="stat-sub">Seus agendamentos pendentes</div>
        </div>
      </div>

      {/* Agendamentos de Hoje */}
      <div className="form-card" style={{ marginTop: '16px', padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ color: '#1A4D73', fontSize: '13px', fontWeight: 600 }}>
            📅 Agendamentos de Hoje
          </h3>
          <button
            className="btn btn-outline btn-sm"
            style={{ fontSize: '11px', padding: '3px 10px' }}
            onClick={() => navigate('/agenda')}
          >
            Ver agenda
          </button>
        </div>
        {loading ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>Carregando...</p>
        ) : agendamentosHoje.length === 0 ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>
            Nenhum agendamento para hoje.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {agendamentosHoje.map(ag => {
              const borderColor: Record<StatusAgendamento, string> = {
                AGENDADO: 'var(--primary-400)', REALIZADO: 'var(--aud-400)',
                FALTOU: 'var(--danger-500)', CANCELADO: 'var(--gray-300)',
              }
              const badgeClass: Record<StatusAgendamento, string> = {
                AGENDADO: 'badge-agendado', REALIZADO: 'badge-ativo',
                FALTOU: 'badge-inativo', CANCELADO: 'badge-cancelado',
              }
              const statusLabel: Record<StatusAgendamento, string> = {
                AGENDADO: 'Agendado', REALIZADO: 'Realizado',
                FALTOU: 'Faltou', CANCELADO: 'Cancelado',
              }
              const relatorioDoAgendamento = sessoesHoje.find(r =>
                (r.paciente?.id ?? r.pacienteId) === ag.pacienteId
              )
              return (
                <div
                  key={ag.id}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '2px',
                    padding: '8px 12px',
                    borderLeft: `3px solid ${borderColor[ag.status]}`,
                    borderRadius: '6px', cursor: 'pointer',
                    background: '#fff', transition: 'background 0.15s',
                  }}
                  onClick={() => navigate('/agenda')}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--gray-50)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary-800)' }}>
                    {format(new Date(ag.dataHoraInicio), 'HH:mm')}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--gray-700)' }}>
                    <span style={{ color: 'var(--gray-400)', fontWeight: 500 }}>paciente: </span>
                    {ag.pacienteNome}
                  </span>
                  <span className={`badge ${badgeClass[ag.status]}`} style={{ fontSize: '10px', alignSelf: 'flex-start' }}>
                    {statusLabel[ag.status]}
                  </span>
                  {ag.status === 'AGENDADO' && ultimasSessoes[ag.pacienteId] && (
                    <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {ultimasSessoes[ag.pacienteId].orientacoesFamilia && (
                        <div style={{ fontSize: '11px', color: 'var(--gray-600)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--aud-600)', textTransform: 'uppercase', fontSize: '10px' }}>Orientações: </span>
                          {ultimasSessoes[ag.pacienteId].orientacoesFamilia}
                        </div>
                      )}
                      {ultimasSessoes[ag.pacienteId].planejamentoProximaSessao && (
                        <div style={{ fontSize: '11px', color: 'var(--gray-600)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--primary-600)', textTransform: 'uppercase', fontSize: '10px' }}>Próx. sessão: </span>
                          {ultimasSessoes[ag.pacienteId].planejamentoProximaSessao}
                        </div>
                      )}
                    </div>
                  )}
                  {ag.status === 'REALIZADO' && relatorioDoAgendamento?.atividadesRealizadas && (
                    <div style={{ marginTop: '2px', fontSize: '11px', color: 'var(--gray-600)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--aud-600)', textTransform: 'uppercase', fontSize: '10px' }}>Atividades realizadas: </span>
                      {relatorioDoAgendamento.atividadesRealizadas}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Consultas de Hoje */}
      <div className="form-card" style={{ marginTop: '24px' }}>
        <h3 style={{ color: '#1A4D73', marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
          📋 Consultas de Hoje
        </h3>
        {loading ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>Carregando...</p>
        ) : sessoesHoje.length === 0 ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>
            Nenhuma sessão registrada hoje.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessoesHoje.map(r => (
              <div
                key={r.id}
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/pacientes/${r.paciente?.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>
                      {r.paciente?.nomeCompleto}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                      {r.horaInicio} – {r.horaFim}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                      Meta: {r.metaTrabalhada}
                    </div>
                  </div>
                  <button
                    className="btn-icon-secondary"
                    title="Visualizar detalhes"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisualizar(r.id);
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
                {r.evolucaoObservada && (
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#374151',
                      background: '#F9FAFB',
                      borderRadius: '6px',
                      padding: '6px 10px',
                    }}
                  >
                    {r.evolucaoObservada}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de Pacientes */}
      <div className="form-card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: '#1A4D73', fontSize: '16px', fontWeight: 600 }}>
            👥 Pacientes Cadastrados
          </h3>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/pacientes')}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            Ver todos
          </button>
        </div>
        {loading ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>Carregando...</p>
        ) : pacientes.length === 0 ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>
            Nenhum paciente cadastrado.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6B7280', fontWeight: 600 }}>Nome</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6B7280', fontWeight: 600 }}>Idade</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6B7280', fontWeight: 600 }}>Atendimento</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6B7280', fontWeight: 600 }}>Convênio</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6B7280', fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6B7280', fontWeight: 600 }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p, i) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: '#111827' }}>{p.nomeCompleto}</td>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>{p.idade} anos</td>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>{p.tipoAtendimento}</td>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>{p.convenio || '–'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: p.status === 'ATIVO' ? '#D1FAE5' : '#FEE2E2',
                        color: p.status === 'ATIVO' ? '#065F46' : '#991B1B',
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                        onClick={() => navigate(`/pacientes/${p.id}/anamnese`)}
                      >
                        Ver
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                        onClick={() => navigate(`/pacientes/${p.id}/relatorios`)}
                        title="Histórico de Sessões"
                      >
                        📝 Relatórios
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
