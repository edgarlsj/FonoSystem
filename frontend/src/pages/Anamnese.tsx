import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

interface AnamneseForm {
  queixaPrincipal: string
  historicoClinico: string
  historicoFamiliar: string
  desenvolvimentoLinguagem: string
  desenvolvimentoMotor: string
  diagnosticoTea: string
  nivelEspectro: string
  usaCaa: string
  tipoCaa: string
  hipersensibilidades: string
  profissionaisAcompanham: string
  frequentaEscola: string
  tipoPerdaAuditiva: string
  grauPerda: string
  usaDispositivo: string
  tipoDispositivo: string
  dataAtivacao: string
  marcaModelo: string
  observacoes: string
}

const FORM_VAZIO: AnamneseForm = {
  queixaPrincipal: '',
  historicoClinico: '',
  historicoFamiliar: '',
  desenvolvimentoLinguagem: '',
  desenvolvimentoMotor: '',
  diagnosticoTea: 'Não',
  nivelEspectro: 'Nivel 1',
  usaCaa: 'Não',
  tipoCaa: '',
  hipersensibilidades: '',
  profissionaisAcompanham: '',
  frequentaEscola: '',
  tipoPerdaAuditiva: '',
  grauPerda: '',
  usaDispositivo: 'Não',
  tipoDispositivo: '',
  dataAtivacao: '',
  marcaModelo: '',
  observacoes: '',
}

export default function Anamnese() {
  const { id } = useParams()        // id do paciente
  const navigate = useNavigate()
  const [form, setForm] = useState<AnamneseForm>(FORM_VAZIO)
  const [anamneseId, setAnamneseId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    api.get(`/v1/pacientes/${id}/anamneses`)
      .then(res => {
        const lista = res.data
        if (lista && lista.length > 0) {
          const a = lista[0]
          setAnamneseId(a.id)
          setForm({
            queixaPrincipal: a.queixaPrincipal || '',
            historicoClinico: a.historicoClinico || '',
            historicoFamiliar: a.historicoFamiliar || '',
            desenvolvimentoLinguagem: a.desenvolvimentoLinguagem || '',
            desenvolvimentoMotor: a.desenvolvimentoMotor || '',
            diagnosticoTea: a.diagnosticoTea || 'Não',
            nivelEspectro: a.nivelEspectro || 'Nivel 1',
            usaCaa: a.usaCaa || 'Não',
            tipoCaa: a.tipoCaa || '',
            hipersensibilidades: a.hipersensibilidades || '',
            profissionaisAcompanham: a.profissionaisAcompanham || '',
            frequentaEscola: a.frequentaEscola || '',
            tipoPerdaAuditiva: a.tipoPerdaAuditiva || '',
            grauPerda: a.grauPerda || '',
            usaDispositivo: a.usaDispositivo || 'Não',
            tipoDispositivo: a.tipoDispositivo || '',
            dataAtivacao: a.dataAtivacao || '',
            marcaModelo: a.marcaModelo || '',
            observacoes: a.observacoes || '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const set = (field: keyof AnamneseForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setSucesso(false)
    setErro('')
  }

  const handleSalvar = async () => {
    if (!form.queixaPrincipal.trim()) {
      setErro('Queixa principal é obrigatória.')
      return
    }
    setSalvando(true)
    setErro('')
    setSucesso(false)
    try {
      if (anamneseId) {
        await api.put(`/v1/pacientes/${id}/anamneses/${anamneseId}`, form)
      } else {
        const res = await api.post(`/v1/pacientes/${id}/anamneses`, form)
        setAnamneseId(res.data.id)
      }
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (e: any) {
      console.error('Erro ao salvar:', e.response?.data || e.message)
      const errMsg =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.[0]?.defaultMessage ||
        e?.response?.data ||
        'Erro ao salvar anamnese.'
      setErro(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg))
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#6B7280' }}>
        Carregando anamnese...
      </div>
    )
  }

  return (
    <div>
      <div className="breadcrumb">
        <a onClick={() => navigate('/pacientes')} style={{ cursor: 'pointer' }}>Pacientes</a>
        <span>›</span>
        <a onClick={() => navigate(`/pacientes/${id}`)} style={{ cursor: 'pointer' }}>Paciente #{id}</a>
        <span>›</span> Anamnese
      </div>

      <div className="page-header">
        <div>
          <div className="page-title">Anamnese</div>
          <div className="page-subtitle">
            {anamneseId ? `Editando anamnese #${anamneseId}` : 'Nova anamnese'}
          </div>
        </div>
      </div>

      {/* Mensagens */}
      {sucesso && (
        <div style={{
          background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0',
          borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontWeight: 500
        }}>
          ✓ Anamnese salva com sucesso!
        </div>
      )}
      {erro && (
        <div style={{
          background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA',
          borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontWeight: 500
        }}>
          ⚠ {erro}
        </div>
      )}

      {/* Queixa e Histórico */}
      <div className="form-card">
        <div className="form-section-title">
          <div className="section-icon"></div>Queixa e Histórico
        </div>
        <div className="form-grid form-grid-2">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Queixa Principal *</label>
            <textarea
              className="form-control"
              placeholder="Descreva a queixa principal..."
              value={form.queixaPrincipal}
              onChange={e => set('queixaPrincipal', e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Histórico Clínico</label>
            <textarea
              className="form-control"
              placeholder="Histórico médico..."
              value={form.historicoClinico}
              onChange={e => set('historicoClinico', e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Histórico Familiar</label>
            <textarea
              className="form-control"
              placeholder="Histórico familiar..."
              value={form.historicoFamiliar}
              onChange={e => set('historicoFamiliar', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Desenvolvimento */}
      <div className="form-card">
        <div className="form-section-title">
          <div className="section-icon"></div>Desenvolvimento
        </div>
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label>Desenvolvimento de Linguagem</label>
            <textarea
              className="form-control"
              placeholder="Primeiras palavras, marcos de linguagem..."
              value={form.desenvolvimentoLinguagem}
              onChange={e => set('desenvolvimentoLinguagem', e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Desenvolvimento Motor</label>
            <textarea
              className="form-control"
              placeholder="Marcos motores, coordenação..."
              value={form.desenvolvimentoMotor}
              onChange={e => set('desenvolvimentoMotor', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Específico TEA */}
      <div className="form-card section-tea">
        <div className="form-section-title">
          <div className="section-icon"></div>Específico TEA
        </div>
        <div className="form-grid form-grid-3">
          <div className="form-group">
            <label>Diagnóstico TEA</label>
            <select className="form-control" value={form.diagnosticoTea} onChange={e => set('diagnosticoTea', e.target.value)}>
              <option>Sim</option>
              <option>Em investigação</option>
              <option>Não</option>
            </select>
          </div>
          <div className="form-group">
            <label>Nível (DSM-5)</label>
            <select className="form-control" value={form.nivelEspectro} onChange={e => set('nivelEspectro', e.target.value)}>
              <option>Nivel 1</option>
              <option>Nivel 2</option>
              <option>Nivel 3</option>
            </select>
          </div>
          <div className="form-group">
            <label>Usa CAA?</label>
            <select className="form-control" value={form.usaCaa} onChange={e => set('usaCaa', e.target.value)}>
              <option>Sim</option>
              <option>Não</option>
              <option>Em introdução</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tipo de CAA</label>
            <input
              className="form-control"
              placeholder="Ex: PECS, LetMeTalk..."
              value={form.tipoCaa}
              onChange={e => set('tipoCaa', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Frequenta Escola?</label>
            <input
              className="form-control"
              placeholder="Ex: Sim, escola regular"
              value={form.frequentaEscola}
              onChange={e => set('frequentaEscola', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Profissionais que Acompanham</label>
            <input
              className="form-control"
              placeholder="Ex: TO, psicólogo..."
              value={form.profissionaisAcompanham}
              onChange={e => set('profissionaisAcompanham', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 3' }}>
            <label>Hipersensibilidades</label>
            <textarea
              className="form-control"
              placeholder="Sensibilidades sensoriais, alimentares..."
              value={form.hipersensibilidades}
              onChange={e => set('hipersensibilidades', e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Reabilitação Auditiva */}
      <div className="form-card">
        <div className="form-section-title">
          <div className="section-icon"></div>Reabilitação Auditiva
        </div>
        <div className="form-grid form-grid-3">
          <div className="form-group">
            <label>Tipo de Perda Auditiva</label>
            <select className="form-control" value={form.tipoPerdaAuditiva} onChange={e => set('tipoPerdaAuditiva', e.target.value)}>
              <option value="">Selecione...</option>
              <option>Neurossensorial</option>
              <option>Condutiva</option>
              <option>Mista</option>
            </select>
          </div>
          <div className="form-group">
            <label>Grau da Perda</label>
            <select className="form-control" value={form.grauPerda} onChange={e => set('grauPerda', e.target.value)}>
              <option value="">Selecione...</option>
              <option>Leve</option>
              <option>Moderada</option>
              <option>Severa</option>
              <option>Profunda</option>
            </select>
          </div>
          <div className="form-group">
            <label>Usa Dispositivo?</label>
            <select className="form-control" value={form.usaDispositivo} onChange={e => set('usaDispositivo', e.target.value)}>
              <option>Sim</option>
              <option>Não</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tipo de Dispositivo</label>
            <input
              className="form-control"
              placeholder="Ex: AASI, Implante Coclear..."
              value={form.tipoDispositivo}
              onChange={e => set('tipoDispositivo', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Data de Ativação</label>
            <input
              type="date"
              className="form-control"
              value={form.dataAtivacao}
              onChange={e => set('dataAtivacao', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Marca / Modelo</label>
            <input
              className="form-control"
              placeholder="Ex: Cochlear Nucleus 7"
              value={form.marcaModelo}
              onChange={e => set('marcaModelo', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="form-card">
        <div className="form-section-title">
          <div className="section-icon"></div>Observações Gerais
        </div>
        <div className="form-group">
          <textarea
            className="form-control"
            placeholder="Observações adicionais..."
            value={form.observacoes}
            onChange={e => set('observacoes', e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-outline" onClick={() => navigate(`/pacientes/${id}`)}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={handleSalvar} disabled={salvando}>
          {salvando ? 'Salvando...' : '✓ Salvar Anamnese'}
        </button>
      </div>
    </div>
  )
}
