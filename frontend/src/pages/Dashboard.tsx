import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import api from '../services/api'

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
  dataSessao: string
  horaInicio: string
  horaFim: string
  metaTrabalhada: string
  percentualAcerto: number
  nivelEngajamento?: number
  evolucaoObservada?: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [totalPacientes, setTotalPacientes] = useState(0)
  const [ativos, setAtivos] = useState(0)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [sessoesHoje, setSessoesHoje] = useState<Relatorio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0]

    Promise.all([
      api.get('/v1/pacientes?size=100&sort=nomeCompleto,asc'),
      api.get(`/v1/relatorios?data=${hoje}`)
    ])
      .then(([pacRes, relRes]) => {
        const lista: Paciente[] = pacRes.data.content || []
        setTotalPacientes(pacRes.data.totalElements || lista.length)
        setAtivos(lista.filter((p: Paciente) => p.status === 'ATIVO').length)
        setPacientes(lista.slice(0, 6))
        setSessoesHoje(relRes.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const chartData = sessoesHoje
    .filter(r => r.percentualAcerto != null)
    .map(r => ({
      nome: r.paciente?.nomeCompleto?.split(' ')[0] || 'Paciente',
      acerto: Number(r.percentualAcerto),
      engajamento: (r.nivelEngajamento || 0) * 20,
    }))

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Visão geral do sistema</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/pacientes/novo')}>
          + Novo Paciente
        </button>
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
          <div className="stat-label">Sessões Hoje</div>
          <div className="stat-value">{loading ? '...' : sessoesHoje.length}</div>
          <div className="stat-sub">Atendimentos do dia</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Média de Acerto</div>
          <div className="stat-value">
            {loading || sessoesHoje.length === 0
              ? '–'
              : `${Math.round(
                  sessoesHoje.reduce((acc, r) => acc + Number(r.percentualAcerto || 0), 0) /
                  sessoesHoje.filter(r => r.percentualAcerto != null).length
                )}%`}
          </div>
          <div className="stat-sub">Nas sessões de hoje</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>

        {/* Sessões de Hoje */}
        <div className="form-card">
          <h3 style={{ color: '#1A4D73', marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
            📋 Sessões de Hoje
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
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: Number(r.percentualAcerto) >= 70 ? '#10B981' : Number(r.percentualAcerto) >= 50 ? '#F59E0B' : '#EF4444',
                        }}
                      >
                        {r.percentualAcerto != null ? `${r.percentualAcerto}%` : '–'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>acerto</div>
                    </div>
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

        {/* Gráfico de desempenho */}
        <div className="form-card">
          <h3 style={{ color: '#1A4D73', marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
            📊 Desempenho nas Sessões de Hoje
          </h3>
          {chartData.length === 0 ? (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '40px 20px' }}>
              Nenhum dado disponível hoje.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={(val: number) => `${val}%`} />
                <Bar dataKey="acerto" name="% Acerto" fill="#1A4D73" radius={[4, 4, 0, 0]} />
                <Bar dataKey="engajamento" name="Engajamento" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
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
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '4px 12px' }}
                      onClick={() => navigate(`/pacientes/${p.id}`)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
