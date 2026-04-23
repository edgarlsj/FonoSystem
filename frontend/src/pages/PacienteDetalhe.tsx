import { useEffect, useState } from 'react'
import { useParams, useNavigate, NavLink, Outlet } from 'react-router-dom'
import api from '../services/api'
import { TabProvider } from '../context/TabContext'

interface Paciente {
  id: number
  nomeCompleto: string
  dataNascimento: string
  idade: number
  sexo: string
  status: string
  tipoAtendimento: string
  convenio?: string
  telefone: string
}

export default function PacienteDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      api.get(`/v1/pacientes/${id}`)
        .then(({ data }) => setPaciente(data))
        .catch(() => navigate('/pacientes'))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>Carregando...</div>
  }

  if (!paciente) return null

  const tabs = [
    { to: 'relatorios', label: 'Folha de Evolução' },
    { to: 'prescricoes', label: 'Prescrição' },
    { to: 'anamnese', label: 'Anamnese' },
    { to: 'avaliacoes', label: 'Avaliações' },
  ]

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a onClick={() => navigate('/pacientes')} style={{ cursor: 'pointer' }}>Pacientes</a>
        <span>›</span>
        {paciente.nomeCompleto}
      </div>

      {/* Patient header */}
      <div style={{
        background: 'var(--odapp-blue)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginBottom: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px', height: '52px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 700, color: '#fff',
          }}>
            {paciente.nomeCompleto.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{paciente.nomeCompleto}</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
              {paciente.idade} anos · {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Feminino' : 'Outro'}
              {paciente.convenio ? ` · ${paciente.convenio}` : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{
            background: paciente.status === 'ATIVO' ? '#D1FAE5' : '#FEE2E2',
            color: paciente.status === 'ATIVO' ? '#065F46' : '#991B1B',
            borderRadius: '999px', padding: '4px 14px',
            fontSize: '12px', fontWeight: 700,
          }}>
            {paciente.status}
          </span>
          <button
            className="btn btn-outline"
            style={{ fontSize: '12px', padding: '6px 14px', color: '#fff', borderColor: 'rgba(255,255,255,0.5)', background: 'transparent' }}
            onClick={() => navigate(`/pacientes/${id}/editar`)}
          >
            ✏️ Editar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        background: '#fff',
        borderBottom: '2px solid var(--gray-200)',
        marginBottom: '24px',
      }}>
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            style={({ isActive }) => ({
              padding: '14px 24px',
              fontWeight: 600,
              fontSize: '14px',
              color: isActive ? 'var(--odapp-blue)' : 'var(--gray-500)',
              borderBottom: isActive ? '2px solid var(--odapp-blue)' : '2px solid transparent',
              marginBottom: '-2px',
              textDecoration: 'none',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            })}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* Tab content */}
      <TabProvider value={true}>
        <Outlet />
      </TabProvider>
    </div>
  )
}
