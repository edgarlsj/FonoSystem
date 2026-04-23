import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'

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

const FORM_INICIAL = {
  tipoAvaliacao: 'INICIAL',
  areaEspecialidade: 'REABILITACAO_AUDITIVA',
  instrumentoAvaliacao: '',
  abordagemTerapeutica: '',
  sessoesPorSemana: 2,
  dataAvaliacao: new Date().toISOString().split('T')[0],
  hipoteseDiagnostica: '',
  resultados: '',
  orientacoesFamilia: '',
  observacoes: '',
}

export default function AvaliacoesTab() {
  const { id } = useParams()
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoData[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetalhes, setShowDetalhes] = useState<AvaliacaoData | null>(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [salvando, setSalvando] = useState(false)
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

  const handleSalvar = async () => {
    if (!form.tipoAvaliacao || !form.areaEspecialidade || !form.dataAvaliacao) {
      showToast('Preencha os campos obrigatórios.', 'error')
      return
    }
    try {
      setSalvando(true)
      await api.post(`/v1/pacientes/${id}/avaliacoes`, {
        ...form,
        sessoesPorSemana: form.sessoesPorSemana || 2,
      })
      showToast('Avaliação salva com sucesso!', 'success')
      setShowModal(false)
      setForm(FORM_INICIAL)
      carregarAvaliacoes()
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Erro ao salvar avaliação.'
      showToast(msg, 'error')
      console.error(err)
    } finally {
      setSalvando(false)
    }
  }

  const labelTipo = (t: string) => {
    switch (t) {
      case 'INICIAL': return 'Avaliação Inicial'
      case 'REAVALIACAO': return 'Reavaliação'
      default: return t
    }
  }

  const labelArea = (a: string) => {
    switch (a) {
      case 'REABILITACAO_AUDITIVA': return 'Reabilitação Auditiva'
      case 'TEA': return 'TEA'
      case 'FALA': return 'Fala'
      case 'LINGUAGEM': return 'Linguagem'
      default: return a
    }
  }

  const badgeColor = (tipo: string) => {
    return tipo === 'INICIAL'
      ? { bg: '#DBEAFE', color: '#1D4ED8' }
      : { bg: '#FEF3C7', color: '#92400E' }
  }

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
        <div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>
            {avaliacoes.length} avaliação{avaliacoes.length !== 1 ? 'ões' : ''} registrada{avaliacoes.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(FORM_INICIAL); setShowModal(true) }}>
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
            Clique em "Nova Avaliação" para registrar a primeira avaliação deste paciente.
          </div>
          <button className="btn btn-primary" onClick={() => { setForm(FORM_INICIAL); setShowModal(true) }}>
            + Nova Avaliação
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {avaliacoes.map(av => {
            const bc = badgeColor(av.tipoAvaliacao)
            const ac = areaColor(av.areaEspecialidade)
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
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: ac.bg, color: ac.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', flexShrink: 0,
                    }}>
                      📊
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
                        {labelTipo(av.tipoAvaliacao)} — {labelArea(av.areaEspecialidade)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                        {format(new Date(av.dataAvaliacao + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        {av.instrumentoAvaliacao ? ` · ${av.instrumentoAvaliacao}` : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 600,
                      background: bc.bg, color: bc.color,
                      borderRadius: '999px', padding: '3px 10px',
                    }}>
                      {labelTipo(av.tipoAvaliacao)}
                    </span>
                    <span style={{
                      fontSize: '11px', fontWeight: 600,
                      background: ac.bg, color: ac.color,
                      borderRadius: '999px', padding: '3px 10px',
                    }}>
                      {labelArea(av.areaEspecialidade)}
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

      {/* MODAL NOVA AVALIAÇÃO */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`}>
        <div className="modal" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="modal-header">
            <h2 className="modal-title">Nova Avaliação</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>

          <div style={{ padding: '24px' }}>
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label>Tipo de Avaliação *</label>
                <select className="form-control" value={form.tipoAvaliacao} onChange={e => setForm({ ...form, tipoAvaliacao: e.target.value })}>
                  <option value="INICIAL">Avaliação Inicial</option>
                  <option value="REAVALIACAO">Reavaliação</option>
                </select>
              </div>
              <div className="form-group">
                <label>Área / Especialidade *</label>
                <select className="form-control" value={form.areaEspecialidade} onChange={e => setForm({ ...form, areaEspecialidade: e.target.value })}>
                  <option value="REABILITACAO_AUDITIVA">Reabilitação Auditiva</option>
                  <option value="TEA">TEA</option>
                  <option value="FALA">Fala</option>
                  <option value="LINGUAGEM">Linguagem</option>
                </select>
              </div>
              <div className="form-group">
                <label>Data da Avaliação *</label>
                <input type="date" className="form-control" value={form.dataAvaliacao} onChange={e => setForm({ ...form, dataAvaliacao: e.target.value })} />
              </div>
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label>Instrumento de Avaliação</label>
                <input type="text" className="form-control" placeholder="Ex: PORTAGE, DENVER II, PROC..." value={form.instrumentoAvaliacao} onChange={e => setForm({ ...form, instrumentoAvaliacao: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Abordagem Terapêutica</label>
                <input type="text" className="form-control" placeholder="Ex: ABA, TEACCH, Aurioral..." value={form.abordagemTerapeutica} onChange={e => setForm({ ...form, abordagemTerapeutica: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label>Sessões por Semana</label>
              <input type="number" className="form-control" min="1" max="7" value={form.sessoesPorSemana} onChange={e => setForm({ ...form, sessoesPorSemana: parseInt(e.target.value) || 2 })} style={{ maxWidth: '120px' }} />
            </div>

            <div className="form-group">
              <label>Hipótese Diagnóstica</label>
              <textarea className="form-control" rows={3} placeholder="Descrição da hipótese diagnóstica..." value={form.hipoteseDiagnostica} onChange={e => setForm({ ...form, hipoteseDiagnostica: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Resultados</label>
              <textarea className="form-control" rows={3} placeholder="Resultados observados na avaliação..." value={form.resultados} onChange={e => setForm({ ...form, resultados: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Orientações à Família</label>
              <textarea className="form-control" rows={2} placeholder="Orientações fornecidas à família..." value={form.orientacoesFamilia} onChange={e => setForm({ ...form, orientacoesFamilia: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea className="form-control" rows={2} placeholder="Observações adicionais..." value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
            </div>

            <div className="form-actions" style={{ marginTop: '24px' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)} disabled={salvando}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSalvar} disabled={salvando}>
                {salvando ? 'Salvando...' : '✓ Salvar Avaliação'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DETALHES */}
      <div className={`modal-overlay ${showDetalhes ? 'active' : ''}`}>
        <div className="modal" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="modal-header">
            <h2 className="modal-title">Detalhes da Avaliação</h2>
            <button className="modal-close" onClick={() => setShowDetalhes(null)}>×</button>
          </div>

          {showDetalhes && (
            <div style={{ padding: '24px' }}>
              {/* Header badges */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
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

              {/* Info grid */}
              <div className="form-card" style={{ marginBottom: '16px' }}>
                <div className="form-section-title"><div className="section-icon" />Informações Gerais</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>Instrumento</label>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#111827' }}>{showDetalhes.instrumentoAvaliacao || '—'}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>Abordagem</label>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#111827' }}>{showDetalhes.abordagemTerapeutica || '—'}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>Sessões/Semana</label>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#111827' }}>{showDetalhes.sessoesPorSemana ?? '—'}x</p>
                  </div>
                </div>
              </div>

              {showDetalhes.hipoteseDiagnostica && (
                <div className="form-card" style={{ marginBottom: '16px' }}>
                  <div className="form-section-title"><div className="section-icon" />Hipótese Diagnóstica</div>
                  <p style={{ fontSize: '14px', color: '#374151', whiteSpace: 'pre-wrap', margin: 0 }}>{showDetalhes.hipoteseDiagnostica}</p>
                </div>
              )}

              {showDetalhes.resultados && (
                <div className="form-card" style={{ marginBottom: '16px' }}>
                  <div className="form-section-title"><div className="section-icon" />Resultados</div>
                  <p style={{ fontSize: '14px', color: '#374151', whiteSpace: 'pre-wrap', margin: 0 }}>{showDetalhes.resultados}</p>
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
                  <div className="form-section-title"><div className="section-icon" />Observações</div>
                  <p style={{ fontSize: '14px', color: '#374151', whiteSpace: 'pre-wrap', margin: 0 }}>{showDetalhes.observacoes}</p>
                </div>
              )}

              <div className="form-actions">
                <button className="btn btn-outline" onClick={() => setShowDetalhes(null)}>Fechar</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
        {toast.msg}
      </div>
    </div>
  )
}
