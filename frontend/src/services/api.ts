import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

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

// Interceptor para refresh automático em 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Se for 401 (não autorizado)
    if (error.response?.status === 401) {
      // Se ainda não tentou fazer refresh
      if (!originalRequest._retry) {
        originalRequest._retry = true
        try {
          const refreshToken = localStorage.getItem('refreshToken')
          if (!refreshToken) {
            // Sem refresh token, vai direto para login
            throw new Error('No refresh token')
          }

          const { data } = await axios.post(`${API_BASE}/v1/auth/refresh`, { refreshToken })
          localStorage.setItem('token', data.token)
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken)
          }
          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return api(originalRequest)
        } catch (err) {
          // Qualquer erro no refresh, limpa e vai para login
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
          return Promise.reject(err)
        }
      } else {
        // Já tentou refresh e ainda está 401, vai para login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
