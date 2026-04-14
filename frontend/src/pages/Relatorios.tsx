import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'

export default function Relatorios() {
  const [data, setData] = useState(new Date())
  const [relatorios, setRelatorios] = useState<any[]>([])

  useEffect(() => {
    carregarRelatorios()
  }, [data])

  const carregarRelatorios = async () => {
    try {
      const dataStr = format(data, 'yyyy-MM-dd')
      const { data: resp } = await api.get(`/v1/relatorios?data=${dataStr}`)
      setRelatorios(resp || [])
    } catch {
      setRelatorios([])
    }
  }

  const mudarData = (delta: number) => {
    const nova = new Date(data)
    nova.setDate(nova.getDate() + delta)
    setData(nova)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Relatório Diário</div>
          <div className="page-subtitle">Registre as sessões do dia</div>
        </div>
        <button className="btn btn-primary">+ Registrar Sessão</button>
      </div>

      <div className="rel-header">
        <div className="rel-date-nav">
          <button onClick={() => mudarData(-1)}>‹</button>
          <span className="current-date">
            {format(data, "EEEE, dd MMM yyyy", { locale: ptBR })}
          </span>
          <button onClick={() => mudarData(1)}>›</button>
        </div>
      </div>

      <div className="session-list">
        {relatorios.length === 0 ? (
          <div className="form-card" style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
            <p>Nenhuma sessão registrada para esta data</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Clique em "+ Registrar Sessão" para começar</p>
          </div>
        ) : (
          relatorios.map((rel: any) => (
            <div className="session-card" key={rel.id}>
              <div className="session-card-header">
                <div>
                  <div className="session-patient">{rel.pacienteNome}</div>
                </div>
                <div className="session-time">{rel.horaInicio} – {rel.horaFim}</div>
              </div>
              <div className="session-body">
                <strong>Meta:</strong> {rel.metaTrabalhada}<br/>
                <strong>Atividades:</strong> {rel.atividadesRealizadas}<br/>
                {rel.evolucaoObservada && <><strong>Evolução:</strong> {rel.evolucaoObservada}<br/></>}
              </div>
            </div>
          ))
        )}

        <div className="add-session-card">
          <div className="add-session-icon">＋</div>
          <div className="add-session-text">Registrar nova sessão do dia</div>
        </div>
      </div>
    </div>
  )
}
