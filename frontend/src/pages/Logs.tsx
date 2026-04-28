import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import api from '../services/api'

interface LogData {
  id: number
  acao: string
  entidade: string
  entidadeId: number
  descricao: string
  detalhes: string | null
  usuario: { id: number; nome: string } | null
  ipAddress: string
  dataCriacao: string
}

const acoesCorMap: { [key: string]: string } = {
  'CRIOU': '#10B981',
  'ATUALIZOU': '#3B82F6',
  'DELETOU': '#EF4444',
  'DESATIVOU': '#F59E0B',
  'ATIVOU': '#10B981'
}

export default function Logs() {
  const [logs, setLogs] = useState<LogData[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [acao, setAcao] = useState('')
  const [entidade, setEntidade] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    carregarLogs()
  }, [page, acao, entidade, dataInicio, dataFim])

  const carregarLogs = async () => {
    try {
      setLoading(true)
      setErro(null)
      const params: any = { page, size: 20, sort: 'data_criacao,desc' }
      if (acao) params.acao = acao
      if (entidade) params.entidade = entidade
      if (dataInicio) params.dataInicio = dataInicio
      if (dataFim) params.dataFim = dataFim

      const { data } = await api.get('/v1/logs', { params })
      setLogs(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch (err: any) {
      console.error('Erro ao carregar logs:', err)
      const status = err?.response?.status
      if (status === 403) {
        setErro('Acesso negado. Apenas administradores podem visualizar os logs.')
      } else if (status === 401) {
        setErro('Sessão expirada. Faça login novamente.')
      } else {
        setErro('Erro ao carregar logs. Verifique sua conexão ou contate o suporte.')
      }
    } finally {
      setLoading(false)
    }
  }

  const limparFiltros = () => {
    setAcao('')
    setEntidade('')
    setDataInicio('')
    setDataFim('')
    setPage(0)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">📋 Logs do Sistema</div>
          <div className="page-subtitle">Histórico de alterações e atividades</div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="table-card" style={{ marginBottom: '24px' }}>
        <div className="table-toolbar">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '12px', width: '100%', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Ação</label>
              <select
                className="form-control"
                value={acao}
                onChange={e => {
                  setAcao(e.target.value)
                  setPage(0)
                }}
              >
                <option value="">Todas</option>
                <option value="CRIOU">✅ Criou</option>
                <option value="ATUALIZOU">✏️ Atualizou</option>
                <option value="DELETOU">🗑️ Deletou</option>
                <option value="DESATIVOU">🚫 Desativou</option>
                <option value="ATIVOU">🟢 Ativou</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Entidade</label>
              <select
                className="form-control"
                value={entidade}
                onChange={e => {
                  setEntidade(e.target.value)
                  setPage(0)
                }}
              >
                <option value="">Todas</option>
                <option value="PACIENTE">Paciente</option>
                <option value="PRESCRICAO">Prescrição</option>
                <option value="RELATORIO">Relatório</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Data Início</label>
              <input
                type="date"
                className="form-control"
                value={dataInicio}
                onChange={e => {
                  setDataInicio(e.target.value)
                  setPage(0)
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Data Fim</label>
              <input
                type="date"
                className="form-control"
                value={dataFim}
                onChange={e => {
                  setDataFim(e.target.value)
                  setPage(0)
                }}
              />
            </div>

            <button
              className="btn btn-outline"
              onClick={limparFiltros}
              style={{ padding: '8px 16px' }}
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* ERRO */}
      {erro && (
        <div style={{
          background: '#FEE2E2',
          border: '1px solid #FCA5A5',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          color: '#B91C1C',
          fontSize: '14px'
        }}>
          ⚠️ {erro}
        </div>
      )}

      {/* LOGS */}
      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
            Carregando logs...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
            Nenhum log encontrado
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {logs.map(log => (
                <div
                  key={log.id}
                  style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '14px',
                    background: '#FAFAFA',
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    alignItems: 'start',
                    gap: '16px'
                  }}
                >
                  {/* Ícone da ação */}
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: acoesCorMap[log.acao] + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0
                    }}
                  >
                    {log.acao === 'CRIOU' && '✅'}
                    {log.acao === 'ATUALIZOU' && '✏️'}
                    {log.acao === 'DELETOU' && '🗑️'}
                    {log.acao === 'DESATIVOU' && '🚫'}
                    {log.acao === 'ATIVOU' && '🟢'}
                  </div>

                  {/* Conteúdo */}
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                      <span
                        style={{
                          background: acoesCorMap[log.acao],
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}
                      >
                        {log.acao}
                      </span>
                      <span style={{ color: '#6B7280', fontSize: '13px', fontWeight: 500 }}>
                        {log.entidade}
                      </span>
                      <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
                        ID: {log.entidadeId}
                      </span>
                    </div>

                    <div style={{ color: '#374151', fontSize: '14px', marginBottom: '8px' }}>
                      {log.descricao}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6B7280' }}>
                      <div>
                        👤 {log.usuario?.nome || 'Sistema'}
                      </div>
                      <div>
                        🌐 {log.ipAddress}
                      </div>
                      <div>
                        🕐 {format(new Date(log.dataCriacao), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                      </div>
                    </div>
                  </div>

                  {/* Detalhes */}
                  {log.detalhes && (
                    <details style={{ cursor: 'pointer' }}>
                      <summary style={{ color: '#3B82F6', fontSize: '12px', fontWeight: 600 }}>
                        Ver detalhes
                      </summary>
                      <pre
                        style={{
                          background: '#F3F4F6',
                          padding: '8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          overflow: 'auto',
                          marginTop: '8px'
                        }}
                      >
                        {JSON.stringify(JSON.parse(log.detalhes), null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>

            {/* PAGINAÇÃO */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Anterior
                </button>
                <span style={{ padding: '8px 12px', color: '#6B7280' }}>
                  Página {page + 1} de {totalPages}
                </span>
                <button
                  className="btn btn-outline"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
