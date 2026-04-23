import { useState } from 'react'

// Estrutura do PROC (Zorzi & Hage, 2004)
const PROC_AREAS = {
  habilidadesComunicativas: {
    titulo: 'Habilidades Comunicativas',
    emoji: '💬',
    subAreas: {
      dialogicas: {
        titulo: 'Habilidades Dialógicas',
        itens: [
          'Inicia interações comunicativas espontaneamente',
          'Mantém tópico de interação por vários turnos',
          'Responde a iniciativas comunicativas do interlocutor',
          'Respeita turnos na interação (alternância comunicativa)',
          'Utiliza contato visual durante interações',
        ],
      },
      funcoesComunicativas: {
        titulo: 'Funções Comunicativas',
        itens: [
          'Faz pedidos (objetos, ações, informações)',
          'Protesta ou rejeita (objetos, atividades)',
          'Nomeia ou comenta sobre objetos e eventos',
          'Chama atenção do interlocutor para si ou para objetos',
          'Demonstra atenção compartilhada (apontar + olhar)',
        ],
      },
      meiosComunicacao: {
        titulo: 'Meios de Comunicação',
        itens: [
          'Usa gestos (apontar, acenar, dar tchau)',
          'Usa vocalizações com intenção comunicativa',
          'Usa palavras isoladas com significado',
          'Combina palavras em enunciados',
          'Uso de comunicação não-verbal para complementar a fala',
        ],
      },
      contextualizacao: {
        titulo: 'Níveis de Contextualização da Linguagem',
        itens: [
          'Comunica-se sobre o contexto imediato (aqui e agora)',
          'Refere-se a objetos/pessoas ausentes',
          'Relata eventos passados',
          'Fala sobre eventos futuros ou hipotéticos',
          'Usa linguagem descontextualizada (narrativa, explicação)',
        ],
      },
    },
  },
  compreensaoVerbal: {
    titulo: 'Compreensão Verbal',
    emoji: '👂',
    subAreas: {
      compreensao: {
        titulo: 'Compreensão da Linguagem',
        itens: [
          'Responde ao próprio nome',
          'Compreende "não" e interrompe a ação',
          'Identifica objetos familiares quando nomeados',
          'Segue comandos verbais simples (uma etapa)',
          'Segue comandos verbais complexos (duas etapas)',
          'Compreende perguntas (o quê? onde? quem?)',
          'Compreende conceitos de quantidade (mais, pouco)',
        ],
      },
    },
  },
  desenvolvimentoCognitivo: {
    titulo: 'Aspectos do Desenvolvimento Cognitivo',
    emoji: '🧠',
    subAreas: {
      manipulacao: {
        titulo: 'Formas de Manipulação dos Objetos',
        itens: [
          'Exploração sensório-motora (leva à boca, sacode, bate)',
          'Manipulação funcional (usa objetos conforme função)',
          'Uso relacional (combina objetos: colher+prato)',
          'Jogo construtivo (empilha, encaixa, constrói)',
          'Jogo simbólico (faz-de-conta com objetos)',
        ],
      },
      simbolismo: {
        titulo: 'Hierarquia do Simbolismo',
        itens: [
          'Ações sensório-motoras repetitivas com objetos',
          'Imitação de ações simples observadas',
          'Uso de objeto substituto no faz-de-conta',
          'Sequências de faz-de-conta (combinação de cenas)',
          'Jogo simbólico com planejamento e narrativa',
        ],
      },
    },
  },
}

type ProcScore = 0 | 1 | 2 | 3 | 4

const SCORE_LABELS: Record<ProcScore, { label: string; desc: string; bg: string; color: string }> = {
  0: { label: 'Ausente', desc: 'Comportamento não observado', bg: '#FEE2E2', color: '#991B1B' },
  1: { label: 'Raro', desc: 'Ocorre raramente/com muita ajuda', bg: '#FFEDD5', color: '#9A3412' },
  2: { label: 'Às vezes', desc: 'Ocorre inconsistentemente', bg: '#FEF3C7', color: '#92400E' },
  3: { label: 'Frequente', desc: 'Ocorre na maioria das situações', bg: '#DBEAFE', color: '#1D4ED8' },
  4: { label: 'Consistente', desc: 'Ocorre de forma estável e funcional', bg: '#D1FAE5', color: '#065F46' },
}

interface ProcFormProps {
  value: any
  onChange: (data: any) => void
}

export default function ProcForm({ value, onChange }: ProcFormProps) {
  const [scores, setScores] = useState<Record<string, Record<string, Record<string, ProcScore>>>>(value?.scores || {})
  const [obsAreas, setObsAreas] = useState<Record<string, string>>(value?.obsAreas || {})
  const [observacoes, setObservacoes] = useState<string>(value?.observacoes || '')
  const [areaAtiva, setAreaAtiva] = useState<string>('habilidadesComunicativas')

  const getScore = (area: string, subArea: string, idx: number): ProcScore => {
    return (scores[area]?.[subArea]?.[String(idx)] as ProcScore) ?? -1 as any
  }

  const handleScore = (area: string, subArea: string, idx: number, score: ProcScore) => {
    const novo = { ...scores }
    if (!novo[area]) novo[area] = {}
    if (!novo[area][subArea]) novo[area][subArea] = {}
    novo[area][subArea][String(idx)] = score
    setScores(novo)
    emitChange(novo, obsAreas, observacoes)
  }

  const calcMediaSubArea = (area: string, subArea: string, itens: string[]): number => {
    let soma = 0, count = 0
    itens.forEach((_, i) => {
      const s = scores[area]?.[subArea]?.[String(i)]
      if (s !== undefined && s >= 0) {
        soma += s
        count++
      }
    })
    return count > 0 ? Math.round((soma / (count * 4)) * 100) : 0
  }

  const calcMediaArea = (areaKey: string) => {
    const area = (PROC_AREAS as any)[areaKey]
    if (!area) return 0
    let total = 0, count = 0
    Object.entries(area.subAreas).forEach(([saKey, sa]: [string, any]) => {
      const m = calcMediaSubArea(areaKey, saKey, sa.itens)
      if (m > 0 || scores[areaKey]?.[saKey]) {
        total += m
        count++
      }
    })
    return count > 0 ? Math.round(total / count) : 0
  }

  const emitChange = (sc: any, oa: any, obs: string) => {
    const areaScores: Record<string, number> = {}
    Object.keys(PROC_AREAS).forEach(k => {
      areaScores[k] = calcMediaArea(k)
    })
    onChange({
      instrumento: 'PROC',
      scores: sc,
      obsAreas: oa,
      areaScores,
      observacoes: obs,
    })
  }

  const handleObsArea = (area: string, val: string) => {
    const novo = { ...obsAreas, [area]: val }
    setObsAreas(novo)
    emitChange(scores, novo, observacoes)
  }

  const areaKeys = Object.keys(PROC_AREAS)

  return (
    <div>
      {/* Resumo por área */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Resumo por Área</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {areaKeys.map(k => {
            const area = (PROC_AREAS as any)[k]
            const p = calcMediaArea(k)
            const cor = p >= 70 ? '#059669' : p >= 40 ? '#D97706' : '#DC2626'
            return (
              <div
                key={k}
                onClick={() => setAreaAtiva(k)}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: areaAtiva === k ? '2px solid var(--odapp-blue)' : '1px solid #E5E7EB',
                  cursor: 'pointer',
                  background: areaAtiva === k ? '#F0FDFA' : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{area.emoji}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{area.titulo}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: cor }}>{p}%</div>
                  <div style={{
                    flex: 1, height: '4px', borderRadius: '2px', background: '#E5E7EB',
                    overflow: 'hidden',
                  }}>
                    <div style={{ width: `${p}%`, height: '100%', background: cor, borderRadius: '2px', transition: 'width 0.3s' }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Abas de área principal */}
      <div style={{
        display: 'flex', gap: '0', borderBottom: '2px solid #E5E7EB', marginBottom: '16px',
        overflowX: 'auto', background: '#fff', borderRadius: '10px 10px 0 0',
      }}>
        {areaKeys.map(k => {
          const area = (PROC_AREAS as any)[k]
          return (
            <button
              key={k}
              onClick={() => setAreaAtiva(k)}
              style={{
                padding: '12px 18px',
                fontWeight: 600,
                fontSize: '13px',
                color: areaAtiva === k ? 'var(--odapp-blue)' : '#9CA3AF',
                background: 'none',
                border: 'none',
                borderBottom: '2px solid',
                borderBottomColor: areaAtiva === k ? 'var(--odapp-blue)' : 'transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {area.emoji} {area.titulo}
            </button>
          )
        })}
      </div>

      {/* Legenda de escala */}
      <div className="form-card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>ESCALA DE PONTUAÇÃO</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {([0, 1, 2, 3, 4] as ProcScore[]).map(s => (
            <div key={s} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '6px',
              background: SCORE_LABELS[s].bg, fontSize: '11px',
            }}>
              <span style={{ fontWeight: 700, color: SCORE_LABELS[s].color }}>{s}</span>
              <span style={{ color: SCORE_LABELS[s].color }}>{SCORE_LABELS[s].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-áreas da área ativa */}
      {Object.entries(((PROC_AREAS as any)[areaAtiva]?.subAreas || {}) as Record<string, any>).map(([saKey, sa]) => (
        <div className="form-card" key={saKey} style={{ marginBottom: '16px' }}>
          <div className="form-section-title">
            <div className="section-icon" />
            {sa.titulo}
            <span style={{
              marginLeft: '12px',
              fontSize: '12px',
              fontWeight: 700,
              color: calcMediaSubArea(areaAtiva, saKey, sa.itens) >= 70 ? '#059669'
                : calcMediaSubArea(areaAtiva, saKey, sa.itens) >= 40 ? '#D97706' : '#9CA3AF',
            }}>
              {calcMediaSubArea(areaAtiva, saKey, sa.itens)}%
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sa.itens.map((item: string, idx: number) => {
              const current = getScore(areaAtiva, saKey, idx)
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    background: current >= 0 ? SCORE_LABELS[current as ProcScore]?.bg + '30' : '#FAFAFA',
                    gap: '12px',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', flex: 1 }}>
                    {item}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {([0, 1, 2, 3, 4] as ProcScore[]).map(s => (
                      <button
                        key={s}
                        onClick={() => handleScore(areaAtiva, saKey, idx, s)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: current === s ? `2px solid ${SCORE_LABELS[s].color}` : '1px solid #D1D5DB',
                          background: current === s ? SCORE_LABELS[s].bg : '#fff',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '13px',
                          color: current === s ? SCORE_LABELS[s].color : '#9CA3AF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Observação da sub-área */}
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label style={{ fontSize: '12px' }}>Observações — {sa.titulo}</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder={`Observações sobre ${sa.titulo.toLowerCase()}...`}
              value={obsAreas[`${areaAtiva}_${saKey}`] || ''}
              onChange={e => handleObsArea(`${areaAtiva}_${saKey}`, e.target.value)}
            />
          </div>
        </div>
      ))}

      {/* Observações gerais */}
      <div className="form-group">
        <label>Observações Gerais do PROC</label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Impressões gerais sobre o comportamento comunicativo e linguístico da criança..."
          value={observacoes}
          onChange={e => { setObservacoes(e.target.value); emitChange(scores, obsAreas, e.target.value) }}
        />
      </div>
    </div>
  )
}
