import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface User {
  id: number
  nome: string
  email: string
  perfil: 'ADMIN' | 'FONOAUDIOLOGO' | 'SECRETARIA'
  ativo: boolean
  createdAt: string
}

export default function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPerfil, setFilterPerfil] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
        sort: 'nome'
      })

      const response = await api.get('/v1/users', { params })
      setUsers(response.data.content)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [page])

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/v1/users/${id}`)
      setDeleteConfirm(null)
      loadUsers()
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
  }

  const handleToggleStatus = async (id: number) => {
    try {
      await api.patch(`/v1/users/${id}/status`)
      loadUsers()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchPerfil = !filterPerfil || user.perfil === filterPerfil
    const matchStatus = !filterStatus || (filterStatus === 'ativo' ? user.ativo : !user.ativo)
    return matchSearch && matchPerfil && matchStatus
  })

  const getPerfilBadge = (perfil: string) => {
    const colors = {
      ADMIN: '#dc2626',
      FONOAUDIOLOGO: '#2563eb',
      SECRETARIA: '#7c3aed'
    }
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: colors[perfil as keyof typeof colors] || '#6b7280',
        color: 'white'
      }}>
        {perfil}
      </span>
    )
  }

  const getStatusBadge = (ativo: boolean) => {
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: ativo ? '#10b981' : '#ef4444',
        color: 'white'
      }}>
        {ativo ? 'ATIVO' : 'INATIVO'}
      </span>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>Gerenciar Usuários</h1>
        <button
          onClick={() => navigate('/usuarios/novo')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          + Novo Usuário
        </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            minWidth: '250px'
          }}
        />

        <select
          value={filterPerfil}
          onChange={e => setFilterPerfil(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}
        >
          <option value="">Todos os perfis</option>
          <option value="ADMIN">Admin</option>
          <option value="FONOAUDIOLOGO">Fonoaudiólogo</option>
          <option value="SECRETARIA">Secretária</option>
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Nome</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Perfil</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{user.nome}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>{getPerfilBadge(user.perfil)}</td>
                  <td style={{ padding: '12px' }}>{getStatusBadge(user.ativo)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => navigate(`/usuarios/${user.id}/editar`)}
                      style={{
                        padding: '6px 12px',
                        marginRight: '8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      style={{
                        padding: '6px 12px',
                        marginRight: '8px',
                        backgroundColor: user.ativo ? '#ef4444' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {user.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(user.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                padding: '8px 16px',
                backgroundColor: page === 0 ? '#d1d5db' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: page === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Anterior
            </button>
            <span style={{ padding: '8px 16px' }}>Página {page + 1} de {totalPages}</span>
            <button
              onClick={() => setPage(p => (p < totalPages - 1 ? p + 1 : p))}
              disabled={page >= totalPages - 1}
              style={{
                padding: '8px 16px',
                backgroundColor: page >= totalPages - 1 ? '#d1d5db' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Próxima
            </button>
          </div>
        </>
      )}

      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <p>Tem certeza que deseja deletar este usuário?</p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setDeleteConfirm(null)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => handleDelete(deleteConfirm)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Deletar
            </button>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  )
}
