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

  return (
    <>
      <header className="app-header">
        <div className="app-header-logo">
          <div className="logo-icon">🎙️</div>
          Live<span>System</span>
        </div>
        <div className="app-header-right">
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
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
                onClick={() => setShowMenu(false)}
              />
              <div className="header-dropdown">
                <div className="header-dropdown-email">
                  {user?.email}
                </div>
                <button
                  className="header-dropdown-item"
                  onClick={() => { navigate('/meu-perfil'); setShowMenu(false) }}
                >
                  ✏️ Editar Meu Perfil
                </button>
                {user?.perfil === 'ADMIN' && (
                  <button
                    className="header-dropdown-item"
                    onClick={() => { navigate('/usuarios'); setShowMenu(false) }}
                  >
                    👤 Gerenciar Usuários
                  </button>
                )}
                <button
                  className="header-dropdown-item"
                  style={{ color: '#dc2626' }}
                  onClick={handleLogout}
                >
                  🚪 Sair
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <aside className="sidebar">
        <div className="sidebar-section">
          <div className="sidebar-section-label">PRINCIPAL</div>
          <NavLink to="/" end className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
            <span className="sidebar-item-icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="/pacientes" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
            <span className="sidebar-item-icon">👥</span> Pacientes
          </NavLink>
          <NavLink to="/relatorios" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
            <span className="sidebar-item-icon">📝</span> Relatórios
          </NavLink>
          <NavLink to="/coletar-dados" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
            <span className="sidebar-item-icon">📋</span> Coletar Dados
          </NavLink>
        </div>

        {(user?.perfil === 'ADMIN' || user?.perfil === 'FONOAUDIOLOGO') && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">SISTEMA</div>
            <NavLink to="/logs" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <span className="sidebar-item-icon">📋</span> Logs
            </NavLink>
          </div>
        )}

        {user?.perfil === 'ADMIN' && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">ADMIN</div>
            <NavLink to="/usuarios" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
              <span className="sidebar-item-icon">👤</span> Usuários
            </NavLink>
          </div>
        )}

        <div className="sidebar-section">
          <div className="sidebar-section-label">CONTA</div>
          <NavLink to="/meu-perfil" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
            <span className="sidebar-item-icon">⚙️</span> Meu Perfil
          </NavLink>
          <button
            className="sidebar-item"
            style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#dc2626' }}
            onClick={handleLogout}
          >
            <span className="sidebar-item-icon">🚪</span> Sair
          </button>
        </div>
      </aside>

      <main className="app-main">
        <div className="content">
          <Outlet />
        </div>
      </main>
    </>
  )
}
