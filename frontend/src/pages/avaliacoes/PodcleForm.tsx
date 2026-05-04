import { useState } from 'react'

// PODCLE — Bühler (2008). 12 indicadores em 2 dimensões: Cognitivo (8) + Linguagem Expressiva (4).
const DIMENSOES = [
  {
    key: 'cognitivo',
    nome: 'Aspecto Cognitivo',
    desc: 'Desenvolvimento de esquemas sensório-motores e cognitivos',
    indicadores: [
      'Esquema sensório-motor',
      'Deslocamento do objeto no espaço',
      'Permanência do objeto',
      'Imitação de esquemas motores',
      'Experiência com objetos novos',
      'Uso de objeto como meio',
      'Esquemas simbólicos simples',
      'Esquemas simbólicos combinados',
    ],
  },
  {
    key: 'linguagem',
    nome: 'Aspecto de Linguagem Expressiva',
    desc: 'Desenvolvimento de formas de comunicação não-verbal e verbal',
    indicadores: [
      'Gestos dêiticos (apontar)',
      'Gestos representativos',
      'Verbalizações acompanhadas de gestos',
      'Verbalizações isoladas',
    ],
  },
]

type Score = 0 | 1 | 2

interface PodcleFormProps {
  value: any
  onChange: (data: any) => void
}

export default function PodcleForm({ value, onChange }: PodcleFormProps) {
  const [scores, setScores] = useState<Record<string, Record<number, Score>>>(value?.scores || {})
  const [observacoes, setObservacoes] = useState<string>(value?.observacoes || '')

  const handleScore = (dimKey: string, idxLocal: number, score: Score) => {
    const novo = { ...scores }
    if (!novo[dimKey]) novo[dimKey] = {}
    const current = novo[dimKey][idxLocal] || 0
    novo[dimKey][idxLocal] = current === score ? 0 : score
    setScores(novo)
    emitChange(novo, observacoes)
  }

  const calcDimScore = (dimKey: string): { pct: number; label: string } => {
    const dim = DIMENSOES.find(d => d.key === dimKey)
    if (!dim) return { pct: 0, label: 'Incompleto' }
    const itemCount = dim.indicadores.length
    const total = Object.values(scores[dimKey] || {}).reduce((a, b) => a + b, 0)
    const max = itemCount * 2
    const pct = max > 0 ? Math.round((total / max) * 100) : 0
    return { pct, label: pct === 100 ? 'Completo' : pct > 0 ? 'Parcial' : 'Ausente' }
  }

  const emitChange = (sc: Record<string, Record<number, Score>>, obs: string) => {
    const scores: Record<string, number> = {}
    DIMENSOES.forEach(d => {
      scores[d.nome] = calcDimScore(d.key).pct
    })

    const cognScore = calcDimScore('cognitivo').pct
    const lingScore = calcDimScore('linguagem').pct
    const media = Math.round((cognScore + lingScore) / 2)

    let resultado: string
    if (media === 0) resultado = 'AUSENTE'
    else if (media < 50) resultado = 'ALTERADO'
    else if (media < 100) resultado = 'PARCIAL'
    else resultado = 'COMPLETO'

    onChange({
      instrumento: 'PODCLE',
      scores,
      scoreGeral: media,
      resultadoGeral: resultado,
      rawScores: sc,
      observacoes: obs,
    })
  }

  return (
    <div>
      {/* Resultado */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Desenvolvimento Cognitivo e Linguagem</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {DIMENSOES.map(dim => {
            const sc = calcDimScore(dim.key)
            return (
              <div key={dim.key} style={{
                padding: '14px', borderRadius: '12px',
                background: '#F9FAFB', border: '1px solid #E5E7EB',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  {dim.nome}
                </div>
                <div style={{
                  fontSize: '28px', fontWeight: 700, color: sc.pct >= 100 ? '#059669' : sc.pct > 0 ? '#D97706' : '#6B7280',
                }}>
                  {sc.pct}%
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                  {sc.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dimensões */}
      {DIMENSOES.map(dim => {
        const dimScores = scores[dim.key] || {}
        const total = Object.values(dimScores).reduce((a, b) => a + b, 0)
        const max = dim.indicadores.length * 2
        return (
          <div className="form-card" key={dim.key} style={{ marginBottom: '16px' }}>
            <div className="form-section-title"><div className="section-icon" />{dim.nome}</div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
              {dim.desc}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dim.indicadores.map((ind, idx) => {
                const score = dimScores[idx] || 0
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 12px', borderRadius: '8px',
                      background: score === 0 ? '#FAFAFA' : score === 1 ? '#FEF3C7' : '#D1FAE5',
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      background: score === 0 ? '#F3F4F6' : score === 1 ? '#FCD34D' : '#10B981',
                      color: score === 0 ? '#9CA3AF' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '14px', flexShrink: 0,
                    }}>
                      {score}
                    </div>
                    <div style={{ flex: 1, fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                      {ind}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[0, 1, 2].map(val => (
                        <button
                          key={val}
                          onClick={() => handleScore(dim.key, idx, val as Score)}
                          style={{
                            width: '28px', height: '28px', borderRadius: '6px',
                            border: score === val ? '2px solid #111827' : '1px solid #D1D5DB',
                            background: score === val ? (val === 0 ? '#F3F4F6' : val === 1 ? '#FCD34D' : '#10B981') : '#fff',
                            color: score === val && val !== 0 ? '#fff' : '#6B7280',
                            fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                          }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{
              marginTop: '10px', padding: '8px 12px',
              background: '#F3F4F6', borderRadius: '6px',
              fontSize: '11px', color: '#6B7280',
            }}>
              Subtotal: {total}/{max} pontos
            </div>
          </div>
        )
      })}

      {/* Observações */}
      <div className="form-group">
        <label>Observações</label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Contexto da observação, comportamentos presentes, dificuldades..."
          value={observacoes}
          onChange={e => { setObservacoes(e.target.value); emitChange(scores, e.target.value) }}
        />
      </div>
    </div>
  )
}
