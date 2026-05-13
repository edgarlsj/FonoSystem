import { createContext, useContext, useState, useCallback } from 'react'

interface AlertOptions {
  title: string
  message: string
  buttonLabel?: string
  type?: 'success' | 'error' | 'info'
}

interface AlertContextType {
  alert: (options: AlertOptions) => Promise<void>
  isOpen: boolean
  data?: AlertOptions
  onClose: () => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<AlertOptions>()
  const [resolver, setResolver] = useState<(() => void) | null>(null)

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setData(options)
      setIsOpen(true)
      setResolver(() => resolve)
    })
  }, [])

  const onClose = useCallback(() => {
    if (resolver) resolver()
    setIsOpen(false)
    setResolver(null)
  }, [resolver])

  return (
    <AlertContext.Provider value={{ alert, isOpen, data, onClose }}>
      {children}
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider')
  }
  return context.alert
}

export function useAlertContext() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlertContext must be used within AlertProvider')
  }
  return context
}
