import { useParams, useNavigate } from 'react-router-dom'

export default function Avaliacao() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div>
      <div className="breadcrumb">
        <a onClick={() => navigate('/pacientes')}>Pacientes</a><span>›</span>
        <a>Paciente #{id}</a><span>›</span> Avaliação
      </div>
      <div className="page-header">
        <div>
          <div className="page-title">Avaliação e Planejamento</div>
          <div className="page-subtitle">Paciente #{id}</div>
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
