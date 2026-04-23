import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'
import PortageForm from './avaliacoes/PortageForm'
import DenverForm from './avaliacoes/DenverForm'
import ProcForm from './avaliacoes/ProcForm'
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
  { key: 'PROC', label: 'PROC (Zorzi & Hage)', desc: '3 áreas · Observação comportamental', emoji: '💬', bg: '#ECFDF5', color: '#065F46' },
  { key: 'OUTRO', label: 'Outro instrumento', desc: 'Formulário livre', emoji: '📝', bg: '#F3F4F6', color: '#6B7280' },
]

export default function AvaliacoesTab() {
  const { id } = useParams()
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoData[]>([])
  const [loading, setLoading] = useState(true)

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
    dataAvaliacao: new Date().toISOString().split('T')[0],
    hipoteseDiagnostica: '',
    resultados: '',
    orientacoesFamilia: '',
    observacoes: '',
  })

  const [salvando, setSalvando] = useState(false)
  const [showDetalhes, setShowDetalhes] = useState<AvaliacaoData | null>(null)
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false, msg: '', type: 'success'
  })

  useEffect(() => {
    carregarAvaliacoes()
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

  const abrirNovaAvaliacao = () => {
    setEtapa('instrumento')
    setInstrumentoSelecionado('')
    setInstrumentoData(null)
    setForm({
      tipoAvaliacao: 'INICIAL',
      areaEspecialidade: 'TEA',
      instrumentoAvaliacao: '',
      abordagemTerapeutica: '',
      sessoesPorSemana: 2,
      dataAvaliacao: new Date().toISOString().split('T')[0],
      hipoteseDiagnostica: '',
      resultados: '',
      orientacoesFamilia: '',
      observacoes: '',
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

      await api.post(`/v1/pacientes/${id}/avaliacoes`, {
        ...form,
        resultados: resultadosJSON,
        sessoesPorSemana: form.sessoesPorSemana || 2,
      })
      showToast('Avaliação salva com sucesso!', 'success')
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
              {etapa === 'instrumento' ? 'Selecione o Instrumento' : `Nova Avaliação — ${INSTRUMENTOS.find(i => i.key === instrumentoSelecionado)?.label || ''}`}
            </h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
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
                  <button className="btn btn-outline" onClick={() => setShowModal(false)} disabled={salvando}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleSalvar} disabled={salvando}>
                    {salvando ? 'Salvando...' : '✓ Salvar Avaliação'}
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

                {/* Denver II — Resultado Geral */}
                {parsed?.resultadoGeral && (
                  <div className="form-card" style={{ marginBottom: '16px' }}>
                    <div className="form-section-title"><div className="section-icon" />Resultado Geral da Triagem</div>
                    <div style={{
                      padding: '14px 20px',
                      borderRadius: '10px',
                      background: parsed.resultadoGeral === 'NORMAL' ? '#D1FAE5' : parsed.resultadoGeral === 'SUSPEITO' ? '#FEF3C7' : '#F3F4F6',
                      fontWeight: 700,
                      fontSize: '16px',
                      color: parsed.resultadoGeral === 'NORMAL' ? '#065F46' : parsed.resultadoGeral === 'SUSPEITO' ? '#92400E' : '#6B7280',
                    }}>
                      {parsed.resultadoGeral === 'NORMAL' ? '✅ Normal' : parsed.resultadoGeral === 'SUSPEITO' ? '⚠️ Suspeito' : '➖ Não testável'}
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
