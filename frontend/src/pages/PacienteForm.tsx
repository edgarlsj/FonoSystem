import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../services/api'

interface Paciente {
  id: number
  nomeCompleto: string
  dataNascimento: string
  sexo: string
  cpf: string
  telefone: string
  nomeResponsavel: string
  telefoneResponsavel: string
  emailResponsavel: string
  grauParentesco: string
  tipoAtendimento: string
  convenio: string
  numeroConvenio: string
}

export default function PacienteForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [erro, setErro] = useState('')
  const [paciente, setPaciente] = useState<Paciente | null>(null)

  useEffect(() => {
    if (isEditing && id) {
      carregarPaciente()
    }
  }, [id, isEditing])

  const carregarPaciente = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/v1/pacientes/${id}`)
      setPaciente(data)
    } catch (err: any) {
      setErro('Erro ao carregar dados do paciente')
      setTimeout(() => navigate('/pacientes'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const dados = {
      nomeCompleto: form.get('nome'),
      dataNascimento: form.get('nascimento'),
      sexo: form.get('sexo'),
      cpf: form.get('cpf'),
      telefone: form.get('telefone'),
      nomeResponsavel: form.get('responsavel'),
      telefoneResponsavel: form.get('telResponsavel'),
      emailResponsavel: form.get('emailResponsavel'),
      grauParentesco: form.get('parentesco'),
      tipoAtendimento: form.get('tipoAtendimento'),
      convenio: form.get('convenio'),
      numeroConvenio: form.get('carteirinha'),
      consentimentoLgpd: form.get('lgpd') === 'on',
    }

    setLoading(true)
    setErro('')
    try {
      if (isEditing) {
        await api.put(`/v1/pacientes/${id}`, dados)
      } else {
        await api.post('/v1/pacientes', dados)
      }
      navigate('/pacientes')
    } catch (err: any) {
      setErro(err.response?.data?.detail || 'Erro ao salvar paciente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="breadcrumb">
        <a onClick={() => navigate('/pacientes')}>Pacientes</a><span>›</span> {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
      </div>
      <div className="page-header">
        <div>
          <div className="page-title">{isEditing ? 'Editar Paciente' : 'Cadastro de Paciente'}</div>
          <div className="page-subtitle">{isEditing ? 'Atualize os dados do paciente' : 'Preencha os dados do novo paciente'}</div>
        </div>
      </div>

      {loading && isEditing ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
          Carregando dados...
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <div className="form-card">
          <div className="form-section-title"><div className="section-icon"></div>Dados Pessoais</div>
          <div className="form-grid form-grid-3">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Nome Completo *</label>
              <input className="form-control" name="nome" required placeholder="Nome completo" defaultValue={paciente?.nomeCompleto || ''} />
            </div>
            <div className="form-group">
              <label>Data de Nascimento *</label>
              <input className="form-control" type="date" name="nascimento" required defaultValue={paciente?.dataNascimento || ''} />
            </div>
            <div className="form-group">
              <label>Sexo *</label>
              <select className="form-control" name="sexo" required defaultValue={paciente?.sexo || ''}>
                <option value="">Selecione...</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div className="form-group">
              <label>CPF</label>
              <input className="form-control" name="cpf" placeholder="000.000.000-00" defaultValue={paciente?.cpf || ''} />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input className="form-control" name="telefone" placeholder="(11) 99999-9999" defaultValue={paciente?.telefone || ''} />
            </div>
          </div>
        </div>

        <div className="form-card">
          <div className="form-section-title"><div className="section-icon"></div>Responsável Legal</div>
          <div className="form-grid form-grid-3">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Nome do Responsável *</label>
              <input className="form-control" name="responsavel" required placeholder="Nome completo" defaultValue={paciente?.nomeResponsavel || ''} />
            </div>
            <div className="form-group">
              <label>Telefone Responsável *</label>
              <input className="form-control" name="telResponsavel" required placeholder="(11) 99999-9999" defaultValue={paciente?.telefoneResponsavel || ''} />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2'}}>
              <label>E-mail</label>
              <input className="form-control" type="email" name="emailResponsavel" placeholder="email@exemplo.com" defaultValue={paciente?.emailResponsavel || ''} />
            </div>
            <div className="form-group">
              <label>Parentesco</label>
              <select className="form-control" name="parentesco" defaultValue={paciente?.grauParentesco || ''}>
                <option>Mãe</option><option>Pai</option><option>Avó/Avô</option><option>Outro</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-card">
          <div className="form-section-title"><div className="section-icon"></div>Convênio</div>
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label>Tipo de Atendimento *</label>
              <select className="form-control" name="tipoAtendimento" defaultValue={paciente?.tipoAtendimento || ''}>
                <option value="CONVENIO">Convênio</option><option value="PARTICULAR">Particular</option>
              </select>
            </div>
            <div className="form-group">
              <label>Convênio</label>
              <input className="form-control" name="convenio" placeholder="Nome do convênio" defaultValue={paciente?.convenio || ''} />
            </div>
            <div className="form-group">
              <label>Carteirinha</label>
              <input className="form-control" name="carteirinha" placeholder="Número" defaultValue={paciente?.numeroConvenio || ''} />
            </div>
          </div>
        </div>

        <div className="form-card">
          <div className="form-section-title"><div className="section-icon"></div>Consentimento (LGPD)</div>
          <div className="form-group">
            <label style={{ textTransform: 'none', fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>
              <input type="checkbox" name="lgpd" style={{ marginRight: '8px', transform: 'scale(1.2)' }} />
              Declaro que li e concordo com os termos de uso e política de privacidade (LGPD).
            </label>
          </div>
        </div>

        {erro && (
          <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #FECACA', fontSize: '13px' }}>
            {erro}
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/pacientes')}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : `✓ ${isEditing ? 'Atualizar' : 'Salvar'} Paciente`}
          </button>
        </div>
      </form>
    </div>
  )
}
