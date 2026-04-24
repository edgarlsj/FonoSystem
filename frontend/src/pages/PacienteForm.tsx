import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
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
  endereco: string
  bairro: string
  cidadeUf: string
  contatoEmergencia: string
}

export default function PacienteForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const [loading, setLoading] = useState(isEditing)
  const [erro, setErro] = useState('')
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Refs para campos obrigatórios
  const nomeRef = useRef<HTMLInputElement>(null)
  const nascimentoRef = useRef<HTMLInputElement>(null)
  const sexoRef = useRef<HTMLSelectElement>(null)
  const responsavelRef = useRef<HTMLInputElement>(null)
  const telResponsavelRef = useRef<HTMLInputElement>(null)
  const tipoAtendimentoRef = useRef<HTMLSelectElement>(null)

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

  const validateForm = (form: FormData): Record<string, string> => {
    const errors: Record<string, string> = {}
    const nome = form.get('nome')?.toString().trim()
    const nascimento = form.get('nascimento')?.toString().trim()
    const sexo = form.get('sexo')?.toString().trim()
    const responsavel = form.get('responsavel')?.toString().trim()
    const telResponsavel = form.get('telResponsavel')?.toString().trim()
    const tipoAtendimento = form.get('tipoAtendimento')?.toString().trim()

    if (!nome) errors.nome = 'Nome Completo é obrigatório'
    if (!nascimento) errors.nascimento = 'Data de Nascimento é obrigatória'
    if (!sexo) errors.sexo = 'Sexo é obrigatório'
    if (!responsavel) errors.responsavel = 'Nome do Responsável é obrigatório'
    if (!telResponsavel) errors.telResponsavel = 'Telefone do Responsável é obrigatório'
    if (!tipoAtendimento) errors.tipoAtendimento = 'Tipo de Atendimento é obrigatório'

    setFieldErrors(errors)
    return errors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    // Validar campos obrigatórios
    const errors = validateForm(form)
    if (Object.keys(errors).length > 0) {
      // Fazer scroll até o primeiro campo com erro
      if (errors.nome) nomeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      else if (errors.nascimento) nascimentoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      else if (errors.sexo) sexoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      else if (errors.responsavel) responsavelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      else if (errors.telResponsavel) telResponsavelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      else if (errors.tipoAtendimento) tipoAtendimentoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

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
      endereco: form.get('endereco'),
      bairro: form.get('bairro'),
      cidadeUf: form.get('cidadeUf'),
      contatoEmergencia: form.get('contatoEmergencia'),
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
              <input
                ref={nomeRef}
                className="form-control"
                name="nome"
                required
                placeholder="Nome completo"
                defaultValue={paciente?.nomeCompleto || ''}
                style={{ border: fieldErrors.nome ? '2px solid #dc2626' : undefined }}
              />
              {fieldErrors.nome && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>⚠ {fieldErrors.nome}</div>}
            </div>
            <div className="form-group">
              <label>Data de Nascimento *</label>
              <input
                ref={nascimentoRef}
                className="form-control"
                type="date"
                name="nascimento"
                required
                defaultValue={paciente?.dataNascimento || ''}
                style={{ border: fieldErrors.nascimento ? '2px solid #dc2626' : undefined }}
              />
              {fieldErrors.nascimento && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>⚠ {fieldErrors.nascimento}</div>}
            </div>
            <div className="form-group">
              <label>Sexo *</label>
              <select
                ref={sexoRef}
                className="form-control"
                name="sexo"
                required
                defaultValue={paciente?.sexo || ''}
                style={{ border: fieldErrors.sexo ? '2px solid #dc2626' : undefined }}
              >
                <option value="">Selecione...</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
              {fieldErrors.sexo && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>⚠ {fieldErrors.sexo}</div>}
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
              <input
                ref={responsavelRef}
                className="form-control"
                name="responsavel"
                required
                placeholder="Nome completo"
                defaultValue={paciente?.nomeResponsavel || ''}
                style={{ border: fieldErrors.responsavel ? '2px solid #dc2626' : undefined }}
              />
              {fieldErrors.responsavel && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>⚠ {fieldErrors.responsavel}</div>}
            </div>
            <div className="form-group">
              <label>Telefone Responsável *</label>
              <input
                ref={telResponsavelRef}
                className="form-control"
                name="telResponsavel"
                required
                placeholder="(11) 99999-9999"
                defaultValue={paciente?.telefoneResponsavel || ''}
                style={{ border: fieldErrors.telResponsavel ? '2px solid #dc2626' : undefined }}
              />
              {fieldErrors.telResponsavel && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>⚠ {fieldErrors.telResponsavel}</div>}
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
          <div className="form-section-title"><div className="section-icon"></div>Endereço e Contato</div>
          <div className="form-grid form-grid-3">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Endereço</label>
              <input className="form-control" name="endereco" placeholder="Rua, Número, Complemento" defaultValue={paciente?.endereco || ''} />
            </div>
            <div className="form-group">
              <label>Contato de Emergência</label>
              <input className="form-control" name="contatoEmergencia" placeholder="Nome e telefone" defaultValue={paciente?.contatoEmergencia || ''} />
            </div>
            <div className="form-group">
              <label>Bairro</label>
              <input className="form-control" name="bairro" placeholder="Bairro" defaultValue={paciente?.bairro || ''} />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Cidade/UF</label>
              <input className="form-control" name="cidadeUf" placeholder="Cidade / Sigla Estado" defaultValue={paciente?.cidadeUf || ''} />
            </div>
          </div>
        </div>

        <div className="form-card">
          <div className="form-section-title"><div className="section-icon"></div>Convênio</div>
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label>Tipo de Atendimento *</label>
              <select
                ref={tipoAtendimentoRef}
                className="form-control"
                name="tipoAtendimento"
                defaultValue={paciente?.tipoAtendimento || ''}
                style={{ border: fieldErrors.tipoAtendimento ? '2px solid #dc2626' : undefined }}
              >
                <option value="CONVENIO">Convênio</option><option value="PARTICULAR">Particular</option>
              </select>
              {fieldErrors.tipoAtendimento && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>⚠ {fieldErrors.tipoAtendimento}</div>}
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
