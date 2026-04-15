import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface PacienteData {
  id: number
  nomeCompleto: string
  idade: number
  nomeResponsavel: string
  convenio: string
  status: string
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<PacienteData[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [confirmarModal, setConfirmarModal] = useState<{ show: boolean; paciente: PacienteData | null; acao: 'ativar' | 'desativar' }>({ show: false, paciente: null, acao: 'desativar' })

  useEffect(() => {
    carregarPacientes()
  }, [])

  const carregarPacientes = async (nome?: string) => {
    try {
      setLoading(true)
      const params: any = { size: 500 }
      if (nome) params.nome = nome
      const { data } = await api.get('/v1/pacientes', { params })
      // Inclui todos os pacientes (ativos e inativos)
      setPacientes(data.content || [])
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBusca = (valor: string) => {
    setBusca(valor)
    carregarPacientes(valor || undefined)
  }

  const handleAlterarStatus = (id: number, statusAtual: string) => {
    const paciente = pacientes.find(p => p.id === id)
    if (!paciente) return

    const acao = statusAtual === 'ATIVO' ? 'desativar' : 'ativar'
    setConfirmarModal({ show: true, paciente, acao })
  }

  const confirmarAlteracao = async () => {
    if (!confirmarModal.paciente) return

    const novoStatus = confirmarModal.acao === 'desativar' ? 'INATIVO' : 'ATIVO'
    const id = confirmarModal.paciente.id

    try {
      await api.patch(`/v1/pacientes/${id}/status`, { status: novoStatus })

      setPacientes(prevPacientes =>
        prevPacientes.map(p =>
          p.id === id ? { ...p, status: novoStatus } : p
        )
      )

      setConfirmarModal({ show: false, paciente: null, acao: 'desativar' })
    } catch (err) {
      console.error('Erro ao alterar status:', err)
      alert('Erro ao alterar status do paciente')
    }
  }

  const cancelarAlteracao = () => {
    setConfirmarModal({ show: false, paciente: null, acao: 'desativar' })
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Pacientes</div>
          <div className="page-subtitle">Gerencie os cadastros dos pacientes</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/pacientes/novo')}>
          + Novo Paciente
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <input
            className="search-input"
            placeholder="🔍  Buscar por nome..."
            value={busca}
            onChange={e => handleBusca(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
            Carregando...
          </div>
        ) : (
          <>
            {/* PACIENTES ATIVOS */}
            <div>
              <h3 style={{ color: '#10B981', marginBottom: '16px', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ✓ Pacientes Ativos
              </h3>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nome</th>
                    <th>Idade</th>
                    <th>Responsável</th>
                    <th>Convênio</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes.filter(p => p.status === 'ATIVO').map((p, i) => (
                    <tr key={p.id}>
                      <td style={{ color: '#9CA3AF' }}>{String(i + 1).padStart(3, '0')}</td>
                      <td><strong>{p.nomeCompleto}</strong></td>
                      <td>{p.idade} anos</td>
                      <td>{p.nomeResponsavel}</td>
                      <td>{p.convenio || 'Particular'}</td>
                      <td>
                        <span className="badge badge-ativo">ATIVO</span>
                      </td>
                      <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button className="btn-link" onClick={() => navigate(`/pacientes/${p.id}/anamnese`)}>
                          Ver
                        </button>
                        <button
                          className="btn-link"
                          style={{ color: 'var(--warning-600)' }}
                          onClick={() => navigate(`/pacientes/${p.id}/editar`)}
                          title="Editar paciente"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn-link"
                          style={{ color: 'var(--primary-600)', fontWeight: 600 }}
                          onClick={() => navigate(`/pacientes/${p.id}/relatorios`)}
                        >
                          📝 Relatórios
                        </button>
                        <button className="btn-link" onClick={() => navigate(`/pacientes/${p.id}/prescricoes`)} title="Prescrições">
                          📋 Prescrições
                        </button>
                        <button
                          className="btn-link"
                          style={{ color: 'var(--danger-500)' }}
                          onClick={() => handleAlterarStatus(p.id, p.status)}
                          title="Desativar paciente"
                        >
                          🚫 Desativar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pacientes.filter(p => p.status === 'ATIVO').length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF' }}>
                        Nenhum paciente ativo
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PACIENTES DESATIVADOS */}
            {pacientes.filter(p => p.status === 'INATIVO').length > 0 && (
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ color: '#EF4444', marginBottom: '16px', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🚫 Pacientes Desativados
                </h3>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nome</th>
                      <th>Idade</th>
                      <th>Responsável</th>
                      <th>Convênio</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientes.filter(p => p.status === 'INATIVO').map((p, i) => (
                      <tr key={p.id}>
                        <td style={{ color: '#9CA3AF' }}>{String(i + 1).padStart(3, '0')}</td>
                        <td><strong>{p.nomeCompleto}</strong></td>
                        <td>{p.idade} anos</td>
                        <td>{p.nomeResponsavel}</td>
                        <td>{p.convenio || 'Particular'}</td>
                        <td>
                          <span className="badge badge-inativo">INATIVO</span>
                        </td>
                        <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button className="btn-link" onClick={() => navigate(`/pacientes/${p.id}/anamnese`)}>
                            Ver
                          </button>
                          <button
                            className="btn-link"
                            style={{ color: 'var(--warning-600)' }}
                            onClick={() => navigate(`/pacientes/${p.id}/editar`)}
                            title="Editar paciente"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="btn-link"
                            style={{ color: 'var(--aud-500)' }}
                            onClick={() => handleAlterarStatus(p.id, p.status)}
                            title="Ativar paciente"
                          >
                            ✓ Ativar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        <div className="table-footer">
          Mostrando {pacientes.length} pacientes
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO */}
      {confirmarModal.show && confirmarModal.paciente && (
        <div className="modal-overlay active">
          <div className="modal" style={{ maxWidth: '450px' }}>
            <div className="modal-header" style={{
              background: confirmarModal.acao === 'desativar' ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white'
            }}>
              <h2 className="modal-title" style={{ color: 'white', margin: 0 }}>
                {confirmarModal.acao === 'desativar' ? '⚠️ Desativar Paciente' : '✅ Ativar Paciente'}
              </h2>
            </div>

            <div style={{ padding: '28px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', color: '#1F2937', fontWeight: 600, marginBottom: '12px' }}>
                {confirmarModal.paciente.nomeCompleto}
              </div>

              {confirmarModal.acao === 'desativar' ? (
                <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', marginBottom: '24px' }}>
                  <p>Você está prestes a <strong>desativar</strong> este paciente.</p>
                  <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                    textAlign: 'left',
                    fontSize: '13px'
                  }}>
                    <div style={{ marginBottom: '8px' }}>✓ Todos os dados serão preservados</div>
                    <div style={{ marginBottom: '8px' }}>✓ Poderá ser reativado posteriormente</div>
                    <div>✓ Histórico permanecerá acessível</div>
                  </div>
                  <p style={{ color: '#9CA3AF', fontSize: '13px' }}>Esta ação pode ser desfeita a qualquer momento.</p>
                </div>
              ) : (
                <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', marginBottom: '24px' }}>
                  <p>Você está prestes a <strong>ativar</strong> este paciente.</p>
                  <div style={{
                    background: '#ECFDF5',
                    border: '1px solid #D1FAE5',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                    textAlign: 'left',
                    fontSize: '13px'
                  }}>
                    <div>O paciente voltará à lista de pacientes ativos</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '16px 28px',
              borderTop: '1px solid #E5E7EB',
              justifyContent: 'flex-end'
            }}>
              <button
                className="btn btn-outline"
                onClick={cancelarAlteracao}
                style={{ padding: '8px 20px' }}
              >
                Cancelar
              </button>
              <button
                className="btn"
                onClick={confirmarAlteracao}
                style={{
                  padding: '8px 20px',
                  background: confirmarModal.acao === 'desativar' ? '#EF4444' : '#10B981',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                {confirmarModal.acao === 'desativar' ? '🚫 Desativar' : '✓ Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
