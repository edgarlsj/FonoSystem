import { useState } from 'react'

// Avaliação de Praxias Orofaciais — Marchezan (2003). 36 itens binários em 4 grupos.
const GRUPOS = [
  {
    key: 'verbais', nome: 'Praxias Verbais', cor: '#5B21B6', bg: '#EDE9FE',
    desc: 'Movimentos com produção sonora',
    itens: [
      'Estalar a língua',
      'Vibrar os lábios (motor de moto)',
      'Vibrar a língua (rrrr)',
      'Beijo sonoro',
      'Cliques labiais',
      'Cliques linguais',
      'Sopro com som ("fff")',
      'Som de assobio',
      'Som "psiu"',
      'Tosse voluntária',
      'Pigarro voluntário',
      'Estalar lábios contra os dentes',
    ],
  },
  {
    key: 'naoVerbais', nome: 'Praxias Não-Verbais', cor: '#0F766E', bg: '#CCFBF1',
    desc: 'Movimentos orofaciais sem som',
    itens: [
      'Protrusão de lábios (bico)',
      'Retração de lábios (sorriso)',
      'Lateralização de lábios (D/E)',
      'Inflar bochechas',
      'Sucção de bochechas',
      'Protrusão de língua',
      'Retração de língua',
      'Lateralização de língua (D/E)',
      'Elevação da ponta da língua',
      'Abaixamento da ponta da língua',
      'Tocar canto dos lábios com a língua',
      'Sopro contínuo (sem som)',
    ],
  },
  {
    key: 'sequencias', nome: 'Sequências de Movimentos', cor: '#1D4ED8', bg: '#DBEAFE',
    desc: 'Movimentos encadeados em sequência',
    itens: [
      'Bico → sorriso → bico',
      'Língua para fora → para cima → para dentro',
      'Inflar bochecha D → E → D',
      'Estalar língua → vibrar lábios → assobiar',
      'Protrusão língua → cantos D → E',
      'Sopro → estalo → beijo',
    ],
  },
  {
    key: 'simultaneos', nome: 'Movimentos Simultâneos', cor: '#9D174D', bg: '#FCE7F3',
    desc: 'Dois movimentos ao mesmo tempo',
    itens: [
      'Inflar bochechas + sorriso',
      'Protrusão de língua + sopro',
      'Lateralização de lábios + olhos fechados',
      'Bico + elevação de sobrancelhas',
      'Língua para cima + abrir/fechar boca',
      'Sopro + lateralização de língua',
    ],
  },
]

// Mapa item-id global (1-36) → { grupoKey, idxLocal }
const getAllItems = () => {
  const items: { id: number; grupoKey: string; idxLocal: number; texto: string }[] = []
  let id = 1
  GRUPOS.forEach(g => {
    g.itens.forEach((texto, idxLocal) => {
      items.push({ id, grupoKey: g.key, idxLocal, texto })
      id++
    })
  })
  return items
}
const ALL_ITEMS = getAllItems()

interface PraxiasFormProps {
  value: any
  onChange: (data: any) => void
}

export default function PraxiasForm({ value, onChange }: PraxiasFormProps) {
  const [itens, setItens] = useState<Record<number, 0 | 1>>(value?.itens || {})
  const [observacoes, setObservacoes] = useState<string>(value?.observacoes || '')

  const handleItem = (id: number, val: 0 | 1) => {
    const novo: Record<number, 0 | 1> = { ...itens }
    if (novo[id] === val) {
      delete novo[id]
    } else {
      novo[id] = val
    }
    setItens(novo)
    emitChange(novo, observacoes)
  }

  const calcGrupoScore = (grupoKey: string, mapa: Record<number, 0 | 1>) => {
    const itensGrupo = ALL_ITEMS.filter(i => i.grupoKey === grupoKey)
    const acertos = itensGrupo.filter(i => mapa[i.id] === 1).length
    return { acertos, total: itensGrupo.length, pct: Math.round((acertos / itensGrupo.length) * 100) }
  }

  const calcTotal = (mapa: Record<number, 0 | 1>) => {
    return Object.values(mapa).filter(v => v === 1).length
  }

  const emitChange = (mapa: Record<number, 0 | 1>, obs: string) => {
    const total = calcTotal(mapa)
    const scores: Record<string, number> = {}
    GRUPOS.forEach(g => {
      scores[g.nome] = calcGrupoScore(g.key, mapa).pct
    })

    let resultado: string
    let classificacao: string
    if (total >= 32) { resultado = 'NORMAL'; classificacao = 'Praxias Adequadas' }
    else if (total >= 26) { resultado = 'LEVE'; classificacao = 'Dispraxia Leve' }
    else if (total >= 18) { resultado = 'MODERADO'; classificacao = 'Dispraxia Moderada' }
    else { resultado = 'GRAVE'; classificacao = 'Dispraxia Grave' }

    onChange({
      instrumento: 'PRAXIAS',
      itens: mapa,
      scores,
      scoreTotal: total,
      scoreMaximo: 36,
      resultadoGeral: resultado,
      classificacao,
      observacoes: obs,
    })
  }

  const total = calcTotal(itens)
  const respondidos = Object.keys(itens).length

  let resultadoLabel: { label: string; cor: string; bg: string; desc: string }
  if (total >= 32) {
    resultadoLabel = { label: 'Praxias Adequadas', cor: '#059669', bg: '#D1FAE5', desc: 'Desempenho dentro do esperado' }
  } else if (total >= 26) {
    resultadoLabel = { label: 'Dispraxia Leve', cor: '#1D4ED8', bg: '#DBEAFE', desc: 'Pequenas dificuldades em alguns movimentos' }
  } else if (total >= 18) {
    resultadoLabel = { label: 'Dispraxia Moderada', cor: '#D97706', bg: '#FEF3C7', desc: 'Dificuldades em vários movimentos práxicos' }
  } else {
    resultadoLabel = { label: 'Dispraxia Grave', cor: '#DC2626', bg: '#FEE2E2', desc: 'Dificuldades acentuadas — necessita intervenção' }
  }

  return (
    <div>
      {/* Resultado */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Resultado das Praxias</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            padding: '16px 24px', borderRadius: '12px',
            background: resultadoLabel.bg, textAlign: 'center', flex: '0 0 auto',
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: resultadoLabel.cor }}>{total}</div>
            <div style={{ fontSize: '11px', color: resultadoLabel.cor, fontWeight: 600 }}>de 36 itens</div>
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
              {respondidos}/36 itens avaliados
            </div>
          </div>
        </div>
      </div>

      {/* Scores por grupo */}
      <div className="form-card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '10px' }}>SCORES POR GRUPO</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          {GRUPOS.map(g => {
            const sc = calcGrupoScore(g.key, itens)
            return (
              <div key={g.key} style={{
                padding: '10px 12px', borderRadius: '8px',
                background: g.bg,
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: g.cor }}>{g.nome}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: g.cor, marginTop: '2px' }}>
                  {sc.acertos}/{sc.total} <span style={{ fontSize: '12px', fontWeight: 500 }}>({sc.pct}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Grupos */}
      {GRUPOS.map(grupo => {
        const itensGrupo = ALL_ITEMS.filter(i => i.grupoKey === grupo.key)
        return (
          <div className="form-card" key={grupo.key} style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px',
              paddingBottom: '10px', borderBottom: `2px solid ${grupo.bg}`,
            }}>
              <div style={{
                width: '8px', height: '24px', borderRadius: '4px', background: grupo.cor,
              }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{grupo.nome}</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>{grupo.desc}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {itensGrupo.map(item => {
                const val = itens[item.id]
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 12px', borderRadius: '8px',
                      border: val === 1 ? '1px solid #86EFAC' : val === 0 ? '1px solid #FCA5A5' : '1px solid #E5E7EB',
                      background: val === 1 ? '#F0FDF4' : val === 0 ? '#FEF2F2' : '#FAFAFA',
                    }}
                  >
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '6px',
                      background: '#F3F4F6', color: '#6B7280',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, flexShrink: 0,
                    }}>
                      {item.id}
                    </div>
                    <div style={{ flex: 1, fontSize: '13px', color: '#374151' }}>{item.texto}</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleItem(item.id, 1)}
                        style={{
                          padding: '4px 14px', borderRadius: '6px',
                          border: val === 1 ? '2px solid #059669' : '1px solid #D1D5DB',
                          background: val === 1 ? '#D1FAE5' : '#fff',
                          color: val === 1 ? '#065F46' : '#6B7280',
                          fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleItem(item.id, 0)}
                        style={{
                          padding: '4px 14px', borderRadius: '6px',
                          border: val === 0 ? '2px solid #DC2626' : '1px solid #D1D5DB',
                          background: val === 0 ? '#FEE2E2' : '#fff',
                          color: val === 0 ? '#991B1B' : '#6B7280',
                          fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                        }}
                      >
                        ✗
                      </button>
                    </div>
                  </div>
                )
              })}
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
          placeholder="Tipo de erros, qualidade dos movimentos, padrão observado..."
          value={observacoes}
          onChange={e => { setObservacoes(e.target.value); emitChange(itens, e.target.value) }}
        />
      </div>
    </div>
  )
}
