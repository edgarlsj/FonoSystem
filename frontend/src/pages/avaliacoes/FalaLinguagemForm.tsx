import { useState } from 'react'

// Roteiro Descritivo — Giacheti e Ferrari (2016). 8 domínios com valor obtido vs esperado.
const DOMINIOS = [
  { id: 1, nome: 'Habilidades Perceptivo-Auditivas', desc: 'Processamento e atenção auditiva' },
  { id: 2, nome: 'Vocabulário — Compreensão', desc: 'Entendimento de palavras e conceitos' },
  { id: 3, nome: 'Vocabulário — Expressão', desc: 'Uso e produção de vocabulário' },
  { id: 4, nome: 'Fonologia', desc: 'Sistema de sons e processos fonológicos' },
  { id: 5, nome: 'Morfossintaxe', desc: 'Estrutura frasal e elementos gramaticais' },
  { id: 6, nome: 'Pragmática/Comunicação', desc: 'Uso funcional e social da linguagem' },
  { id: 7, nome: 'Motricidade Orofacial', desc: 'Estruturas e funções motoras orais' },
  { id: 8, nome: 'Fala (Articulação/Inteligibilidade)', desc: 'Clareza e precisão da fala' },
]

interface FalaLinguagemFormProps {
  value: any
  onChange: (data: any) => void
}

export default function FalaLinguagemForm({ value, onChange }: FalaLinguagemFormProps) {
  const [obtidos, setObtidos] = useState<Record<number, number>>(value?.obtidos || {})
  const [observacoes, setObservacoes] = useState<string>(value?.observacoes || '')

  const handleObtido = (id: number, val: string) => {
    const num = Math.min(Math.max(parseInt(val) || 0, 0), 10)
    const novo = { ...obtidos, [id]: num }
    setObtidos(novo)
    emitChange(novo, observacoes)
  }

  const calcPerfil = (obt: Record<number, number>): { adequados: number; parciais: number; alterados: number } => {
    let adequados = 0, parciais = 0, alterados = 0
    DOMINIOS.forEach(d => {
      const val = obt[d.id] || 0
      if (val >= 8) adequados++
      else if (val >= 5) parciais++
      else alterados++
    })
    return { adequados, parciais, alterados }
  }

  const emitChange = (obt: Record<number, number>, obs: string) => {
    const scores: Record<string, number> = {}
    const perfil = calcPerfil(obt)

    DOMINIOS.forEach(d => {
      const obtido = obt[d.id] || 0
      scores[d.nome] = Math.round((obtido / 10) * 100)
    })

    const totalAvaliados = Object.values(obt).filter(v => v > 0).length
    let resultado: string
    if (perfil.adequados === DOMINIOS.length) resultado = 'ADEQUADO'
    else if (perfil.alterados === 0) resultado = 'PARCIAL'
    else resultado = 'ALTERADO'

    onChange({
      instrumento: 'FALA_LINGUAGEM',
      obtidos: obt,
      scores,
      scoreGeral: Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length),
      perfil,
      totalAvaliados,
      resultadoGeral: resultado,
      observacoes: obs,
    })
  }

  const perfil = calcPerfil(obtidos)
  const totalAvaliados = Object.values(obtidos).filter(v => v > 0).length
  const scoreGeral = DOMINIOS.length > 0
    ? Math.round(Object.values(obtidos).reduce((a, b) => a + b, 0) / DOMINIOS.length)
    : 0

  return (
    <div>
      {/* Resumo do Perfil */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Perfil Fonoaudiológico</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            padding: '12px 16px', borderRadius: '12px',
            background: '#D1FAE5', border: '1px solid #6EE7B7',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#065F46', marginBottom: '4px' }}>ADEQUADOS</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>
              {perfil.adequados}/{DOMINIOS.length}
            </div>
            <div style={{ fontSize: '10px', color: '#047857' }}>Domínios ≥ 8/10</div>
          </div>
          <div style={{
            padding: '12px 16px', borderRadius: '12px',
            background: '#FEF3C7', border: '1px solid #FCD34D',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#92400E', marginBottom: '4px' }}>PARCIAIS</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#D97706' }}>
              {perfil.parciais}
            </div>
            <div style={{ fontSize: '10px', color: '#B45309' }}>Domínios 5–7/10</div>
          </div>
          <div style={{
            padding: '12px 16px', borderRadius: '12px',
            background: '#FEE2E2', border: '1px solid #FCA5A5',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#991B1B', marginBottom: '4px' }}>ALTERADOS</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#DC2626' }}>
              {perfil.alterados}
            </div>
            <div style={{ fontSize: '10px', color: '#B91C1C' }}>Domínios &lt; 5/10</div>
          </div>
        </div>
        <div style={{
          padding: '10px 14px', borderRadius: '8px',
          background: '#F3F4F6', fontSize: '12px', color: '#6B7280',
        }}>
          <strong>Score Geral:</strong> {scoreGeral}/10 · <strong>Domínios avaliados:</strong> {totalAvaliados}/{DOMINIOS.length}
        </div>
      </div>

      {/* Legenda */}
      <div className="form-card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>INTERPRETAÇÃO</div>
        <div style={{ fontSize: '11px', color: '#6B7280', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span>🟢 <strong>8–10:</strong> Adequado</span>
          <span>🟡 <strong>5–7:</strong> Parcial</span>
          <span>🔴 <strong>0–4:</strong> Alterado</span>
        </div>
      </div>

      {/* Domínios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {DOMINIOS.map(dom => {
          const obtido = obtidos[dom.id] || 0
          const pct = Math.round((obtido / 10) * 100)
          let status: 'adequado' | 'parcial' | 'alterado'
          if (obtido >= 8) status = 'adequado'
          else if (obtido >= 5) status = 'parcial'
          else status = 'alterado'

          const statusColor = {
            adequado: { bg: '#D1FAE5', color: '#059669', label: '✓ Adequado' },
            parcial: { bg: '#FEF3C7', color: '#D97706', label: '⚠ Parcial' },
            alterado: { bg: '#FEE2E2', color: '#DC2626', label: '✗ Alterado' },
          }[status]

          return (
            <div className="form-card" key={dom.id} style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: statusColor.bg,
                  color: statusColor.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '16px', flexShrink: 0,
                }}>
                  {obtido}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{dom.nome}</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{dom.desc}</div>
                    </div>
                    <div style={{
                      padding: '4px 10px', borderRadius: '6px',
                      background: statusColor.bg, color: statusColor.color,
                      fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap',
                    }}>
                      {statusColor.label}
                    </div>
                  </div>

                  {/* Input + Barra */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={obtido}
                      onChange={e => handleObtido(dom.id, e.target.value)}
                      style={{
                        width: '50px', padding: '6px 8px', borderRadius: '6px',
                        border: '1px solid #D1D5DB', fontSize: '13px', fontWeight: 600,
                      }}
                    />
                    <span style={{ fontSize: '12px', color: '#9CA3AF', minWidth: '20px' }}>/10</span>
                    <div style={{
                      flex: 1, height: '6px', borderRadius: '3px',
                      background: '#E5E7EB', overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%', background: statusColor.color,
                        transition: 'width 0.2s',
                      }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', minWidth: '30px' }}>{pct}%</span>
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
          placeholder="Contextualização da avaliação, comportamentos observados, recomendações..."
          value={observacoes}
          onChange={e => { setObservacoes(e.target.value); emitChange(obtidos, e.target.value) }}
        />
      </div>
    </div>
  )
}
