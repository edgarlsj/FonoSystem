import { useState } from 'react'

// MBGR — Marchesan, Berretin-Felix, Genaro, Rehder (2012). 10 domínios com score numérico.
const DOMINIOS = [
  { id: 1, nome: 'Postura', desc: 'Posição de cabeça e ombros' },
  { id: 2, nome: 'Análise Facial/Extraoral', desc: 'Estruturas e medidas faciais, movimento mandibular' },
  { id: 3, nome: 'Análise Intraoral', desc: 'Mucosa oral, dentes, oclusão, palato, amígdalas' },
  { id: 4, nome: 'Mobilidade', desc: 'Mobilidade de língua, lábios, bochechas, mandíbula' },
  { id: 5, nome: 'Tonicidade e Palpação', desc: 'Tônus muscular e sensibilidade à palpação' },
  { id: 6, nome: 'Respiração', desc: 'Tipo e modo respiratório (nasal, bucal, mista)' },
  { id: 7, nome: 'Mastigação', desc: 'Padrão, tempo e qualidade da mastigação' },
  { id: 8, nome: 'Deglutição', desc: 'Consistências (sólida, líquida), sequência de deglutição' },
  { id: 9, nome: 'Fala', desc: 'Fala espontânea e em sequências' },
  { id: 10, nome: 'Voz', desc: 'Qualidade vocal e características da voz' },
]

interface MbgrFormProps {
  value: any
  onChange: (data: any) => void
}

export default function MbgrForm({ value, onChange }: MbgrFormProps) {
  const [scores, setScores] = useState<Record<number, number>>(value?.scores || {})
  const [observacoes, setObservacoes] = useState<Record<number, string>>(value?.observacoesDominio || {})
  const [obsGeral, setObsGeral] = useState<string>(value?.observacoes || '')

  const handleScore = (id: number, val: string) => {
    const num = Math.max(parseInt(val) || 0, 0)
    const novo = { ...scores, [id]: num }
    setScores(novo)
    emitChange(novo, observacoes, obsGeral)
  }

  const handleObservacao = (id: number, val: string) => {
    const novo = { ...observacoes, [id]: val }
    setObservacoes(novo)
    emitChange(scores, novo, obsGeral)
  }

  const emitChange = (sc: Record<number, number>, obs: Record<number, string>, obsG: string) => {
    const total = Object.values(sc).reduce((a, b) => a + b, 0)
    const avaliados = Object.values(sc).filter(v => v > 0).length

    const scores: Record<string, number> = {}
    DOMINIOS.forEach(d => {
      scores[d.nome] = Math.min((sc[d.id] || 0) * 10, 100)
    })

    let resultado: string
    let classificacao: string
    if (total <= 4) { resultado = 'NORMAL'; classificacao = 'Sem alteração miofuncional' }
    else if (total <= 12) { resultado = 'LEVE'; classificacao = 'Alteração Miofuncional Leve' }
    else if (total <= 24) { resultado = 'MODERADO'; classificacao = 'Alteração Miofuncional Moderada' }
    else { resultado = 'GRAVE'; classificacao = 'Alteração Miofuncional Grave' }

    onChange({
      instrumento: 'MBGR',
      scores: sc,
      scoreTotal: total,
      scoreMaximo: DOMINIOS.length * 4,
      avaliados,
      radarScores: scores,
      resultadoGeral: resultado,
      classificacao,
      observacoesDominio: obs,
      observacoes: obsG,
    })
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const avaliados = Object.values(scores).filter(v => v > 0).length

  let resultadoLabel: { label: string; cor: string; bg: string; desc: string }
  if (total <= 4) {
    resultadoLabel = { label: 'Sem Alteração', cor: '#059669', bg: '#D1FAE5', desc: 'Funções miofuncionais orofaciais adequadas' }
  } else if (total <= 12) {
    resultadoLabel = { label: 'Alteração Leve', cor: '#1D4ED8', bg: '#DBEAFE', desc: 'Pequenas alterações miofuncionais' }
  } else if (total <= 24) {
    resultadoLabel = { label: 'Alteração Moderada', cor: '#D97706', bg: '#FEF3C7', desc: 'Alterações miofuncionais importantes' }
  } else {
    resultadoLabel = { label: 'Alteração Grave', cor: '#DC2626', bg: '#FEE2E2', desc: 'Alterações miofuncionais significativas — intervenção necessária' }
  }

  return (
    <div>
      {/* Resultado */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Avaliação Miofuncional Orofacial</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            padding: '16px 24px', borderRadius: '12px',
            background: resultadoLabel.bg, textAlign: 'center', flex: '0 0 auto',
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: resultadoLabel.cor }}>{total}</div>
            <div style={{ fontSize: '11px', color: resultadoLabel.cor, fontWeight: 600 }}>Score Total</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '16px', fontWeight: 700, color: resultadoLabel.cor,
              padding: '8px 16px', borderRadius: '8px', background: resultadoLabel.bg,
              marginBottom: '8px',
            }}>
              {resultadoLabel.label}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>{resultadoLabel.desc}</div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
              {avaliados}/{DOMINIOS.length} domínios avaliados
            </div>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className="form-card" style={{ marginBottom: '16px', padding: '12px 16px', background: '#F9FAFB' }}>
        <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', gap: '12px' }}>
          <span><strong>Escala:</strong> 0 = Normal · 1–2 = Leve alteração · 3–4 = Alteração moderada/grave</span>
        </div>
      </div>

      {/* Domínios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {DOMINIOS.map(dom => {
          const score = scores[dom.id] || 0
          const obs = observacoes[dom.id] || ''

          let cor: string
          if (score === 0) cor = '#059669'
          else if (score <= 2) cor = '#1D4ED8'
          else cor = '#DC2626'

          let bg: string
          if (score === 0) bg = '#D1FAE5'
          else if (score <= 2) bg = '#DBEAFE'
          else bg = '#FEE2E2'

          return (
            <div className="form-card" key={dom.id} style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: bg,
                  color: cor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '16px', flexShrink: 0,
                }}>
                  {score}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{dom.nome}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{dom.desc}</div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      value={score}
                      onChange={e => handleScore(dom.id, e.target.value)}
                      style={{
                        width: '50px', padding: '6px 8px', borderRadius: '6px',
                        border: '1px solid #D1D5DB', fontSize: '13px', fontWeight: 600,
                      }}
                    />
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      {score === 0 ? 'Normal' : score <= 2 ? 'Leve' : 'Grave'}
                    </span>
                  </div>

                  {/* Campo de observação por domínio */}
                  <textarea
                    placeholder="Observações específicas deste domínio..."
                    value={obs}
                    onChange={e => handleObservacao(dom.id, e.target.value)}
                    style={{
                      width: '100%', marginTop: '8px', padding: '6px 8px',
                      borderRadius: '6px', border: '1px solid #D1D5DB',
                      fontSize: '12px', fontFamily: 'inherit',
                      minHeight: '32px', resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Observações Gerais */}
      <div className="form-group" style={{ marginTop: '16px' }}>
        <label>Observações Gerais</label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Contexto clínico, recomendações, achados relevantes..."
          value={obsGeral}
          onChange={e => { setObsGeral(e.target.value); emitChange(scores, observacoes, e.target.value) }}
        />
      </div>
    </div>
  )
}
