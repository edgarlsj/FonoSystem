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

  const handleDownloadPdf = async (prescricaoId: number, pacienteNome: string, dataPrescricao: string) => {
    try {
      const response = await api.get(`/v1/prescricoes/${prescricaoId}/pdf`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      const fileName = `prescricao_${pacienteNome}_${dataPrescricao}.pdf`
      link.setAttribute('download', fileName)
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
      const response = await api.get(`/v1/prescricoes/${prescricaoId}/pdf`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const printWindow = window.open(url)
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print()
        })
      }
    } catch {
      showToast('Erro ao preparar impressão.', 'error')
    }
  }

  return (
    <div>
      {!inTab && (
        <>
          {/* BREADCRUMB */}
          <div className="breadcrumb">
            <a onClick={() => navigate('/pacientes')}>Pacientes</a>
            <span>›</span>
            {pacienteNome || '...'}
            <span>›</span>
            Prescrições
          </div>

          {/* HEADER */}
          <div className="page-header">
            <div>
              <div className="page-title">📋 Prescrições</div>
              <div className="page-subtitle">
                {pacienteNome || 'Carregando...'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <PacienteAcoesMenu pacienteId={id!} paginaAtual="prescricoes" />
              <button className="btn btn-primary" onClick={() => abrirNovaPrescrição()}>
                + Nova Prescrição
              </button>
            </div>
          </div>
        </>
      )}

      {inTab && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button className="btn btn-primary" onClick={() => abrirNovaPrescrição()}>
            + Nova Prescrição
          </button>
        </div>
      )}

      {/* LISTA DE PRESCRIÇÕES */}
      <div className="prescricao-list">
        {loading ? (
          <div className="form-card" style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
            Carregando prescrições...
          </div>
        ) : prescricoes.length === 0 ? (
          <div className="form-card" style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
            <p>Nenhuma prescrição registrada para este paciente</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Clique em "+ Nova Prescrição" para começar</p>
          </div>
        ) : (
          prescricoes.map((p) => (
            <div className="prescricao-card" key={p.id}>
              <div className="prescricao-card-header">
                <div>
                  <div className="prescricao-titulo">{p.titulo}</div>
                  <div className="prescricao-meta">
                    <span className="prescricao-date">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {format(new Date(p.dataPrescricao + 'T00:00:00'), "dd 'de' MMM yyyy", { locale: ptBR })}
                    </span>
                    <span className="prescricao-profissional">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      {p.profissionalNome}
                    </span>
                  </div>
                </div>
                <div className="prescricao-actions">
                  <button
                    className="btn-icon-primary"
                    title="Visualizar detalhes"
                    onClick={() => setDetalhes(p)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button
                    className="btn-icon-primary"
                    title="Editar prescrição"
                    onClick={() => abrirEditar(p)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    className="btn-icon-success"
                    title="Baixar PDF"
                    onClick={() => handleDownloadPdf(p.id, p.pacienteNome, p.dataPrescricao)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </button>
                  <button
                    className="btn-icon-secondary"
                    title="Imprimir"
                    onClick={() => handlePrintPdf(p.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9"></polyline>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="prescricao-body">
                <div className="prescricao-descricao">
                  {p.descricaoExercicios.length > 180
                    ? p.descricaoExercicios.substring(0, 180) + '...'
                    : p.descricaoExercicios}
                </div>
                {p.observacoes && (
                  <div className="prescricao-obs-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    Com observações
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div className="add-session-card" onClick={() => setIsModalOpen(true)}>
          <div className="add-session-icon">＋</div>
          <div className="add-session-text">Criar nova prescrição</div>
        </div>
      </div>

      {/* MODAL DE CRIAÇÃO */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`}>
        <div className="modal" style={{ maxWidth: '650px' }}>
          <div className="modal-header">
            <h2 className="modal-title">{editando ? 'Editar Prescrição' : 'Nova Prescrição'}</h2>
            <button className="modal-close" onClick={() => fecharModal()}>×</button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid">
              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Data da Prescrição</label>
                  <input type="date" className={`form-control ${errors.dataPrescricao ? 'error' : ''}`} {...register('dataPrescricao')} />
                  {errors.dataPrescricao && <span className="hint" style={{ color: 'red' }}>{errors.dataPrescricao.message}</span>}
                </div>
                <div className="form-group">
                  <label>Título</label>
                  <input className={`form-control ${errors.titulo ? 'error' : ''}`}
                    placeholder="Ex: Exercícios de motricidade oral"
                    {...register('titulo')} />
                  {errors.titulo && <span className="hint" style={{ color: 'red' }}>{errors.titulo.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Descrição da Prescrição</label>
                <textarea
                  className={`form-control ${errors.descricaoExercicios ? 'error' : ''}`}
                  rows={8}
                  placeholder="Descreva a prescrição e orientações..."
                  {...register('descricaoExercicios')}
                />
                {errors.descricaoExercicios && <span className="hint" style={{ color: 'red' }}>{errors.descricaoExercicios.message}</span>}
              </div>

              <div className="form-group">
                <label>Observações (opcional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Orientações adicionais para a família, frequência recomendada, etc."
                  {...register('observacoes')}
                />
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '24px' }}>
              <button type="button" className="btn btn-outline" onClick={() => fecharModal()}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : `${editando ? 'Atualizar' : 'Salvar'} Prescrição`}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL DE VISUALIZAÇÃO */}
      <div className={`modal-overlay ${detalhes ? 'active' : ''}`}>
        <div className="modal" style={{ maxWidth: '700px' }}>
          <div className="modal-header">
            <h2 className="modal-title">Detalhes da Prescrição</h2>
            <button className="modal-close" onClick={() => setDetalhes(null)}>×</button>
          </div>

          {detalhes && (
            <div className="view-details">
              {/* Header com info */}
              <div className="session-card-header" style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div className="session-patient" style={{ fontSize: '20px' }}>{detalhes.pacienteNome}</div>
                  <div className="page-subtitle">
                    Prescrição em {format(new Date(detalhes.dataPrescricao + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                  <div className="page-subtitle" style={{ marginTop: '2px' }}>
                    Profissional: {detalhes.profissionalNome}
                  </div>
                </div>
              </div>

              <div className="form-grid">
                {/* Título */}
                <div className="form-card" style={{ borderLeft: '4px solid var(--primary-500)' }}>
                  <div className="form-section-title"><div className="section-icon" />Título</div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)' }}>{detalhes.titulo}</p>
                </div>

                {/* Descrição da Prescrição */}
                <div className="form-card">
                  <div className="form-section-title"><div className="section-icon" />Descrição da Prescrição</div>
                  <pre style={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    color: 'var(--gray-700)',
                    lineHeight: '1.8',
                    margin: 0,
                    background: 'var(--gray-50)',
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {detalhes.descricaoExercicios}
                  </pre>
                </div>

                {/* Observações */}
                {detalhes.observacoes && (
                  <div className="form-card section-auditiva">
                    <div className="form-section-title"><div className="section-icon" />Observações</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-700)', lineHeight: '1.7' }}>
                      {detalhes.observacoes}
                    </p>
                  </div>
                )}
              </div>

              <div className="form-actions" style={{ gap: '10px' }}>
                <button className="btn btn-outline" onClick={() => setDetalhes(null)}>Fechar</button>
                <button className="btn btn-success" onClick={() => handleDownloadPdf(detalhes.id, detalhes.pacienteNome, detalhes.dataPrescricao)}>
                  📥 Baixar PDF
                </button>
                <button className="btn btn-primary" onClick={() => handlePrintPdf(detalhes.id)}>
                  🖨 Imprimir
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
