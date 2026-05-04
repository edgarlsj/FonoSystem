import { useState } from 'react'

// DEMSS-BR — Avaliação Motora da Fala (Fish, 2019). 7 tarefas com escala 0-4 + consistência.
const TAREFAS = [
  { id: 1, nome: 'V — Vogais isoladas', desc: 'Produção de vogais em contexto isolado' },
  { id: 2, nome: 'CV — Consoante-Vogal simples', desc: 'Estruturas silábicas simples (ba, pa, ta)' },
  { id: 3, nome: 'VC — Vogal-Consoante', desc: 'Consoante em posição final de sílaba' },
  { id: 4, nome: 'CVC — Consoante-Vogal-Consoante', desc: 'Estrutura fechada completa (bat, pat)' },
  { id: 5, nome: 'Dissilábicas', desc: 'Palavras com 2 sílabas' },
  { id: 6, nome: 'Polissilábicas', desc: 'Palavras com 3+ sílabas' },
  { id: 7, nome: 'Fala Conectada', desc: 'Produção em frase/narrativa' },
]

type Precisao = 0 | 1 | 2 | 3 | 4
type Consistencia = 'consistente' | 'inconsistente' | ''

interface MotoraFalaFormProps {
  value: any
  onChange: (data: any) => void
}

export default function MotoraFalaForm({ value, onChange }: MotoraFalaFormProps) {
  const [precisoes, setPrecisoes] = useState<Record<number, Precisao>>(value?.precisoes || {})
  const [consistencias, setConsistencias] = useState<Record<number, Consistencia>>(value?.consistencias || {})
  const [observacoes, setObservacoes] = useState<string>(value?.observacoes || '')

  const handlePrecisao = (id: number, val: Precisao) => {
    const novo = { ...precisoes, [id]: precisoes[id] === val ? 0 : val }
    setPrecisoes(novo)
    emitChange(novo, consistencias, observacoes)
  }

  const handleConsistencia = (id: number) => {
    const novo = { ...consistencias }
    const current = novo[id] || ''
    if (current === 'consistente') novo[id] = 'inconsistente'
    else if (current === 'inconsistente') delete novo[id]
    else novo[id] = 'consistente'
    setConsistencias(novo)
    emitChange(precisoes, novo, observacoes)
  }

  const emitChange = (prec: Record<number, Precisao>, cons: Record<number, Consistencia>, obs: string) => {
    const totalPrec = Object.values(prec).reduce((a: number, b: Precisao) => a + b, 0)
    const maxPrec = TAREFAS.length * 4
    const totalCons = Object.values(cons).filter(c => c === 'consistente').length
    const maxCons = TAREFAS.length

    const scores: Record<string, number> = {}
    TAREFAS.forEach(t => {
      const p = prec[t.id] || 0
      scores[t.nome] = Math.round((p / 4) * 100)
    })

    let resultado: string
    const mediaPrec = maxPrec > 0 ? (totalPrec / maxPrec) * 100 : 0
    if (mediaPrec >= 80) resultado = 'NORMAL'
    else if (mediaPrec >= 60) resultado = 'LEVE'
    else if (mediaPrec >= 40) resultado = 'MODERADO'
    else resultado = 'GRAVE'

    onChange({
      instrumento: 'MOTORA_FALA',
      precisoes: prec,
      consistencias: cons,
      scoreTotal: totalPrec,
      scoreMaximo: maxPrec,
      totalConsistentes: totalCons,
      scores,
      resultadoGeral: resultado,
      observacoes: obs,
    })
  }

  const totalPrec = Object.values(precisoes).reduce((a: number, b: Precisao) => a + b, 0)
  const maxPrec = TAREFAS.length * 4
  const mediaPrec = maxPrec > 0 ? (totalPrec / maxPrec) * 100 : 0

  let resultadoLabel: { label: string; cor: string; bg: string; desc: string }
  if (mediaPrec >= 80) {
    resultadoLabel = { label: 'Adequado', cor: '#059669', bg: '#D1FAE5', desc: 'Motricidade de fala dentro do esperado' }
  } else if (mediaPrec >= 60) {
    resultadoLabel = { label: 'Comprometimento Leve', cor: '#1D4ED8', bg: '#DBEAFE', desc: 'Erros leves em precisão motora' }
  } else if (mediaPrec >= 40) {
    resultadoLabel = { label: 'Comprometimento Moderado', cor: '#D97706', bg: '#FEF3C7', desc: 'Dificuldades moderadas de precisão' }
  } else {
    resultadoLabel = { label: 'Comprometimento Grave', cor: '#DC2626', bg: '#FEE2E2', desc: 'Dificuldades graves na motricidade de fala' }
  }

  const precisaoCores = [
    { val: 0 as Precisao, label: '0', desc: 'Incorreto', cor: '#6B7280', bg: '#F3F4F6' },
    { val: 1 as Precisao, label: '1', desc: 'Corr. após tentativas', cor: '#D97706', bg: '#FEF3C7' },
    { val: 2 as Precisao, label: '2', desc: 'Corr. com dica', cor: '#1D4ED8', bg: '#DBEAFE' },
    { val: 3 as Precisao, label: '3', desc: 'Distorção consistente', cor: '#8B5CF6', bg: '#F3E8FF' },
    { val: 4 as Precisao, label: '4', desc: 'Correto (sem dica)', cor: '#059669', bg: '#D1FAE5' },
  ]

  return (
    <div>
      {/* Resultado */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Avaliação Motora da Fala</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            padding: '16px 24px', borderRadius: '12px',
            background: resultadoLabel.bg, textAlign: 'center', flex: '0 0 auto',
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: resultadoLabel.cor }}>
              {Math.round(mediaPrec)}%
            </div>
            <div style={{ fontSize: '11px', color: resultadoLabel.cor, fontWeight: 600 }}>Score Geral</div>
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
              {totalPrec}/{maxPrec} pontos de precisão
            </div>
          </div>
        </div>
      </div>

      {/* Legenda Precisão */}
      <div className="form-card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>ESCALA DE PRECISÃO (0–4)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
          {precisaoCores.map(p => (
            <div key={p.val} style={{
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px',
              padding: '6px 10px', background: p.bg, borderRadius: '6px',
            }}>
              <span style={{
                width: '24px', height: '24px', borderRadius: '4px',
                background: p.cor, color: '#fff', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
              }}>{p.val}</span>
              <div><strong>{p.label}</strong> {p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tarefas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {TAREFAS.map(tarefa => {
          const prec = precisoes[tarefa.id] || 0
          const cons = consistencias[tarefa.id] || ''
          const precObj = precisaoCores.find(p => p.val === prec)
          return (
            <div className="form-card" key={tarefa.id} style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: precObj?.bg || '#F3F4F6',
                  color: precObj?.cor || '#9CA3AF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '16px', flexShrink: 0,
                }}>
                  {prec}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{tarefa.nome}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{tarefa.desc}</div>

                  {/* Precisão */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280' }}>Precisão</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {precisaoCores.map(p => {
                        const isSel = prec === p.val
                        return (
                          <button
                            key={p.val}
                            onClick={() => handlePrecisao(tarefa.id, p.val)}
                            style={{
                              width: '32px', height: '32px', borderRadius: '6px',
                              border: isSel ? `2px solid ${p.cor}` : '1px solid #D1D5DB',
                              background: isSel ? p.bg : '#fff',
                              color: isSel ? p.cor : '#9CA3AF',
                              fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                            }}
                            title={p.desc}
                          >
                            {p.val}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Consistência */}
                  <div>
                    <button
                      onClick={() => handleConsistencia(tarefa.id)}
                      style={{
                        padding: '6px 12px', borderRadius: '6px',
                        border: cons === 'consistente' ? '2px solid #059669' : cons === 'inconsistente' ? '2px solid #DC2626' : '1px solid #D1D5DB',
                        background: cons === 'consistente' ? '#D1FAE5' : cons === 'inconsistente' ? '#FEE2E2' : '#fff',
                        color: cons === 'consistente' ? '#065F46' : cons === 'inconsistente' ? '#991B1B' : '#6B7280',
                        fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                      }}
                    >
                      {cons === 'consistente' ? '✓ Consistente' : cons === 'inconsistente' ? '✗ Inconsistente' : 'Marcar Consistência'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Observações */}
      <div className="form-group" style={{ marginTop: '16px' }}>
        <label>Observações</label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Características motoras observadas, facilidades, dificuldades específicas..."
          value={observacoes}
          onChange={e => { setObservacoes(e.target.value); emitChange(precisoes, consistencias, e.target.value) }}
        />
      </div>
    </div>
  )
}
