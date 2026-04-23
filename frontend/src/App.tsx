import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import PacienteForm from './pages/PacienteForm'
import PacienteDetalhe from './pages/PacienteDetalhe'
import Anamnese from './pages/Anamnese'
import Avaliacao from './pages/Avaliacao'
import AvaliacoesTab from './pages/AvaliacoesTab'
import Relatorios from './pages/Relatorios'
import PacienteRelatorios from './pages/PacienteRelatorios'
import PacientePrescricoes from './pages/PacientePrescricoes'
import Logs from './pages/Logs'
import ColetarDados from './pages/ColetarDados'
import Users from './pages/Users'
import UserForm from './pages/UserForm'
import Profile from './pages/Profile'

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
        <Route path="pacientes/:id/editar" element={<PacienteForm />} />
        <Route path="pacientes/:id" element={<PacienteDetalhe />}>
          <Route index element={<Navigate to="relatorios" replace />} />
          <Route path="relatorios" element={<PacienteRelatorios />} />
          <Route path="prescricoes" element={<PacientePrescricoes />} />
          <Route path="anamnese" element={<Anamnese />} />
          <Route path="avaliacoes" element={<AvaliacoesTab />} />
          <Route path="avaliacao" element={<Avaliacao />} />
        </Route>
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="coletar-dados" element={<ColetarDados />} />
        <Route path="logs" element={<Logs />} />
        <Route path="usuarios" element={<Users />} />
        <Route path="usuarios/novo" element={<UserForm />} />
        <Route path="usuarios/:id/editar" element={<UserForm />} />
        <Route path="meu-perfil" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
