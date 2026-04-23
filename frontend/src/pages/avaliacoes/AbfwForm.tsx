import { useState } from 'react'

// ABFW — Prova de Pragmática (Perfil Funcional da Comunicação)
const FUNCOES_COMUNICATIVAS = [
  { id: 'pedido_objeto', nome: 'Pedido de Objeto', desc: 'Solicita objetos concretos (brinquedos, alimentos)', categoria: 'Instrumental' },
  { id: 'pedido_acao', nome: 'Pedido de Ação', desc: 'Solicita que o outro realize uma ação', categoria: 'Instrumental' },
  { id: 'pedido_rotina', nome: 'Pedido de Rotina Social', desc: 'Solicita início/continuação de jogos e rotinas (ex: cadê-achou)', categoria: 'Instrumental' },
  { id: 'pedido_consentimento', nome: 'Pedido de Consentimento', desc: 'Pede permissão para realizar ação', categoria: 'Instrumental' },
  { id: 'pedido_informacao', nome: 'Pedido de Informação', desc: 'Faz perguntas buscando informação', categoria: 'Heurística' },
  { id: 'protesto', nome: 'Protesto/Recusa', desc: 'Recusa objetos, alimentos ou atividades', categoria: 'Regulatória' },
  { id: 'reconhecimento', nome: 'Reconhecimento do Outro', desc: 'Reconhece presença do interlocutor (olha, sorri)', categoria: 'Interacional' },
  { id: 'exibicao', nome: 'Exibição', desc: 'Busca atenção para si (olha pra mim!)', categoria: 'Pessoal' },
  { id: 'comentario', nome: 'Comentário', desc: 'Comenta sobre objetos, eventos ou ações', categoria: 'Informativa' },
  { id: 'nomeacao', nome: 'Nomeação', desc: 'Nomeia objetos, figuras ou pessoas', categoria: 'Informativa' },
  { id: 'narrativa', nome: 'Narrativa', desc: 'Relata fatos reais ou imaginários', categoria: 'Informativa' },
  { id: 'expressao_sentimento', nome: 'Expressão de Sentimento', desc: 'Expressa estados emocionais (feliz, triste, bravo)', categoria: 'Pessoal' },
  { id: 'jogo_compartilhado', nome: 'Jogo Compartilhado', desc: 'Participa de atividades lúdicas com o outro', categoria: 'Interacional' },
  { id: 'nao_focalizada', nome: 'Não Focalizada', desc: 'Ato comunicativo sem interlocutor definido (fala para si)', categoria: 'Pessoal' },
  { id: 'reativa', nome: 'Reativa', desc: 'Responde a atos do interlocutor (resposta a perguntas, ecolalia)', categoria: 'Regulatória' },
]

const MEIOS_COMUNICACAO = [
  { id: 'verbal', nome: 'Verbal', desc: 'Uso de palavras e frases', emoji: '🗣️' },
  { id: 'vocal', nome: 'Vocal', desc: 'Vocalizações sem palavra (sons, gritos, riso)', emoji: '🔊' },
  { id: 'gestual', nome: 'Gestual', desc: 'Gestos, expressões faciais, contato visual', emoji: '👋' },
]

type Frequencia = 0 | 1 | 2 | 3 | 4
type MeioUso = 'nao' | 'pouco' | 'muito'

const FREQ_LABELS: Record<Frequencia, { label: string; bg: string; color: string }> = {
  0: { label: 'Ausente', bg: '#F3F4F6', color: '#6B7280' },
  1: { label: 'Raro', bg: '#FEE2E2', color: '#991B1B' },
  2: { label: 'Pouco', bg: '#FEF3C7', color: '#92400E' },
  3: { label: 'Frequente', bg: '#DBEAFE', color: '#1D4ED8' },
  4: { label: 'Muito Freq.', bg: '#D1FAE5', color: '#065F46' },
}

interface AbfwFormProps {
  value: any
  onChange: (data: any) => void
}

export default function AbfwForm({ value, onChange }: AbfwFormProps) {
  const [frequencias, setFrequencias] = useState<Record<string, Frequencia>>(value?.frequencias || {})
  const [meios, setMeios] = useState<Record<string, MeioUso>>(value?.meios || {})
  const [totalAtos, setTotalAtos] = useState<string>(value?.totalAtos || '')
  const [tempoAmostra, setTempoAmostra] = useState<string>(value?.tempoAmostra || '30')
  const [observacoes, setObservacoes] = useState<string>(value?.observacoes || '')

  const handleFreq = (funcId: string, freq: Frequencia) => {
    const novo = { ...frequencias, [funcId]: frequencias[funcId] === freq ? 0 as Frequencia : freq }
    setFrequencias(novo)
    emitChange(novo, meios, totalAtos, tempoAmostra, observacoes)
  }

  const handleMeio = (meioId: string, uso: MeioUso) => {
    const novo = { ...meios, [meioId]: meios[meioId] === uso ? 'nao' : uso }
    setMeios(novo)
    emitChange(frequencias, novo, totalAtos, tempoAmostra, observacoes)
  }

  const calcCategoriaScore = (cat: string) => {
    const funcs = FUNCOES_COMUNICATIVAS.filter(f => f.categoria === cat)
    if (funcs.length === 0) return 0
    let total = 0
    funcs.forEach(f => {
      total += (frequencias[f.id] || 0)
    })
    return Math.round((total / (funcs.length * 4)) * 100)
  }

  const emitChange = (freqs: Record<string, Frequencia>, ms: Record<string, MeioUso>, ta: string, tempo: string, obs: string) => {
    const categorias = ['Instrumental', 'Regulatória', 'Interacional', 'Pessoal', 'Heurística', 'Informativa']
    const scores: Record<string, number> = {}
    categorias.forEach(c => {
      const funcs = FUNCOES_COMUNICATIVAS.filter(f => f.categoria === c)
      if (funcs.length === 0) return
      let t = 0
      funcs.forEach(f => { t += (freqs[f.id] || 0) })
      scores[c] = Math.round((t / (funcs.length * 4)) * 100)
    })

    onChange({
      instrumento: 'ABFW',
      frequencias: freqs,
      meios: ms,
      totalAtos: ta,
      tempoAmostra: tempo,
      scores,
      observacoes: obs,
    })
  }

  const categorias = ['Instrumental', 'Regulatória', 'Interacional', 'Pessoal', 'Heurística', 'Informativa']

  return (
    <div>
      {/* Resumo por categoria */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Perfil Funcional da Comunicação</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          {categorias.map(cat => {
            const p = calcCategoriaScore(cat)
            const cor = p >= 70 ? '#059669' : p >= 40 ? '#D97706' : p > 0 ? '#DC2626' : '#9CA3AF'
            return (
              <div key={cat} style={{
                padding: '12px', borderRadius: '10px',
                border: '1px solid #E5E7EB', textAlign: 'center',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: cor }}>{p}%</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', marginTop: '2px' }}>{cat}</div>
                <div style={{
                  height: '4px', borderRadius: '2px', background: '#E5E7EB', marginTop: '8px',
                  overflow: 'hidden',
                }}>
                  <div style={{ width: `${p}%`, height: '100%', background: cor, borderRadius: '2px', transition: 'width 0.3s' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dados da amostra */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Dados da Amostra</div>
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label>Tempo da Amostra (minutos)</label>
            <input type="number" className="form-control" min="1" max="60"
              value={tempoAmostra}
              onChange={e => { setTempoAmostra(e.target.value); emitChange(frequencias, meios, totalAtos, e.target.value, observacoes) }}
            />
          </div>
          <div className="form-group">
            <label>Total de Atos Comunicativos Observados</label>
            <input type="number" className="form-control" min="0"
              value={totalAtos}
              onChange={e => { setTotalAtos(e.target.value); emitChange(frequencias, meios, e.target.value, tempoAmostra, observacoes) }}
            />
          </div>
        </div>
      </div>

      {/* Meios de comunicação */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Meios de Comunicação Predominantes</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {MEIOS_COMUNICACAO.map(meio => {
            const uso = meios[meio.id] || 'nao'
            return (
              <div key={meio.id} style={{
                flex: '1 1 200px', padding: '14px', borderRadius: '10px',
                border: '1px solid #E5E7EB', background: '#fff',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{meio.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{meio.nome}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{meio.desc}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['nao', 'pouco', 'muito'] as MeioUso[]).map(u => {
                    const labels: Record<MeioUso, { l: string; bg: string; c: string }> = {
                      nao: { l: 'Não usa', bg: '#FEE2E2', c: '#991B1B' },
                      pouco: { l: 'Pouco', bg: '#FEF3C7', c: '#92400E' },
                      muito: { l: 'Predominante', bg: '#D1FAE5', c: '#065F46' },
                    }
                    const lb = labels[u]
                    return (
                      <button
                        key={u}
                        onClick={() => handleMeio(meio.id, u)}
                        style={{
                          flex: 1, padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                          border: uso === u ? `2px solid ${lb.c}` : '1px solid #D1D5DB',
                          background: uso === u ? lb.bg : '#fff', color: uso === u ? lb.c : '#9CA3AF',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >{lb.l}</button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Escala */}
      <div className="form-card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>FREQUÊNCIA DAS FUNÇÕES COMUNICATIVAS</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {([0, 1, 2, 3, 4] as Frequencia[]).map(f => (
            <div key={f} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '6px',
              background: FREQ_LABELS[f].bg, fontSize: '11px',
            }}>
              <span style={{ fontWeight: 700, color: FREQ_LABELS[f].color }}>{f}</span>
              <span style={{ color: FREQ_LABELS[f].color }}>{FREQ_LABELS[f].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Funções comunicativas agrupadas por categoria */}
      {categorias.map(cat => {
        const funcs = FUNCOES_COMUNICATIVAS.filter(f => f.categoria === cat)
        if (funcs.length === 0) return null
        return (
          <div className="form-card" key={cat} style={{ marginBottom: '12px' }}>
            <div className="form-section-title">
              <div className="section-icon" />
              {cat}
              <span style={{
                marginLeft: '12px', fontSize: '12px', fontWeight: 700,
                color: calcCategoriaScore(cat) >= 70 ? '#059669'
                  : calcCategoriaScore(cat) >= 40 ? '#D97706' : '#9CA3AF',
              }}>
                {calcCategoriaScore(cat)}%
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {funcs.map(func => {
                const current = frequencias[func.id] || 0
                return (
                  <div
                    key={func.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      background: current > 0 ? FREQ_LABELS[current as Frequencia].bg + '30' : '#FAFAFA',
                      gap: '12px', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                        {func.nome}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>
                        {func.desc}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      {([0, 1, 2, 3, 4] as Frequencia[]).map(f => (
                        <button
                          key={f}
                          onClick={() => handleFreq(func.id, f)}
                          style={{
                            width: '30px', height: '30px', borderRadius: '6px',
                            border: current === f && f > 0 ? `2px solid ${FREQ_LABELS[f].color}` : '1px solid #D1D5DB',
                            background: current === f && f > 0 ? FREQ_LABELS[f].bg : '#fff',
                            color: current === f && f > 0 ? FREQ_LABELS[f].color : '#9CA3AF',
                            fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                        >{f}</button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Observações */}
      <div className="form-group" style={{ marginTop: '16px' }}>
        <label>Observações</label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Observações sobre o perfil comunicativo, contexto da amostra, interação..."
          value={observacoes}
          onChange={e => { setObservacoes(e.target.value); emitChange(frequencias, meios, totalAtos, tempoAmostra, e.target.value) }}
        />
      </div>
    </div>
  )
}
