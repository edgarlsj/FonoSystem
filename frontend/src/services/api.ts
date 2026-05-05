import axios from 'axios'
import { showSessionExpiredNotification } from '../utils/notifications'

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor para adicionar JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para 401 - Token expirado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se for 401 (não autorizado/token expirado)
    if (error.response?.status === 401) {
      // Limpa dados do usuário
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')

      // Mostra notificação elegante
      showSessionExpiredNotification()

      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default api
