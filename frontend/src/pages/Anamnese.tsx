import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import PacienteAcoesMenu from '../components/PacienteAcoesMenu'
import { useInTab } from '../context/TabContext'

interface PacienteInfo {
  nomeCompleto: string;
  dataNascimento: string;
  idade: number;
  sexo: string;
  endereco: string;
  bairro: string;
  cidadeUf: string;
  contatoEmergencia: string;
}

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
  alergias: string;
  medicacoes: string;
  nomeMae: string;
  dataNascMae: string;
  telefoneMae: string;
  profissaoMae: string;
  nomePai: string;
  dataNascPai: string;
  telefonePai: string;
  profissaoPai: string;
  irmaos: string;
  outrosFamiliares: string;
  periodoCuidadores: string;
  semanasGestacao: string;
  tipoParto: string;
  intercorrenciasParto: string;
  testeOrelhinha: string;
  testeLinguinha: string;
  amamentacaoChupeta: string;
  histPerdaAuditiva: boolean;
  histTranstornosNeurologicos: boolean;
  histConvulsoes: boolean;
  histMalformacaoFetal: boolean;
  histGagueira: boolean;
  histOutros: string;
  idadeFirmouPescoco: string;
  idadeSentou: string;
  idadeEngatinhou: string;
  idadeAndou: string;
  maoReferencia: string;
  andaPontaPe: string;
  autonomiaVestir: string;
  sentaW: string;
  idadeBalbuciou: string;
  idadePrimeirasPalavras: string;
  gagueja: string;
  comunicacaoAtual: string;
  trocasFala: string;
  rotinaSono: string;
  rotinaAlimentacao: string;
  restricaoAlimentar: string;
  rotinaSocializacao: string;
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
  alergias: '',
  medicacoes: '',
  nomeMae: '',
  dataNascMae: '',
  telefoneMae: '',
  profissaoMae: '',
  nomePai: '',
  dataNascPai: '',
  telefonePai: '',
  profissaoPai: '',
  irmaos: '',
  outrosFamiliares: '',
  periodoCuidadores: '',
  semanasGestacao: '',
  tipoParto: '',
  intercorrenciasParto: '',
  testeOrelhinha: '',
  testeLinguinha: '',
  amamentacaoChupeta: '',
  histPerdaAuditiva: false,
  histTranstornosNeurologicos: false,
  histConvulsoes: false,
  histMalformacaoFetal: false,
  histGagueira: false,
  histOutros: '',
  idadeFirmouPescoco: '',
  idadeSentou: '',
  idadeEngatinhou: '',
  idadeAndou: '',
  maoReferencia: '',
  andaPontaPe: '',
  autonomiaVestir: '',
  sentaW: '',
  idadeBalbuciou: '',
  idadePrimeirasPalavras: '',
  gagueja: '',
  comunicacaoAtual: '',
  trocasFala: '',
  rotinaSono: '',
  rotinaAlimentacao: '',
  restricaoAlimentar: '',
  rotinaSocializacao: ''
}

export default function Anamnese() {
  const { id } = useParams()
  const navigate = useNavigate()
  const inTab = useInTab()
  const [form, setForm] = useState<AnamneseForm>(FORM_VAZIO)
  const [pacienteInfo, setPacienteInfo] = useState<PacienteInfo | null>(null)
  const [anamneseId, setAnamneseId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const queixaPrincipalRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // 1. Carregar dados do paciente
    api.get(`/v1/pacientes/${id}`)
      .then(res => setPacienteInfo(res.data))
      .catch(() => {})

    // 2. Carregar anamnese existente
    api.get(`/v1/pacientes/${id}/anamneses`)
      .then(res => {
        const lista = res.data
        if (lista && lista.length > 0) {
          const a = lista[0]
          setAnamneseId(a.id)
          setForm({
            ...FORM_VAZIO,
            ...a,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const set = (field: keyof AnamneseForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setSucesso(false)
    setErro('')
    // Limpar erro específico do campo quando usuário começa a editar
    if (fieldErrors[field as string]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field as string]
        return newErrors
      })
    }
  }

  const handleSalvar = async () => {
    // Validar campos obrigatórios
    const errors: Record<string, string> = {}
    if (!form.queixaPrincipal.trim()) {
      errors.queixaPrincipal = 'Queixa principal é obrigatória.'
    }

    // Se há erros, mostrar e navegar até primeiro campo inválido
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      // Navegar até o primeiro campo com erro
      queixaPrincipalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // Limpar erros se validação passou
    setFieldErrors({})
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
      window.scrollTo(0, 0)
      setTimeout(() => setSucesso(false), 3000)
    } catch (e: any) {
      console.error('Erro ao salvar:', e.response?.data || e.message)
      const errMsg =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.[0]?.defaultMessage ||
        e?.response?.data ||
        'Erro ao salvar anamnese.'
      setErro(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg))
      window.scrollTo(0, 0)
    } finally {
      setSalvando(false)
    }
  }

  const handleGerarPdf = async () => {
    try {
      const response = await api.get(`/v1/pacientes/${id}/anamneses/pdf`, {
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => window.URL.revokeObjectURL(url), 100)
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (e: any) {
      console.error('Erro ao gerar PDF:', e)
      const errMsg = e?.response?.data?.message || 'Erro ao gerar PDF da anamnese.'
      setErro(typeof errMsg === 'string' ? errMsg : 'Erro ao gerar PDF da anamnese.')
      window.scrollTo(0, 0)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#6B7280' }}>
        Carregando dados...
      </div>
    )
  }

  return (
    <div>
      {!inTab && (
        <>
          <div className="breadcrumb">
            <button onClick={() => navigate('/pacientes')} className="breadcrumb-btn">Pacientes</button>
            <span>›</span>
            <button onClick={() => navigate(`/pacientes/${id}`)} className="breadcrumb-btn bold">
              {pacienteInfo?.nomeCompleto || `Paciente #${id}`}
            </button>
            <span>›</span> Anamnese Fonoaudiológica
          </div>
          <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="btn btn-outline" onClick={() => navigate('/pacientes')} title="Voltar">← Voltar</button>
              <div>
                <div className="page-title">🩺 Anamnese Fonoaudiológica</div>
                <div className="page-subtitle" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
                  {pacienteInfo?.nomeCompleto || ''}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="btn btn-primary" onClick={handleGerarPdf} title="Gerar PDF da anamnese">📥 Gerar PDF</button>
              <PacienteAcoesMenu pacienteId={id!} paginaAtual="anamnese" />
            </div>
          </div>
        </>
      )}

      {/* Botão de PDF em modo tab */}
      {inTab && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
          <button className="btn btn-primary" onClick={handleGerarPdf} title="Gerar PDF da anamnese">📥 Gerar PDF</button>
        </div>
      )}

      {/* Mensagens */}
      {sucesso && (
        <div style={{ background: '#D1FAE5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontWeight: 500 }}>
          ✓ Anamnese salva com sucesso!
        </div>
      )}
      {erro && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontWeight: 500 }}>
          ⚠ {erro}
        </div>
      )}

      {/* I. Dados do paciente (ReadOnly mostly) */}
      <div className="form-card">
        <div className="form-section-title">I. Dados do paciente</div>
        <div className="form-grid form-grid-3" style={{ background: '#F3F4F6', padding: '16px', borderRadius: '8px' }}>
          <div><small>Nome:</small><br/><b>{pacienteInfo?.nomeCompleto || '-'}</b></div>
          <div><small>Data Nasc:</small><br/><b>{pacienteInfo?.dataNascimento || '-'} ({pacienteInfo?.idade || 0} anos)</b></div>
          <div><small>Sexo:</small><br/><b>{pacienteInfo?.sexo || '-'}</b></div>
          <div style={{ gridColumn: 'span 2' }}><small>Endereço:</small><br/><b>{pacienteInfo?.endereco || '-'}</b></div>
          <div><small>Bairro:</small><br/><b>{pacienteInfo?.bairro || '-'}</b></div>
          <div><small>Cidade/UF:</small><br/><b>{pacienteInfo?.cidadeUf || '-'}</b></div>
          <div style={{ gridColumn: 'span 2' }}><small>Contato de Emergência:</small><br/><b>{pacienteInfo?.contatoEmergencia || '-'}</b></div>
        </div>
        
        <div className="form-grid form-grid-2" style={{ marginTop: '16px' }}>
          <div className="form-group">
            <label>Alérgico a algo?</label>
            <input className="form-control" value={form.alergias} onChange={e => set('alergias', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Toma medicação? Se sim, qual:</label>
            <input className="form-control" value={form.medicacoes} onChange={e => set('medicacoes', e.target.value)} />
          </div>
        </div>
      </div>

      {/* II. Familiares Reponsáveis */}
      <div className="form-card">
        <div className="form-section-title">II. Familiares Responsáveis pelo Tratamento</div>
        
        <h5 style={{ marginTop: '10px', marginBottom: '10px', color: '#4B5563' }}>Mãe</h5>
        <div className="form-grid form-grid-4">
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Nome</label><input className="form-control" value={form.nomeMae} onChange={e => set('nomeMae', e.target.value)} /></div>
          <div className="form-group"><label>Data de Nasc.</label><input className="form-control" value={form.dataNascMae} onChange={e => set('dataNascMae', e.target.value)} /></div>
          <div className="form-group"><label>Telefone</label><input className="form-control" value={form.telefoneMae} onChange={e => set('telefoneMae', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Profissão</label><input className="form-control" value={form.profissaoMae} onChange={e => set('profissaoMae', e.target.value)} /></div>
        </div>

        <h5 style={{ marginTop: '15px', marginBottom: '10px', color: '#4B5563' }}>Pai</h5>
        <div className="form-grid form-grid-4">
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Nome</label><input className="form-control" value={form.nomePai} onChange={e => set('nomePai', e.target.value)} /></div>
          <div className="form-group"><label>Data de Nasc.</label><input className="form-control" value={form.dataNascPai} onChange={e => set('dataNascPai', e.target.value)} /></div>
          <div className="form-group"><label>Telefone</label><input className="form-control" value={form.telefonePai} onChange={e => set('telefonePai', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Profissão</label><input className="form-control" value={form.profissaoPai} onChange={e => set('profissaoPai', e.target.value)} /></div>
        </div>

        <div className="form-grid form-grid-2" style={{ marginTop: '15px' }}>
          <div className="form-group"><label>Irmão(s) / idade</label><input className="form-control" value={form.irmaos} onChange={e => set('irmaos', e.target.value)} /></div>
          <div className="form-group"><label>Outros Familiares</label><input className="form-control" value={form.outrosFamiliares} onChange={e => set('outrosFamiliares', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Qual período a criança está em casa na companhia dos cuidadores?</label><input className="form-control" value={form.periodoCuidadores} onChange={e => set('periodoCuidadores', e.target.value)} /></div>
          
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Queixas Principais *</label>
            <textarea
              ref={queixaPrincipalRef}
              className="form-control"
              rows={3}
              value={form.queixaPrincipal}
              onChange={e => set('queixaPrincipal', e.target.value)}
              style={{
                border: fieldErrors.queixaPrincipal ? '2px solid #dc2626' : '1px solid #ddd',
                outline: fieldErrors.queixaPrincipal ? '2px solid #fecaca' : 'none',
                outlineOffset: '-1px'
              }}
            />
            {fieldErrors.queixaPrincipal && (
              <div style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '4px' }}>
                ⚠ {fieldErrors.queixaPrincipal}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* III. Antecedentes Pessoais */}
      <div className="form-card">
        <div className="form-section-title">III. Antecedentes Pessoais</div>
        <div className="form-grid form-grid-3">
          <div className="form-group"><label>Gestação (semanas)</label><input className="form-control" value={form.semanasGestacao} onChange={e => set('semanasGestacao', e.target.value)} /></div>
          <div className="form-group"><label>Tipo de Parto</label><input className="form-control" value={form.tipoParto} onChange={e => set('tipoParto', e.target.value)} /></div>
          <div className="form-group"><label>Teste da Orelhinha</label><input className="form-control" placeholder="Passou/Falhou" value={form.testeOrelhinha} onChange={e => set('testeOrelhinha', e.target.value)} /></div>
          <div className="form-group"><label>Teste da Linguinha</label><input className="form-control" value={form.testeLinguinha} onChange={e => set('testeLinguinha', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Uso de Mamadeira / Chupeta / Peito</label><input className="form-control" value={form.amamentacaoChupeta} onChange={e => set('amamentacaoChupeta', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 3' }}><label>Houve intercorrência? Quais?</label><textarea className="form-control" value={form.intercorrenciasParto} onChange={e => set('intercorrenciasParto', e.target.value)} /></div>
          {/* Historical clinical fallback if used previously */}
          <div className="form-group" style={{ gridColumn: 'span 3' }}>
            <label>Histórico Clínico Adicional</label>
            <textarea className="form-control" value={form.historicoClinico} onChange={e => set('historicoClinico', e.target.value)} rows={2} />
          </div>
        </div>
      </div>

      {/* IV. Antecedentes Familiares */}
      <div className="form-card">
        <div className="form-section-title">IV. Antecedentes Familiares (Histórico)</div>
        <div className="form-grid form-grid-3">
          <label className="checkbox-label"><input type="checkbox" checked={form.histPerdaAuditiva} onChange={e => set('histPerdaAuditiva', e.target.checked)}/> Perda Auditiva</label>
          <label className="checkbox-label"><input type="checkbox" checked={form.histTranstornosNeurologicos} onChange={e => set('histTranstornosNeurologicos', e.target.checked)}/> Transtornos Neurológicos</label>
          <label className="checkbox-label"><input type="checkbox" checked={form.histConvulsoes} onChange={e => set('histConvulsoes', e.target.checked)}/> Convulsões</label>
          <label className="checkbox-label"><input type="checkbox" checked={form.histMalformacaoFetal} onChange={e => set('histMalformacaoFetal', e.target.checked)}/> Malformação Fetal</label>
          <label className="checkbox-label"><input type="checkbox" checked={form.histGagueira} onChange={e => set('histGagueira', e.target.checked)}/> Gagueira</label>
        </div>
        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>Outros diagnósticos na família</label>
          <textarea className="form-control" value={form.histOutros} onChange={e => set('histOutros', e.target.value)} />
        </div>
      </div>

      {/* V. Desenvolvimento Motor */}
      <div className="form-card">
        <div className="form-section-title">V. Desenvolvimento Motor</div>
        <div className="form-grid form-grid-4">
          <div className="form-group"><label>Firmou o pescoço</label><input className="form-control" value={form.idadeFirmouPescoco} onChange={e => set('idadeFirmouPescoco', e.target.value)} /></div>
          <div className="form-group"><label>Sentou</label><input className="form-control" value={form.idadeSentou} onChange={e => set('idadeSentou', e.target.value)} /></div>
          <div className="form-group"><label>Engatinhou</label><input className="form-control" value={form.idadeEngatinhou} onChange={e => set('idadeEngatinhou', e.target.value)} /></div>
          <div className="form-group"><label>Andou</label><input className="form-control" value={form.idadeAndou} onChange={e => set('idadeAndou', e.target.value)} /></div>
          <div className="form-group"><label>Qual mão referência</label><input className="form-control" value={form.maoReferencia} onChange={e => set('maoReferencia', e.target.value)} /></div>
          <div className="form-group"><label>Anda na ponta do pé</label><input className="form-control" value={form.andaPontaPe} onChange={e => set('andaPontaPe', e.target.value)} /></div>
          <div className="form-group"><label>Senta em W</label><input className="form-control" value={form.sentaW} onChange={e => set('sentaW', e.target.value)} /></div>
          <div className="form-group"><label>Autonomia p/ vestir</label><input className="form-control" value={form.autonomiaVestir} onChange={e => set('autonomiaVestir', e.target.value)} /></div>
        </div>
      </div>

      {/* VI. Desenvolvimento da Linguagem */}
      <div className="form-card">
        <div className="form-section-title">VI. Desenvolvimento da Linguagem</div>
        <div className="form-grid form-grid-3">
          <div className="form-group"><label>Balbuciou (idade)</label><input className="form-control" value={form.idadeBalbuciou} onChange={e => set('idadeBalbuciou', e.target.value)} /></div>
          <div className="form-group"><label>Primeiras palavras (idade)</label><input className="form-control" value={form.idadePrimeirasPalavras} onChange={e => set('idadePrimeirasPalavras', e.target.value)} /></div>
          <div className="form-group"><label>Gagueja?</label><input className="form-control" value={form.gagueja} onChange={e => set('gagueja', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 3' }}><label>Atualmente como se comunica?</label><textarea className="form-control" value={form.comunicacaoAtual} onChange={e => set('comunicacaoAtual', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 3' }}><label>Apresenta trocas na fala? Quais?</label><textarea className="form-control" value={form.trocasFala} onChange={e => set('trocasFala', e.target.value)} /></div>
        </div>
      </div>

      {/* VII. Rotina */}
      <div className="form-card">
        <div className="form-section-title">VII. Rotina</div>
        <div className="form-grid form-grid-2">
          <div className="form-group"><label>Sono</label><textarea className="form-control" value={form.rotinaSono} onChange={e => set('rotinaSono', e.target.value)} /></div>
          <div className="form-group"><label>Escola</label><textarea className="form-control" value={form.frequentaEscola} onChange={e => set('frequentaEscola', e.target.value)} /></div>
          <div className="form-group"><label>Alimentação</label><textarea className="form-control" value={form.rotinaAlimentacao} onChange={e => set('rotinaAlimentacao', e.target.value)} /></div>
          <div className="form-group"><label>Apresenta restrição alimentar?</label><textarea className="form-control" value={form.restricaoAlimentar} onChange={e => set('restricaoAlimentar', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Socialização</label><textarea className="form-control" value={form.rotinaSocializacao} onChange={e => set('rotinaSocializacao', e.target.value)} /></div>
        </div>
      </div>

      {/* VIII. Específico TEA e Reabilitação Auditiva (Componentes pré-existentes vitais do FonoSystem) */}
      <div className="form-card section-tea">
        <div className="form-section-title">VIII. Componentes FonoSystem (TEA e Reabilitação Auditiva)</div>
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
            <input className="form-control" placeholder="Ex: PECS, LetMeTalk..." value={form.tipoCaa} onChange={e => set('tipoCaa', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Profissionais Acompanham</label>
            <input className="form-control" value={form.profissionaisAcompanham} onChange={e => set('profissionaisAcompanham', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Hipersensibilidades</label>
            <input className="form-control" value={form.hipersensibilidades} onChange={e => set('hipersensibilidades', e.target.value)} />
          </div>

          {/* Auditiva */}
          <div className="form-group">
            <label>Tipo Perda Auditiva</label>
            <select className="form-control" value={form.tipoPerdaAuditiva} onChange={e => set('tipoPerdaAuditiva', e.target.value)}>
              <option value="">Selecione...</option><option>Neurossensorial</option><option>Condutiva</option><option>Mista</option>
            </select>
          </div>
          <div className="form-group">
            <label>Grau da Perda</label>
            <select className="form-control" value={form.grauPerda} onChange={e => set('grauPerda', e.target.value)}>
              <option value="">Selecione...</option><option>Leve</option><option>Moderada</option><option>Severa</option><option>Profunda</option>
            </select>
          </div>
          <div className="form-group">
            <label>Usa Dispositivo?</label>
            <select className="form-control" value={form.usaDispositivo} onChange={e => set('usaDispositivo', e.target.value)}>
              <option>Sim</option><option>Não</option>
            </select>
          </div>
        </div>
      </div>

      {/* IX. Observações Gerais */}
      <div className="form-card">
        <div className="form-section-title">IX. Observações Gerais</div>
        <div className="form-group">
          <textarea className="form-control" rows={4} value={form.observacoes} onChange={e => set('observacoes', e.target.value)} />
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

      <style>{`
        .checkbox-label { display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 14px; cursor: pointer; color: #374151; }
        .checkbox-label input { transform: scale(1.2); cursor: pointer; }
        .breadcrumb-btn { background: none; border: none; color: inherit; padding: 0; font: inherit; cursor: pointer; }
        .breadcrumb-btn.bold { font-weight: 600; }
      `}</style>
    </div>
  )
}
