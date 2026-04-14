import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import PacienteForm from './pages/PacienteForm'
import Anamnese from './pages/Anamnese'
import Avaliacao from './pages/Avaliacao'
import Relatorios from './pages/Relatorios'
import PacienteRelatorios from './pages/PacienteRelatorios'
import PacientePrescricoes from './pages/PacientePrescricoes'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="pacientes/novo" element={<PacienteForm />} />
        <Route path="pacientes/:id/anamnese" element={<Anamnese />} />
        <Route path="pacientes/:id/avaliacao" element={<Avaliacao />} />
        <Route path="pacientes/:id/relatorios" element={<PacienteRelatorios />} />
        <Route path="pacientes/:id/prescricoes" element={<PacientePrescricoes />} />
        <Route path="relatorios" element={<Relatorios />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
