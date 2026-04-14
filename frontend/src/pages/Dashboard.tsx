import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, tea: 0, auditiva: 0, sessoes: 0 })

  useEffect(() => {
    // Carrega estatísticas (simplificado)
    api.get('/v1/pacientes?size=1').then(res => {
      setStats(prev => ({ ...prev, total: res.data.totalElements || 0 }))
    }).catch(() => {})
  }, [])

  return (
    <div>
      <div className="stats-row">
        <div className="stat-card blue">
          <div className="stat-label">Total de Pacientes</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">Pacientes cadastrados</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Pacientes TEA</div>
          <div className="stat-value">{stats.tea}</div>
          <div className="stat-sub">Transtorno do Espectro Autista</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Reabilitação Auditiva</div>
          <div className="stat-value">{stats.auditiva}</div>
          <div className="stat-sub">Implante coclear e AASI</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Sessões Hoje</div>
          <div className="stat-value">{stats.sessoes}</div>
          <div className="stat-sub">Atendimentos do dia</div>
        </div>
      </div>

      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Visão geral do sistema</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/pacientes/novo')}>
          + Novo Paciente
        </button>
      </div>

      <div className="form-card" style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h2 style={{ color: '#1A4D73', marginBottom: '8px' }}>Bem-vindo ao FonoSystem</h2>
        <p style={{ color: '#6B7280', maxWidth: '500px', margin: '0 auto' }}>
          Gerencie seus pacientes, registre anamneses, avaliações e relatórios diários
          de forma organizada e segura.
        </p>
      </div>
    </div>
  )
}
