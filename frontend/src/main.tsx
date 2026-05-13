import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ConfirmProvider } from './context/ConfirmContext'
import { AlertProvider } from './context/AlertContext'
import ConfirmModal from './components/ConfirmModal'
import AlertModal from './components/AlertModal'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ConfirmProvider>
          <AlertProvider>
            <ConfirmModal />
            <AlertModal />
            <App />
          </AlertProvider>
        </ConfirmProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
