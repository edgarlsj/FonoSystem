import { useParams, useNavigate } from 'react-router-dom'

export default function Anamnese() {
  const { id } = useParams()
  const navigate = useNavigate()

  const handleSalvar = () => {
    alert('Anamnese salva com sucesso!')
  }

  return (
    <div>
      <div className="breadcrumb">
        <a onClick={() => navigate('/pacientes')}>Pacientes</a><span>›</span>
        <a>Paciente #{id}</a><span>›</span> Anamnese
      </div>
      <div className="page-header">
        <div>
          <div className="page-title">Anamnese</div>
          <div className="page-subtitle">Paciente #{id}</div>
        </div>
      </div>

      <div className="form-card">
        <div className="form-section-title"><div className="section-icon"></div>Queixa e Histórico</div>
        <div className="form-grid form-grid-2">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Queixa Principal *</label>
            <textarea className="form-control" placeholder="Descreva a queixa principal..." />
          </div>
          <div className="form-group">
            <label>Histórico Clínico</label>
            <textarea className="form-control" placeholder="Histórico médico..." />
          </div>
          <div className="form-group">
            <label>Histórico Familiar</label>
            <textarea className="form-control" placeholder="Histórico familiar..." />
          </div>
        </div>
      </div>

      <div className="form-card">
        <div className="form-section-title"><div className="section-icon"></div>Desenvolvimento</div>
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label>Desenvolvimento de Linguagem</label>
            <textarea className="form-control" placeholder="Primeiras palavras, marcos de linguagem..." />
          </div>
          <div className="form-group">
            <label>Desenvolvimento Motor</label>
            <textarea className="form-control" placeholder="Marcos motores, coordenação..." />
          </div>
        </div>
      </div>

      <div className="form-card section-tea">
        <div className="form-section-title"><div className="section-icon"></div>Específico TEA</div>
        <div className="form-grid form-grid-3">
          <div className="form-group">
            <label>Diagnóstico TEA</label>
            <select className="form-control">
              <option>Sim</option><option>Em investigação</option><option>Não</option>
            </select>
          </div>
          <div className="form-group">
            <label>Nível (DSM-5)</label>
            <select className="form-control">
              <option>Nível 1</option><option>Nível 2</option><option>Nível 3</option>
            </select>
          </div>
          <div className="form-group">
            <label>Usa CAA?</label>
            <select className="form-control">
              <option>Sim</option><option>Não</option><option>Em introdução</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-outline" onClick={() => navigate('/pacientes')}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSalvar}>✓ Salvar Anamnese</button>
      </div>
    </div>
  )
}
