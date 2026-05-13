import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useConfirm } from '../context/ConfirmContext'
import { useAlert } from '../context/AlertContext'
import api from '../services/api'

interface Documento {
  id: number
  nomeArquivo: string
  nomeProfissional: string
  especialidade: string
  descricao: string
  tipoMime: string
  tamanhoBytes: number
  dataAnexacao: string
  profissionalNome: string
}

export default function DocumentosProfissionaisTab() {
  const { id } = useParams()
  const alertFn = useAlert()
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [deletando, setDeletando] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    nomeArquivo: '',
    nomeProfissional: '',
    especialidade: '',
    descricao: '',
    arquivo: null as File | null,
  })

  useEffect(() => {
    carregarDocumentos()
  }, [id])

  const carregarDocumentos = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/v1/pacientes/${id}/documentos-profissionais`)
      setDocumentos(data)
    } catch (err) {
      console.error('Erro ao carregar documentos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        arquivo: file,
        nomeArquivo: prev.nomeArquivo || file.name,
      }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const enviarDocumento = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.arquivo) {
      alert('Selecione um arquivo')
      return
    }

    try {
      setEnviando(true)
      const formDataBody = new FormData()
      formDataBody.append('arquivo', formData.arquivo)
      formDataBody.append('nomeArquivo', formData.nomeArquivo)
      formDataBody.append('nomeProfissional', formData.nomeProfissional)
      formDataBody.append('especialidade', formData.especialidade)
      formDataBody.append('descricao', formData.descricao)

      await api.post(`/v1/pacientes/${id}/documentos-profissionais`, formDataBody, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setFormData({
        nomeArquivo: '',
        nomeProfissional: '',
        especialidade: '',
        descricao: '',
        arquivo: null,
      })
      setMostrarFormulario(false)
      carregarDocumentos()
    } catch (err) {
      console.error('Erro ao enviar documento:', err)
      alertFn({ title: 'Erro', message: 'Erro ao enviar documento', type: 'error' })
    } finally {
      setEnviando(false)
    }
  }

  const confirm = useConfirm()

  const deletarDocumento = async (docId: number) => {
    const confirmacao = await confirm({
      title: 'Deletar Documento',
      message: 'Tem certeza que deseja deletar este documento?',
      okLabel: 'Deletar',
      cancelLabel: 'Cancelar'
    })
    if (!confirmacao) return

    try {
      setDeletando(docId)
      await api.delete(`/v1/pacientes/${id}/documentos-profissionais/${docId}`)
      carregarDocumentos()
    } catch (err) {
      console.error('Erro ao deletar documento:', err)
      alertFn({ title: 'Erro', message: 'Erro ao deletar documento', type: 'error' })
    } finally {
      setDeletando(null)
    }
  }

  const baixarDocumento = async (docId: number, nomeArquivo: string) => {
    try {
      const response = await api.get(`/v1/pacientes/${id}/documentos-profissionais/${docId}/download`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', nomeArquivo)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao baixar documento:', err)
      alertFn({ title: 'Erro', message: 'Erro ao baixar documento', type: 'error' })
    }
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatarTamanho = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>Carregando...</div>
  }

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>Documentos</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>
            {documentos.length} {documentos.length === 1 ? 'documento anexado' : 'documentos anexados'}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          style={{ fontSize: '13px', padding: '8px 16px' }}
        >
          {mostrarFormulario ? '✕ Cancelar' : '+ Anexar Documento'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="form-card" style={{ marginBottom: '24px' }}>
          <form onSubmit={enviarDocumento}>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label>Nome do Arquivo *</label>
                <input
                  type="text"
                  className="form-control"
                  name="nomeArquivo"
                  value={formData.nomeArquivo}
                  onChange={handleInputChange}
                  placeholder="Ex: relatorio_auditivo.pdf"
                  required
                />
              </div>
              <div className="form-group">
                <label>Identificação do Documento *</label>
                <input
                  type="text"
                  className="form-control"
                  name="nomeProfissional"
                  value={formData.nomeProfissional}
                  onChange={handleInputChange}
                  placeholder="Ex: Dr. João Silva, Laudo de Exame"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tipo/Especialidade</label>
                <input
                  type="text"
                  className="form-control"
                  name="especialidade"
                  value={formData.especialidade}
                  onChange={handleInputChange}
                  placeholder="Ex: Audiólogo, Exame, Laudo"
                />
              </div>
              <div className="form-group">
                <label>Arquivo *</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Descrição</label>
                <textarea
                  className="form-control"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  placeholder="Notas sobre o documento..."
                  rows={4}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setMostrarFormulario(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={enviando}>
                {enviando ? 'Enviando...' : '✓ Anexar Documento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {documentos.length === 0 ? (
        <div style={{
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          color: '#9CA3AF',
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>Nenhum documento anexado</p>
          <p style={{ margin: 0, fontSize: '13px' }}>Comece anexando arquivos pertinentes ao paciente</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {documentos.map(doc => (
            <div
              key={doc.id}
              style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>📄</span>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      baixarDocumento(doc.id, doc.nomeArquivo)
                    }}
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--primary-600)',
                      textDecoration: 'none',
                    }}
                  >
                    {doc.nomeArquivo}
                  </a>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>({formatarTamanho(doc.tamanhoBytes)})</span>
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                  <strong>Identificação:</strong> {doc.nomeProfissional}
                  {doc.especialidade && ` · ${doc.especialidade}`}
                </div>
                {doc.descricao && (
                  <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                    <strong>Descrição:</strong> {doc.descricao}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  📅 {formatarData(doc.dataAnexacao)} · 👤 {doc.profissionalNome}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => baixarDocumento(doc.id, doc.nomeArquivo)}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  ⬇️ Download
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => deletarDocumento(doc.id)}
                  disabled={deletando === doc.id}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    color: '#DC2626',
                    borderColor: '#FCA5A5',
                  }}
                >
                  {deletando === doc.id ? '...' : '🗑️ Deletar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
