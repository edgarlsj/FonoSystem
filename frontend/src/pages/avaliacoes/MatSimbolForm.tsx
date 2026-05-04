import { useState } from 'react'

// Avaliação de Maturidade Simbólica — Befi-Lopes (2003). 7 estágios hierárquicos.
const ESTAGIOS = [
  { key: 'EPS', sigla: 'EPS', nome: 'Esquema Pré-Simbólico', desc: 'Reconhece uso do objeto, gesto breve', pontos: 1 },
  { key: 'EAS', sigla: 'EAS', nome: 'Esquema Auto-Simbólico', desc: 'Realiza ação sobre si mesmo (ex: finge beber)', pontos: 2 },
  { key: 'JSA', sigla: 'JSA', nome: 'Jogo Simbólico Assimilativo', desc: 'Ação sobre outra pessoa ou boneco', pontos: 3 },
  { key: 'JSI', sigla: 'JSI', nome: 'Jogo Simbólico Imitativo', desc: 'Imita papel de outra pessoa (mãe, médico)', pontos: 4 },
  { key: 'JSOS', sigla: 'JSOS', nome: 'Jogo Simbólico com Objeto Substituto', desc: 'Usa objeto para representar outro', pontos: 5 },
  { key: 'JSCU', sigla: 'JSCU', nome: 'Jogo Combinatorial — Esquema Único', desc: 'Sequência simples de ações relacionadas', pontos: 6 },
  { key: 'JSCM', sigla: 'JSCM', nome: 'Jogo Combinatorial — Esquemas Múltiplos', desc: 'Sequência complexa de ações coordenadas', pontos: 7 },
]

interface MatSimbolFormProps {
  value: any
  onChange: (data: any) => void
}

export default function MatSimbolForm({ value, onChange }: MatSimbolFormProps) {
  const [frequente, setFrequente] = useState<string>(value?.jogoFrequente?.sigla || '')
  const [elaborado, setElaborado] = useState<string>(value?.jogoElaborado?.sigla || '')
  const [observacoes, setObservacoes] = useState<string>(value?.observacoes || '')

  const handleSelect = (tipo: 'frequente' | 'elaborado', sigla: string) => {
    if (tipo === 'frequente') {
      const novo = frequente === sigla ? '' : sigla
      setFrequente(novo)
      emitChange(novo, elaborado, observacoes)
    } else {
      const novo = elaborado === sigla ? '' : sigla
      setElaborado(novo)
      emitChange(frequente, novo, observacoes)
    }
  }

  const emitChange = (freq: string, elab: string, obs: string) => {
    const fObj = ESTAGIOS.find(e => e.sigla === freq)
    const eObj = ESTAGIOS.find(e => e.sigla === elab)
    const total = (fObj?.pontos || 0) + (eObj?.pontos || 0)

    let resultado: string
    if (!fObj || !eObj) resultado = 'INCOMPLETO'
    else if (total >= 10) resultado = 'ADEQUADO'
    else if (total >= 5) resultado = 'PARCIAL'
    else resultado = 'ALTERADO'

    onChange({
      instrumento: 'MAT_SIMBOLICA',
      jogoFrequente: fObj ? { sigla: fObj.sigla, nome: fObj.nome, pontos: fObj.pontos } : null,
      jogoElaborado: eObj ? { sigla: eObj.sigla, nome: eObj.nome, pontos: eObj.pontos } : null,
      scoreTotal: total,
      scoreMaximo: 14,
      scores: {
        'Jogo mais frequente': fObj ? Math.round((fObj.pontos / 7) * 100) : 0,
        'Jogo mais elaborado': eObj ? Math.round((eObj.pontos / 7) * 100) : 0,
        'Maturidade Total': Math.round((total / 14) * 100),
      },
      resultadoGeral: resultado,
      observacoes: obs,
    })
  }

  const fObj = ESTAGIOS.find(e => e.sigla === frequente)
  const eObj = ESTAGIOS.find(e => e.sigla === elaborado)
  const total = (fObj?.pontos || 0) + (eObj?.pontos || 0)

  let resultadoLabel: { label: string; cor: string; bg: string; desc: string }
  if (!fObj || !eObj) {
    resultadoLabel = { label: 'Incompleto', cor: '#6B7280', bg: '#F3F4F6', desc: 'Selecione os dois tipos de jogo' }
  } else if (total >= 10) {
    resultadoLabel = { label: 'Maturidade Adequada', cor: '#059669', bg: '#D1FAE5', desc: 'Perfil simbólico desenvolvido para a faixa' }
  } else if (total >= 5) {
    resultadoLabel = { label: 'Maturidade Parcial', cor: '#D97706', bg: '#FEF3C7', desc: 'Desenvolvimento intermediário do jogo simbólico' }
  } else {
    resultadoLabel = { label: 'Maturidade Alterada', cor: '#DC2626', bg: '#FEE2E2', desc: 'Predomínio de esquemas pré ou auto-simbólicos' }
  }

  const renderEstagiosBotoes = (tipo: 'frequente' | 'elaborado', selected: string) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
      {ESTAGIOS.map(est => {
        const isSel = selected === est.sigla
        return (
          <button
            key={est.sigla}
            onClick={() => handleSelect(tipo, est.sigla)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '10px 12px', borderRadius: '8px',
              border: isSel ? '2px solid #29B6D1' : '1px solid #E5E7EB',
              background: isSel ? '#E0F2FE' : '#fff',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <span style={{
              minWidth: '40px', height: '24px', padding: '0 8px', borderRadius: '6px',
              background: isSel ? '#0369A1' : '#F3F4F6',
              color: isSel ? '#fff' : '#6B7280',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '11px', flexShrink: 0,
            }}>
              {est.sigla}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: isSel ? '#0369A1' : '#374151' }}>
                {est.nome} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({est.pontos}pt)</span>
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{est.desc}</div>
            </div>
          </button>
        )
      })}
    </div>
  )

  return (
    <div>
      {/* Resultado */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Maturidade Simbólica</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            padding: '16px 24px', borderRadius: '12px',
            background: resultadoLabel.bg, textAlign: 'center', flex: '0 0 auto',
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: resultadoLabel.cor }}>{total}</div>
            <div style={{ fontSize: '11px', color: resultadoLabel.cor, fontWeight: 600 }}>de 14 pontos</div>
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
        {/* Barra visual */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>
            <span>0 (alterado)</span>
            <span>5 (parcial)</span>
            <span>10 (adequado)</span>
            <span>14</span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', background: '#E5E7EB', overflow: 'hidden' }}>
            <div style={{
              width: `${(total / 14) * 100}%`,
              height: '100%', borderRadius: '4px',
              background: resultadoLabel.cor,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      </div>

      {/* Jogo mais frequente */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Jogo Simbólico mais Frequente</div>
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '10px' }}>
          Tipo de jogo que apareceu com maior frequência durante a observação.
        </div>
        {renderEstagiosBotoes('frequente', frequente)}
      </div>

      {/* Jogo mais elaborado */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Jogo Simbólico mais Elaborado</div>
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '10px' }}>
          Tipo de jogo de maior complexidade que a criança conseguiu realizar (mesmo que poucas vezes).
        </div>
        {renderEstagiosBotoes('elaborado', elaborado)}
      </div>

      {/* Observações */}
      <div className="form-group">
        <label>Observações</label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Descrição da brincadeira observada, contexto, materiais utilizados..."
          value={observacoes}
          onChange={e => { setObservacoes(e.target.value); emitChange(frequente, elaborado, e.target.value) }}
        />
      </div>
    </div>
  )
}
