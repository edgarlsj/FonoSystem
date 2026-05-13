import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'
import PacienteAcoesMenu from '../components/PacienteAcoesMenu'
import { useInTab } from '../context/TabContext'

const schema = z.object({
  dataPrescricao: z.string().min(1, 'Data é obrigatória'),
  titulo: z.string().min(3, 'Mínimo 3 caracteres'),
  descricaoExercicios: z.string().optional(),
  observacoes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface PrescricaoData {
  id: number
  pacienteNome: string
  pacienteId: number
  profissionalNome: string
  dataPrescricao: string
  titulo: string
  descricaoExercicios: string
  observacoes: string | null
  createdAt: string
}

export default function PacientePrescricoes() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const inTab = useInTab()
  const [prescricoes, setPrescricoes] = useState<PrescricaoData[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pacienteNome, setPacienteNome] = useState('')
  const [detalhes, setDetalhes] = useState<PrescricaoData | null>(null)
  const [editando, setEditando] = useState<PrescricaoData | null>(null)
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false, msg: '', type: 'success'
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dataPrescricao: format(new Date(), 'yyyy-MM-dd'),
    }
  })

  useEffect(() => {
    carregarPrescricoes()
    carregarPaciente()
  }, [id])

  const carregarPrescricoes = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/v1/pacientes/${id}/prescricoes`)
      setPrescricoes(data || [])
    } catch {
      setPrescricoes([])
    } finally {
      setLoading(false)
    }
  }

  const carregarPaciente = async () => {
    try {
      const { data } = await api.get(`/v1/pacientes/${id}`)
      setPacienteNome(data.nomeCompleto)
    } catch {
      setPacienteNome('')
    }
  }

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
  }

  const abrirEditar = (prescricao: PrescricaoData) => {
    setEditando(prescricao)
    reset({
      dataPrescricao: prescricao.dataPrescricao,
      titulo: prescricao.titulo,
      descricaoExercicios: prescricao.descricaoExercicios,
      observacoes: prescricao.observacoes || '',
    })
    setIsModalOpen(true)
  }

  const abrirNovaPrescrição = () => {
    setEditando(null)
    reset({ dataPrescricao: format(new Date(), 'yyyy-MM-dd') })
    setIsModalOpen(true)
  }

  const fecharModal = () => {
    setIsModalOpen(false)
    setEditando(null)
    reset({ dataPrescricao: format(new Date(), 'yyyy-MM-dd') })
  }

  const onSubmit = async (formData: FormData) => {
    try {
      setSaving(true)
      if (editando) {
        await api.put(`/v1/prescricoes/${editando.id}`, formData)
        showToast('Prescrição atualizada com sucesso!', 'success')
      } else {
        await api.post(`/v1/pacientes/${id}/prescricoes`, formData)
        showToast('Prescrição criada com sucesso!', 'success')
      }
      setIsModalOpen(false)
      setEditando(null)
      reset({ dataPrescricao: format(new Date(), 'yyyy-MM-dd') })
      carregarPrescricoes()
    } catch {
      showToast(`Erro ao ${editando ? 'atualizar' : 'criar'} prescrição.`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPdf = async (prescricaoId: number, nomePaciente: string, dataPrescricao: string) => {
    try {
      const response = await api.get(`/v1/prescricoes/${prescricaoId}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `prescricao_${nomePaciente}_${dataPrescricao}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showToast('PDF baixado com sucesso!', 'success')
    } catch {
      showToast('Erro ao gerar PDF.', 'error')
    }
  }

  const handlePrintPdf = async (prescricaoId: number) => {
    try {
      const response = await api.get(`/v1/prescricoes/${prescricaoId}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const printWindow = window.open(url)
      if (printWindow) {
        printWindow.addEventListener('load', () => printWindow.print())
      }
    } catch {
      showToast('Erro ao preparar impressão.', 'error')
    }
  }

  return (
    <div>
      {!inTab && (
        <>
          <div className="breadcrumb">
            <a onClick={() => navigate('/pacientes')}>Pacientes</a>
            <span>›</span>
            {pacienteNome || '...'}
            <span>›</span>
            Prescrição
          </div>

          <div className="page-header">
            <div>
              <div className="page-title">Prescrição</div>
              <div className="page-subtitle">{pacienteNome || 'Carregando...'}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <PacienteAcoesMenu pacienteId={id!} paginaAtual="prescricoes" />
              <button className="btn btn-primary" onClick={abrirNovaPrescrição}>
                + Nova Prescrição
              </button>
            </div>
          </div>
        </>
      )}

      {inTab && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button className="btn btn-primary" onClick={abrirNovaPrescrição}>
            + Nova Prescrição
          </button>
        </div>
      )}

      {/* LISTA */}
      {loading ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
          Carregando...
        </div>
      ) : prescricoes.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.4 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <p style={{ fontWeight: 500, color: '#6B7280' }}>Nenhuma prescrição registrada</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Clique em "+ Nova Prescrição" para começar</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {prescricoes.map((p) => (
            <div key={p.id} style={{
              background: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              padding: '20px',
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-start',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.15s',
            }}>
              {/* Badge de data */}
              <div style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                padding: '10px 14px',
                textAlign: 'center',
                minWidth: '56px',
                flexShrink: 0,
              }}>
                <div style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1, color: '#1D4ED8' }}>
                  {format(new Date(p.dataPrescricao + 'T00:00:00'), 'dd')}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#3B82F6', textTransform: 'uppercase', marginTop: '2px' }}>
                  {format(new Date(p.dataPrescricao + 'T00:00:00'), 'MMM', { locale: ptBR })}
                </div>
                <div style={{ fontSize: '11px', color: '#93C5FD', marginTop: '1px' }}>
                  {format(new Date(p.dataPrescricao + 'T00:00:00'), 'yyyy')}
                </div>
              </div>

              {/* Conteúdo */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#111827', marginBottom: '6px' }}>
                  {p.titulo}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#6B7280',
                  lineHeight: '1.6',
                  marginBottom: '10px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden',
                }}>
                  {p.descricaoExercicios}
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    {p.profissionalNome}
                  </span>
                  {p.observacoes && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#059669',
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: '999px',
                      padding: '2px 8px',
                    }}>
                      Com observações
                    </span>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  className="btn-icon-primary"
                  title="Visualizar"
                  onClick={() => setDetalhes(p)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button
                  className="btn-icon-primary"
                  title="Editar"
                  onClick={() => abrirEditar(p)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  className="btn-icon-success"
                  title="Baixar PDF"
                  onClick={() => handleDownloadPdf(p.id, p.pacienteNome, p.dataPrescricao)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
                <button
                  className="btn-icon-secondary"
                  title="Imprimir"
                  onClick={() => handlePrintPdf(p.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"/>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                    <rect x="6" y="14" width="12" height="8"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}

          <div className="add-session-card" onClick={abrirNovaPrescrição}>
            <div className="add-session-icon">＋</div>
            <div className="add-session-text">Nova prescrição</div>
          </div>
        </div>
      )}

      {/* MODAL CRIAR / EDITAR */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`}>
        <div className="modal" style={{ maxWidth: '640px' }}>
          <div className="modal-header">
            <div>
              <h2 className="modal-title">{editando ? 'Editar Prescrição' : 'Nova Prescrição'}</h2>
              {editando && (
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                  {editando.pacienteNome} · {format(new Date(editando.dataPrescricao + 'T00:00:00'), "dd 'de' MMMM yyyy", { locale: ptBR })}
                </div>
              )}
            </div>
            <button className="modal-close" onClick={fecharModal}>×</button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid" style={{ padding: '0 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Data</label>
                  <input
                    type="date"
                    className={`form-control ${errors.dataPrescricao ? 'error' : ''}`}
                    {...register('dataPrescricao')}
                  />
                  {errors.dataPrescricao && (
                    <span className="hint" style={{ color: 'red' }}>{errors.dataPrescricao.message}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Título</label>
                  <input
                    className={`form-control ${errors.titulo ? 'error' : ''}`}
                    placeholder="Ex: Higiene oral pós-alimentação"
                    {...register('titulo')}
                  />
                  {errors.titulo && (
                    <span className="hint" style={{ color: 'red' }}>{errors.titulo.message}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Conteúdo da Prescrição</label>
                <textarea
                  className="form-control"
                  rows={9}
                  placeholder="Descreva as orientações, frequência, procedimentos e cuidados..."
                  style={{ resize: 'vertical', lineHeight: '1.7' }}
                  {...register('descricaoExercicios')}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Observações
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>(opcional)</span>
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Orientações complementares, frequência recomendada, cuidados especiais..."
                  {...register('observacoes')}
                />
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '24px' }}>
              <button type="button" className="btn btn-outline" onClick={fecharModal}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : editando ? 'Atualizar' : 'Salvar Prescrição'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL VISUALIZAÇÃO */}
      <div className={`modal-overlay ${detalhes ? 'active' : ''}`}>
        <div className="modal" style={{ maxWidth: '680px' }}>
          <div className="modal-header" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <div>
              <h2 className="modal-title">Prescrição</h2>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                {detalhes?.pacienteNome}
              </div>
            </div>
            <button className="modal-close" onClick={() => setDetalhes(null)}>×</button>
          </div>

          {detalhes && (
            <div>
              {/* Cabeçalho do documento */}
              <div style={{
                padding: '20px 24px',
                background: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
              }}>
                <div style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'center',
                  minWidth: '56px',
                  flexShrink: 0,
                }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1, color: '#1D4ED8' }}>
                    {format(new Date(detalhes.dataPrescricao + 'T00:00:00'), 'dd')}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#3B82F6', textTransform: 'uppercase', marginTop: '2px' }}>
                    {format(new Date(detalhes.dataPrescricao + 'T00:00:00'), 'MMM', { locale: ptBR })}
                  </div>
                  <div style={{ fontSize: '11px', color: '#93C5FD', marginTop: '1px' }}>
                    {format(new Date(detalhes.dataPrescricao + 'T00:00:00'), 'yyyy')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{detalhes.titulo}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                    Emitida por {detalhes.profissionalNome}
                  </div>
                </div>
              </div>

              {/* Conteúdo */}
              <div style={{ padding: '24px' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '10px',
                }}>
                  Conteúdo
                </div>
                <div style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.8',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {detalhes.descricaoExercicios}
                </div>

                {detalhes.observacoes && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '10px',
                    }}>
                      Observações
                    </div>
                    <div style={{
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      fontSize: '13px',
                      color: '#92400E',
                      lineHeight: '1.7',
                    }}>
                      {detalhes.observacoes}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions" style={{ borderTop: '1px solid #F3F4F6' }}>
                <button className="btn btn-outline" onClick={() => setDetalhes(null)}>Fechar</button>
                <button className="btn btn-outline" onClick={() => { setDetalhes(null); abrirEditar(detalhes) }}>
                  Editar
                </button>
                <button className="btn btn-outline" onClick={() => handleDownloadPdf(detalhes.id, detalhes.pacienteNome, detalhes.dataPrescricao)}>
                  Baixar PDF
                </button>
                <button className="btn btn-primary" onClick={() => handlePrintPdf(detalhes.id)}>
                  Imprimir
                </button>
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
