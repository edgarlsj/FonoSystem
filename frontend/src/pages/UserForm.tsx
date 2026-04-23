import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

interface User {
  id: number
  nome: string
  email: string
  perfil: 'ADMIN' | 'FONOAUDIOLOGO' | 'SECRETARIA'
  numeroConselho: string | null
  ativo: boolean
}

export default function UserForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil: 'FONOAUDIOLOGO' as const,
    numeroConselho: '',
    ativo: true
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isEdit) {
      loadUser()
    }
  }, [id])

  const loadUser = async () => {
    try {
      const response = await api.get(`/v1/users/${id}`)
      const user = response.data
      setForm({
        nome: user.nome,
        email: user.email,
        senha: '',
        perfil: user.perfil,
        numeroConselho: user.numeroConselho || '',
        ativo: user.ativo
      })
    } catch (err) {
      console.error('Erro ao carregar usuário:', err)
      setError('Erro ao carregar usuário')
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!form.nome.trim()) errors.nome = 'Nome é obrigatório'
    if (!form.email.trim()) errors.email = 'Email é obrigatório'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email inválido'
    if (!form.perfil) errors.perfil = 'Perfil é obrigatório'

    if (!isEdit && !form.senha) {
      errors.senha = 'Senha é obrigatória para novo usuário'
    }
    if (form.senha && form.senha.length < 8) {
      errors.senha = 'Senha deve ter no mínimo 8 caracteres'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setLoading(true)
    try {
      const payload = {
        nome: form.nome,
        email: form.email,
        perfil: form.perfil,
        numeroConselho: form.numeroConselho || null,
        ativo: form.ativo
      } as Record<string, any>

      if (form.senha) {
        payload.senha = form.senha
      }

      if (isEdit) {
        await api.put(`/v1/users/${id}`, payload)
      } else {
        await api.post('/v1/users', payload)
      }

      setTimeout(() => navigate('/usuarios'), 1500)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao salvar usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px' }}>
      <h1>{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h1>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fecaca'
        }}>
          {error}
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
            placeholder="Nome completo"
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
            placeholder="email@exemplo.com"
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
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              boxSizing: 'border-box'
            }}
            placeholder="Ex: CRFa 2-12345"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Senha {!isEdit && '*'}
          </label>
          <input
            type="password"
            name="senha"
            value={form.senha}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: validationErrors.senha ? '2px solid #dc2626' : '1px solid #ddd',
              boxSizing: 'border-box'
            }}
            placeholder={isEdit ? 'Deixe em branco para manter a senha atual' : 'Mínimo 8 caracteres'}
          />
          {validationErrors.senha && (
            <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
              {validationErrors.senha}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Perfil *
          </label>
          <select
            name="perfil"
            value={form.perfil}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: validationErrors.perfil ? '2px solid #dc2626' : '1px solid #ddd',
              boxSizing: 'border-box'
            }}
          >
            <option value="ADMIN">Admin</option>
            <option value="FONOAUDIOLOGO">Fonoaudiólogo</option>
            <option value="SECRETARIA">Secretária</option>
          </select>
          {validationErrors.perfil && (
            <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
              {validationErrors.perfil}
            </p>
          )}
        </div>

        {isEdit && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="ativo"
                checked={form.ativo}
                onChange={handleChange}
              />
              <span style={{ fontWeight: '600' }}>Ativo</span>
            </label>
          </div>
        )}

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
            {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
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
