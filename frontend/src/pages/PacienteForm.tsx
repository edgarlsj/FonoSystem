import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../services/api'

export default function PacienteForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

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
      await api.post('/v1/pacientes', dados)
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
        <a onClick={() => navigate('/pacientes')}>Pacientes</a><span>›</span> Novo Paciente
      </div>
      <div className="page-header">
        <div>
          <div className="page-title">Cadastro de Paciente</div>
          <div className="page-subtitle">Preencha os dados do novo paciente</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-card">
          <div className="form-section-title"><div className="section-icon"></div>Dados Pessoais</div>
          <div className="form-grid form-grid-3">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Nome Completo *</label>
              <input className="form-control" name="nome" required placeholder="Nome completo" />
            </div>
            <div className="form-group">
              <label>Data de Nascimento *</label>
              <input className="form-control" type="date" name="nascimento" required />
            </div>
            <div className="form-group">
              <label>Sexo *</label>
              <select className="form-control" name="sexo" required>
                <option value="">Selecione...</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div className="form-group">
              <label>CPF</label>
              <input className="form-control" name="cpf" placeholder="000.000.000-00" />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input className="form-control" name="telefone" placeholder="(11) 99999-9999" />
            </div>
          </div>
        </div>

        <div className="form-card">
          <div className="form-section-title"><div className="section-icon"></div>Responsável Legal</div>
          <div className="form-grid form-grid-3">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Nome do Responsável *</label>
              <input className="form-control" name="responsavel" required placeholder="Nome completo" />
            </div>
            <div className="form-group">
              <label>Telefone Responsável *</label>
              <input className="form-control" name="telResponsavel" required placeholder="(11) 99999-9999" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2'}}>
              <label>E-mail</label>
              <input className="form-control" type="email" name="emailResponsavel" placeholder="email@exemplo.com" />
            </div>
            <div className="form-group">
              <label>Parentesco</label>
              <select className="form-control" name="parentesco">
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
              <select className="form-control" name="tipoAtendimento">
                <option value="CONVENIO">Convênio</option><option value="PARTICULAR">Particular</option>
              </select>
            </div>
            <div className="form-group">
              <label>Convênio</label>
              <input className="form-control" name="convenio" placeholder="Nome do convênio" />
            </div>
            <div className="form-group">
              <label>Carteirinha</label>
              <input className="form-control" name="carteirinha" placeholder="Número" />
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
            {loading ? 'Salvando...' : '✓ Salvar Paciente'}
          </button>
        </div>
      </form>
    </div>
  )
}
