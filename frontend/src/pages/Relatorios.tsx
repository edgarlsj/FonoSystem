import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '../services/api'

// Esquema de validação
const schema = z.object({
  pacienteId: z.string().min(1, 'Paciente é obrigatório'),
  dataSessao: z.string().min(1, 'Data é obrigatória'),
  horaInicio: z.string().min(1, 'Hora início é obrigatória'),
  horaFim: z.string().min(1, 'Hora fim é obrigatória'),
  atividadesRealizadas: z.string().min(3, 'Mínimo 3 caracteres'),
  metaTrabalhada: z.string().min(3, 'Mínimo 3 caracteres'),
  percentualAcerto: z.string().optional(),
  nivelEngajamento: z.string().optional(),
  evolucaoObservada: z.string().optional(),
  orientacoesFamilia: z.string().optional(),
  planejamentoProximaSessao: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function Relatorios() {
  const [data, setData] = useState(new Date())
  const [relatorios, setRelatorios] = useState<any[]>([])
  const [pacientes, setPacientes] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ show: boolean, msg: string, type: 'success' | 'error' }>({
    show: false, msg: '', type: 'success'
  })
  const [relatorioVisualizar, setRelatorioVisualizar] = useState<any | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dataSessao: format(new Date(), 'yyyy-MM-dd'),
      horaInicio: '08:00',
      horaFim: '09:00'
    }
  })

  useEffect(() => {
    carregarRelatorios()
  }, [data])

  useEffect(() => {
    if (isModalOpen) {
      carregarPacientes()
    }
  }, [isModalOpen])

  const carregarRelatorios = async () => {
    try {
      const dataStr = format(data, 'yyyy-MM-dd')
      const { data: resp } = await api.get(`/v1/relatorios?data=${dataStr}`)
      setRelatorios(resp || [])
    } catch {
      setRelatorios([])
    }
  }

  const carregarPacientes = async () => {
    try {
      const { data: resp } = await api.get('/v1/pacientes?size=100&status=ATIVO')
      setPacientes(resp.content || [])
    } catch (err) {
      console.error('Erro ao carregar pacientes', err)
    }
  }

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
  }

  const onSubmit = async (formData: FormData) => {
    try {
      setLoading(true)
      const payload = {
        ...formData,
        pacienteId: Number(formData.pacienteId),
        percentualAcerto: formData.percentualAcerto ? Number(formData.percentualAcerto) : null,
        nivelEngajamento: formData.nivelEngajamento ? Number(formData.nivelEngajamento) : null,
      }
      
      await api.post(`/v1/pacientes/${payload.pacienteId}/relatorios`, payload)
      
      showToast('Sessão registrada com sucesso!', 'success')
      setIsModalOpen(false)
      reset()
      carregarRelatorios()
    } catch (err) {
      showToast('Erro ao registrar sessão. Verifique os dados.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVisualizar = async (id: number) => {
    try {
      setLoading(true)
      const { data } = await api.get(`/v1/relatorios/${id}`)
      setRelatorioVisualizar(data)
    } catch (err) {
      showToast('Erro ao carregar detalhes do relatório.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const mudarData = (delta: number) => {
    const nova = new Date(data)
    nova.setDate(nova.getDate() + delta)
    setData(nova)
  }

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      setLoading(true)
      await api.delete(`/v1/relatorios/${id}`)
      showToast('Sessão excluída com sucesso!', 'success')
      carregarRelatorios()
    } catch (err) {
      showToast('Erro ao excluir sessão.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Relatório Diário</div>
          <div className="page-subtitle">Registre as sessões do dia</div>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Registrar Sessão
        </button>
      </div>

      <div className="rel-header">
        <div className="rel-date-nav">
          <button onClick={() => mudarData(-1)}>‹</button>
          <span className="current-date">
            {format(data, "EEEE, dd MMM yyyy", { locale: ptBR })}
          </span>
          <button onClick={() => mudarData(1)}>›</button>
        </div>
      </div>

      <div className="session-list">
        {relatorios.length === 0 ? (
          <div className="form-card" style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
            <p>Nenhuma sessão registrada para esta data</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Clique em "+ Registrar Sessão" para começar</p>
          </div>
        ) : (
          relatorios.map((rel: any) => (
            <div className={`session-card ${rel.atividadesRealizadas?.toLowerCase().includes('tea') ? 'tea' : ''}`} key={rel.id}>
              <div className="session-card-header">
                <div>
                  <div className="session-patient">{rel.pacienteNome}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="session-time">{rel.horaInicio} – {rel.horaFim}</div>
                  <button 
                    className="btn-icon-secondary" 
                    title="Visualizar detalhes"
                    onClick={() => handleVisualizar(rel.id)}
                    disabled={loading}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button 
                    className="btn-icon-danger" 
                    title="Excluir sessão"
                    onClick={() => handleExcluir(rel.id)}
                    disabled={loading}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="session-body">
                <strong>Meta:</strong> {rel.metaTrabalhada}<br/>
                <strong>Atividades:</strong> {rel.atividadesRealizadas}<br/>
                {rel.evolucaoObservada && <><strong>Evolução:</strong> {rel.evolucaoObservada}<br/></>}
              </div>
            </div>
          ))
        )}

        <div className="add-session-card" onClick={() => setIsModalOpen(true)}>
          <div className="add-session-icon">＋</div>
          <div className="add-session-text">Registrar nova sessão do dia</div>
        </div>
      </div>

      {/* MODAL DE CRIAÇÃO */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`}>
        <div className="modal" style={{ maxWidth: '600px' }}>
          <div className="modal-header">
            <h2 className="modal-title">Registrar Sessão</h2>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid">
              <div className="form-group">
                <label>Paciente</label>
                <select className={`form-control ${errors.pacienteId ? 'error' : ''}`} {...register('pacienteId')}>
                  <option value="">Selecione o paciente...</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>{p.nomeCompleto}</option>
                  ))}
                </select>
                {errors.pacienteId && <span className="hint" style={{ color: 'red' }}>{errors.pacienteId.message}</span>}
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Data</label>
                  <input type="date" className="form-control" {...register('dataSessao')} />
                </div>
                <div className="form-group">
                  <label>Início</label>
                  <input type="time" className="form-control" {...register('horaInicio')} />
                </div>
                <div className="form-group">
                  <label>Fim</label>
                  <input type="time" className="form-control" {...register('horaFim')} />
                </div>
              </div>

              <div className="form-group">
                <label>Meta Trabalhada</label>
                <input className="form-control" placeholder="Ex: Contato visual, Fonação..." {...register('metaTrabalhada')} />
                {errors.metaTrabalhada && <span className="hint" style={{ color: 'red' }}>{errors.metaTrabalhada.message}</span>}
              </div>

              <div className="form-group">
                <label>Atividades Realizadas</label>
                <textarea className="form-control" rows={3} {...register('atividadesRealizadas')} />
                {errors.atividadesRealizadas && <span className="hint" style={{ color: 'red' }}>{errors.atividadesRealizadas.message}</span>}
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>% de Acerto (TEA)</label>
                  <input type="number" step="0.1" className="form-control" {...register('percentualAcerto')} />
                </div>
                <div className="form-group">
                  <label>Engajamento (1-5)</label>
                  <select className="form-control" {...register('nivelEngajamento')}>
                    <option value="">N/A</option>
                    {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Evolução Observada</label>
                <textarea className="form-control" rows={2} {...register('evolucaoObservada')} />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Orientações à Família</label>
                  <textarea className="form-control" rows={2} placeholder="Sugestões de estímulo em casa..." {...register('orientacoesFamilia')} />
                </div>
                <div className="form-group">
                  <label>Planejamento Próxima Sessão</label>
                  <textarea className="form-control" rows={2} placeholder="O que será trabalhado na próxima sessão..." {...register('planejamentoProximaSessao')} />
                </div>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '24px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Sessão'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL DE VISUALIZAÇÃO */}
      <div className={`modal-overlay ${relatorioVisualizar ? 'active' : ''}`}>
        <div className="modal" style={{ maxWidth: '700px' }}>
          <div className="modal-header">
            <h2 className="modal-title">Detalhes da Sessão</h2>
            <button className="modal-close" onClick={() => setRelatorioVisualizar(null)}>×</button>
          </div>

          {relatorioVisualizar && (
            <div className="view-details">
              <div className="session-card-header" style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div className="session-patient" style={{ fontSize: '20px' }}>{relatorioVisualizar.pacienteNome}</div>
                  <div className="page-subtitle">Sessão em {format(new Date(relatorioVisualizar.dataSessao + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</div>
                </div>
                <div className="session-time" style={{ fontSize: '14px', padding: '6px 16px' }}>
                  {relatorioVisualizar.horaInicio} – {relatorioVisualizar.horaFim}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-card">
                  <div className="form-section-title"><div className="section-icon" />Objetivos e Atividades</div>
                  <div className="view-group">
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Meta Trabalhada</label>
                    <p style={{ margin: '4px 0 16px', fontSize: '14px', color: 'var(--gray-800)' }}>{relatorioVisualizar.metaTrabalhada}</p>
                    
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Atividades Realizadas</label>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--gray-800)', whiteSpace: 'pre-wrap' }}>{relatorioVisualizar.atividadesRealizadas}</p>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-card">
                    <div className="form-section-title"><div className="section-icon" />Desempenho</div>
                    <div className="session-metrics" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <div className="metric-label">Acerto</div>
                        <div className={`metric-value ${Number(relatorioVisualizar.percentualAcerto) >= 70 ? 'green' : 'blue'}`}>
                          {relatorioVisualizar.percentualAcerto != null ? `${relatorioVisualizar.percentualAcerto}%` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="metric-label">Engajamento</div>
                        <div className="engagement-dots" style={{ marginTop: '8px' }}>
                           {[1, 2, 3, 4, 5].map(v => (
                             <div key={v} className={`dot ${v <= (relatorioVisualizar.nivelEngajamento || 0) ? 'filled' : ''}`} />
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-card">
                    <div className="form-section-title"><div className="section-icon" />Comunicação Auxiliar</div>
                    <div className="view-group">
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)' }}>USO DE CAA</label>
                      <p style={{ margin: '4px 0', fontWeight: 600 }}>{relatorioVisualizar.usoCaaSessao ? '✅ Sim' : '❌ Não'}</p>
                      {relatorioVisualizar.recursoCaaUtilizado && (
                        <p style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Recurso: {relatorioVisualizar.recursoCaaUtilizado}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-card">
                  <div className="form-section-title"><div className="section-icon" />Evolução e Observações</div>
                  <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)' }}>EVOLUÇÃO OBSERVADA</label>
                      <p style={{ marginTop: '4px', fontSize: '13px' }}>{relatorioVisualizar.evolucaoObservada || 'Sem registros'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-500)' }}>INTERCORRÊNCIAS</label>
                      <p style={{ marginTop: '4px', fontSize: '13px' }}>{relatorioVisualizar.intercorrencias || 'Nenhuma intercorrência'}</p>
                    </div>
                  </div>
                </div>

                <div className="form-card section-auditiva">
                   <div className="form-section-title"><div className="section-icon" />Orientações e Próxima Sessão</div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--aud-600)' }}>ORIENTAÇÕES À FAMÍLIA</label>
                        <p style={{ marginTop: '4px', fontSize: '13px' }}>{relatorioVisualizar.orientacoesFamilia || 'Sem orientações específicas.'}</p>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--aud-600)' }}>PLANEJAMENTO PRÓXIMA SESSÃO</label>
                        <p style={{ marginTop: '4px', fontSize: '13px' }}>{relatorioVisualizar.planejamentoProximaSessao || 'A definir.'}</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" onClick={() => setRelatorioVisualizar(null)}>Fechar Visualização</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
        {toast.msg}
      </div>
    </div>
  )
}
