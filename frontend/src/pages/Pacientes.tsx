import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface PacienteData {
  id: number
  nomeCompleto: string
  idade: number
  nomeResponsavel: string
  convenio: string
  status: string
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<PacienteData[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    carregarPacientes()
  }, [])

  const carregarPacientes = async (nome?: string) => {
    try {
      setLoading(true)
      const params: any = { size: 50 }
      if (nome) params.nome = nome
      const { data } = await api.get('/v1/pacientes', { params })
      setPacientes(data.content || [])
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBusca = (valor: string) => {
    setBusca(valor)
    carregarPacientes(valor || undefined)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Pacientes</div>
          <div className="page-subtitle">Gerencie os cadastros dos pacientes</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/pacientes/novo')}>
          + Novo Paciente
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <input
            className="search-input"
            placeholder="🔍  Buscar por nome..."
            value={busca}
            onChange={e => handleBusca(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
            Carregando...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Idade</th>
                <th>Responsável</th>
                <th>Convênio</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ color: '#9CA3AF' }}>{String(i + 1).padStart(3, '0')}</td>
                  <td><strong>{p.nomeCompleto}</strong></td>
                  <td>{p.idade} anos</td>
                  <td>{p.nomeResponsavel}</td>
                  <td>{p.convenio || 'Particular'}</td>
                  <td>
                    <span className={`badge ${p.status === 'ATIVO' ? 'badge-ativo' : 'badge-inativo'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className="btn-link" onClick={() => navigate(`/pacientes/${p.id}/anamnese`)}>
                      Ver
                    </button>
                    <button 
                      className="btn-link" 
                      style={{ color: 'var(--primary-600)', fontWeight: 600 }}
                      onClick={() => navigate(`/pacientes/${p.id}/relatorios`)}
                    >
                      📝 Relatórios
                    </button>
                    <button className="btn-link" onClick={() => navigate(`/pacientes/${p.id}/prescricoes`)} title="Prescrições de exercícios">
                      📋 Prescrições
                    </button>
                  </td>
                </tr>
              ))}
              {pacientes.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    Nenhum paciente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        <div className="table-footer">
          Mostrando {pacientes.length} pacientes
        </div>
      </div>
    </div>
  )
}
