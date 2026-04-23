import { useState } from 'react'

// CARS — 15 domínios, escala 1-4
const CARS_DOMINIOS = [
  {
    id: 1, nome: 'Relação com Pessoas',
    desc: 'Como a criança se relaciona com pais, adultos e crianças',
    niveis: ['Sem dificuldade na interação', 'Leve — evita contato visual, timidez excessiva', 'Moderado — alheio às vezes, esforço necessário para obter atenção', 'Severo — constantemente alheio ao que os outros fazem'],
  },
  {
    id: 2, nome: 'Imitação',
    desc: 'Capacidade de imitar sons, palavras, movimentos',
    niveis: ['Imita adequadamente', 'Imita na maioria das vezes, com atraso ocasional', 'Imita apenas parte do tempo, requer ajuda', 'Raramente ou nunca imita sons ou movimentos'],
  },
  {
    id: 3, nome: 'Resposta Emocional',
    desc: 'Tipo e grau de resposta emocional',
    niveis: ['Respostas emocionais adequadas à situação', 'Ocasionalmente inadequadas em tipo ou intensidade', 'Sinais definidos de inadequação emocional', 'Respostas raramente adequadas à situação'],
  },
  {
    id: 4, nome: 'Uso do Corpo',
    desc: 'Coordenação e uso do corpo',
    niveis: ['Uso adequado e coordenado do corpo', 'Peculiaridades menores — movimentos repetitivos ocasionais', 'Movimentos repetitivos notáveis (flapping, girar, balançar)', 'Movimentos intensos e persistentes, difíceis de interromper'],
  },
  {
    id: 5, nome: 'Uso de Objetos',
    desc: 'Interesse e uso de brinquedos e objetos',
    niveis: ['Interesse e uso adequado de brinquedos', 'Interesse reduzido ou uso levemente inadequado', 'Pouco interesse ou uso claramente inadequado', 'Uso estereotipado, fixação em partes dos objetos'],
  },
  {
    id: 6, nome: 'Adaptação a Mudanças',
    desc: 'Dificuldade com mudanças de rotina ou ambiente',
    niveis: ['Aceita mudanças sem dificuldade', 'Alguma resistência a mudanças, pode ser redirecionado', 'Resistência ativa a mudanças, reações de estresse', 'Reações severas a mudanças, difíceis de acalmar'],
  },
  {
    id: 7, nome: 'Resposta Visual',
    desc: 'Padrão de uso da visão',
    niveis: ['Uso visual adequado', 'Precisa de lembretes ocasionais para olhar objetos', 'Olhar fixo no vazio, evita contato visual', 'Evitacão consistente do olhar ou fixação em estímulos incomuns'],
  },
  {
    id: 8, nome: 'Resposta Auditiva',
    desc: 'Resposta a estímulos sonoros',
    niveis: ['Reações auditivas adequadas para a idade', 'Leve hipersensibilidade ou falta de resposta', 'Respostas inconsistentes a sons, cobre ouvidos', 'Hiper ou hiposensibilidade auditiva marcante'],
  },
  {
    id: 9, nome: 'Resposta Sensorial (Tato, Paladar, Olfato)',
    desc: 'Exploração e respostas sensoriais',
    niveis: ['Respostas sensoriais adequadas', 'Leve tendência a explorar cheirando, tocando ou provando', 'Moderada preocupação com exploração sensorial', 'Comportamento sensorial intenso: leva tudo à boca, cheira, ignora dor'],
  },
  {
    id: 10, nome: 'Medo e Nervosismo',
    desc: 'Medos ou ansiedade',
    niveis: ['Medos adequados à idade e situação', 'Leve exagero ou redução de medos esperados', 'Medos em situações inofensivas ou falta de medo em situações perigosas', 'Medos intensos e/ou ausência total de medo funcional'],
  },
  {
    id: 11, nome: 'Comunicação Verbal',
    desc: 'Fala e linguagem verbal',
    niveis: ['Comunicação verbal adequada à idade', 'Leve atraso, maioria da fala com significado', 'Fala presente mas com ecolalia, inversão pronominal ou uso atípico', 'Ausência de fala funcional ou jargão sem significado'],
  },
  {
    id: 12, nome: 'Comunicação Não-Verbal',
    desc: 'Gestos, expressões corporais e faciais',
    niveis: ['Uso adequado de gestos e expressões', 'Uso imaturo — aponta vagamente ou não aponta', 'Dificuldade em expressar necessidades por gestos', 'Gestos e expressões faciais sem relação com a situação'],
  },
  {
    id: 13, nome: 'Nível de Atividade',
    desc: 'Quantidade de movimentação e energia',
    niveis: ['Nível de atividade adequado à situação', 'Levemente hiper ou hipoativo', 'Muito ativo/inquieto ou muito passivo/lento', 'Extremamente ativo ou extremamente passivo, difícil de manejar'],
  },
  {
    id: 14, nome: 'Nível e Consistência da Resposta Intelectual',
    desc: 'Funcionamento intelectual e variação entre áreas',
    niveis: ['Funciona de forma relativamente uniforme em todas as áreas', 'Leve variação entre áreas de funcionamento', 'Variação notável — algumas habilidades adequadas, outras deficientes', 'Grande discrepância — habilidades isoladas notáveis com áreas muito deficientes'],
  },
  {
    id: 15, nome: 'Impressão Geral',
    desc: 'Impressão clínica geral sobre o grau de autismo',
    niveis: ['Sem características de autismo', 'Leves características de autismo', 'Moderadas características de autismo', 'Severas características de autismo'],
  },
]

type CarsScore = 1 | 2 | 3 | 4 | 0

interface CarsFormProps {
  value: any
  onChange: (data: any) => void
}

export default function CarsForm({ value, onChange }: CarsFormProps) {
  const [scores, setScores] = useState<Record<number, CarsScore>>(value?.scores || {})
  const [observacoes, setObservacoes] = useState<string>(value?.observacoes || '')

  const handleScore = (domId: number, score: CarsScore) => {
    const novo = { ...scores, [domId]: scores[domId] === score ? 0 : score }
    setScores(novo)
    emitChange(novo, observacoes)
  }

  const calcTotal = (sc: Record<number, CarsScore>) => {
    let total = 0
    CARS_DOMINIOS.forEach(d => {
      total += (sc[d.id] || 0)
    })
    return total
  }

  const getClassificacao = (total: number) => {
    if (total < 15) return { label: 'Incompleto', cor: '#6B7280', bg: '#F3F4F6', desc: 'Responda todos os itens' }
    if (total <= 29) return { label: 'Sem Autismo', cor: '#059669', bg: '#D1FAE5', desc: 'Pontuação abaixo do ponto de corte para autismo' }
    if (total <= 36) return { label: 'Autismo Leve a Moderado', cor: '#D97706', bg: '#FEF3C7', desc: 'Características autísticas presentes em grau leve a moderado' }
    return { label: 'Autismo Severo', cor: '#DC2626', bg: '#FEE2E2', desc: 'Características autísticas pronunciadas, necessidade de suporte substancial' }
  }

  const emitChange = (sc: Record<number, CarsScore>, obs: string) => {
    const total = calcTotal(sc)
    const classif = getClassificacao(total)
    const avaliados = Object.values(sc).filter(s => s > 0).length
    // Criar scores por domínio em percentual (1=25%, 2=50%, 3=75%, 4=100%)
    const domScores: Record<string, number> = {}
    CARS_DOMINIOS.forEach(d => {
      domScores[d.nome] = ((sc[d.id] || 0) / 4) * 100
    })
    onChange({
      instrumento: 'CARS',
      scores: domScores,
      rawScores: sc,
      totalScore: total,
      totalAvaliados: avaliados,
      resultadoGeral: total <= 29 ? 'NORMAL' : total <= 36 ? 'LEVE_MODERADO' : 'SEVERO',
      classificacao: classif.label,
      observacoes: obs,
    })
  }

  const total = calcTotal(scores)
  const classif = getClassificacao(total)
  const avaliados = Object.values(scores).filter(s => s > 0).length

  const scoreCores = [
    { val: 1 as CarsScore, label: '1', bg: '#D1FAE5', color: '#065F46' },
    { val: 2 as CarsScore, label: '2', bg: '#DBEAFE', color: '#1D4ED8' },
    { val: 3 as CarsScore, label: '3', bg: '#FEF3C7', color: '#92400E' },
    { val: 4 as CarsScore, label: '4', bg: '#FEE2E2', color: '#991B1B' },
  ]

  return (
    <div>
      {/* Resultado */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Resultado CARS</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            padding: '16px 24px', borderRadius: '12px',
            background: classif.bg, textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: classif.cor }}>{total}</div>
            <div style={{ fontSize: '11px', color: classif.cor, fontWeight: 600 }}>de 60 pontos</div>
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
            <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
              {avaliados}/15 domínios avaliados
            </div>
          </div>
        </div>
        {/* Barra visual */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>
            <span>15 (s/ autismo)</span>
            <span>30 (leve-mod)</span>
            <span>37 (severo)</span>
            <span>60</span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', background: '#E5E7EB', overflow: 'hidden', position: 'relative' as const }}>
            <div style={{
              position: 'absolute' as const, left: '49.5%', top: 0, width: '2px', height: '100%', background: '#D97706', zIndex: 1,
            }} />
            <div style={{
              position: 'absolute' as const, left: '61.5%', top: 0, width: '2px', height: '100%', background: '#DC2626', zIndex: 1,
            }} />
            <div style={{
              width: `${Math.min((total / 60) * 100, 100)}%`,
              height: '100%', borderRadius: '4px',
              background: classif.cor,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      </div>

      {/* Escala */}
      <div className="form-card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px' }}>ESCALA POR DOMÍNIO</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {scoreCores.map(s => (
            <div key={s.val} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <span style={{
                width: '20px', height: '20px', borderRadius: '6px',
                background: s.bg, color: s.color, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px',
              }}>{s.val}</span>
              <span style={{ color: '#6B7280' }}>
                {s.val === 1 ? 'Normal' : s.val === 2 ? 'Leve' : s.val === 3 ? 'Moderado' : 'Severo'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Domínios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {CARS_DOMINIOS.map(dom => {
          const selected = scores[dom.id] || 0
          return (
            <div className="form-card" key={dom.id} style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: selected > 0 ? scoreCores[selected - 1].bg : '#F3F4F6',
                  color: selected > 0 ? scoreCores[selected - 1].color : '#9CA3AF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '14px', flexShrink: 0,
                }}>
                  {dom.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{dom.nome}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{dom.desc}</div>

                  {/* Opções de score */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                    {dom.niveis.map((nivel, idx) => {
                      const val = (idx + 1) as CarsScore
                      const sc = scoreCores[idx]
                      const isSelected = selected === val
                      return (
                        <button
                          key={val}
                          onClick={() => handleScore(dom.id, val)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 12px', borderRadius: '8px',
                            border: isSelected ? `2px solid ${sc.color}` : '1px solid #E5E7EB',
                            background: isSelected ? sc.bg : '#fff',
                            cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.15s',
                          }}
                        >
                          <span style={{
                            width: '22px', height: '22px', borderRadius: '6px',
                            background: isSelected ? sc.color : '#F3F4F6',
                            color: isSelected ? '#fff' : '#9CA3AF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '12px', flexShrink: 0,
                          }}>
                            {val}
                          </span>
                          <span style={{ fontSize: '12px', color: isSelected ? sc.color : '#6B7280' }}>
                            {nivel}
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
          placeholder="Observações sobre o comportamento da criança durante a avaliação CARS..."
          value={observacoes}
          onChange={e => { setObservacoes(e.target.value); emitChange(scores, e.target.value) }}
        />
      </div>
    </div>
  )
}
