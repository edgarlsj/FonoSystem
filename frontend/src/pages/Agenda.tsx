import { useEffect, useState } from 'react'
import { format, addDays, subDays, isToday, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'
import { useConfirm } from '../context/ConfirmContext'

type StatusAgendamento = 'AGENDADO' | 'REALIZADO' | 'FALTOU' | 'CANCELADO'
type Aba = 'agenda' | 'relatorio'

interface Agendamento {
  id: number
  pacienteId: number
  pacienteNome: string
  dataHoraInicio: string
  duracao: number
  status: StatusAgendamento
  observacoes?: string
}

interface Paciente {
  id: number
  nomeCompleto: string
}

interface UltimaSessao {
  orientacoesFamilia?: string
  planejamentoProximaSessao?: string
}

const STATUS_LABEL: Record<StatusAgendamento, string> = {
  AGENDADO: 'Agendado',
  REALIZADO: 'Realizado',
  FALTOU: 'Faltou',
  CANCELADO: 'Cancelado',
}

const STATUS_CLASS: Record<StatusAgendamento, string> = {
  AGENDADO: 'badge-agendado',
  REALIZADO: 'badge-ativo',
  FALTOU: 'badge-inativo',
  CANCELADO: 'badge-cancelado',
}

const BORDER_COLOR: Record<StatusAgendamento, string> = {
  AGENDADO:  'var(--primary-400)',
  REALIZADO: 'var(--aud-400)',
  FALTOU:    'var(--danger-500)',
  CANCELADO: 'var(--gray-300)',
}

export default function Agenda() {
  const confirm = useConfirm()
  const [aba, setAba] = useState<Aba>('agenda')

  // ── Aba Agenda ──────────────────────────────────────
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [ultimasSessoes, setUltimasSessoes] = useState<Record<number, UltimaSessao>>({})
  const [proximoAgendamentoIdPorPaciente, setProximoAgendamentoIdPorPaciente] = useState<Record<number, number>>({})
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Agendamento | null>(null)
  const [salvando, setSalvando] = useState(false)

  const [formPacienteId, setFormPacienteId] = useState('')
  const [formData, setFormData] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [formHora, setFormHora] = useState('08:00')
  const [formDuracao, setFormDuracao] = useState('50')
  const [formObs, setFormObs] = useState('')
  const [formStatus, setFormStatus] = useState<StatusAgendamento>('AGENDADO')
  const [formRecorrente, setFormRecorrente] = useState(false)
  const [formDataFim, setFormDataFim] = useState(format(addDays(new Date(), 28), 'yyyy-MM-dd'))

  // ── Aba Relatório ────────────────────────────────────
  const [relInicio, setRelInicio] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [relFim, setRelFim] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [relDados, setRelDados] = useState<Agendamento[]>([])
  const [relLoading, setRelLoading] = useState(false)

  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false, msg: '', type: 'success',
  })

  useEffect(() => { carregarAgendamentos() }, [dataSelecionada])
  useEffect(() => { if (modalAberto && pacientes.length === 0) carregarPacientes() }, [modalAberto])
  useEffect(() => { if (aba === 'relatorio') carregarRelatorio() }, [aba])

  const carregarAgendamentos = async () => {
    setLoading(true)
    try {
      const dataAgenda = format(dataSelecionada, 'yyyy-MM-dd')
      const { data } = await api.get(`/v1/agendamentos?data=${dataAgenda}`)
      const lista: Agendamento[] = data || []
      setAgendamentos(lista)

      const pacientesUnicos = Array.from(new Set(lista.map(ag => ag.pacienteId)))
      const [resultadosRelatorios, resultadosAgendamentos] = await Promise.all([
        Promise.allSettled(pacientesUnicos.map(pacienteId => api.get(`/v1/pacientes/${pacienteId}/relatorios/ultimo`))),
        Promise.allSettled(pacientesUnicos.map(pacienteId => api.get(`/v1/pacientes/${pacienteId}/agendamentos`))),
      ])
      const map: Record<number, UltimaSessao> = {}
      const proximosMap: Record<number, number> = {}
      pacientesUnicos.forEach((pacienteId, i) => {
        const r = resultadosRelatorios[i]
        if (r.status === 'fulfilled' && r.value.data) {
          map[pacienteId] = {
            orientacoesFamilia: r.value.data.orientacoesFamilia,
            planejamentoProximaSessao: r.value.data.planejamentoProximaSessao,
          }
        }

        const agendamentosPaciente = resultadosAgendamentos[i]
        if (agendamentosPaciente.status === 'fulfilled' && Array.isArray(agendamentosPaciente.value.data)) {
          const agora = new Date()
          const proximo = agendamentosPaciente.value.data
            .filter((ag: Agendamento) => new Date(ag.dataHoraInicio) >= agora)
            .sort((a: Agendamento, b: Agendamento) => new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime())[0]

          if (proximo) {
            proximosMap[pacienteId] = proximo.id
          }
        }
      })
      setUltimasSessoes(map)
      setProximoAgendamentoIdPorPaciente(proximosMap)
    } catch {
      mostrarToast('Erro ao carregar agendamentos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const carregarPacientes = async () => {
    try {
      const { data } = await api.get('/v1/pacientes?status=ATIVO&size=500')
      setPacientes(data.content ?? data)
    } catch { /* silencioso */ }
  }

  const carregarRelatorio = async () => {
    setRelLoading(true)
    try {
      const { data } = await api.get(`/v1/agendamentos/relatorio?inicio=${relInicio}&fim=${relFim}`)
      setRelDados(data)
    } catch {
      mostrarToast('Erro ao carregar relatório', 'error')
    } finally {
      setRelLoading(false)
    }
  }

  const salvarAgendamento = async () => {
    if (!formPacienteId || !formData || !formHora) {
      mostrarToast('Preencha paciente, data e hora', 'error')
      return
    }
    if (formRecorrente && !formDataFim) {
      mostrarToast('Informe a data final da recorrencia', 'error')
      return
    }
    if (formRecorrente && formDataFim < formData) {
      mostrarToast('Data final deve ser igual ou posterior a data inicial', 'error')
      return
    }
    setSalvando(true)
    try {
      const payload = {
        dataHoraInicio: `${formData}T${formHora}:00`,
        duracao: parseInt(formDuracao) || 50,
        observacoes: formObs || undefined,
      }

      if (formRecorrente) {
        const { data } = await api.post(`/v1/pacientes/${formPacienteId}/agendamentos/recorrente`, {
          ...payload,
          dataFim: formDataFim,
        })
        const totalCriado = Array.isArray(data) ? data.length : 0
        mostrarToast(`${totalCriado} agendamentos criados com sucesso`, 'success')
      } else {
        await api.post(`/v1/pacientes/${formPacienteId}/agendamentos`, payload)
        mostrarToast('Agendamento criado com sucesso', 'success')
      }
      fecharModal()
      carregarAgendamentos()
    } catch {
      mostrarToast('Erro ao criar agendamento', 'error')
    } finally {
      setSalvando(false)
    }
  }

  const marcarFaltou = async (ag: Agendamento) => {
    const ok = await confirm({
      title: 'Registrar Falta',
      message: `Confirmar que ${ag.pacienteNome} faltou neste atendimento?`,
      okLabel: 'Sim, faltou',
    })
    if (!ok) return
    try {
      await api.patch(`/v1/agendamentos/${ag.id}/faltou`)
      mostrarToast('Falta registrada', 'success')
      carregarAgendamentos()
    } catch {
      mostrarToast('Erro ao registrar falta', 'error')
    }
  }

  const cancelarAgendamento = async (ag: Agendamento) => {
    const ok = await confirm({
      title: 'Cancelar Agendamento',
      message: `Cancelar o agendamento de ${ag.pacienteNome}?`,
      okLabel: 'Cancelar agendamento',
    })
    if (!ok) return
    try {
      await api.patch(`/v1/agendamentos/${ag.id}/cancelar`)
      mostrarToast('Agendamento cancelado', 'success')
      carregarAgendamentos()
    } catch {
      mostrarToast('Erro ao cancelar', 'error')
    }
  }

  const abrirEditar = (ag: Agendamento) => {
    setEditando(ag)
    setFormData(format(new Date(ag.dataHoraInicio), 'yyyy-MM-dd'))
    setFormHora(format(new Date(ag.dataHoraInicio), 'HH:mm'))
    setFormDuracao(String(ag.duracao))
    setFormObs(ag.observacoes ?? '')
    setFormStatus(ag.status)
    setModalAberto(true)
  }

  const salvarEdicao = async () => {
    if (!editando || !formData || !formHora) {
      mostrarToast('Preencha data e hora', 'error')
      return
    }
    setSalvando(true)
    try {
      await api.put(`/v1/agendamentos/${editando.id}`, {
        dataHoraInicio: `${formData}T${formHora}:00`,
        duracao: parseInt(formDuracao) || 50,
        observacoes: formObs || undefined,
        status: formStatus,
      })
      mostrarToast('Agendamento atualizado', 'success')
      fecharModal()
      carregarAgendamentos()
    } catch {
      mostrarToast('Erro ao atualizar agendamento', 'error')
    } finally {
      setSalvando(false)
    }
  }

  const excluirAgendamento = async (ag: Agendamento) => {
    const ok = await confirm({
      title: 'Excluir Agendamento',
      message: `Excluir o agendamento de ${ag.pacienteNome}? Esta ação não pode ser desfeita.`,
      okLabel: 'Excluir',
    })
    if (!ok) return
    try {
      await api.delete(`/v1/agendamentos/${ag.id}`)
      mostrarToast('Agendamento excluído', 'success')
      carregarAgendamentos()
    } catch {
      mostrarToast('Erro ao excluir', 'error')
    }
  }

  const fecharModal = () => {
    setModalAberto(false)
    setEditando(null)
    setFormPacienteId('')
    setFormData(format(dataSelecionada, 'yyyy-MM-dd'))
    setFormHora('08:00')
    setFormDuracao('50')
    setFormObs('')
    setFormStatus('AGENDADO')
    setFormRecorrente(false)
    setFormDataFim(format(addDays(dataSelecionada, 28), 'yyyy-MM-dd'))
  }

  const mostrarToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000)
  }

  const agendadosHoje = agendamentos.filter(a => a.status === 'AGENDADO')
  const dataLabel = isToday(dataSelecionada)
    ? 'Hoje'
    : format(dataSelecionada, "EEEE, dd 'de' MMMM", { locale: ptBR })

  // Totais do relatório
  const total      = relDados.length
  const realizados = relDados.filter(a => a.status === 'REALIZADO').length
  const faltas     = relDados.filter(a => a.status === 'FALTOU').length
  const cancelados = relDados.filter(a => a.status === 'CANCELADO').length
  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda</h1>
          <p className="page-subtitle">Gerencie os atendimentos</p>
        </div>
        {aba === 'agenda' && (
          <button className="btn btn-primary" onClick={() => { setFormData(format(dataSelecionada, 'yyyy-MM-dd')); setFormDataFim(format(addDays(dataSelecionada, 28), 'yyyy-MM-dd')); setModalAberto(true) }}>
            + Novo Agendamento
          </button>
        )}
      </div>

      {/* Abas */}
      <div className="tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`tab-btn${aba === 'agenda' ? ' active' : ''}`}
          onClick={() => setAba('agenda')}
        >
          📅 Agenda
        </button>
        <button
          className={`tab-btn${aba === 'relatorio' ? ' active' : ''}`}
          onClick={() => setAba('relatorio')}
        >
          📊 Relatório
        </button>
      </div>

      {/* ═══ ABA AGENDA ═══ */}
      {aba === 'agenda' && (
        <>
          {isToday(dataSelecionada) && agendadosHoje.length > 0 && (
            <div style={{
              background: 'var(--primary-50)',
              border: '1px solid var(--primary-200)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              color: 'var(--primary-800)',
            }}>
              <span style={{ fontSize: '18px' }}>📅</span>
              <span>
                Você tem <strong>{agendadosHoje.length}</strong> atendimento{agendadosHoje.length !== 1 ? 's' : ''} pendente{agendadosHoje.length !== 1 ? 's' : ''} hoje.
              </span>
            </div>
          )}

          {/* Navegação de datas */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '24px', background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)', padding: '12px 20px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <button className="btn btn-outline btn-sm" onClick={() => setDataSelecionada(d => subDays(d, 1))}>
              ← Anterior
            </button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--primary-900)', textTransform: 'capitalize' }}>
                {dataLabel}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                {format(dataSelecionada, 'dd/MM/yyyy')}
              </div>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setDataSelecionada(new Date())}
              disabled={isToday(dataSelecionada)}
              style={{ opacity: isToday(dataSelecionada) ? 0.4 : 1 }}
            >
              Hoje
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setDataSelecionada(d => addDays(d, 1))}>
              Próximo →
            </button>
          </div>

          {/* Lista */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-400)' }}>Carregando...</div>
            ) : agendamentos.length === 0 ? (
              <div style={{
                background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                padding: '48px', textAlign: 'center', color: 'var(--gray-400)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
                <div style={{ fontSize: '15px', fontWeight: 600 }}>Nenhum agendamento para este dia</div>
                <div style={{ fontSize: '13px', marginTop: '6px' }}>Clique em "+ Novo Agendamento" para adicionar</div>
              </div>
            ) : agendamentos.map(ag => {
              const ultimaSessao = ultimasSessoes[ag.pacienteId]
              return (
                <div key={ag.id} style={{
                  background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                  padding: '16px 20px', boxShadow: 'var(--shadow-sm)',
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  borderLeft: `4px solid ${BORDER_COLOR[ag.status]}`,
                }}>
                  <div style={{ minWidth: '52px', textAlign: 'center', fontWeight: 700, fontSize: '16px', color: 'var(--primary-800)' }}>
                    {format(new Date(ag.dataHoraInicio), 'HH:mm')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-900)' }}>{ag.pacienteNome}</div>
                    {ag.observacoes && <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>{ag.observacoes}</div>}
                    <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>{ag.duracao} min</div>
                    {proximoAgendamentoIdPorPaciente[ag.pacienteId] === ag.id && (ultimaSessao?.orientacoesFamilia || ultimaSessao?.planejamentoProximaSessao) && (
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {ultimaSessao.orientacoesFamilia && (
                          <div style={{ fontSize: '12px', color: 'var(--gray-600)', lineHeight: 1.4 }}>
                            <span style={{ fontWeight: 700, color: 'var(--aud-600)', textTransform: 'uppercase', fontSize: '10px' }}>Orientações à família: </span>
                            {ultimaSessao.orientacoesFamilia}
                          </div>
                        )}
                        {ultimaSessao.planejamentoProximaSessao && (
                          <div style={{ fontSize: '12px', color: 'var(--gray-600)', lineHeight: 1.4 }}>
                            <span style={{ fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', fontSize: '10px' }}>Planejamento próxima sessão: </span>
                            {ultimaSessao.planejamentoProximaSessao}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className={`badge ${STATUS_CLASS[ag.status]}`}>{STATUS_LABEL[ag.status]}</span>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {ag.status === 'AGENDADO' && (
                      <>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger-500)', borderColor: 'var(--danger-500)' }}
                          onClick={() => marcarFaltou(ag)}
                        >
                          Faltou
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => cancelarAgendamento(ag)}>
                          Cancelar
                        </button>
                      </>
                    )}
                    <button
                      className="btn btn-outline btn-sm"
                      title="Editar"
                      onClick={() => abrirEditar(ag)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      title="Excluir"
                      style={{ color: 'var(--danger-500)', borderColor: 'var(--danger-500)' }}
                      onClick={() => excluirAgendamento(ag)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ═══ ABA RELATÓRIO ═══ */}
      {aba === 'relatorio' && (
        <>
          {/* Filtro de período */}
          <div className="form-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, flex: '1 1 160px' }}>
                <label>Data início</label>
                <input type="date" className="form-control" value={relInicio} onChange={e => setRelInicio(e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0, flex: '1 1 160px' }}>
                <label>Data fim</label>
                <input type="date" className="form-control" value={relFim} onChange={e => setRelFim(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={carregarRelatorio} disabled={relLoading}>
                {relLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {relLoading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-400)' }}>Carregando...</div>
          ) : (
            <>
              {/* Cards de resumo */}
              <div className="stats-row" style={{ marginBottom: '24px' }}>
                <div className="stat-card blue">
                  <div className="stat-label">Total</div>
                  <div className="stat-value">{total}</div>
                  <div className="stat-sub">Agendamentos no período</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-label">Realizados</div>
                  <div className="stat-value">{realizados}</div>
                  <div className="stat-sub">{pct(realizados)}% do total</div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: 'var(--danger-500)' }}>
                  <div className="stat-label">Faltas</div>
                  <div className="stat-value" style={{ color: 'var(--danger-500)' }}>{faltas}</div>
                  <div className="stat-sub">{pct(faltas)}% do total</div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: 'var(--gray-400)' }}>
                  <div className="stat-label">Cancelados</div>
                  <div className="stat-value" style={{ color: 'var(--gray-500)' }}>{cancelados}</div>
                  <div className="stat-sub">{pct(cancelados)}% do total</div>
                </div>
              </div>

              {/* Lista do período */}
              {relDados.length === 0 ? (
                <div style={{
                  background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                  padding: '48px', textAlign: 'center', color: 'var(--gray-400)',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>📊</div>
                  <div style={{ fontSize: '15px', fontWeight: 600 }}>Nenhum agendamento no período</div>
                </div>
              ) : (
                <div className="form-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
                        <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Data</th>
                        <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Hora</th>
                        <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Paciente</th>
                        <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Duração</th>
                        <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relDados.map((ag, i) => (
                        <tr key={ag.id} style={{ borderBottom: '1px solid var(--gray-100)', background: i % 2 === 0 ? '#fff' : 'var(--gray-50)' }}>
                          <td style={{ padding: '10px 16px', color: 'var(--gray-700)' }}>
                            {format(new Date(ag.dataHoraInicio), "dd/MM/yyyy")}
                          </td>
                          <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--primary-800)' }}>
                            {format(new Date(ag.dataHoraInicio), 'HH:mm')}
                          </td>
                          <td style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--gray-900)' }}>
                            {ag.pacienteNome}
                          </td>
                          <td style={{ padding: '10px 16px', color: 'var(--gray-500)' }}>
                            {ag.duracao} min
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            <span className={`badge ${STATUS_CLASS[ag.status]}`}>{STATUS_LABEL[ag.status]}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Modal novo / editar agendamento */}
      <div className={`modal-overlay${modalAberto ? ' active' : ''}`} onClick={fecharModal}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-title">{editando ? 'Editar Agendamento' : 'Novo Agendamento'}</span>
            <button className="modal-close" onClick={fecharModal}>×</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {editando ? (
              <div className="form-group">
                <label>Paciente</label>
                <input className="form-control" value={editando.pacienteNome} disabled />
              </div>
            ) : (
              <div className="form-group">
                <label>Paciente *</label>
                <select className="form-control" value={formPacienteId} onChange={e => setFormPacienteId(e.target.value)}>
                  <option value="">Selecione o paciente</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
                </select>
              </div>
            )}
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label>Data *</label>
                <input type="date" className="form-control" value={formData} onChange={e => setFormData(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Hora *</label>
                <input type="time" className="form-control" value={formHora} onChange={e => setFormHora(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Duração (minutos)</label>
              <input type="number" className="form-control" min={10} max={240} value={formDuracao} onChange={e => setFormDuracao(e.target.value)} />
            </div>
            {editando && (
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={formStatus} onChange={e => setFormStatus(e.target.value as StatusAgendamento)}>
                  <option value="AGENDADO">Agendado</option>
                  <option value="REALIZADO">Realizado</option>
                  <option value="FALTOU">Faltou</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            )}
            {!editando && (
              <>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--gray-700)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formRecorrente}
                    onChange={e => setFormRecorrente(e.target.checked)}
                  />
                  Repetir semanalmente
                </label>
                {formRecorrente && (
                  <div className="form-group">
                    <label>Repetir ate *</label>
                    <input
                      type="date"
                      className="form-control"
                      min={formData}
                      value={formDataFim}
                      onChange={e => setFormDataFim(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}
            <div className="form-group">
              <label>Observações</label>
              <textarea className="form-control" rows={2} placeholder="Opcional..." value={formObs} onChange={e => setFormObs(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button className="btn btn-outline" onClick={fecharModal} disabled={salvando}>Cancelar</button>
              <button className="btn btn-primary" onClick={editando ? salvarEdicao : salvarAgendamento} disabled={salvando}>
                {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: toast.type === 'success' ? 'var(--aud-600)' : 'var(--danger-500)',
          color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)', fontSize: '14px', fontWeight: 500, zIndex: 3000,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
