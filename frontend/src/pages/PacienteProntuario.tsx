import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

interface Paciente {
  id: number
  nomeCompleto: string
  dataNascimento: string
  idade: number
  sexo: string
  cpf?: string
  telefone?: string
  email?: string
  status: string
  convenio?: string
  numeroConvenio?: string
  tipoAtendimento?: string
  nomeResponsavel?: string
  telefoneResponsavel?: string
  emailResponsavel?: string
  grauParentesco?: string
  contatoEmergencia?: string
  endereco?: string
  bairro?: string
  cidadeUf?: string
  createdAt?: string
}

interface Relatorio {
  id: number
  dataSessao?: string
  horaInicio?: string
  horaFim?: string
  atividadesRealizadas?: string
  metaTrabalhada?: string
  evolucaoObservada?: string
  intercorrencias?: string
  orientacoesFamilia?: string
  planejamentoProximaSessao?: string
  createdAt?: string
}

interface Avaliacao {
  id: number
  tipoAvaliacao?: string
  areaEspecialidade?: string
  instrumentoAvaliacao?: string
  abordagemTerapeutica?: string
  dataAvaliacao?: string
  hipoteseDiagnostica?: string
  resultados?: string
  createdAt?: string
}

export default function PacienteProntuario() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [id])

  const carregarDados = async () => {
    try {
      const [pacRes, relRes, avRes] = await Promise.all([
        api.get(`/v1/pacientes/${id}`),
        api.get(`/v1/pacientes/${id}/relatorios?page=0&size=5`).catch(() => ({ data: { content: [] } })),
        api.get(`/v1/pacientes/${id}/avaliacoes`).catch(() => ({ data: [] }))
      ])
      setPaciente(pacRes.data)
      setRelatorios(relRes.data.content || relRes.data || [])
      setAvaliacoes(avRes.data || [])
    } catch (err) {
      console.error('Erro ao carregar prontuário:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImprimir = () => window.print()

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>Carregando prontuário...</div>
  }

  if (!paciente) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>Paciente não encontrado</div>
  }

  const formatarData = (data?: string) => {
    if (!data) return ''
    try {
      const date = new Date(data)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return data
    }
  }

  const truncar = (texto?: string, max = 120) => {
    if (!texto) return ''
    return texto.length > max ? texto.substring(0, max) + '...' : texto
  }

  const sectionTitle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 700,
    color: '#1F2937',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }

  const sectionBox: React.CSSProperties = {
    marginBottom: '28px',
    paddingBottom: '24px',
    borderBottom: '1px solid #F3F4F6',
  }

  const labelStyle: React.CSSProperties = {
    color: '#6B7280',
    fontSize: '11px',
    marginBottom: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  }

  const valueStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#1F2937',
    fontWeight: 500,
  }

  return (
    <div style={{ padding: '0 24px 40px 24px' }}>
      {/* Buttons - hidden on print */}
      <div className="no-print" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={handleImprimir}
          className="btn btn-primary"
          style={{ fontSize: '13px', padding: '8px 16px' }}
        >
          Imprimir Prontuário
        </button>
        <button
          onClick={() => navigate(`/pacientes/${id}/editar`)}
          className="btn btn-outline"
          style={{ fontSize: '13px', padding: '8px 16px' }}
        >
          Editar Paciente
        </button>
      </div>

      {/* Prontuário Content */}
      <div style={{
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>

        {/* ── DADOS PESSOAIS ── */}
        <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '2px solid #E5E7EB' }}>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#1F2937', marginBottom: '6px' }}>
            {paciente.nomeCompleto}
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
            {paciente.idade} anos
            {paciente.sexo && ` · ${paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Feminino' : 'Outro'}`}
            {paciente.dataNascimento && ` · Nasc: ${formatarData(paciente.dataNascimento)}`}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {paciente.cpf && (
              <div>
                <div style={labelStyle}>CPF</div>
                <div style={valueStyle}>{paciente.cpf}</div>
              </div>
            )}
            {paciente.telefone && (
              <div>
                <div style={labelStyle}>Telefone</div>
                <div style={valueStyle}>{paciente.telefone}</div>
              </div>
            )}
            {paciente.email && (
              <div>
                <div style={labelStyle}>Email</div>
                <div style={valueStyle}>{paciente.email}</div>
              </div>
            )}
            <div>
              <div style={labelStyle}>Status</div>
              <div>
                <span style={{
                  display: 'inline-block',
                  background: paciente.status === 'ATIVO' ? '#D1FAE5' : '#FEE2E2',
                  color: paciente.status === 'ATIVO' ? '#065F46' : '#991B1B',
                  borderRadius: '999px',
                  padding: '3px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}>
                  {paciente.status}
                </span>
              </div>
            </div>
            {paciente.createdAt && (
              <div>
                <div style={labelStyle}>Cadastrado em</div>
                <div style={valueStyle}>{formatarData(paciente.createdAt)}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── RESPONSÁVEL ── */}
        {(paciente.nomeResponsavel || paciente.telefoneResponsavel || paciente.emailResponsavel) && (
          <div style={sectionBox}>
            <div style={sectionTitle}>Responsável</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {paciente.nomeResponsavel && (
                <div>
                  <div style={labelStyle}>Nome</div>
                  <div style={valueStyle}>
                    {paciente.nomeResponsavel}
                    {paciente.grauParentesco && <span style={{ color: '#6B7280', fontWeight: 400 }}> ({paciente.grauParentesco})</span>}
                  </div>
                </div>
              )}
              {paciente.telefoneResponsavel && (
                <div>
                  <div style={labelStyle}>Telefone</div>
                  <div style={valueStyle}>{paciente.telefoneResponsavel}</div>
                </div>
              )}
              {paciente.emailResponsavel && (
                <div>
                  <div style={labelStyle}>Email</div>
                  <div style={valueStyle}>{paciente.emailResponsavel}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CONTATO DE EMERGÊNCIA ── */}
        {paciente.contatoEmergencia && (
          <div style={sectionBox}>
            <div style={sectionTitle}>Contato de Emergência</div>
            <div style={valueStyle}>{paciente.contatoEmergencia}</div>
          </div>
        )}

        {/* ── CONVÊNIO / ATENDIMENTO ── */}
        <div style={sectionBox}>
          <div style={sectionTitle}>Informações de Atendimento</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={labelStyle}>Tipo de Atendimento</div>
              <div style={valueStyle}>{paciente.tipoAtendimento || 'Não informado'}</div>
            </div>
            <div>
              <div style={labelStyle}>Convênio</div>
              <div style={valueStyle}>{paciente.convenio || 'Particular'}</div>
            </div>
            {paciente.numeroConvenio && (
              <div>
                <div style={labelStyle}>Número do Convênio</div>
                <div style={valueStyle}>{paciente.numeroConvenio}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── ENDEREÇO ── */}
        {(paciente.endereco || paciente.bairro || paciente.cidadeUf) && (
          <div style={sectionBox}>
            <div style={sectionTitle}>Endereço</div>
            <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
              {paciente.endereco && <div>{paciente.endereco}</div>}
              {(paciente.bairro || paciente.cidadeUf) && (
                <div>
                  {paciente.bairro && <span>{paciente.bairro}</span>}
                  {paciente.bairro && paciente.cidadeUf && ' - '}
                  {paciente.cidadeUf && <span>{paciente.cidadeUf}</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ÚLTIMOS ATENDIMENTOS (com atividade, meta, evolução) ── */}
        <div style={sectionBox}>
          <div style={sectionTitle}>
            Últimos Atendimentos ({relatorios.length})
          </div>
          {relatorios.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#9CA3AF', padding: '12px 0' }}>
              Nenhum atendimento registrado
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {relatorios.map((rel) => (
                <div
                  key={rel.id}
                  style={{
                    padding: '16px',
                    background: '#F9FAFB',
                    borderRadius: '8px',
                    borderLeft: '3px solid var(--odapp-blue)',
                  }}
                >
                  {/* Data e horário */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                      Folha de Evolução - {formatarData(rel.dataSessao || rel.createdAt)}
                    </div>
                    {rel.horaInicio && rel.horaFim && (
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>
                        {rel.horaInicio} - {rel.horaFim}
                      </div>
                    )}
                  </div>

                  {/* Campos detalhados */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {rel.metaTrabalhada && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase' }}>Meta</div>
                        <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{truncar(rel.metaTrabalhada, 150)}</div>
                      </div>
                    )}
                    {rel.atividadesRealizadas && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase' }}>Atividade</div>
                        <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{truncar(rel.atividadesRealizadas, 150)}</div>
                      </div>
                    )}
                    {rel.evolucaoObservada && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase' }}>Evolução</div>
                        <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{truncar(rel.evolucaoObservada, 200)}</div>
                      </div>
                    )}
                    {rel.orientacoesFamilia && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase' }}>Orientações à Família</div>
                        <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{truncar(rel.orientacoesFamilia, 150)}</div>
                      </div>
                    )}
                    {rel.planejamentoProximaSessao && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase' }}>Próxima Sessão</div>
                        <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{truncar(rel.planejamentoProximaSessao, 150)}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── AVALIAÇÕES ── */}
        <div style={{ marginBottom: '8px' }}>
          <div style={sectionTitle}>
            Avaliações Realizadas ({avaliacoes.length})
          </div>
          {avaliacoes.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#9CA3AF', padding: '12px 0' }}>
              Nenhuma avaliação registrada
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {avaliacoes.map((av) => (
                <div
                  key={av.id}
                  style={{
                    padding: '16px',
                    background: '#F9FAFB',
                    borderRadius: '8px',
                    borderLeft: '3px solid #10B981',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                      {av.tipoAvaliacao || 'Avaliação'}
                    </div>
                    {(av.dataAvaliacao || av.createdAt) && (
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>
                        {formatarData(av.dataAvaliacao || av.createdAt)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {av.areaEspecialidade && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase' }}>Área</div>
                        <div style={{ fontSize: '13px', color: '#374151' }}>{av.areaEspecialidade}</div>
                      </div>
                    )}
                    {av.instrumentoAvaliacao && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase' }}>Instrumento</div>
                        <div style={{ fontSize: '13px', color: '#374151' }}>{av.instrumentoAvaliacao}</div>
                      </div>
                    )}
                    {av.abordagemTerapeutica && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase' }}>Abordagem</div>
                        <div style={{ fontSize: '13px', color: '#374151' }}>{av.abordagemTerapeutica}</div>
                      </div>
                    )}
                    {av.hipoteseDiagnostica && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase' }}>Hipótese Diagnóstica</div>
                        <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{truncar(av.hipoteseDiagnostica, 200)}</div>
                      </div>
                    )}
                    {av.resultados && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase' }}>Resultados</div>
                        <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{truncar(av.resultados, 200)}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
