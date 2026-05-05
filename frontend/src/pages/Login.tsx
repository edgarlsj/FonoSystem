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
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErro('Email ou senha inválidos')
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setErro('Não foi possível conectar ao servidor')
      } else if (err.response?.status >= 500) {
        setErro('Erro no servidor. Tente novamente mais tarde.')
      } else {
        setErro(err.response?.data?.detail || 'Erro ao conectar. Tente novamente.')
      }
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Efeito de fundo animado */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        top: '-200px',
        right: '-200px',
        animation: 'float 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '50%',
        bottom: '-150px',
        left: '-150px',
        animation: 'float 10s ease-in-out infinite reverse',
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(30px); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-container {
          animation: slideUp 0.6s ease-out;
        }

        .login-input {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 15px;
          font-weight: 500;
          color: #1f2937;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .login-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          background: white;
        }

        .login-input::placeholder {
          color: #9ca3af;
        }

        .login-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px 24px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
          position: relative;
          overflow: hidden;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }

        .login-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fee2e2;
          padding: 14px 16px;
          border-radius: 12px;
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(10px);
          animation: slideUp 0.3s ease-out;
        }

        .login-error button {
          background: transparent;
          border: none;
          color: #fee2e2;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          margin-left: 10px;
          transition: all 0.2s ease;
        }

        .login-error button:hover {
          transform: scale(1.2);
        }

        .loading-spinner {
          display: inline-block;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          margin: 0 3px;
          animation: spin 1s infinite;
        }

        .loading-spinner:nth-child(2) { animation-delay: 0.1s; }
        .loading-spinner:nth-child(3) { animation-delay: 0.2s; }

        @keyframes spin {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="login-container" style={{
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '56px 48px',
        width: '100%',
        maxWidth: '460px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontSize: '56px',
            marginBottom: '16px',
            display: 'inline-block',
            animation: 'float 3s ease-in-out infinite',
          }}>
            🧩
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 800,
            color: 'white',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px',
          }}>
            Live System
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: '0',
            fontWeight: 500,
          }}>
            Reabilitação Auditiva & Neurodesenvolvimento
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              📧 Email
            </label>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              🔒 Senha
            </label>
            <input
              className="login-input"
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {erro && (
            <div className="login-error" style={{ marginBottom: '24px' }}>
              <span>⚠️ {erro}</span>
              <button
                type="button"
                onClick={() => setErro('')}
              >
                ✕
              </button>
            </div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', width: '20px' }}>
                  <span className="loading-spinner" />
                  <span className="loading-spinner" />
                  <span className="loading-spinner" />
                </span>
              </>
            ) : (
              '🚀 Entrar'
            )}
          </button>

          <p style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '12px',
            marginTop: '20px',
            margin: '20px 0 0 0',
          }}>
            v1.0.0 | © 2026 Live System
          </p>
        </form>
      </div>
    </div>
  )
}
