import { useState } from 'react'

// Itens representativos por faixa etária e domínio
const PORTAGE_ITENS: Record<string, Record<string, string[]>> = {
  '0-1': {
    'Socialização': [
      'Sorri em resposta ao adulto',
      'Olha para quem fala com ele/ela',
      'Estende os braços para ser pego',
      'Brinca de esconder e achar (cadê/achou)',
      'Aceita presença de estranhos quando acompanhado',
    ],
    'Cognição': [
      'Acompanha objetos com os olhos (tracking visual)',
      'Busca objeto parcialmente escondido',
      'Tira objeto de dentro de recipiente',
      'Coloca objeto dentro de recipiente',
      'Imita ações simples com objetos (bater palma)',
    ],
    'Linguagem': [
      'Vocaliza em resposta a estímulos sonoros',
      'Balbucia sílabas repetidas (ma-ma, pa-pa)',
      'Responde ao próprio nome virando a cabeça',
      'Compreende o significado de "não"',
      'Imita sons produzidos pelo adulto',
    ],
    'Autocuidado': [
      'Suga e engole líquidos adequadamente',
      'Leva alimento à boca com a mão',
      'Segura mamadeira ou copo com ajuda',
      'Aceita alimento pastoso com colher',
      'Coopera ao ser vestido (estende braços/pernas)',
    ],
    'Motor': [
      'Sustenta a cabeça quando em posição prona',
      'Senta com apoio e depois sem apoio',
      'Rola de prono para supino e vice-versa',
      'Engatinha em superfície plana',
      'Fica em pé com apoio em móveis',
    ],
  },
  '1-2': {
    'Socialização': [
      'Brinca ao lado de outras crianças (paralelo)',
      'Abraça ou beija adultos familiares',
      'Imita ações domésticas simples (varrer, limpar)',
      'Entrega objetos ao adulto quando solicitado',
      'Demonstra preferência por brinquedos específicos',
    ],
    'Cognição': [
      'Empilha 2 a 3 blocos',
      'Encaixa formas simples em prancha',
      'Combina/pareia objetos iguais',
      'Aponta partes do corpo quando nomeadas',
      'Vira páginas de livro (várias por vez)',
    ],
    'Linguagem': [
      'Usa 5 a 10 palavras com significado',
      'Aponta para objetos desejados',
      'Compreende comandos simples de uma etapa',
      'Nomeia objetos familiares sob solicitação',
      'Usa gestos para comunicar necessidades',
    ],
    'Autocuidado': [
      'Bebe em copo com pouco derramamento',
      'Come com colher (ainda com derramamento)',
      'Tira meias ou sapatos sozinho/a',
      'Indica quando fralda está suja/molhada',
      'Coopera durante o banho (estende mãos)',
    ],
    'Motor': [
      'Anda de forma independente',
      'Agacha e levanta sem apoio',
      'Sobe escadas com ajuda (mão ou corrimão)',
      'Chuta bola para frente',
      'Empurra e puxa brinquedos andando',
    ],
  },
  '2-3': {
    'Socialização': [
      'Participa de brincadeiras simples com pares',
      'Demonstra empatia (consola quem chora)',
      'Espera a vez em atividades simples com ajuda',
      'Diz "por favor" e "obrigado" com lembrança',
      'Identifica-se pelo primeiro nome',
    ],
    'Cognição': [
      'Empilha 6 ou mais blocos',
      'Classifica objetos por forma ou cor',
      'Compreende conceitos de tamanho (grande/pequeno)',
      'Completa quebra-cabeça de 3-4 peças',
      'Associa objetos por função (colher-prato)',
    ],
    'Linguagem': [
      'Combina 2 palavras em frases (quero água)',
      'Usa pronome "eu" ou próprio nome',
      'Nomeia figuras familiares em livros',
      'Responde perguntas simples de sim/não',
      'Vocabulário de 50+ palavras',
    ],
    'Autocuidado': [
      'Come com garfo além de colher',
      'Tira roupas simples (camiseta, calça elástico)',
      'Usa vaso sanitário com ajuda e aviso',
      'Lava mãos com ajuda',
      'Escova dentes com supervisão',
    ],
    'Motor': [
      'Corre sem cair frequentemente',
      'Sobe e desce escadas alternando pés com apoio',
      'Pula com os dois pés no mesmo lugar',
      'Pedala triciclo',
      'Desenha linhas verticais/horizontais imitando',
    ],
  },
  '3-4': {
    'Socialização': [
      'Brinca cooperativamente com outras crianças',
      'Compartilha brinquedos quando solicitado',
      'Segue regras simples em jogos de grupo',
      'Expressa emoções com palavras (feliz, triste)',
      'Relata experiências simples do dia a dia',
    ],
    'Cognição': [
      'Conta até 5 objetos com correspondência',
      'Nomeia 4+ cores corretamente',
      'Classifica por dois atributos (cor E forma)',
      'Compreende conceitos de tempo (ontem/hoje/amanhã)',
      'Reconta história simples com sequência',
    ],
    'Linguagem': [
      'Usa frases de 3-4 palavras',
      'Faz perguntas usando "por quê?" e "como?"',
      'Relata eventos recentes com detalhes',
      'Compreende instruções de duas etapas',
      'Usa plural e tempos verbais básicos',
    ],
    'Autocuidado': [
      'Veste-se sozinho com supervisão mínima',
      'Abotoa e desabotoa botões grandes',
      'Usa vaso sanitário de forma independente',
      'Serve-se de alimentos com supervisão',
      'Limpa o nariz quando lembrado',
    ],
    'Motor': [
      'Equilibra-se em um pé por 3+ segundos',
      'Sobe escadas alternando pés sem apoio',
      'Pega bola grande com as duas mãos',
      'Corta papel com tesoura (sem precisão)',
      'Copia formas geométricas simples (círculo)',
    ],
  },
  '4-5': {
    'Socialização': [
      'Escolhe seus próprios amigos para brincar',
      'Participa de jogos com regras simples',
      'Demonstra senso de humor',
      'Pede permissão para usar objetos de outros',
      'Coopera com adultos em tarefas domésticas',
    ],
    'Cognição': [
      'Conta até 10+ objetos',
      'Identifica letras do próprio nome',
      'Compara quantidades (mais/menos/igual)',
      'Sequencia 3+ imagens em ordem lógica',
      'Resolve problemas práticos simples',
    ],
    'Linguagem': [
      'Usa frases complexas de 5+ palavras',
      'Define palavras simples pela função',
      'Conta histórias com começo, meio e fim',
      'Compreende instruções de 3 etapas',
      'Usa conectivos (porque, então, mas)',
    ],
    'Autocuidado': [
      'Veste-se completamente sozinho',
      'Amarra sapatos com laço (com dificuldade)',
      'Toma banho com supervisão mínima',
      'Escolhe roupas adequadas ao clima',
      'Serve-se de bebidas sem derramar',
    ],
    'Motor': [
      'Pula em um pé só (4-5 vezes)',
      'Anda em linha reta (pé ante pé)',
      'Recorta formas simples com tesoura',
      'Copia formas (quadrado, triângulo)',
      'Desenha pessoa com 3+ partes do corpo',
    ],
  },
  '5-6': {
    'Socialização': [
      'Participa de atividades em grupo organizadas',
      'Compreende e respeita regras sociais básicas',
      'Expressa preferências e opiniões',
      'Resolve conflitos simples com pares com ajuda verbal',
      'Demonstra interesse em aprender coisas novas',
    ],
    'Cognição': [
      'Conta até 20+ e reconhece numerais',
      'Identifica/escreve letras do alfabeto',
      'Compreende conceitos de ontem/hoje/amanhã',
      'Realiza operações simples de adição (1+1)',
      'Categoriza objetos em 3+ grupos',
    ],
    'Linguagem': [
      'Usa linguagem adequada ao contexto social',
      'Reconta história mantendo sequência lógica',
      'Compreende ironia e figuras de linguagem simples',
      'Vocabulário expressivo amplo (2000+ palavras)',
      'Mantém tópico em conversa por vários turnos',
    ],
    'Autocuidado': [
      'Cuida da higiene pessoal de forma independente',
      'Prepara lanches simples (cereal com leite)',
      'Organiza materiais/brinquedos após uso',
      'Segue rotinas diárias sem precisar de lembrete',
      'Atende telefone e dá recados simples',
    ],
    'Motor': [
      'Anda de bicicleta com/sem rodinhas',
      'Pula corda',
      'Escreve nome e copia palavras',
      'Manipula objetos pequenos com destreza (miçangas)',
      'Arremessa e pega bola com uma mão',
    ],
  },
}

type Status = 'adquirido' | 'emergente' | 'naoAdquirido' | ''

interface PortageFormProps {
  value: any
  onChange: (data: any) => void
}

export default function PortageForm({ value, onChange }: PortageFormProps) {
  const [faixaEtaria, setFaixaEtaria] = useState<string>(value?.faixaEtaria || '0-1')
  const [itensStatus, setItensStatus] = useState<Record<string, Record<string, Status>>>(value?.itensStatus || {})
  const [observacoes, setObservacoes] = useState<string>(value?.observacoes || '')
  const [domAtivo, setDomAtivo] = useState<string>('Socialização')

  const dominios = Object.keys(PORTAGE_ITENS[faixaEtaria] || {})

  const handleStatusChange = (dominio: string, index: number, status: Status) => {
    const key = `${faixaEtaria}_${dominio}`
    const novo = { ...itensStatus }
    if (!novo[key]) novo[key] = {}
    const atual = novo[key][String(index)]
    novo[key][String(index)] = atual === status ? '' : status
    setItensStatus(novo)
    emitChange(faixaEtaria, novo, observacoes)
  }

  const getStatus = (dominio: string, index: number): Status => {
    const key = `${faixaEtaria}_${dominio}`
    return (itensStatus[key]?.[String(index)] as Status) || ''
  }

  const calcPercent = (dominio: string) => {
    const key = `${faixaEtaria}_${dominio}`
    const itens = PORTAGE_ITENS[faixaEtaria]?.[dominio] || []
    if (itens.length === 0) return 0
    let total = 0
    itens.forEach((_, i) => {
      const s = itensStatus[key]?.[String(i)]
      if (s === 'adquirido') total += 100
      else if (s === 'emergente') total += 50
    })
    return Math.round(total / itens.length)
  }

  const emitChange = (fe: string, is: any, obs: string) => {
    const scores: Record<string, number> = {}
    Object.keys(PORTAGE_ITENS[fe] || {}).forEach(d => {
      const key = `${fe}_${d}`
      const itens = PORTAGE_ITENS[fe]?.[d] || []
      let t = 0
      itens.forEach((_, i) => {
        const s = is[key]?.[String(i)]
        if (s === 'adquirido') t += 100
        else if (s === 'emergente') t += 50
      })
      scores[d] = itens.length > 0 ? Math.round(t / itens.length) : 0
    })
    onChange({
      instrumento: 'PORTAGE',
      faixaEtaria: fe,
      itensStatus: is,
      scores,
      observacoes: obs,
    })
  }

  const handleFaixaChange = (fe: string) => {
    setFaixaEtaria(fe)
    setDomAtivo(Object.keys(PORTAGE_ITENS[fe] || {})[0] || 'Socialização')
    emitChange(fe, itensStatus, observacoes)
  }

  const statusColors: Record<string, { bg: string; color: string; label: string }> = {
    adquirido: { bg: '#D1FAE5', color: '#065F46', label: '✅ Adquirido' },
    emergente: { bg: '#FEF3C7', color: '#92400E', label: '🔄 Emergente' },
    naoAdquirido: { bg: '#FEE2E2', color: '#991B1B', label: '❌ Não adquirido' },
  }

  return (
    <div>
      {/* Faixa etária */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Faixa Etária do Paciente</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.keys(PORTAGE_ITENS).map(fe => (
            <button
              key={fe}
              className={faixaEtaria === fe ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ fontSize: '13px', padding: '6px 16px' }}
              onClick={() => handleFaixaChange(fe)}
            >
              {fe} {fe === '0-1' ? 'ano' : 'anos'}
            </button>
          ))}
        </div>
      </div>

      {/* Resumo por domínio */}
      <div className="form-card" style={{ marginBottom: '16px' }}>
        <div className="form-section-title"><div className="section-icon" />Resumo por Domínio</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {dominios.map(d => {
            const p = calcPercent(d)
            const cor = p >= 70 ? '#059669' : p >= 40 ? '#D97706' : '#DC2626'
            return (
              <div
                key={d}
                onClick={() => setDomAtivo(d)}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: domAtivo === d ? '2px solid var(--odapp-blue)' : '1px solid #E5E7EB',
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: domAtivo === d ? '#F0FDFA' : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '22px', fontWeight: 700, color: cor }}>{p}%</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', marginTop: '2px' }}>{d}</div>
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
                borderBottom: domAtivo === d ? '2px solid var(--odapp-blue)' : '2px solid transparent',
                marginBottom: '-2px',
                background: 'none',
                border: 'none',
                borderBottomWidth: '2px',
                borderBottomStyle: 'solid',
                borderBottomColor: domAtivo === d ? 'var(--odapp-blue)' : 'transparent',
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
          {Object.entries(statusColors).map(([key, { bg, color, label }]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: bg, border: `2px solid ${color}`, display: 'inline-block' }} />
              <span style={{ color: '#6B7280' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Itens do domínio ativo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(PORTAGE_ITENS[faixaEtaria]?.[domAtivo] || []).map((item, idx) => {
            const status = getStatus(domAtivo, idx)
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
                  background: status ? statusColors[status]?.bg + '40' : '#FAFAFA',
                  gap: '12px',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', flex: 1 }}>
                  {item}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {(['adquirido', 'emergente', 'naoAdquirido'] as Status[]).map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(domAtivo, idx, s)}
                      title={statusColors[s].label}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: status === s ? `2px solid ${statusColors[s].color}` : '1px solid #D1D5DB',
                        background: status === s ? statusColors[s].bg : '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {s === 'adquirido' ? '✅' : s === 'emergente' ? '🔄' : '❌'}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Observações */}
      <div className="form-group">
        <label>Observações Gerais</label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Observações sobre o desempenho geral da criança na avaliação PORTAGE..."
          value={observacoes}
          onChange={e => { setObservacoes(e.target.value); emitChange(faixaEtaria, itensStatus, e.target.value) }}
        />
      </div>
    </div>
  )
}
