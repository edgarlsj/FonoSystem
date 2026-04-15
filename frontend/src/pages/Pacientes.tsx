import { useEffect, useRef, useState } from 'react'
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
  const [dropdownAberto, setDropdownAberto] = useState<number | null>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top?: number; bottom?: number; left: number }>({ top: 0, left: 0 })
  const [confirmarModal, setConfirmarModal] = useState<{ show: boolean; paciente: PacienteData | null; acao: 'ativar' | 'desativar' }>({ show: false, paciente: null, acao: 'desativar' })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    carregarPacientes()
  }, [])

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAberto(null)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  const carregarPacientes = async (nome?: string) => {
    try {
      setLoading(true)
      const params: any = { size: 500 }
      if (nome) params.nome = nome
      const { data } = await api.get('/v1/pacientes', { params })
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

  const handleAlterarStatus = (paciente: PacienteData) => {
    const acao = paciente.status === 'ATIVO' ? 'desativar' : 'ativar'
    setDropdownAberto(null)
    setConfirmarModal({ show: true, paciente, acao })
  }

  const confirmarAlteracao = async () => {
    if (!confirmarModal.paciente) return
    const novoStatus = confirmarModal.acao === 'desativar' ? 'INATIVO' : 'ATIVO'
    const id = confirmarModal.paciente.id
    try {
      await api.patch(`/v1/pacientes/${id}/status`, { status: novoStatus })
      setPacientes(prev => prev.map(p => p.id === id ? { ...p, status: novoStatus } : p))
      setConfirmarModal({ show: false, paciente: null, acao: 'desativar' })
    } catch (err) {
      console.error('Erro ao alterar status:', err)
      alert('Erro ao alterar status do paciente')
    }
  }

  const navegar = (caminho: string) => {
    setDropdownAberto(null)
    navigate(caminho)
  }

  const renderTabela = (lista: PacienteData[], titulo: string, cor: string, icone: string) => (
    <div style={{ marginBottom: '40px' }}>
      <h3 style={{ color: cor, marginBottom: '16px', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {icone} {titulo} ({lista.length})
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
          {lista.map((p, i) => (
            <tr key={p.id}>
              <td style={{ color: '#9CA3AF' }}>{String(i + 1).padStart(3, '0')}</td>
              <td><strong>{p.nomeCompleto}</strong></td>
              <td>{p.idade} anos</td>
              <td>{p.nomeResponsavel}</td>
              <td>{p.convenio || 'Particular'}</td>
              <td>
                <span className={`badge badge-${p.status === 'ATIVO' ? 'ativo' : 'inativo'}`}>
                  {p.status}
                </span>
              </td>
              <td>
                <div ref={dropdownAberto === p.id ? dropdownRef : undefined}>
                  <button
                    onClick={(e) => {
                      if (dropdownAberto === p.id) {
                        setDropdownAberto(null)
                      } else {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        const alturaMenu = 260
                        const espacoAbaixo = window.innerHeight - rect.bottom
                        if (espacoAbaixo < alturaMenu) {
                          setDropdownPos({ bottom: window.innerHeight - rect.top + 4, left: rect.left })
                        } else {
                          setDropdownPos({ top: rect.bottom + 4, left: rect.left })
                        }
                        setDropdownAberto(p.id)
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#374151',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Ações <span style={{ fontSize: '10px' }}>{dropdownAberto === p.id ? '▲' : '▼'}</span>
                  </button>

                  {dropdownAberto === p.id && (
                    <div style={{
                      position: 'fixed',
                      top: dropdownPos.top,
                      bottom: dropdownPos.bottom,
                      left: dropdownPos.left,
                      zIndex: 1000,
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      minWidth: '190px',
                      overflow: 'hidden'
                    }}>
                      <MenuItem icon="✏️" label="Editar" onClick={() => navegar(`/pacientes/${p.id}/editar`)} />
                      <MenuItem icon="🩺" label="Anamnese" onClick={() => navegar(`/pacientes/${p.id}/anamnese`)} />
                      <MenuItem icon="📝" label="Relatórios" onClick={() => navegar(`/pacientes/${p.id}/relatorios`)} />
                      <MenuItem icon="📋" label="Prescrições" onClick={() => navegar(`/pacientes/${p.id}/prescricoes`)} />
                      <div style={{ borderTop: '1px solid #F3F4F6', margin: '4px 0' }} />
                      {p.status === 'ATIVO' ? (
                        <MenuItem
                          icon="🚫"
                          label="Desativar"
                          onClick={() => handleAlterarStatus(p)}
                          danger
                        />
                      ) : (
                        <MenuItem
                          icon="✅"
                          label="Ativar"
                          onClick={() => handleAlterarStatus(p)}
                          success
                        />
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {lista.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF' }}>
                Nenhum paciente encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )

  const ativos = pacientes.filter(p => p.status === 'ATIVO')
  const inativos = pacientes.filter(p => p.status === 'INATIVO')

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
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Carregando...</div>
        ) : (
          <>
            {renderTabela(ativos, 'Pacientes Ativos', '#10B981', '✓')}
            {inativos.length > 0 && renderTabela(inativos, 'Pacientes Desativados', '#EF4444', '🚫')}
          </>
        )}

        <div className="table-footer">
          Mostrando {pacientes.length} pacientes ({ativos.length} ativos, {inativos.length} desativados)
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO */}
      {confirmarModal.show && confirmarModal.paciente && (
        <div className="modal-overlay active">
          <div className="modal" style={{ maxWidth: '450px' }}>
            <div className="modal-header" style={{
              background: confirmarModal.acao === 'desativar'
                ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
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
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '16px', textAlign: 'left', fontSize: '13px' }}>
                    <div style={{ marginBottom: '8px' }}>✓ Todos os dados serão preservados</div>
                    <div style={{ marginBottom: '8px' }}>✓ Poderá ser reativado posteriormente</div>
                    <div>✓ Histórico permanecerá acessível</div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', marginBottom: '24px' }}>
                  <p>Você está prestes a <strong>ativar</strong> este paciente.</p>
                  <div style={{ background: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: '8px', padding: '12px', marginBottom: '16px', textAlign: 'left', fontSize: '13px' }}>
                    <div>O paciente voltará à lista de pacientes ativos</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', padding: '16px 28px', borderTop: '1px solid #E5E7EB', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setConfirmarModal({ show: false, paciente: null, acao: 'desativar' })} style={{ padding: '8px 20px' }}>
                Cancelar
              </button>
              <button
                className="btn"
                onClick={confirmarAlteracao}
                style={{ padding: '8px 20px', background: confirmarModal.acao === 'desativar' ? '#EF4444' : '#10B981', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                {confirmarModal.acao === 'desativar' ? '🚫 Desativar' : '✅ Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon, label, onClick, danger, success }: {
  icon: string
  label: string
  onClick: () => void
  danger?: boolean
  success?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const cor = danger ? '#EF4444' : success ? '#10B981' : '#374151'
  const bgHover = danger ? '#FEF2F2' : success ? '#ECFDF5' : '#F9FAFB'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '10px 16px',
        background: hovered ? bgHover : 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: danger || success ? 600 : 500,
        color: hovered || danger || success ? cor : '#374151',
        textAlign: 'left'
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}
