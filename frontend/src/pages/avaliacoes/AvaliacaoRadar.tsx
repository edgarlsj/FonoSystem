import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface AvaliacaoRadarProps {
  scores: Record<string, number>
  titulo?: string
}

const LABEL_MAP: Record<string, string> = {
  // PORTAGE
  'Socialização': 'Social.',
  'Cognição': 'Cogn.',
  'Linguagem': 'Ling.',
  'Autocuidado': 'Autoc.',
  'Motor': 'Motor',
  // DENVER II
  'Pessoal-Social': 'Pess-Soc.',
  'Motor Fino-Adaptativo': 'M. Fino',
  'Motor Grosso': 'M. Grosso',
  // PROC
  'habilidadesComunicativas': 'Hab. Com.',
  'compreensaoVerbal': 'Compr. Verb.',
  'desenvolvimentoCognitivo': 'Des. Cogn.',
}

export default function AvaliacaoRadar({ scores, titulo }: AvaliacaoRadarProps) {
  const data = Object.entries(scores).map(([key, value]) => ({
    dominio: LABEL_MAP[key] || key,
    dominioFull: key,
    valor: value,
    fullMark: 100,
  }))

  if (data.length === 0) return null

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #E5E7EB',
    }}>
      {titulo && (
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151',
          marginBottom: '12px',
          textAlign: 'center',
        }}>
          {titulo}
        </div>
      )}
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis
            dataKey="dominio"
            tick={{
              fontSize: 11,
              fontWeight: 600,
              fill: '#6B7280',
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            tickCount={5}
          />
          <Radar
            name="Score"
            dataKey="valor"
            stroke="#29B6D1"
            fill="#29B6D1"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <div style={{
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>{d.dominioFull}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#29B6D1', marginTop: '2px' }}>{d.valor}%</div>
                </div>
              )
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legenda textual */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
        {data.map(d => {
          const cor = d.valor >= 70 ? '#059669' : d.valor >= 40 ? '#D97706' : '#DC2626'
          return (
            <div key={d.dominioFull} style={{
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '999px',
              background: d.valor >= 70 ? '#D1FAE5' : d.valor >= 40 ? '#FEF3C7' : '#FEE2E2',
              color: cor,
              fontWeight: 600,
            }}>
              {d.dominio}: {d.valor}%
            </div>
          )
        })}
      </div>
    </div>
  )
}
