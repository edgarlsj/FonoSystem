import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface Paciente {
  id: number
  nomeCompleto: string
  idade: number
  sexo: string
  status: string
  tipoAtendimento: string
  convenio?: string
  telefone: string
}

export default function ColetarDados() {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    api.get('/v1/pacientes?size=100&sort=nome_completo,asc&status=ATIVO')
      .then(({ data }) => setPacientes(data.content || []))
      .catch(() => setPacientes([]))
      .finally(() => setLoading(false))
  }, [])

  const filtrados = pacientes.filter(p =>
    p.nomeCompleto.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Coletar Dados</div>
          <div className="page-subtitle">Selecione o paciente para registrar evolução, prescrição ou avaliação</div>
        </div>
      </div>

      {/* Busca */}
      <div style={{
        background: '#fff',
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid #E5E7EB',
      }}>
        <input
          className="form-control"
          placeholder="🔍  Buscar paciente pelo nome..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          autoFocus
          style={{ fontSize: '15px' }}
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>Carregando pacientes...</div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
          <div>{busca ? 'Nenhum paciente encontrado.' : 'Nenhum paciente ativo cadastrado.'}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtrados.map(p => (
            <div
              key={p.id}
              onClick={() => navigate(`/pacientes/${p.id}/relatorios`)}
              style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                padding: '16px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.15s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--odapp-blue)'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(41,182,209,0.15)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '44px', height: '44px',
                borderRadius: '50%',
                background: 'var(--odapp-blue)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 700,
                flexShrink: 0,
              }}>
                {p.nomeCompleto.charAt(0)}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#111827' }}>{p.nomeCompleto}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                  {p.idade} anos · {p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Feminino' : 'Outro'}
                  {p.convenio ? ` · ${p.convenio}` : ''}
                </div>
              </div>

              {/* Badge */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  background: '#DBEAFE', color: '#1D4ED8',
                  borderRadius: '999px', padding: '3px 10px',
                }}>
                  {p.tipoAtendimento === 'CONVENIO' ? 'Convênio' : 'Particular'}
                </span>
                <span style={{ color: 'var(--odapp-blue)', fontSize: '20px' }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
