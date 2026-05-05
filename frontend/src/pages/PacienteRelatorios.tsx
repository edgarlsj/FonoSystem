import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'
import PacienteAcoesMenu from '../components/PacienteAcoesMenu'
import { useInTab } from '../context/TabContext'
import FolhaEvolucao from './FolhaEvolucao'

export default function PacienteRelatorios() {
  const { id } = useParams()
  const navigate = useNavigate()
  const inTab = useInTab()
  const [paciente, setPaciente] = useState<any>(null)
  const [relatorios, setRelatorios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [relatorioVisualizar, setRelatorioVisualizar] = useState<any | null>(null)
  const [relatorioEditando, setRelatorioEditando] = useState<any | null>(null)

  // Filtros
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [termoBusca, setTermoBusca] = useState('')

  // Toast
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false, msg: '', type: 'success'
  })

  // Templates
  const [templates, setTemplates] = useState<any[]>([])
  const [mostrarTemplates, setMostrarTemplates] = useState(false)
  const [nomeTemplate, setNomeTemplate] = useState('')
  const [mostrarSalvarTemplate, setMostrarSalvarTemplate] = useState(false)
  const [salvandoTemplate, setSalvandoTemplate] = useState(false)

  // Folha de Evolução
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set())
  const [modoSelecao, setModoSelecao] = useState(false)
  const [mostrandoFolhaEvolucao, setMostrandoFolhaEvolucao] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [id, dataInicio, dataFim])

  useEffect(() => {
    if (relatorioEditando) {
      carregarTemplates()
    }
  }, [relatorioEditando])

  const carregarDados = async () => {
    try {
      setLoading(true)
      
      // Carrega dados do paciente apenas na primeira vez ou se mudar ID
      if (!paciente) {
        const pacRes = await api.get(`/v1/pacientes/${id}`)
        setPaciente(pacRes.data)
      }

      // Se houver datas, usa o endpoint de evolução (filtro por data)
      // Caso contrário, carrega todos
      let url = `/v1/pacientes/${id}/relatorios`
      if (dataInicio && dataFim) {
        url = `/v1/pacientes/${id}/evolucao?inicio=${dataInicio}&fim=${dataFim}`
      }

      const { data } = await api.get(url)
      setRelatorios(data || [])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  const limparFiltros = () => {
    setDataInicio('')
    setDataFim('')
    setTermoBusca('')
  }

  const toggleSelecionado = (relatorioId: number) => {
    const novo = new Set(selecionados)
    if (novo.has(relatorioId)) {
      novo.delete(relatorioId)
    } else {
      novo.add(relatorioId)
    }
    setSelecionados(novo)
    if (novo.size === 0) {
      setModoSelecao(false)
    }
  }

  const gerarDadosAgrupados = () => {
    const agrupado = new Map<string, any[]>()
    const pacienteNome = paciente?.nomeCompleto || 'Paciente'

    relatoriosFiltrados.forEach(rel => {
      if (selecionados.has(rel.id)) {
        if (!agrupado.has(pacienteNome)) {
          agrupado.set(pacienteNome, [])
        }
        agrupado.get(pacienteNome)!.push(rel)
      }
    })

    agrupado.forEach(relats => {
      relats.sort((a, b) =>
        new Date(a.dataSessao).getTime() - new Date(b.dataSessao).getTime()
      )
    })

    return new Map([...agrupado.entries()].sort())
  }

  const relatoriosFiltrados = relatorios.filter(rel => {
    if (!termoBusca) return true
    const busca = termoBusca.toLowerCase()
    return (
      rel.metaTrabalhada?.toLowerCase().includes(busca) ||
      rel.atividadesRealizadas?.toLowerCase().includes(busca) ||
      rel.evolucaoObservada?.toLowerCase().includes(busca)
    )
  })

  const carregarTemplates = async () => {
    try {
      const { data } = await api.get('/v1/templates-relatorio')
      setTemplates(data)
    } catch (err) {
      console.error('Erro ao carregar templates:', err)
    }
  }

  const aplicarTemplate = (template: any) => {
    if (!relatorioEditando) return
    setRelatorioEditando({
      ...relatorioEditando,
      metaTrabalhada: template.metaTrabalhada || '',
      atividadesRealizadas: template.atividadesRealizadas || '',
      evolucaoObservada: template.evolucaoObservada || '',
      orientacoesFamilia: template.orientacoesFamilia || '',
      planejamentoProximaSessao: template.planejamentoProximaSessao || '',
    })
    setMostrarTemplates(false)
    showToast(`Template "${template.nome}" aplicado com sucesso!`, 'success')
  }

  const salvarTemplate = async () => {
    if (!nomeTemplate.trim() || !relatorioEditando) return

    try {
      setSalvandoTemplate(true)
      await api.post('/v1/templates-relatorio', {
        nome: nomeTemplate,
        metaTrabalhada: relatorioEditando.metaTrabalhada,
        atividadesRealizadas: relatorioEditando.atividadesRealizadas,
        evolucaoObservada: relatorioEditando.evolucaoObservada,
        orientacoesFamilia: relatorioEditando.orientacoesFamilia,
        planejamentoProximaSessao: relatorioEditando.planejamentoProximaSessao,
      })
      showToast(`Template "${nomeTemplate}" salvo com sucesso!`, 'success')
      setNomeTemplate('')
      setMostrarSalvarTemplate(false)
      carregarTemplates()
    } catch (err) {
      showToast('Erro ao salvar template', 'error')
      console.error('Erro:', err)
    } finally {
      setSalvandoTemplate(false)
    }
  }

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
  }

  const handleVisualizar = async (relId: number) => {
    try {
      setLoading(true)
      const { data } = await api.get(`/v1/relatorios/${relId}`)
      setRelatorioVisualizar(data)
    } catch (err) {
      console.error('Erro ao carregar detalhes do relatório:', err)
    } finally {
      setLoading(false)
    }
  }

  const abrirEditar = (rel: any) => {
    setRelatorioEditando(rel)
    setRelatorioVisualizar(null)
  }

  const fecharEditar = () => {
    setRelatorioEditando(null)
  }

  const isFutureDate = (dateStr: string): boolean => {
    const sessaoDate = new Date(dateStr + 'T00:00:00').getTime()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return sessaoDate > today.getTime()
  }

  const handleAtualizar = async () => {
    if (!relatorioEditando) return

    if (isFutureDate(relatorioEditando.dataSessao)) {
      const confirmacao = window.confirm(
        'A data da sessão é futura. Deseja continuar mesmo assim?'
      )
      if (!confirmacao) return
    }

    try {
      setSalvando(true)
      await api.put(`/v1/relatorios/${relatorioEditando.id}`, {
        pacienteId: Number(id),
        dataSessao: relatorioEditando.dataSessao,
        horaInicio: relatorioEditando.horaInicio,
        horaFim: relatorioEditando.horaFim,
        atividadesRealizadas: relatorioEditando.atividadesRealizadas,
        metaTrabalhada: relatorioEditando.metaTrabalhada,
        usoCaaSessao: relatorioEditando.usoCaaSessao,
        recursoCaaUtilizado: relatorioEditando.recursoCaaUtilizado,
        respostaEstimulacaoAuditiva: relatorioEditando.respostaEstimulacaoAuditiva,
        evolucaoObservada: relatorioEditando.evolucaoObservada,
        intercorrencias: relatorioEditando.intercorrencias,
        orientacoesFamilia: relatorioEditando.orientacoesFamilia,
        planejamentoProximaSessao: relatorioEditando.planejamentoProximaSessao,
      })
      showToast('Relatório atualizado com sucesso!', 'success')
      fecharEditar()
      carregarDados()
    } catch (err: any) {
      showToast('Erro ao atualizar relatório', 'error')
      console.error('Erro ao atualizar:', err)
    } finally {
      setSalvando(false)
    }
  }

  if (loading && !paciente) {
    return <div style={{ textAlign: 'center', padding: '100px', color: '#6B7280' }}>Carregando histórico...</div>
  }

  return (
    <div>
      {!inTab && (
        <>
          <div className="breadcrumb">
            <button onClick={() => navigate('/pacientes')} className="btn-link" style={{ padding: 0 }}>Pacientes</button>
            <span>›</span>
            <strong>{paciente?.nomeCompleto || 'Paciente'}</strong>
            <span>›</span> Relatório Diário
          </div>
          <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="btn btn-outline" onClick={() => navigate(-1)}>← Voltar</button>
              <div>
                <div className="page-title">📝 Relatório Diário</div>
                <div className="page-subtitle">{paciente?.nomeCompleto || 'Carregando...'}</div>
              </div>
            </div>
            <PacienteAcoesMenu pacienteId={id!} paginaAtual="relatorios" />
          </div>
        </>
      )}

      {/* BARRA DE FILTROS */}
      <div className="table-toolbar" style={{ marginBottom: '24px', background: 'white', padding: '16px', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr auto', gap: '16px', alignItems: 'end', width: '100%' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Data Início</label>
            <input type="date" className="form-control" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Data Fim</label>
            <input type="date" className="form-control" value={dataFim} onChange={e => setDataFim(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Buscar por Meta ou Atividade</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Digite para filtrar..." 
              value={termoBusca}
              onChange={e => setTermoBusca(e.target.value)}
            />
          </div>
          <button className="btn btn-outline" onClick={limparFiltros} style={{ whiteSpace: 'nowrap' }}>
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Botão para Folha de Evolução */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <button
          className={`btn ${modoSelecao ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => {
            if (selecionados.size > 0) {
              setMostrandoFolhaEvolucao(true)
            } else {
              setModoSelecao(!modoSelecao)
            }
          }}
        >
          📋 {modoSelecao ? 'Gerar Folha' : 'Modo Seleção'}
          {selecionados.size > 0 && ` (${selecionados.size})`}
        </button>
      </div>

      <div className="session-list">
        {relatoriosFiltrados.length === 0 ? (
          <div className="form-card" style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔎</div>
            <p>{relatorios.length === 0 ? "Nenhum relatório encontrado para este paciente." : "Nenhum resultado para os filtros aplicados."}</p>
            {(dataInicio || dataFim || termoBusca) && (
              <button className="btn-link" onClick={limparFiltros} style={{ marginTop: '12px' }}>Remover filtros</button>
            )}
          </div>
        ) : (
          relatoriosFiltrados.map((rel: any) => (
            <div
              className={`session-card ${selecionados.has(rel.id) ? 'selected' : ''}`}
              key={rel.id}
              onClick={() => modoSelecao && toggleSelecionado(rel.id)}
              style={{ cursor: modoSelecao ? 'pointer' : 'default', opacity: modoSelecao && !selecionados.has(rel.id) ? 0.6 : 1 }}
            >
              <div className="session-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  {modoSelecao && (
                    <input
                      type="checkbox"
                      checked={selecionados.has(rel.id)}
                      onChange={() => toggleSelecionado(rel.id)}
                      onClick={e => e.stopPropagation()}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  )}
                  <div className="session-patient">
                    {format(new Date(rel.dataSessao + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="session-time">{rel.horaInicio} – {rel.horaFim}</div>
                  <button
                    className="btn-icon-primary"
                    title="Editar relatório"
                    onClick={() => abrirEditar(rel)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    className="btn-icon-secondary"
                    title="Visualizar detalhes"
                    onClick={() => handleVisualizar(rel.id)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="session-body">
                <strong>Meta:</strong> {rel.metaTrabalhada}<br/>
                <strong>Atividades:</strong> {rel.atividadesRealizadas}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE VISUALIZAÇÃO */}
      <div className={`modal-overlay ${relatorioVisualizar ? 'active' : ''}`}>
        <div className="modal" style={{ maxWidth: '700px' }}>
          <div className="modal-header">
            <h2 className="modal-title">Detalhes de Relatório</h2>
            <button className="modal-close" onClick={() => setRelatorioVisualizar(null)}>×</button>
          </div>

          {relatorioVisualizar && (
            <div className="view-details">
              <div className="session-card-header" style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div className="session-patient" style={{ fontSize: '20px' }}>{relatorioVisualizar.pacienteNome}</div>
                  <div className="page-subtitle">Relatório de {format(new Date(relatorioVisualizar.dataSessao + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</div>
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
                   <div className="form-section-title"><div className="section-icon" />Observações para Próximo Atendimento</div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--aud-600)' }}>ORIENTAÇÕES À FAMÍLIA</label>
                        <p style={{ marginTop: '4px', fontSize: '13px' }}>{relatorioVisualizar.orientacoesFamilia || 'Sem orientações específicas.'}</p>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--aud-600)' }}>PLANEJAMENTO PRÓXIMO ATENDIMENTO</label>
                        <p style={{ marginTop: '4px', fontSize: '13px' }}>{relatorioVisualizar.planejamentoProximaSessao || 'A definir.'}</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn btn-outline" onClick={() => setRelatorioVisualizar(null)}>Fechar</button>
                <button className="btn btn-primary" onClick={() => abrirEditar(relatorioVisualizar)}>✏️ Editar</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE EDIÇÃO */}
      <div className={`modal-overlay ${relatorioEditando ? 'active' : ''}`}>
        <div className="modal" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="modal-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <h2 className="modal-title">Editar Relatório</h2>
              <button
                className="btn btn-outline"
                onClick={() => setMostrarTemplates(!mostrarTemplates)}
                style={{ fontSize: '13px', padding: '8px 12px' }}
              >
                📋 Usar Template
              </button>
            </div>
            <button className="modal-close" onClick={() => fecharEditar()}>×</button>
          </div>

          {relatorioEditando && (
            <div style={{ padding: '24px' }}>
              {/* SELETOR DE TEMPLATES */}
              {mostrarTemplates && (
                <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #E5E7EB' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '12px', display: 'block', textTransform: 'uppercase' }}>
                    Selecionar Template:
                  </label>
                  {templates.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>Nenhum template salvo ainda. Crie um preenchendo os campos abaixo.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {templates.map(t => (
                        <button
                          key={t.id}
                          onClick={() => aplicarTemplate(t)}
                          style={{
                            padding: '12px',
                            background: '#FFFFFF',
                            border: '1px solid #D1D5DB',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#374151',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => {
                            const target = e.target as HTMLButtonElement
                            target.style.borderColor = '#3B82F6'
                            target.style.background = '#EFF6FF'
                          }}
                          onMouseLeave={e => {
                            const target = e.target as HTMLButtonElement
                            target.style.borderColor = '#D1D5DB'
                            target.style.background = '#FFFFFF'
                          }}
                        >
                          {t.nome}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label>Data da Sessão *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={relatorioEditando.dataSessao}
                    onChange={(e) => setRelatorioEditando({...relatorioEditando, dataSessao: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Hora Início *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={relatorioEditando.horaInicio}
                    onChange={(e) => setRelatorioEditando({...relatorioEditando, horaInicio: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Hora Fim *</label>
                <input
                  type="time"
                  className="form-control"
                  value={relatorioEditando.horaFim}
                  onChange={(e) => setRelatorioEditando({...relatorioEditando, horaFim: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Meta Trabalhada *</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={relatorioEditando.metaTrabalhada}
                  onChange={(e) => setRelatorioEditando({...relatorioEditando, metaTrabalhada: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Atividades Realizadas *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={relatorioEditando.atividadesRealizadas}
                  onChange={(e) => setRelatorioEditando({...relatorioEditando, atividadesRealizadas: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Uso de CAA neste Atendimento</label>
                  <select
                    className="form-control"
                    value={relatorioEditando.usoCaaSessao ? 'sim' : 'nao'}
                    onChange={(e) => setRelatorioEditando({...relatorioEditando, usoCaaSessao: e.target.value === 'sim'})}
                  >
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
              </div>

              <div className="form-group">
                <label>Recurso CAA Utilizado</label>
                <input
                  type="text"
                  className="form-control"
                  value={relatorioEditando.recursoCaaUtilizado || ''}
                  onChange={(e) => setRelatorioEditando({...relatorioEditando, recursoCaaUtilizado: e.target.value})}
                  placeholder="Descreva o recurso utilizado"
                />
              </div>

              <div className="form-group">
                <label>Resposta à Estimulação Auditiva</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={relatorioEditando.respostaEstimulacaoAuditiva || ''}
                  onChange={(e) => setRelatorioEditando({...relatorioEditando, respostaEstimulacaoAuditiva: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Evolução Observada</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={relatorioEditando.evolucaoObservada || ''}
                  onChange={(e) => setRelatorioEditando({...relatorioEditando, evolucaoObservada: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Intercorrências</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={relatorioEditando.intercorrencias || ''}
                  onChange={(e) => setRelatorioEditando({...relatorioEditando, intercorrencias: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Orientações à Família</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={relatorioEditando.orientacoesFamilia || ''}
                  onChange={(e) => setRelatorioEditando({...relatorioEditando, orientacoesFamilia: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Planejamento Próximo Atendimento</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={relatorioEditando.planejamentoProximaSessao || ''}
                  onChange={(e) => setRelatorioEditando({...relatorioEditando, planejamentoProximaSessao: e.target.value})}
                />
              </div>

              <div style={{ padding: '16px', background: '#FEF3C7', borderRadius: '8px', marginTop: '24px', marginBottom: '20px', border: '1px solid #FCD34D' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setMostrarSalvarTemplate(true)}
                  style={{ width: '100%' }}
                >
                  💾 Salvar Como Novo Template
                </button>
              </div>

              <div className="form-actions" style={{ marginTop: '0px' }}>
                <button className="btn btn-outline" onClick={() => fecharEditar()} disabled={salvando}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={() => handleAtualizar()} disabled={salvando}>
                  {salvando ? 'Salvando...' : '✓ Atualizar Relatório'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL SALVAR TEMPLATE */}
      <div className={`modal-overlay ${mostrarSalvarTemplate ? 'active' : ''}`}>
        <div className="modal" style={{ maxWidth: '450px' }}>
          <div className="modal-header">
            <h2 className="modal-title">Salvar como Template</h2>
            <button className="modal-close" onClick={() => {
              setMostrarSalvarTemplate(false)
              setNomeTemplate('')
            }}>×</button>
          </div>
          <div style={{ padding: '24px' }}>
            <div className="form-group">
              <label>Nome do Template *</label>
              <input
                type="text"
                className="form-control"
                value={nomeTemplate}
                onChange={e => setNomeTemplate(e.target.value)}
                placeholder="Ex: Estratégia de Comunicação Aumentativa"
                autoFocus
              />
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                Este nome ajudará a identificar o template quando precisar usá-lo novamente.
              </p>
            </div>
            <div className="form-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setMostrarSalvarTemplate(false)
                  setNomeTemplate('')
                }}
                disabled={salvandoTemplate}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => salvarTemplate()}
                disabled={!nomeTemplate.trim() || salvandoTemplate}
              >
                {salvandoTemplate ? 'Salvando...' : '✓ Salvar Template'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOLHA DE EVOLUÇÃO */}
      {mostrandoFolhaEvolucao && (
        <FolhaEvolucao
          dadosAgrupados={gerarDadosAgrupados()}
          onFechar={() => setMostrandoFolhaEvolucao(false)}
        />
      )}

      {/* TOAST */}
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
        {toast.msg}
      </div>
    </div>
  )
}
