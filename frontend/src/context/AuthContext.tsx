import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import api from '../services/api'

interface AuthUser {
  nome: string
  email: string
  perfil: string
}

interface AuthContextType {
  token: string | null
  user: AuthUser | null
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback(async (email: string, senha: string) => {
    const { data } = await api.post('/v1/auth/login', { email, senha })
    setToken(data.token)
    setUser({ nome: data.nome, email: data.email, perfil: data.perfil })
    localStorage.setItem('token', data.token)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify({ nome: data.nome, email: data.email, perfil: data.perfil }))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
