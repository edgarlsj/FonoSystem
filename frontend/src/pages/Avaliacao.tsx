import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Avaliacao() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pacienteNome, setPacienteNome] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carregar dados do paciente para exibir o nome
    api.get(`/v1/pacientes/${id}`)
      .then(res => setPacienteNome(res.data.nomeCompleto))
      .catch(() => setPacienteNome(`Paciente #${id}`))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', color: '#6B7280' }}>Carregando...</div>
  }

  return (
    <div>
      <div className="breadcrumb">
        <button 
          onClick={() => navigate('/pacientes')} 
          style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, font: 'inherit', cursor: 'pointer' }}
        >
          Pacientes
        </button>
        <span>›</span>
        <button 
          onClick={() => navigate(`/pacientes/${id}`)} 
          style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, font: 'inherit', cursor: 'pointer', fontWeight: 600 }}
        >
          {pacienteNome}
        </button>
        <span>›</span> Avaliação
      </div>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-outline" onClick={() => navigate(`/pacientes/${id}`)} title="Voltar">
            ← Voltar
          </button>
          <div>
            <div className="page-title">Avaliação e Planejamento</div>
            <div className="page-subtitle" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
              Paciente: {pacienteNome}
            </div>
          </div>
        </div>
        <button className="btn btn-primary">+ Nova Avaliação</button>
      </div>

      <div className="form-card">
        <div className="form-section-title"><div className="section-icon"></div>Dados da Avaliação</div>
        <div className="form-grid form-grid-3">
          <div className="form-group">
            <label>Tipo *</label>
            <select className="form-control">
              <option>Avaliação Inicial</option><option>Reavaliação</option>
            </select>
          </div>
          <div className="form-group">
            <label>Especialidade *</label>
            <select className="form-control">
              <option>Reabilitação Auditiva</option><option>TEA</option><option>Fala</option>
            </select>
          </div>
          <div className="form-group">
            <label>Data</label>
            <input className="form-control" type="date" />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Hipótese Diagnóstica</label>
            <textarea className="form-control" placeholder="Descrição da hipótese..." />
          </div>
          <div className="form-group">
            <label>Resultados</label>
            <textarea className="form-control" placeholder="Resultados da avaliação..." />
          </div>
        </div>
      </div>

      <div className="form-card">
        <div className="form-section-title"><div className="section-icon"></div>Plano Terapêutico — Metas</div>
        <div className="plan-list">
          <div className="plan-item em-andamento">
            <div className="plan-status em-andamento"></div>
            <div className="plan-text">
              Meta exemplo — Adicione metas ao plano terapêutico
              <small>📅 Use a API para criar e gerenciar metas</small>
              <div className="progress-bar" style={{ marginTop: '6px' }}>
                <div className="progress-fill" style={{ width: '0%' }}></div>
              </div>
            </div>
            <span className="badge" style={{ background: '#DBEAFE', color: '#1E40AF' }}>Em andamento</span>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" style={{ marginTop: '12px' }}>+ Adicionar meta</button>
      </div>

      <div className="form-actions">
        <button className="btn btn-outline" onClick={() => navigate('/pacientes')}>Cancelar</button>
        <button className="btn btn-primary">✓ Salvar Avaliação</button>
      </div>
    </div>
  )
}
