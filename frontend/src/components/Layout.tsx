import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setShowMenu(false)
  }

  const handleEditProfile = () => {
    navigate('/meu-perfil')
    setShowMenu(false)
  }

  const handleManageUsers = () => {
    navigate('/usuarios')
    setShowMenu(false)
  }

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">🎙️</div>
          Fono<span>System</span>
        </div>
        <NavLink to="/" end className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/pacientes" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
          👥 Pacientes
        </NavLink>
        <NavLink to="/relatorios" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
          📝 Relatórios
        </NavLink>
        {user?.perfil === 'ADMIN' && (
          <NavLink to="/logs" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            📋 Logs
          </NavLink>
        )}
        <div className="nav-right">
          <span className="nav-user-name">{user?.nome}</span>
          <div
            className="avatar"
            onClick={() => setShowMenu(!showMenu)}
            title="Menu do usuário"
            style={{ cursor: 'pointer' }}
          >
            {user?.nome?.charAt(0) || 'U'}
          </div>

          {showMenu && (
            <>
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 99
                }}
                onClick={() => setShowMenu(false)}
              />
              <div style={{
                position: 'absolute',
                top: '70px',
                right: '20px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 100,
                minWidth: '200px'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #eee',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {user?.email}
                </div>

                <button
                  onClick={handleEditProfile}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#333',
                    borderBottom: '1px solid #eee',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  ✏️ Editar Meu Perfil
                </button>

                {user?.perfil === 'ADMIN' && (
                  <button
                    onClick={handleManageUsers}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#333',
                      borderBottom: '1px solid #eee',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    👤 Gerenciar Usuários
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#dc2626',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  🚪 Sair
                </button>
              </div>
            </>
          )}
        </div>
      </nav>
      <div className="content">
        <Outlet />
      </div>
    </>
  )
}
