import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await login(email, senha)
      navigate('/')
    } catch {
      setErro('Email ou senha inválidos')
      // Limpar apenas a senha, mantém o email preenchido
      setSenha('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0C2D48 0%, #1A4D73 50%, #2E74B5 100%)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎙️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0C2D48' }}>
            Fono<span style={{ color: '#6BACE0', fontWeight: 400 }}>System</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
            Sistema de Gestão Fonoaudiológica
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Email</label>
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Senha</label>
            <input
              className="form-control"
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {erro && (
            <div style={{
              background: '#FEF2F2', color: '#991B1B', padding: '10px 14px',
              borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
              border: '1px solid #FECACA',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{erro}</span>
              <button
                type="button"
                onClick={() => setErro('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#991B1B',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '0',
                  marginLeft: '10px'
                }}
              >
                ✕
              </button>
            </div>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: '14px' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>


      </div>
    </div>
  )
}
