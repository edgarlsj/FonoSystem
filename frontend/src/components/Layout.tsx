import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
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
          <div className="avatar" onClick={handleLogout} title="Sair">
            {user?.nome?.charAt(0) || 'U'}
          </div>
        </div>
      </nav>
      <div className="content">
        <Outlet />
      </div>
    </>
  )
}
