import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
  pacienteId: string | number
  paginaAtual?: 'anamnese' | 'relatorios' | 'prescricoes' | 'editar'
}

export default function PacienteAcoesMenu({ pacienteId, paginaAtual }: Props) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fechar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  const navegar = (caminho: string) => {
    setAberto(false)
    navigate(caminho)
  }

  const opcoes = [
    { key: 'editar',     icon: '✏️',  label: 'Editar Cadastro',  path: `/pacientes/${pacienteId}/editar` },
    { key: 'anamnese',   icon: '🩺',  label: 'Anamnese',         path: `/pacientes/${pacienteId}/anamnese` },
    { key: 'relatorios', icon: '📝',  label: 'Relatórios',       path: `/pacientes/${pacienteId}/relatorios` },
    { key: 'prescricoes',icon: '📋',  label: 'Prescrições',      path: `/pacientes/${pacienteId}/prescricoes` },
  ]

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setAberto(!aberto)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #D1D5DB',
          background: aberto ? '#F3F4F6' : 'white',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          color: '#374151',
          whiteSpace: 'nowrap'
        }}
      >
        Ações do Paciente <span style={{ fontSize: '10px' }}>{aberto ? '▲' : '▼'}</span>
      </button>

      {aberto && (
        <div style={{
          position: 'absolute',
          top: '110%',
          left: 0,
          zIndex: 200,
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          minWidth: '210px',
          overflow: 'hidden'
        }}>
          {opcoes.map(op => {
            const ativa = op.key === paginaAtual
            return (
              <ItemMenu
                key={op.key}
                icon={op.icon}
                label={op.label}
                ativa={ativa}
                onClick={() => navegar(op.path)}
              />
            )
          })}
          <div style={{ borderTop: '1px solid #F3F4F6', margin: '4px 0' }} />
          <ItemMenu
            icon="👥"
            label="Ver todos os pacientes"
            onClick={() => navegar('/pacientes')}
          />
        </div>
      )}
    </div>
  )
}

function ItemMenu({ icon, label, onClick, ativa }: {
  icon: string
  label: string
  onClick: () => void
  ativa?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '10px 16px',
        background: ativa ? '#EFF6FF' : hovered ? '#F9FAFB' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: ativa ? 700 : 500,
        color: ativa ? '#2563EB' : '#374151',
        textAlign: 'left'
      }}
    >
      <span>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {ativa && <span style={{ fontSize: '11px', color: '#93C5FD' }}>●</span>}
    </button>
  )
}
