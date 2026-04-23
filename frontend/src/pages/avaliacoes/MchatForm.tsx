import { useState } from 'react'

// M-CHAT-R/F — 20 itens. Para a maioria: "Não" = risco. Itens reversos (2, 5, 12): "Sim" = risco.
const MCHAT_ITENS = [
  { id: 1, pergunta: 'Se você aponta algo no outro lado do cômodo, seu filho/a olha para o que você está apontando?', reverso: false },
  { id: 2, pergunta: 'Você já se perguntou se seu filho/a é surdo/a?', reverso: true },
  { id: 3, pergunta: 'Seu filho/a brinca de faz-de-conta (ex: finge beber de um copo vazio, fala ao telefone de brinquedo)?', reverso: false },
  { id: 4, pergunta: 'Seu filho/a gosta de subir em objetos (ex: móveis, brinquedos, escadas)?', reverso: false },
  { id: 5, pergunta: 'Seu filho/a faz movimentos incomuns com os dedos perto dos olhos (ex: mexe os dedos perto dos olhos)?', reverso: true },
  { id: 6, pergunta: 'Seu filho/a aponta com o dedo para pedir algo ou para pedir ajuda?', reverso: false },
  { id: 7, pergunta: 'Seu filho/a aponta com o dedo para mostrar algo interessante?', reverso: false },
  { id: 8, pergunta: 'Seu filho/a se interessa por outras crianças (ex: observa, sorri, vai até elas)?', reverso: false },
  { id: 9, pergunta: 'Seu filho/a traz objetos para mostrar a você?', reverso: false },
  { id: 10, pergunta: 'Seu filho/a responde quando você o/a chama pelo nome (olha, fala ou para o que está fazendo)?', reverso: false },
  { id: 11, pergunta: 'Quando você sorri para seu filho/a, ele/a sorri de volta?', reverso: false },
  { id: 12, pergunta: 'Seu filho/a fica incomodado/a com barulhos do dia a dia (ex: aspirador, música alta)?', reverso: true },
  { id: 13, pergunta: 'Seu filho/a anda?', reverso: false },
  { id: 14, pergunta: 'Seu filho/a olha nos seus olhos quando você fala com ele/a, brinca ou o/a veste?', reverso: false },
  { id: 15, pergunta: 'Seu filho/a tenta copiar o que você faz (ex: acenar, bater palma)?', reverso: false },
  { id: 16, pergunta: 'Se você vira a cabeça para olhar algo, seu filho/a procura ver o que você está olhando?', reverso: false },
  { id: 17, pergunta: 'Seu filho/a tenta fazer com que você olhe para ele/a (ex: busca elogio, diz "olha!")?', reverso: false },
  { id: 18, pergunta: 'Seu filho/a entende quando você pede para ele/a fazer algo (ex: "põe na mesa", "me dá")?', reverso: false },
  { id: 19, pergunta: 'Se algo novo acontece, seu filho/a olha para o seu rosto para saber a sua reação?', reverso: false },
  { id: 20, pergunta: 'Seu filho/a gosta de atividades com movimento (ex: ser balançado, pular no joelho)?', reverso: false },
]

type Resposta = 'sim' | 'nao' | ''

interface MchatFormProps {
  value: any
  onChange: (data: any) => void
}

export default function MchatForm({ value, onChange }: MchatFormProps) {
  const [respostas, setRespostas] = useState<Record<number, Resposta>>(value?.respostas || {})
  const [observacoes, setObservacoes] = useState<string>(value?.observacoes || '')

  const handleResp = (id: number, resp: Resposta) => {
    const novo = { ...respostas, [id]: respostas[id] === resp ? '' : resp }
    setRespostas(novo)
    emitChange(novo, observacoes)
  }

  const isRisco = (item: typeof MCHAT_ITENS[0], resp: Resposta): boolean => {
    if (!resp) return false
    return item.reverso ? resp === 'sim' : resp === 'nao'
  }

  const calcScore = (resps: Record<number, Resposta>) => {
    let risco = 0
    MCHAT_ITENS.forEach(item => {
      if (isRisco(item, resps[item.id])) risco++
    })
    return risco
  }

  const getRiscoLabel = (score: number) => {
    if (score <= 2) return { label: 'Baixo Risco', cor: '#059669', bg: '#D1FAE5', desc: 'Sem indicativo significativo — reavaliar aos 24 meses se aplicado antes' }
    if (score <= 7) return { label: 'Risco Moderado', cor: '#D97706', bg: '#FEF3C7', desc: 'Aplicar Follow-Up — encaminhar para avaliação diagnóstica se confirmado' }
    return { label: 'Alto Risco', cor: '#DC2626', bg: '#FEE2E2', desc: 'Encaminhar imediatamente para avaliação diagnóstica e intervenção precoce' }
  }

  const emitChange = (resps: Record<number, Resposta>, obs: string) => {
    const score = calcScore(resps)
    const risco = getRiscoLabel(score)
    const respondidas = Object.values(resps).filter(r => r !== '').length
    onChange({
      instrumento: 'M-CHAT',
      respostas: resps,
      score,
      totalRespondidas: respondidas,
      resultadoGeral: score <= 2 ? 'BAIXO_RISCO' : score <= 7 ? 'RISCO_MODERADO' : 'ALTO_RISCO',
      scores: {
        'Risco TEA': Math.round((score / 20) * 100),
        'Itens respondidos': Math.round((respondidas / 20) * 100),
      },
      riscoLabel: risco.label,
      observacoes: obs,
    })
  }

  const score = calcScore(respostas)
  const risco = getRiscoLabel(score)
  const respondidas = Object.values(respostas).filter(r => r !== '').length

  return (
    <div>
      {/* Resultado */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Resultado da Triagem</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            padding: '16px 24px', borderRadius: '12px',
            background: risco.bg, textAlign: 'center', flex: '0 0 auto',
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: risco.cor }}>{score}</div>
            <div style={{ fontSize: '11px', color: risco.cor, fontWeight: 600 }}>de 20 itens de risco</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '16px', fontWeight: 700, color: risco.cor,
              padding: '8px 16px', borderRadius: '8px', background: risco.bg,
              marginBottom: '8px',
            }}>
              {risco.label}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>{risco.desc}</div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
              {respondidas}/20 itens respondidos
            </div>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="form-card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>
          ESCALA DE RISCO: 0-2 Baixo · 3-7 Moderado · 8-20 Alto
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
          <span>✅ <strong>Sim</strong> = resposta esperada (maioria)</span>
          <span>⚠️ Itens 2, 5, 12 são <strong>reversos</strong></span>
        </div>
      </div>

      {/* Perguntas */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Questionário — Respostas dos Pais/Responsáveis</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {MCHAT_ITENS.map(item => {
            const resp = respostas[item.id] || ''
            const emRisco = isRisco(item, resp)
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '12px 16px', borderRadius: '8px',
                  border: emRisco ? '1px solid #FCA5A5' : '1px solid #E5E7EB',
                  background: emRisco ? '#FEF2F2' : resp ? '#F0FDF4' : '#FAFAFA',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: emRisco ? '#FEE2E2' : '#F3F4F6',
                  color: emRisco ? '#DC2626' : '#6B7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, flexShrink: 0,
                }}>
                  {item.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                    {item.pergunta}
                    {item.reverso && <span style={{ fontSize: '10px', color: '#D97706', marginLeft: '6px' }}>(reverso)</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleResp(item.id, 'sim')}
                    style={{
                      padding: '6px 16px', borderRadius: '8px',
                      border: resp === 'sim' ? '2px solid #059669' : '1px solid #D1D5DB',
                      background: resp === 'sim' ? '#D1FAE5' : '#fff',
                      color: resp === 'sim' ? '#065F46' : '#6B7280',
                      fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => handleResp(item.id, 'nao')}
                    style={{
                      padding: '6px 16px', borderRadius: '8px',
                      border: resp === 'nao' ? '2px solid #DC2626' : '1px solid #D1D5DB',
                      background: resp === 'nao' ? '#FEE2E2' : '#fff',
                      color: resp === 'nao' ? '#991B1B' : '#6B7280',
                      fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    Não
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Observações */}
      <div className="form-group">
        <label>Observações</label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Observações sobre a aplicação do M-CHAT-R/F, contexto da entrevista com família..."
          value={observacoes}
          onChange={e => { setObservacoes(e.target.value); emitChange(respostas, e.target.value) }}
        />
      </div>
    </div>
  )
}
