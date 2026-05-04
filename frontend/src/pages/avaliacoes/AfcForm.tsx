import { useState } from 'react'

// AFC — Yavas, Hernandorena, Lamprecht (1991). Cálculo do PCC + processos fonológicos.
const PROCESSOS = [
  { key: 'simpl_encontro', nome: 'Simplificação de encontro consonantal', exemplo: 'pato → "pato" / prato → "pato"' },
  { key: 'apagamento_silaba', nome: 'Apagamento de sílaba átona', exemplo: 'sapato → "pato"' },
  { key: 'apagamento_final', nome: 'Apagamento de consoante final', exemplo: 'flor → "fló"' },
  { key: 'posteriorizacao', nome: 'Posteriorização', exemplo: 't/d → k/g (tudo → "kudo")' },
  { key: 'anteriorizacao', nome: 'Anteriorização', exemplo: 'k/g → t/d (gato → "dato")' },
  { key: 'fricatizacao', nome: 'Fricatização', exemplo: 'oclusivo → fricativo (pé → "fé")' },
  { key: 'plosivizacao', nome: 'Plosivização', exemplo: 'fricativo → oclusivo (faca → "paca")' },
  { key: 'vocalizacao', nome: 'Vocalização (semivocalização) de líquida', exemplo: 'mala → "maua"' },
  { key: 'sonorizacao', nome: 'Sonorização', exemplo: 'p → b, t → d (pato → "bato")' },
  { key: 'dessonorizacao', nome: 'Dessonorização', exemplo: 'b → p, d → t (boi → "pói")' },
  { key: 'nasalizacao', nome: 'Nasalização', exemplo: 'p → m, t → n' },
  { key: 'desnasalizacao', nome: 'Desnasalização', exemplo: 'm → b, n → d (mãe → "bãe")' },
]

interface AfcFormProps {
  value: any
  onChange: (data: any) => void
}

export default function AfcForm({ value, onChange }: AfcFormProps) {
  const [totalConsoantes, setTotalConsoantes] = useState<string>(value?.totalConsoantes?.toString() || '')
  const [consoantesCorretas, setConsoantesCorretas] = useState<string>(value?.consoantesCorretas?.toString() || '')
  const [processos, setProcessos] = useState<string[]>(value?.processos || [])
  const [observacoes, setObservacoes] = useState<string>(value?.observacoes || '')

  const totalNum = parseInt(totalConsoantes) || 0
  const corretasNum = parseInt(consoantesCorretas) || 0
  const pcc = totalNum > 0 ? (corretasNum / totalNum) * 100 : 0
  const pccArred = Math.round(pcc * 10) / 10

  const handleNum = (campo: 'total' | 'corretas', val: string) => {
    const limpo = val.replace(/\D/g, '')
    if (campo === 'total') {
      setTotalConsoantes(limpo)
      emitChange(parseInt(limpo) || 0, corretasNum, processos, observacoes)
    } else {
      const max = parseInt(totalConsoantes) || 0
      const novo = Math.min(parseInt(limpo) || 0, max)
      setConsoantesCorretas(novo.toString())
      emitChange(totalNum, novo, processos, observacoes)
    }
  }

  const toggleProcesso = (key: string) => {
    const novo = processos.includes(key)
      ? processos.filter(p => p !== key)
      : [...processos, key]
    setProcessos(novo)
    emitChange(totalNum, corretasNum, novo, observacoes)
  }

  const getClassificacao = (pccVal: number, total: number): { resultado: string; label: string; cor: string; bg: string; desc: string } => {
    if (total === 0) return { resultado: 'INCOMPLETO', label: 'Incompleto', cor: '#6B7280', bg: '#F3F4F6', desc: 'Informe o total de consoantes' }
    if (pccVal > 85) return { resultado: 'LEVE', label: 'Desvio Leve', cor: '#059669', bg: '#D1FAE5', desc: 'PCC > 85% — desvio fonológico leve' }
    if (pccVal >= 65) return { resultado: 'MEDIO_MODERADO', label: 'Desvio Médio-Moderado', cor: '#1D4ED8', bg: '#DBEAFE', desc: 'PCC entre 65–85%' }
    if (pccVal >= 50) return { resultado: 'MODERADO_GRAVE', label: 'Desvio Moderado-Grave', cor: '#D97706', bg: '#FEF3C7', desc: 'PCC entre 50–65%' }
    return { resultado: 'GRAVE', label: 'Desvio Grave', cor: '#DC2626', bg: '#FEE2E2', desc: 'PCC < 50% — desvio fonológico grave' }
  }

  const emitChange = (total: number, corretas: number, procs: string[], obs: string) => {
    const pccCalc = total > 0 ? (corretas / total) * 100 : 0
    const pccR = Math.round(pccCalc * 10) / 10
    const classif = getClassificacao(pccCalc, total)

    onChange({
      instrumento: 'AFC',
      totalConsoantes: total,
      consoantesCorretas: corretas,
      pcc: pccR,
      processos: procs,
      processosLabels: procs.map(k => PROCESSOS.find(p => p.key === k)?.nome).filter(Boolean),
      scores: { 'PCC': Math.round(pccR) },
      resultadoGeral: classif.resultado,
      classificacao: classif.label,
      observacoes: obs,
    })
  }

  const classif = getClassificacao(pcc, totalNum)

  return (
    <div>
      {/* Resultado */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Cálculo do PCC</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            padding: '16px 24px', borderRadius: '12px',
            background: classif.bg, textAlign: 'center', flex: '0 0 auto',
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: classif.cor }}>{pccArred}%</div>
            <div style={{ fontSize: '11px', color: classif.cor, fontWeight: 600 }}>PCC</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '16px', fontWeight: 700, color: classif.cor,
              padding: '8px 16px', borderRadius: '8px', background: classif.bg,
              marginBottom: '8px',
            }}>
              {classif.label}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>{classif.desc}</div>
            {totalNum > 0 && (
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                {corretasNum} consoantes corretas de {totalNum} produzidas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inputs PCC */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Dados da Análise</div>
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label>Total de Consoantes Produzidas *</label>
            <input
              type="text"
              inputMode="numeric"
              className="form-control"
              placeholder="Ex: 80"
              value={totalConsoantes}
              onChange={e => handleNum('total', e.target.value)}
            />
            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
              Total de consoantes-alvo nas palavras analisadas
            </div>
          </div>
          <div className="form-group">
            <label>Consoantes Produzidas Corretamente *</label>
            <input
              type="text"
              inputMode="numeric"
              className="form-control"
              placeholder="Ex: 65"
              value={consoantesCorretas}
              onChange={e => handleNum('corretas', e.target.value)}
            />
            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
              Consoantes-alvo realizadas conforme o sistema-alvo
            </div>
          </div>
        </div>
        <div style={{
          marginTop: '12px', padding: '10px 14px',
          background: '#F9FAFB', borderRadius: '8px',
          fontSize: '12px', color: '#6B7280',
        }}>
          <strong>Fórmula:</strong> PCC = (Consoantes Corretas ÷ Total de Consoantes) × 100
        </div>
      </div>

      {/* Tabela de classificação */}
      <div className="form-card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>FAIXAS DE CLASSIFICAÇÃO (Shriberg & Kwiatkowski, 1982)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '6px', fontSize: '11px' }}>
          <div style={{ padding: '6px 10px', background: '#D1FAE5', borderRadius: '6px', color: '#065F46' }}>
            <strong>&gt; 85%</strong> Leve
          </div>
          <div style={{ padding: '6px 10px', background: '#DBEAFE', borderRadius: '6px', color: '#1D4ED8' }}>
            <strong>65–85%</strong> Médio-Moderado
          </div>
          <div style={{ padding: '6px 10px', background: '#FEF3C7', borderRadius: '6px', color: '#92400E' }}>
            <strong>50–65%</strong> Moderado-Grave
          </div>
          <div style={{ padding: '6px 10px', background: '#FEE2E2', borderRadius: '6px', color: '#991B1B' }}>
            <strong>&lt; 50%</strong> Grave
          </div>
        </div>
      </div>

      {/* Processos fonológicos */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Processos Fonológicos Observados</div>
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '10px' }}>
          Marque todos os processos fonológicos identificados na análise:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '6px' }}>
          {PROCESSOS.map(p => {
            const isSel = processos.includes(p.key)
            return (
              <button
                key={p.key}
                onClick={() => toggleProcesso(p.key)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px',
                  border: isSel ? '2px solid #5B21B6' : '1px solid #E5E7EB',
                  background: isSel ? '#EDE9FE' : '#fff',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '4px',
                  border: '2px solid ' + (isSel ? '#5B21B6' : '#D1D5DB'),
                  background: isSel ? '#5B21B6' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {isSel && <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: isSel ? '#5B21B6' : '#374151' }}>
                    {p.nome}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                    {p.exemplo}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Observações */}
      <div className="form-group">
        <label>Observações</label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Padrões fonológicos predominantes, contexto da coleta, materiais utilizados..."
          value={observacoes}
          onChange={e => { setObservacoes(e.target.value); emitChange(totalNum, corretasNum, processos, e.target.value) }}
        />
      </div>
    </div>
  )
}
