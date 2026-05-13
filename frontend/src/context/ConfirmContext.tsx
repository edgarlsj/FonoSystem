import { createContext, useContext, useState, useCallback } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  okLabel?: string
  cancelLabel?: string
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  isOpen: boolean
  data?: ConfirmOptions
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<ConfirmOptions>()
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setData(options)
      setIsOpen(true)
      setResolver(() => resolve)
    })
  }, [])

  const onConfirm = useCallback(() => {
    if (resolver) resolver(true)
    setIsOpen(false)
    setResolver(null)
  }, [resolver])

  const onCancel = useCallback(() => {
    if (resolver) resolver(false)
    setIsOpen(false)
    setResolver(null)
  }, [resolver])

  return (
    <ConfirmContext.Provider value={{ confirm, isOpen, data, onConfirm, onCancel }}>
      {children}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return context.confirm
}

export function useConfirmContext() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirmContext must be used within ConfirmProvider')
  }
  return context
}
