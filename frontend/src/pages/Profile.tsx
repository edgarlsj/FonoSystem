import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

interface ProfileData {
  nome: string
  email: string
  numeroConselho: string
  senhaAtual: string
  senhaNova: string
  confirmarSenha: string
}

export default function Profile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState<ProfileData>({
    nome: '',
    email: '',
    numeroConselho: '',
    senhaAtual: '',
    senhaNova: '',
    confirmarSenha: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        nome: user.nome,
        email: user.email,
        numeroConselho: user.numeroConselho || ''
      }))
    }
  }, [user])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!form.nome.trim()) errors.nome = 'Nome é obrigatório'
    if (!form.email.trim()) errors.email = 'Email é obrigatório'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Email inválido'
    }

    if (form.senhaNova || form.senhaAtual) {
      if (!form.senhaAtual) errors.senhaAtual = 'Senha atual é obrigatória'
      if (!form.senhaNova) errors.senhaNova = 'Nova senha é obrigatória'
      if (form.senhaNova.length < 8) {
        errors.senhaNova = 'Senha deve ter no mínimo 8 caracteres'
      }
      if (form.senhaNova !== form.confirmarSenha) {
        errors.confirmarSenha = 'Senhas não conferem'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) return

    setLoading(true)
    try {
      const payload: any = {
        nome: form.nome,
        email: form.email,
        numeroConselho: form.numeroConselho || null,
        perfil: user?.perfil
      }

      if (form.senhaNova) {
        payload.senha = form.senhaNova
      }

      const response = await api.put(`/v1/users/${user?.id}`, payload)
      const updatedUserData = response.data
      setSuccess('Perfil atualizado com sucesso! Redirecionando...')

      // Atualizar localStorage com os dados retornados pelo servidor
      localStorage.setItem('user', JSON.stringify({
        id: updatedUserData.id,
        nome: updatedUserData.nome,
        email: updatedUserData.email,
        perfil: updatedUserData.perfil,
        numeroConselho: updatedUserData.numeroConselho
      }))

      // Limpar apenas os campos de senha (não limpar nome e email)
      setForm(prev => ({
        ...prev,
        senhaAtual: '',
        senhaNova: '',
        confirmarSenha: ''
      }))

      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Erro ao atualizar perfil'
      setError(errorMsg)

      // Limpar apenas campos de senha, NUNCA limpar email ou nome
      setForm(prev => ({
        ...prev,
        senhaAtual: '',
        senhaNova: '',
        confirmarSenha: ''
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px' }}>
      <h1>Meu Perfil</h1>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fecaca',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#991b1b',
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

      {success && (
        <div style={{
          backgroundColor: '#dcfce7',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #bbf7d0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#166534',
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

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Nome *
          </label>
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: validationErrors.nome ? '2px solid #dc2626' : '1px solid #ddd',
              boxSizing: 'border-box'
            }}
          />
          {validationErrors.nome && (
            <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
              {validationErrors.nome}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: validationErrors.email ? '2px solid #dc2626' : '1px solid #ddd',
              boxSizing: 'border-box'
            }}
          />
          {validationErrors.email && (
            <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
              {validationErrors.email}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Nº do Conselho (CRFa)
          </label>
          <input
            type="text"
            name="numeroConselho"
            value={form.numeroConselho}
            onChange={handleChange}
            placeholder="Ex: CRFa 2-12345"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              boxSizing: 'border-box'
            }}
          />
          <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '5px' }}>
            Será exibido nos documentos impressos junto com o nome: <strong>{form.nome || '—'}</strong>
          </p>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '14px' }}>
            Alterar Senha (opcional)
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>
              Senha Atual
            </label>
            <input
              type="password"
              name="senhaAtual"
              value={form.senhaAtual}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: validationErrors.senhaAtual ? '2px solid #dc2626' : '1px solid #ddd',
                boxSizing: 'border-box'
              }}
              placeholder="Digite sua senha atual"
            />
            {validationErrors.senhaAtual && (
              <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
                {validationErrors.senhaAtual}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>
              Nova Senha
            </label>
            <input
              type="password"
              name="senhaNova"
              value={form.senhaNova}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: validationErrors.senhaNova ? '2px solid #dc2626' : '1px solid #ddd',
                boxSizing: 'border-box'
              }}
              placeholder="Nova senha (mín 8 caracteres)"
            />
            {validationErrors.senhaNova && (
              <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
                {validationErrors.senhaNova}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              name="confirmarSenha"
              value={form.confirmarSenha}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: validationErrors.confirmarSenha ? '2px solid #dc2626' : '1px solid #ddd',
                boxSizing: 'border-box'
              }}
              placeholder="Confirme a nova senha"
            />
            {validationErrors.confirmarSenha && (
              <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
                {validationErrors.confirmarSenha}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
