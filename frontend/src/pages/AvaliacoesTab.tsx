import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'
import PortageForm from './avaliacoes/PortageForm'
import DenverForm from './avaliacoes/DenverForm'
import ProcForm from './avaliacoes/ProcForm'
import MchatForm from './avaliacoes/MchatForm'
import CarsForm from './avaliacoes/CarsForm'
import AbfwForm from './avaliacoes/AbfwForm'
import AvaliacaoRadar from './avaliacoes/AvaliacaoRadar'

interface AvaliacaoData {
  id: number
  tipoAvaliacao: string
  areaEspecialidade: string
  instrumentoAvaliacao?: string
  abordagemTerapeutica?: string
  sessoesPorSemana?: number
  dataAvaliacao: string
  hipoteseDiagnostica?: string
  resultados?: string
  orientacoesFamilia?: string
  observacoes?: string
  createdAt?: string
}

const INSTRUMENTOS = [
  { key: 'PORTAGE', label: 'Inventário PORTAGE', desc: '580 itens · 6 domínios · 0-6 anos', emoji: '📋', bg: '#EDE9FE', color: '#5B21B6' },
  { key: 'DENVER_II', label: 'Teste DENVER II', desc: '125 itens · 4 domínios · Triagem', emoji: '🧪', bg: '#DBEAFE', color: '#1D4ED8' },
  { key: 'MCHAT', label: 'M-CHAT-R/F', desc: '20 itens · Triagem de Autismo · 16-30 meses', emoji: '👶', bg: '#FFE4E6', color: '#BE123C' },
  { key: 'CARS', label: 'Teste CARS', desc: '15 domínios · Severidade do TEA', emoji: '🧩', bg: '#FEF3C7', color: '#92400E' },
  { key: 'PROC', label: 'PROC (Zorzi & Hage)', desc: '3 áreas · Observação comportamental', emoji: '🗣️', bg: '#ECFDF5', color: '#065F46' },
  { key: 'ABFW', label: 'ABFW Pragmática', desc: '15 funções · Perfil funcional da comunicação', emoji: '💬', bg: '#E0F2FE', color: '#0369A1' },
  { key: 'OUTRO', label: 'Outro instrumento', desc: 'Formulário livre', emoji: '📝', bg: '#F3F4F6', color: '#6B7280' },
]

export default function AvaliacoesTab() {
  const { id } = useParams()
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoData[]>([])
  const [loading, setLoading] = useState(true)
  const [pacienteNome, setPacienteNome] = useState('')

  // Modal nova avaliação
  const [showModal, setShowModal] = useState(false)
  const [etapa, setEtapa] = useState<'instrumento' | 'formulario'>('instrumento')
  const [instrumentoSelecionado, setInstrumentoSelecionado] = useState<string>('')
  const [instrumentoData, setInstrumentoData] = useState<any>(null)

  // Campos base da avaliação
  const [form, setForm] = useState({
    tipoAvaliacao: 'INICIAL',
    areaEspecialidade: 'TEA',
    instrumentoAvaliacao: '',
    abordagemTerapeutica: '',
    sessoesPorSemana: 2,
    dataAvaliacao: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })(),
    hipoteseDiagnostica: '',
    resultados: '',
    orientacoesFamilia: '',
    observacoes: '',
  })

  const [salvando, setSalvando] = useState(false)
  const [showDetalhes, setShowDetalhes] = useState<AvaliacaoData | null>(null)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false, msg: '', type: 'success'
  })

  useEffect(() => {
    carregarAvaliacoes()
    if (id) {
      api.get(`/v1/pacientes/${id}`)
        .then(({ data }) => setPacienteNome(data.nomeCompleto || ''))
        .catch(() => {})
    }
  }, [id])

  const carregarAvaliacoes = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/v1/pacientes/${id}/avaliacoes`)
      setAvaliacoes(data || [])
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err)
      setAvaliacoes([])
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
  }

  const handleImprimir = (av: AvaliacaoData) => {
    const parsed = parseResultados(av.resultados)
    const instrInfo = getInstrumentoInfo(av.instrumentoAvaliacao)
    const dataFormatada = format(new Date(av.dataAvaliacao + 'T00:00:00'), "dd/MM/yyyy")

    // Gerar tabela de scores se houver
    let scoresHTML = ''
    const scores = parsed?.scores || parsed?.areaScores
    if (scores) {
      const rows = Object.entries(scores as Record<string, number>)
        .map(([k, v]) => {
          const cor = (v as number) >= 70 ? '#059669' : (v as number) >= 40 ? '#D97706' : '#DC2626'
          return `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;font-size:13px;">${k}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;font-weight:700;color:${cor};text-align:center;">${v}%</td>
            <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;">
              <div style="background:#E5E7EB;border-radius:4px;height:8px;overflow:hidden;">
                <div style="background:${cor};height:100%;width:${v}%;border-radius:4px;"></div>
              </div>
            </td>
          </tr>`
        }).join('')
      scoresHTML = `
        <h3 style="color:#29B6D1;border-bottom:2px solid #29B6D1;padding-bottom:6px;margin-top:24px;">Resultados por Domínio</h3>
        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
          <thead><tr style="background:#F9FAFB;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6B7280;border-bottom:2px solid #E5E7EB;">Domínio</th>
            <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6B7280;border-bottom:2px solid #E5E7EB;width:80px;">Score</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6B7280;border-bottom:2px solid #E5E7EB;width:200px;">Progresso</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>`
    }

    // Resultado geral (Denver, M-CHAT, CARS)
    let geralHTML = ''
    if (parsed?.resultadoGeral) {
      if (parsed.instrumento === 'M-CHAT') {
        const isAlto = parsed.resultadoGeral === 'ALTO_RISCO'
        const isMod = parsed.resultadoGeral === 'RISCO_MODERADO'
        const cor = isAlto ? '#DC2626' : isMod ? '#D97706' : '#059669'
        const bg = isAlto ? '#FEE2E2' : isMod ? '#FEF3C7' : '#D1FAE5'
        geralHTML = `<div style="padding:12px 16px;border-radius:8px;background:${bg};color:${cor};font-weight:700;font-size:15px;margin-top:16px;">Resultado M-CHAT: ${parsed.riscoLabel} (Score: ${parsed.score}/20)</div>`
      } else if (parsed.instrumento === 'CARS') {
        const isSev = parsed.resultadoGeral === 'SEVERO'
        const isMod = parsed.resultadoGeral === 'LEVE_MODERADO'
        const cor = isSev ? '#DC2626' : isMod ? '#D97706' : '#059669'
        const bg = isSev ? '#FEE2E2' : isMod ? '#FEF3C7' : '#D1FAE5'
        geralHTML = `<div style="padding:12px 16px;border-radius:8px;background:${bg};color:${cor};font-weight:700;font-size:15px;margin-top:16px;">Classificação CARS: ${parsed.classificacao} (Total: ${parsed.totalScore}/60)</div>`
      } else {
        const r = parsed.resultadoGeral
        const lbl = r === 'NORMAL' ? '✅ Normal' : r === 'SUSPEITO' ? '⚠️ Suspeito' : '➖ Não testável'
        const cor = r === 'NORMAL' ? '#065F46' : r === 'SUSPEITO' ? '#92400E' : '#6B7280'
        const bg = r === 'NORMAL' ? '#D1FAE5' : r === 'SUSPEITO' ? '#FEF3C7' : '#F3F4F6'
        geralHTML = `<div style="padding:12px 16px;border-radius:8px;background:${bg};color:${cor};font-weight:700;font-size:15px;margin-top:16px;">${lbl}</div>`
      }
    }

    // Seções de texto
    const secao = (titulo: string, texto?: string) => {
      if (!texto) return ''
      return `<h3 style="color:#29B6D1;border-bottom:2px solid #29B6D1;padding-bottom:6px;margin-top:24px;">${titulo}</h3>
        <p style="font-size:13px;color:#374151;white-space:pre-wrap;line-height:1.6;">${texto}</p>`
    }

    const htmlTop = `<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <title>Avaliação — ${pacienteNome || 'Paciente'}</title>
  <style>
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 32px; color: #111827; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #29B6D1; padding-bottom: 16px; margin-bottom: 24px; }
    .badge { display: inline-block; font-size: 11px; font-weight: 600; border-radius: 999px; padding: 3px 12px; margin-right: 6px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 16px; }
    .info-item label { font-size: 10px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; }
    .info-item p { margin: 4px 0 0; font-size: 13px; }
    h3 { font-size: 14px; margin-bottom: 8px; }
    footer { margin-top: 60px; padding-top: 16px; border-top: 1px solid #E5E7EB; display: flex; justify-content: space-between; font-size: 11px; color: #9CA3AF; }
  </style>
</head><body>
  <div class="header">
    <div>
      <div style="font-size:20px;font-weight:700;color:#29B6D1;">🎙️ Live System</div>
      <div style="font-size:12px;color:#6B7280;margin-top:4px;">Relatório de Avaliação</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:16px;font-weight:700;">${pacienteNome || 'Paciente'}</div>
      <div style="font-size:12px;color:#6B7280;margin-top:4px;">Data: ${dataFormatada}</div>
    </div>
  </div>

  <div>
    <span class="badge" style="background:${instrInfo?.bg || '#F3F4F6'};color:${instrInfo?.color || '#6B7280'};">${instrInfo?.emoji || '📊'} ${av.instrumentoAvaliacao || 'Avaliação'}</span>
    <span class="badge" style="background:#DBEAFE;color:#1D4ED8;">${labelTipo(av.tipoAvaliacao)}</span>
    <span class="badge" style="background:#EDE9FE;color:#5B21B6;">${labelArea(av.areaEspecialidade)}</span>
  </div>

  <div class="info-grid">
    <div class="info-item"><label>Abordagem</label><p>${av.abordagemTerapeutica || '—'}</p></div>
    <div class="info-item"><label>Sessões/Semana</label><p>${av.sessoesPorSemana ?? '—'}x</p></div>
    <div class="info-item"><label>Instrumento</label><p>${av.instrumentoAvaliacao || '—'}</p></div>
  </div>
`

    // Gerar gráfico radar SVG para impressão
    let radarSVG = ''
    if (scores) {
      const entries = Object.entries(scores as Record<string, number>)
      const n = entries.length
      if (n >= 3) {
        const cx = 160, cy = 160, r = 120
        const angleStep = (2 * Math.PI) / n
        const startAngle = -Math.PI / 2
        // Use String.fromCharCode(60) para gerar '<' sem confundir o TSX parser
        const lt = String.fromCharCode(60)

        const gridCircles = [20, 40, 60, 80, 100].map(pct => {
          const gr = (r * pct) / 100
          return `${lt}circle cx="${cx}" cy="${cy}" r="${gr}" fill="none" stroke="#E5E7EB" stroke-width="1"/>`
        }).join('')

        const gridLines = entries.map((_, i) => {
          const angle = startAngle + i * angleStep
          const x = cx + r * Math.cos(angle)
          const y = cy + r * Math.sin(angle)
          return `${lt}line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#E5E7EB" stroke-width="1"/>`
        }).join('')

        const labels = entries.map(([k], i) => {
          const angle = startAngle + i * angleStep
          const labelR = r + 28
          const x = cx + labelR * Math.cos(angle)
          const y = cy + labelR * Math.sin(angle)
          const anchor = Math.abs(x - cx) < 5 ? 'middle' : x > cx ? 'start' : 'end'
          return `${lt}text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="central" font-size="11" font-weight="600" fill="#6B7280">${k}${lt}/text>`
        }).join('')

        const points = entries.map(([, v], i) => {
          const angle = startAngle + i * angleStep
          const pr = (r * (v as number)) / 100
          const x = cx + pr * Math.cos(angle)
          const y = cy + pr * Math.sin(angle)
          return `${x},${y}`
        }).join(' ')

        const dots = entries.map(([, v], i) => {
          const angle = startAngle + i * angleStep
          const pr = (r * (v as number)) / 100
          const x = cx + pr * Math.cos(angle)
          const y = cy + pr * Math.sin(angle)
          return `${lt}circle cx="${x}" cy="${y}" r="4" fill="#29B6D1" stroke="#fff" stroke-width="2"/>`
        }).join('')

        const pctLabels = [20, 40, 60, 80, 100].map(pct => {
          const y = cy - (r * pct) / 100
          return `${lt}text x="${cx + 4}" y="${y - 4}" font-size="9" fill="#9CA3AF">${pct}%${lt}/text>`
        }).join('')

        radarSVG = [
          `${lt}div style="text-align:center;margin:24px 0 8px;">`,
          `${lt}h3 style="color:#29B6D1;border-bottom:2px solid #29B6D1;padding-bottom:6px;display:inline-block;">Perfil de Desenvolvimento${lt}/h3>`,
          `${lt}div style="display:flex;justify-content:center;margin-top:8px;">`,
          `${lt}svg width="320" height="320" viewBox="0 0 320 320" style="max-width:100%;">`,
          gridCircles, gridLines, pctLabels,
          `${lt}polygon points="${points}" fill="rgba(41,182,209,0.2)" stroke="#29B6D1" stroke-width="2"/>`,
          dots, labels,
          `${lt}/svg>${lt}/div>${lt}/div>`,
        ].join('')
      }
    }

    const hipoteseHTML = secao('Hipótese Diagnóstica', av.hipoteseDiagnostica)
    const obsAvalHTML = secao('Observações da Avaliação', parsed?.observacoes)
    const orientHTML = secao('Orientações à Família', av.orientacoesFamilia)
    const obsGeraisHTML = secao('Observações Gerais', av.observacoes)
    const faixaHTML = parsed?.faixaEtaria ? String.fromCharCode(60) + `p style="margin-top:16px;font-size:13px;">${String.fromCharCode(60)}strong>Faixa Etária Avaliada:${String.fromCharCode(60)}/strong> ${parsed.faixaEtaria} anos${String.fromCharCode(60)}/p>` : ''
    const footerDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm")

    const htmlBottom = [
      hipoteseHTML, radarSVG, scoresHTML, geralHTML, faixaHTML,
      obsAvalHTML, orientHTML, obsGeraisHTML,
      `${String.fromCharCode(60)}footer>`,
      `${String.fromCharCode(60)}span>Live System — Gerado em ${footerDate}${String.fromCharCode(60)}/span>`,
      `${String.fromCharCode(60)}span>Documento para uso profissional${String.fromCharCode(60)}/span>`,
      `${String.fromCharCode(60)}/footer>`,
      `${String.fromCharCode(60)}/body>${String.fromCharCode(60)}/html>`,
    ].join('\n')

    const html = htmlTop + htmlBottom

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
      setTimeout(() => win.print(), 400)
    }
  }

  const abrirNovaAvaliacao = () => {
    setEtapa('instrumento')
    setInstrumentoSelecionado('')
    setInstrumentoData(null)
    setEditandoId(null)
    setForm({
      tipoAvaliacao: 'INICIAL',
      areaEspecialidade: 'TEA',
      instrumentoAvaliacao: '',
      abordagemTerapeutica: '',
      sessoesPorSemana: 2,
      dataAvaliacao: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })(),
      hipoteseDiagnostica: '',
      resultados: '',
      orientacoesFamilia: '',
      observacoes: '',
    })
    setShowModal(true)
  }

  const abrirEditar = (av: AvaliacaoData) => {
    setShowDetalhes(null)
    setEditandoId(av.id)

    const parsed = parseResultados(av.resultados)
    // Detectar instrumento pelo nome
    const instrKey = INSTRUMENTOS.find(i => i.label === av.instrumentoAvaliacao)?.key
      || (av.instrumentoAvaliacao?.includes('PORTAGE') ? 'PORTAGE'
        : av.instrumentoAvaliacao?.includes('DENVER') ? 'DENVER_II'
          : av.instrumentoAvaliacao?.includes('M-CHAT') ? 'MCHAT'
            : av.instrumentoAvaliacao?.includes('CARS') ? 'CARS'
              : av.instrumentoAvaliacao?.includes('ABFW') ? 'ABFW'
                : av.instrumentoAvaliacao?.includes('PROC') ? 'PROC' : 'OUTRO')

    setInstrumentoSelecionado(instrKey)
    setInstrumentoData(parsed)
    setEtapa('formulario')
    setForm({
      tipoAvaliacao: av.tipoAvaliacao || 'INICIAL',
      areaEspecialidade: av.areaEspecialidade || 'TEA',
      instrumentoAvaliacao: av.instrumentoAvaliacao || '',
      abordagemTerapeutica: av.abordagemTerapeutica || '',
      sessoesPorSemana: av.sessoesPorSemana || 2,
      dataAvaliacao: av.dataAvaliacao || '',
      hipoteseDiagnostica: av.hipoteseDiagnostica || '',
      resultados: (!parsed ? (av.resultados || '') : ''),
      orientacoesFamilia: av.orientacoesFamilia || '',
      observacoes: av.observacoes || '',
    })
    setShowModal(true)
  }

  const selecionarInstrumento = (key: string) => {
    setInstrumentoSelecionado(key)
    const instrLabel = INSTRUMENTOS.find(i => i.key === key)?.label || key
    setForm(f => ({ ...f, instrumentoAvaliacao: instrLabel }))
    setEtapa('formulario')
  }

  const handleSalvar = async () => {
    if (!form.dataAvaliacao) {
      showToast('Preencha a data da avaliação.', 'error')
      return
    }
    try {
      setSalvando(true)
      // Serializa os dados do instrumento no campo resultados
      const resultadosJSON = instrumentoData
        ? JSON.stringify(instrumentoData)
        : form.resultados

      if (editandoId) {
        await api.put(`/v1/avaliacoes/${editandoId}`, {
          ...form,
          resultados: resultadosJSON,
          sessoesPorSemana: form.sessoesPorSemana || 2,
        })
        showToast('Avaliação atualizada com sucesso!', 'success')
      } else {
        await api.post(`/v1/pacientes/${id}/avaliacoes`, {
          ...form,
          resultados: resultadosJSON,
          sessoesPorSemana: form.sessoesPorSemana || 2,
        })
        showToast('Avaliação salva com sucesso!', 'success')
      }
      setEditandoId(null)
      setShowModal(false)
      carregarAvaliacoes()
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Erro ao salvar avaliação.'
      showToast(msg, 'error')
      console.error(err)
    } finally {
      setSalvando(false)
    }
  }

  // Helpers de label
  const labelTipo = (t: string) => t === 'INICIAL' ? 'Avaliação Inicial' : t === 'REAVALIACAO' ? 'Reavaliação' : t
  const labelArea = (a: string) => {
    switch (a) {
      case 'REABILITACAO_AUDITIVA': return 'Reab. Auditiva'
      case 'TEA': return 'TEA'
      case 'FALA': return 'Fala'
      case 'LINGUAGEM': return 'Linguagem'
      default: return a
    }
  }

  const parseResultados = (r?: string): any => {
    if (!r) return null
    try { return JSON.parse(r) } catch { return null }
  }

  const getInstrumentoInfo = (instrumento?: string) => {
    if (!instrumento) return null
    return INSTRUMENTOS.find(i => i.label === instrumento || i.key === instrumento) || null
  }

  const badgeColor = (tipo: string) => tipo === 'INICIAL'
    ? { bg: '#DBEAFE', color: '#1D4ED8' }
    : { bg: '#FEF3C7', color: '#92400E' }

  const areaColor = (area: string) => {
    switch (area) {
      case 'TEA': return { bg: '#EDE9FE', color: '#5B21B6' }
      case 'FALA': return { bg: '#FCE7F3', color: '#9D174D' }
      case 'LINGUAGEM': return { bg: '#ECFDF5', color: '#065F46' }
      default: return { bg: '#E0F2FE', color: '#0369A1' }
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>Carregando avaliações...</div>
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', color: '#6B7280' }}>
          {avaliacoes.length} avaliação{avaliacoes.length !== 1 ? 'ões' : ''} registrada{avaliacoes.length !== 1 ? 's' : ''}
        </div>
        <button className="btn btn-primary" onClick={abrirNovaAvaliacao}>
          + Nova Avaliação
        </button>
      </div>

      {/* Lista */}
      {avaliacoes.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
            Nenhuma avaliação registrada
          </div>
          <div style={{ fontSize: '13px', marginBottom: '20px' }}>
            Clique em "Nova Avaliação" para registrar com PORTAGE, DENVER II ou PROC.
          </div>
          <button className="btn btn-primary" onClick={abrirNovaAvaliacao}>
            + Nova Avaliação
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {avaliacoes.map(av => {
            const bc = badgeColor(av.tipoAvaliacao)
            const ac = areaColor(av.areaEspecialidade)
            const parsed = parseResultados(av.resultados)
            const instrInfo = getInstrumentoInfo(av.instrumentoAvaliacao)

            return (
              <div
                key={av.id}
                className="session-card"
                style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                onClick={() => setShowDetalhes(av)}
              >
                <div className="session-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: instrInfo?.bg || ac.bg, color: instrInfo?.color || ac.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', flexShrink: 0,
                    }}>
                      {instrInfo?.emoji || '📊'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                        {av.instrumentoAvaliacao || labelTipo(av.tipoAvaliacao)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                        {format(new Date(av.dataAvaliacao + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        {' · '}{labelArea(av.areaEspecialidade)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Mini scores do instrumento */}
                    {parsed?.scores && Object.entries(parsed.scores as Record<string, number>).slice(0, 3).map(([k, v]) => (
                      <span key={k} style={{
                        fontSize: '10px', fontWeight: 700,
                        background: (v as number) >= 70 ? '#D1FAE5' : (v as number) >= 40 ? '#FEF3C7' : '#FEE2E2',
                        color: (v as number) >= 70 ? '#065F46' : (v as number) >= 40 ? '#92400E' : '#991B1B',
                        borderRadius: '999px', padding: '2px 8px',
                      }}>
                        {v}%
                      </span>
                    ))}
                    {parsed?.areaScores && Object.entries(parsed.areaScores as Record<string, number>).map(([k, v]) => (
                      <span key={k} style={{
                        fontSize: '10px', fontWeight: 700,
                        background: (v as number) >= 70 ? '#D1FAE5' : (v as number) >= 40 ? '#FEF3C7' : '#FEE2E2',
                        color: (v as number) >= 70 ? '#065F46' : (v as number) >= 40 ? '#92400E' : '#991B1B',
                        borderRadius: '999px', padding: '2px 8px',
                      }}>
                        {v}%
                      </span>
                    ))}
                    <span style={{
                      fontSize: '11px', fontWeight: 600,
                      background: bc.bg, color: bc.color,
                      borderRadius: '999px', padding: '3px 10px',
                    }}>
                      {labelTipo(av.tipoAvaliacao)}
                    </span>
                    <span style={{ color: 'var(--odapp-blue)', fontSize: '20px' }}>›</span>
                  </div>
                </div>
                {av.hipoteseDiagnostica && (
                  <div className="session-body" style={{ fontSize: '13px', color: '#6B7280' }}>
                    <strong>Hipótese:</strong> {av.hipoteseDiagnostica.length > 120 ? av.hipoteseDiagnostica.slice(0, 120) + '...' : av.hipoteseDiagnostica}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ============ MODAL NOVA AVALIAÇÃO ============ */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`}>
        <div className="modal" style={{ maxWidth: etapa === 'formulario' ? '900px' : '700px', maxHeight: '92vh', overflowY: 'auto' }}>
          <div className="modal-header">
            <h2 className="modal-title">
              {etapa === 'instrumento'
                ? 'Selecione o Instrumento'
                : `${editandoId ? 'Editar' : 'Nova'} Avaliação — ${INSTRUMENTOS.find(i => i.key === instrumentoSelecionado)?.label || ''}`}
            </h2>
            <button className="modal-close" onClick={() => { setShowModal(false); setEditandoId(null) }}>×</button>
          </div>

          <div style={{ padding: '24px' }}>
            {/* ETAPA 1: Seleção de instrumento */}
            {etapa === 'instrumento' && (
              <div>
                <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
                  Escolha o instrumento de avaliação que será utilizado:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                  {INSTRUMENTOS.map(inst => (
                    <button
                      key={inst.key}
                      onClick={() => selecionarInstrumento(inst.key)}
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        border: '2px solid #E5E7EB',
                        background: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget).style.borderColor = inst.color
                        ;(e.currentTarget).style.background = inst.bg + '30'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget).style.borderColor = '#E5E7EB'
                        ;(e.currentTarget).style.background = '#fff'
                      }}
                    >
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: inst.bg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '24px', flexShrink: 0,
                      }}>
                        {inst.emoji}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>{inst.label}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{inst.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ETAPA 2: Formulário */}
            {etapa === 'formulario' && (
              <div>
                {/* Botão voltar */}
                <button
                  className="btn btn-outline"
                  style={{ marginBottom: '16px', fontSize: '13px' }}
                  onClick={() => setEtapa('instrumento')}
                >
                  ← Trocar instrumento
                </button>

                {/* Campos base */}
                <div className="form-card" style={{ marginBottom: '16px' }}>
                  <div className="form-section-title"><div className="section-icon" />Dados Gerais</div>
                  <div className="form-grid form-grid-3">
                    <div className="form-group">
                      <label>Tipo *</label>
                      <select className="form-control" value={form.tipoAvaliacao} onChange={e => setForm({ ...form, tipoAvaliacao: e.target.value })}>
                        <option value="INICIAL">Avaliação Inicial</option>
                        <option value="REAVALIACAO">Reavaliação</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Área *</label>
                      <select className="form-control" value={form.areaEspecialidade} onChange={e => setForm({ ...form, areaEspecialidade: e.target.value })}>
                        <option value="TEA">TEA</option>
                        <option value="REABILITACAO_AUDITIVA">Reabilitação Auditiva</option>
                        <option value="FALA">Fala</option>
                        <option value="LINGUAGEM">Linguagem</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Data *</label>
                      <input type="date" className="form-control" value={form.dataAvaliacao} onChange={e => setForm({ ...form, dataAvaliacao: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label>Abordagem Terapêutica</label>
                      <input type="text" className="form-control" placeholder="Ex: ABA, TEACCH, Aurioral..." value={form.abordagemTerapeutica} onChange={e => setForm({ ...form, abordagemTerapeutica: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Sessões por Semana</label>
                      <input type="number" className="form-control" min="1" max="7" value={form.sessoesPorSemana} onChange={e => setForm({ ...form, sessoesPorSemana: parseInt(e.target.value) || 2 })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Hipótese Diagnóstica</label>
                    <textarea className="form-control" rows={2} placeholder="Hipótese diagnóstica..." value={form.hipoteseDiagnostica} onChange={e => setForm({ ...form, hipoteseDiagnostica: e.target.value })} />
                  </div>
                </div>

                {/* Formulário específico do instrumento */}
                {instrumentoSelecionado === 'PORTAGE' && (
                  <PortageForm value={instrumentoData} onChange={setInstrumentoData} />
                )}
                {instrumentoSelecionado === 'DENVER_II' && (
                  <DenverForm value={instrumentoData} onChange={setInstrumentoData} />
                )}
                {instrumentoSelecionado === 'MCHAT' && (
                  <MchatForm value={instrumentoData} onChange={setInstrumentoData} />
                )}
                {instrumentoSelecionado === 'CARS' && (
                  <CarsForm value={instrumentoData} onChange={setInstrumentoData} />
                )}
                {instrumentoSelecionado === 'ABFW' && (
                  <AbfwForm value={instrumentoData} onChange={setInstrumentoData} />
                )}
                {instrumentoSelecionado === 'PROC' && (
                  <ProcForm value={instrumentoData} onChange={setInstrumentoData} />
                )}
                {instrumentoSelecionado === 'OUTRO' && (
                  <div className="form-card" style={{ marginBottom: '16px' }}>
                    <div className="form-section-title"><div className="section-icon" />Resultados</div>
                    <div className="form-group">
                      <label>Instrumento Utilizado</label>
                      <input type="text" className="form-control" placeholder="Nome do instrumento..." value={form.instrumentoAvaliacao} onChange={e => setForm({ ...form, instrumentoAvaliacao: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Resultados</label>
                      <textarea className="form-control" rows={4} placeholder="Descreva os resultados da avaliação..." value={form.resultados} onChange={e => setForm({ ...form, resultados: e.target.value })} />
                    </div>
                  </div>
                )}

                {/* Campos finais */}
                <div className="form-card" style={{ marginBottom: '16px' }}>
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label>Orientações à Família</label>
                      <textarea className="form-control" rows={2} placeholder="Orientações fornecidas..." value={form.orientacoesFamilia} onChange={e => setForm({ ...form, orientacoesFamilia: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Observações Gerais</label>
                      <textarea className="form-control" rows={2} placeholder="Observações adicionais..." value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button className="btn btn-outline" onClick={() => { setShowModal(false); setEditandoId(null) }} disabled={salvando}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleSalvar} disabled={salvando}>
                    {salvando ? 'Salvando...' : editandoId ? '✓ Atualizar Avaliação' : '✓ Salvar Avaliação'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============ MODAL DETALHES ============ */}
      <div className={`modal-overlay ${showDetalhes ? 'active' : ''}`}>
        <div className="modal" style={{ maxWidth: '800px', maxHeight: '92vh', overflowY: 'auto' }}>
          <div className="modal-header">
            <h2 className="modal-title">Detalhes da Avaliação</h2>
            <button className="modal-close" onClick={() => setShowDetalhes(null)}>×</button>
          </div>

          {showDetalhes && (() => {
            const parsed = parseResultados(showDetalhes.resultados)
            const instrInfo = getInstrumentoInfo(showDetalhes.instrumentoAvaliacao)
            const radarScores = parsed?.scores || parsed?.areaScores || null

            return (
              <div style={{ padding: '24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {instrInfo && (
                    <span style={{
                      fontSize: '13px', fontWeight: 600,
                      background: instrInfo.bg, color: instrInfo.color,
                      borderRadius: '999px', padding: '4px 14px',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      {instrInfo.emoji} {instrInfo.label}
                    </span>
                  )}
                  <span style={{
                    fontSize: '12px', fontWeight: 600,
                    background: badgeColor(showDetalhes.tipoAvaliacao).bg,
                    color: badgeColor(showDetalhes.tipoAvaliacao).color,
                    borderRadius: '999px', padding: '4px 14px',
                  }}>
                    {labelTipo(showDetalhes.tipoAvaliacao)}
                  </span>
                  <span style={{
                    fontSize: '12px', fontWeight: 600,
                    background: areaColor(showDetalhes.areaEspecialidade).bg,
                    color: areaColor(showDetalhes.areaEspecialidade).color,
                    borderRadius: '999px', padding: '4px 14px',
                  }}>
                    {labelArea(showDetalhes.areaEspecialidade)}
                  </span>
                  <span style={{
                    fontSize: '12px', fontWeight: 600,
                    background: '#F3F4F6', color: '#374151',
                    borderRadius: '999px', padding: '4px 14px',
                  }}>
                    📅 {format(new Date(showDetalhes.dataAvaliacao + 'T00:00:00'), "dd/MM/yyyy")}
                  </span>
                </div>

                {/* Gráfico Radar */}
                {radarScores && (
                  <div style={{ marginBottom: '20px' }}>
                    <AvaliacaoRadar
                      scores={radarScores}
                      titulo={`Perfil de Desenvolvimento — ${instrInfo?.label || 'Avaliação'}`}
                    />
                  </div>
                )}

                {/* Resultado Geral */}
                {parsed?.resultadoGeral && (
                  <div className="form-card" style={{ marginBottom: '16px' }}>
                    <div className="form-section-title"><div className="section-icon" />Resultado da Triagem/Avaliação</div>
                    <div style={{
                      padding: '14px 20px',
                      borderRadius: '10px',
                      background: parsed.instrumento === 'M-CHAT' ? (parsed.resultadoGeral === 'ALTO_RISCO' ? '#FEE2E2' : parsed.resultadoGeral === 'RISCO_MODERADO' ? '#FEF3C7' : '#D1FAE5')
                                : parsed.instrumento === 'CARS' ? (parsed.resultadoGeral === 'SEVERO' ? '#FEE2E2' : parsed.resultadoGeral === 'LEVE_MODERADO' ? '#FEF3C7' : '#D1FAE5')
                                : (parsed.resultadoGeral === 'NORMAL' ? '#D1FAE5' : parsed.resultadoGeral === 'SUSPEITO' ? '#FEF3C7' : '#F3F4F6'),
                      fontWeight: 700,
                      fontSize: '16px',
                      color: parsed.instrumento === 'M-CHAT' ? (parsed.resultadoGeral === 'ALTO_RISCO' ? '#DC2626' : parsed.resultadoGeral === 'RISCO_MODERADO' ? '#D97706' : '#059669')
                             : parsed.instrumento === 'CARS' ? (parsed.resultadoGeral === 'SEVERO' ? '#DC2626' : parsed.resultadoGeral === 'LEVE_MODERADO' ? '#D97706' : '#059669')
                             : (parsed.resultadoGeral === 'NORMAL' ? '#065F46' : parsed.resultadoGeral === 'SUSPEITO' ? '#92400E' : '#6B7280'),
                    }}>
                      {parsed.instrumento === 'M-CHAT' ? `M-CHAT: ${parsed.riscoLabel} (Score: ${parsed.score}/20)`
                       : parsed.instrumento === 'CARS' ? `CARS: ${parsed.classificacao} (Total: ${parsed.totalScore}/60)`
                       : (parsed.resultadoGeral === 'NORMAL' ? '✅ Normal' : parsed.resultadoGeral === 'SUSPEITO' ? '⚠️ Suspeito' : '➖ Não testável')}
                    </div>
                  </div>
                )}

                {/* PORTAGE — Faixa etária */}
                {parsed?.faixaEtaria && (
                  <div className="form-card" style={{ marginBottom: '16px' }}>
                    <div className="form-section-title"><div className="section-icon" />Faixa Etária Avaliada</div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>
                      {parsed.faixaEtaria} anos
                    </div>
                  </div>
                )}

                {/* Info gerais */}
                <div className="form-card" style={{ marginBottom: '16px' }}>
                  <div className="form-section-title"><div className="section-icon" />Informações Gerais</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>Abordagem</label>
                      <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#111827' }}>{showDetalhes.abordagemTerapeutica || '—'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>Sessões/Semana</label>
                      <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#111827' }}>{showDetalhes.sessoesPorSemana ?? '—'}x</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>Instrumento</label>
                      <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#111827' }}>{showDetalhes.instrumentoAvaliacao || '—'}</p>
                    </div>
                  </div>
                </div>

                {showDetalhes.hipoteseDiagnostica && (
                  <div className="form-card" style={{ marginBottom: '16px' }}>
                    <div className="form-section-title"><div className="section-icon" />Hipótese Diagnóstica</div>
                    <p style={{ fontSize: '14px', color: '#374151', whiteSpace: 'pre-wrap', margin: 0 }}>{showDetalhes.hipoteseDiagnostica}</p>
                  </div>
                )}

                {/* Observações do instrumento */}
                {parsed?.observacoes && (
                  <div className="form-card" style={{ marginBottom: '16px' }}>
                    <div className="form-section-title"><div className="section-icon" />Observações da Avaliação</div>
                    <p style={{ fontSize: '14px', color: '#374151', whiteSpace: 'pre-wrap', margin: 0 }}>{parsed.observacoes}</p>
                  </div>
                )}

                {showDetalhes.orientacoesFamilia && (
                  <div className="form-card" style={{ marginBottom: '16px' }}>
                    <div className="form-section-title"><div className="section-icon" />Orientações à Família</div>
                    <p style={{ fontSize: '14px', color: '#374151', whiteSpace: 'pre-wrap', margin: 0 }}>{showDetalhes.orientacoesFamilia}</p>
                  </div>
                )}

                {showDetalhes.observacoes && (
                  <div className="form-card" style={{ marginBottom: '16px' }}>
                    <div className="form-section-title"><div className="section-icon" />Observações Gerais</div>
                    <p style={{ fontSize: '14px', color: '#374151', whiteSpace: 'pre-wrap', margin: 0 }}>{showDetalhes.observacoes}</p>
                  </div>
                )}

                <div className="form-actions">
                  <button className="btn btn-outline" onClick={() => setShowDetalhes(null)}>Fechar</button>
                  <button className="btn btn-outline" onClick={() => abrirEditar(showDetalhes)} style={{ color: '#D97706', borderColor: '#D97706' }}>✏️ Editar</button>
                  <button className="btn btn-primary" onClick={() => handleImprimir(showDetalhes)}>🖨️ Imprimir</button>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
        {toast.msg}
      </div>
    </div>
  )
}
