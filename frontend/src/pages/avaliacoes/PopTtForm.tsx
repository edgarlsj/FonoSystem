import { useState } from 'react'

// POP-TT — Borghi e Pântano (2010). 3 seções, classificação qualitativa A/B/C/D.
const POP_SECOES = [
  {
    key: 'CONHECIMENTO_CORPO',
    nome: 'I — Conhecimento do Corpo',
    desc: 'Cinestesia, lateralidade, imagem proprioceptiva, imitação de gestos, figura humana',
  },
  {
    key: 'PRAXIA_GLOBAL',
    nome: 'II — Praxia Global',
    desc: 'Equilíbrio, coordenação motora ampla, organização espacial',
  },
  {
    key: 'PRAXIA_FINA',
    nome: 'III — Praxia Fina',
    desc: 'Destreza manual, velocidade e precisão visuomotora',
  },
]

const NIVEIS = [
  { key: 'A', label: 'A — Ótimo', desc: 'Execução imediata e inequívoca', score: 100, cor: '#059669', bg: '#D1FAE5' },
  { key: 'B', label: 'B — Bom', desc: 'Execução inequívoca, não imediata', score: 75, cor: '#1D4ED8', bg: '#DBEAFE' },
  { key: 'C', label: 'C — Satisfatório', desc: 'Acertos em ≥50% das solicitações, com dúvidas', score: 50, cor: '#D97706', bg: '#FEF3C7' },
  { key: 'D', label: 'D — Fraco', desc: 'Acertos abaixo do esperado por chance', score: 25, cor: '#DC2626', bg: '#FEE2E2' },
]

interface PopTtFormProps {
  value: any
  onChange: (data: any) => void
}

export default function PopTtForm({ value, onChange }: PopTtFormProps) {
  const [niveis, setNiveis] = useState<Record<string, string>>(value?.niveis || {})
  const [observacoes, setObservacoes] = useState<string>(value?.observacoes || '')

  const handleNivel = (secaoKey: string, nivelKey: string) => {
    const novo = { ...niveis, [secaoKey]: niveis[secaoKey] === nivelKey ? '' : nivelKey }
    setNiveis(novo)
    emitChange(novo, observacoes)
  }

  const calcResultadoGeral = (n: Record<string, string>): string => {
    const vals = POP_SECOES.map(s => n[s.key]).filter(v => v)
    if (vals.length < POP_SECOES.length) return 'INCOMPLETO'
    const otimosBons = vals.filter(v => v === 'A' || v === 'B').length
    const fracos = vals.filter(v => v === 'D').length
    if (otimosBons === vals.length) return 'ADEQUADO'
    if (fracos >= 2) return 'ALTERADO'
    return 'PARCIAL'
  }

  const emitChange = (n: Record<string, string>, obs: string) => {
    const scores: Record<string, number> = {}
    POP_SECOES.forEach(s => {
      const niv = n[s.key]
      const nivelObj = NIVEIS.find(x => x.key === niv)
      scores[s.nome] = nivelObj?.score ?? 0
    })
    onChange({
      instrumento: 'POP-TT',
      niveis: n,
      scores,
      resultadoGeral: calcResultadoGeral(n),
      observacoes: obs,
    })
  }

  const resultado = calcResultadoGeral(niveis)
  const respondidas = POP_SECOES.filter(s => niveis[s.key]).length

  const resultadoLabels = {
    INCOMPLETO: { label: 'Incompleto', cor: '#6B7280', bg: '#F3F4F6', desc: 'Classifique todas as seções' },
    ADEQUADO: { label: 'Perfil Adequado', cor: '#059669', bg: '#D1FAE5', desc: 'Todas as seções com desempenho ótimo ou bom' },
    PARCIAL: { label: 'Perfil Parcial', cor: '#D97706', bg: '#FEF3C7', desc: 'Desempenho variável entre as seções' },
    ALTERADO: { label: 'Perfil Alterado', cor: '#DC2626', bg: '#FEE2E2', desc: 'Duas ou mais seções com desempenho fraco' },
  }
  const resultadoLabel = resultadoLabels[resultado as keyof typeof resultadoLabels] || resultadoLabels.INCOMPLETO

  return (
    <div>
      {/* Resultado */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Resultado da Observação</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            padding: '16px 24px', borderRadius: '12px',
            background: resultadoLabel.bg, textAlign: 'center', flex: '0 0 auto',
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: resultadoLabel.cor }}>{respondidas}</div>
            <div style={{ fontSize: '11px', color: resultadoLabel.cor, fontWeight: 600 }}>de {POP_SECOES.length} seções</div>
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
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="form-card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>NÍVEIS DE DESEMPENHO</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {NIVEIS.map(n => (
            <div key={n.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <span style={{
                width: '24px', height: '24px', borderRadius: '6px',
                background: n.bg, color: n.cor, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
              }}>{n.key}</span>
              <span style={{ color: '#6B7280' }}>{n.label.split('—')[1]?.trim()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Seções */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {POP_SECOES.map(secao => {
          const selected = niveis[secao.key] || ''
          const nivelSel = NIVEIS.find(n => n.key === selected)
          return (
            <div className="form-card" key={secao.key} style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: nivelSel?.bg || '#F3F4F6',
                  color: nivelSel?.cor || '#9CA3AF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '14px', flexShrink: 0,
                }}>
                  {selected || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{secao.nome}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{secao.desc}</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                    {NIVEIS.map(n => {
                      const isSel = selected === n.key
                      return (
                        <button
                          key={n.key}
                          onClick={() => handleNivel(secao.key, n.key)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 12px', borderRadius: '8px',
                            border: isSel ? `2px solid ${n.cor}` : '1px solid #E5E7EB',
                            background: isSel ? n.bg : '#fff',
                            cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.15s',
                          }}
                        >
                          <span style={{
                            width: '24px', height: '24px', borderRadius: '6px',
                            background: isSel ? n.cor : '#F3F4F6',
                            color: isSel ? '#fff' : '#9CA3AF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '12px', flexShrink: 0,
                          }}>
                            {n.key}
                          </span>
                          <span style={{ fontSize: '12px', color: isSel ? n.cor : '#374151', fontWeight: isSel ? 600 : 400 }}>
                            <strong>{n.label}</strong> — {n.desc}
                          </span>
                        </button>
                      )
                    })}
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
          placeholder="Observações sobre a aplicação do POP-TT..."
          value={observacoes}
          onChange={e => { setObservacoes(e.target.value); emitChange(niveis, e.target.value) }}
        />
      </div>
    </div>
  )
}
