import { useState } from 'react'

const DENVER_ITENS: Record<string, { item: string; faixa: string }[]> = {
  'Pessoal-Social': [
    { item: 'Olha para o rosto do examinador', faixa: '0-3m' },
    { item: 'Sorri espontaneamente', faixa: '1-5m' },
    { item: 'Alimenta-se com biscoito sozinho', faixa: '4-9m' },
    { item: 'Bebe no copo', faixa: '9-17m' },
    { item: 'Imita atividades domésticas', faixa: '12-21m' },
    { item: 'Ajuda em tarefas simples de casa', faixa: '15-24m' },
    { item: 'Veste-se com supervisão', faixa: '24-42m' },
    { item: 'Escova dentes com ajuda', faixa: '18-36m' },
    { item: 'Lava e seca as mãos', faixa: '24-48m' },
    { item: 'Veste-se sem ajuda', faixa: '36-60m' },
  ],
  'Motor Fino-Adaptativo': [
    { item: 'Segue objeto até linha média', faixa: '0-3m' },
    { item: 'Agarra chocalho', faixa: '2-5m' },
    { item: 'Transfere objetos entre mãos', faixa: '4-8m' },
    { item: 'Faz pinça polegar-indicador', faixa: '7-14m' },
    { item: 'Faz torre de 2 cubos', faixa: '12-21m' },
    { item: 'Faz torre de 4 cubos', faixa: '15-24m' },
    { item: 'Imita linha vertical', faixa: '18-36m' },
    { item: 'Faz torre de 8 cubos', faixa: '24-42m' },
    { item: 'Copia círculo', faixa: '30-48m' },
    { item: 'Desenha pessoa com 3+ partes', faixa: '42-72m' },
  ],
  'Linguagem': [
    { item: 'Reage a sons (vira cabeça, para)', faixa: '0-3m' },
    { item: 'Vocaliza sem chorar (sons guturais)', faixa: '1-5m' },
    { item: 'Balbucia (ma-ma, pa-pa inespecífico)', faixa: '4-10m' },
    { item: 'Diz "papa/mama" específico', faixa: '8-16m' },
    { item: 'Usa 3+ palavras além de mama/papa', faixa: '12-24m' },
    { item: 'Combina 2 palavras', faixa: '15-30m' },
    { item: 'Nomeia 1+ figuras', faixa: '18-30m' },
    { item: 'Fala inteligível (75%)', faixa: '24-48m' },
    { item: 'Compreende 4+ preposições', faixa: '30-54m' },
    { item: 'Define 5+ palavras', faixa: '48-72m' },
  ],
  'Motor Grosso': [
    { item: 'Levanta a cabeça em prono (45°)', faixa: '0-4m' },
    { item: 'Senta cabeça firme', faixa: '1-5m' },
    { item: 'Senta sem apoio', faixa: '4-9m' },
    { item: 'Puxa-se para ficar em pé', faixa: '6-12m' },
    { item: 'Anda bem, raramente cai', faixa: '11-17m' },
    { item: 'Chuta bola para frente', faixa: '14-24m' },
    { item: 'Pula no lugar com 2 pés', faixa: '18-36m' },
    { item: 'Equilibra-se em 1 pé (2s)', faixa: '24-48m' },
    { item: 'Pula em 1 pé', faixa: '36-60m' },
    { item: 'Anda calcanhar-dedo (pé ante pé)', faixa: '36-72m' },
  ],
}

type DenverStatus = 'passou' | 'falhou' | 'recusa' | 'na' | ''

interface DenverFormProps {
  value: any
  onChange: (data: any) => void
}

export default function DenverForm({ value, onChange }: DenverFormProps) {
  const [itensStatus, setItensStatus] = useState<Record<string, Record<string, DenverStatus>>>(value?.itensStatus || {})
  const [resultadoGeral, setResultadoGeral] = useState<string>(value?.resultadoGeral || '')
  const [observacoes, setObservacoes] = useState<string>(value?.observacoes || '')
  const [domAtivo, setDomAtivo] = useState<string>('Pessoal-Social')

  const dominios = Object.keys(DENVER_ITENS)

  const handleStatusChange = (dominio: string, index: number, status: DenverStatus) => {
    const novo = { ...itensStatus }
    if (!novo[dominio]) novo[dominio] = {}
    const atual = novo[dominio][String(index)]
    novo[dominio][String(index)] = atual === status ? '' : status
    setItensStatus(novo)
    emitChange(novo, resultadoGeral, observacoes)
  }

  const getStatus = (dominio: string, index: number): DenverStatus => {
    return (itensStatus[dominio]?.[String(index)] as DenverStatus) || ''
  }

  const calcStats = (dominio: string) => {
    const itens = DENVER_ITENS[dominio] || []
    let passou = 0, falhou = 0, avaliados = 0
    itens.forEach((_, i) => {
      const s = itensStatus[dominio]?.[String(i)]
      if (s === 'passou') { passou++; avaliados++ }
      else if (s === 'falhou') { falhou++; avaliados++ }
      else if (s === 'recusa') { avaliados++ }
    })
    const percentual = avaliados > 0 ? Math.round((passou / avaliados) * 100) : 0
    return { passou, falhou, avaliados, total: itens.length, percentual }
  }

  const emitChange = (is: any, rg: string, obs: string) => {
    const scores: Record<string, number> = {}
    dominios.forEach(d => {
      scores[d] = calcStats(d).percentual
    })
    onChange({
      instrumento: 'DENVER_II',
      itensStatus: is,
      resultadoGeral: rg,
      scores,
      observacoes: obs,
    })
  }

  const handleResultado = (r: string) => {
    setResultadoGeral(r)
    emitChange(itensStatus, r, observacoes)
  }

  const statusBtns: { key: DenverStatus; label: string; emoji: string; bg: string; color: string }[] = [
    { key: 'passou', label: 'Passou', emoji: '✅', bg: '#D1FAE5', color: '#065F46' },
    { key: 'falhou', label: 'Falhou', emoji: '❌', bg: '#FEE2E2', color: '#991B1B' },
    { key: 'recusa', label: 'Recusa', emoji: '🚫', bg: '#FEF3C7', color: '#92400E' },
    { key: 'na', label: 'N/A', emoji: '➖', bg: '#F3F4F6', color: '#6B7280' },
  ]

  const resultadoOpcoes = [
    { key: 'NORMAL', label: 'Normal', bg: '#D1FAE5', color: '#065F46', desc: 'Sem atrasos identificados' },
    { key: 'SUSPEITO', label: 'Suspeito', bg: '#FEF3C7', color: '#92400E', desc: 'Possíveis atrasos — necessita acompanhamento' },
    { key: 'NAO_TESTAVEL', label: 'Não testável', bg: '#F3F4F6', color: '#6B7280', desc: 'Não foi possível completar a avaliação' },
  ]

  return (
    <div>
      {/* Resumo por domínio */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Resumo por Domínio</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {dominios.map(d => {
            const st = calcStats(d)
            const cor = st.percentual >= 70 ? '#059669' : st.percentual >= 40 ? '#D97706' : '#DC2626'
            return (
              <div
                key={d}
                onClick={() => setDomAtivo(d)}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: domAtivo === d ? '2px solid var(--odapp-blue)' : '1px solid #E5E7EB',
                  cursor: 'pointer',
                  background: domAtivo === d ? '#F0FDFA' : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{d}</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: cor }}>{st.percentual}%</div>
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                  {st.avaliados}/{st.total} avaliados · {st.passou} passou
                </div>
                <div style={{
                  height: '4px', borderRadius: '2px', background: '#E5E7EB', marginTop: '8px',
                  overflow: 'hidden',
                }}>
                  <div style={{ width: `${st.percentual}%`, height: '100%', background: cor, borderRadius: '2px', transition: 'width 0.3s' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Abas de domínio */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex', gap: '0', borderBottom: '2px solid #E5E7EB', marginBottom: '16px',
          overflowX: 'auto',
        }}>
          {dominios.map(d => (
            <button
              key={d}
              onClick={() => setDomAtivo(d)}
              style={{
                padding: '10px 16px',
                fontWeight: 600,
                fontSize: '13px',
                color: domAtivo === d ? 'var(--odapp-blue)' : '#9CA3AF',
                background: 'none',
                border: 'none',
                borderBottom: '2px solid',
                borderBottomColor: domAtivo === d ? 'var(--odapp-blue)' : 'transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Legenda */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {statusBtns.map(s => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.bg, border: `2px solid ${s.color}`, display: 'inline-block' }} />
              <span style={{ color: '#6B7280' }}>{s.emoji} {s.label}</span>
            </div>
          ))}
        </div>

        {/* Itens */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(DENVER_ITENS[domAtivo] || []).map((item, idx) => {
            const status = getStatus(domAtivo, idx)
            const activeSt = statusBtns.find(s => s.key === status)
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
                  background: activeSt ? activeSt.bg + '40' : '#FAFAFA',
                  gap: '12px',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
                    {item.item}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                    Faixa esperada: {item.faixa}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {statusBtns.map(s => (
                    <button
                      key={s.key}
                      onClick={() => handleStatusChange(domAtivo, idx, s.key)}
                      title={s.label}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: status === s.key ? `2px solid ${s.color}` : '1px solid #D1D5DB',
                        background: status === s.key ? s.bg : '#fff',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {s.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Resultado Geral */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Resultado Geral da Triagem</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {resultadoOpcoes.map(r => (
            <button
              key={r.key}
              onClick={() => handleResultado(r.key)}
              style={{
                flex: '1 1 200px',
                padding: '16px',
                borderRadius: '10px',
                border: resultadoGeral === r.key ? `2px solid ${r.color}` : '1px solid #E5E7EB',
                background: resultadoGeral === r.key ? r.bg : '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '14px', color: r.color }}>{r.label}</div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{r.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Observações */}
      <div className="form-group">
        <label>Observações Gerais</label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Observações sobre o desempenho na triagem Denver II..."
          value={observacoes}
          onChange={e => { setObservacoes(e.target.value); emitChange(itensStatus, resultadoGeral, e.target.value) }}
        />
      </div>
    </div>
  )
}
