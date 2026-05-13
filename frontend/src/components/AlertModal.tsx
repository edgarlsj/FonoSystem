import { useAlertContext } from '../context/AlertContext'

export default function AlertModal() {
  const { isOpen, data, onClose } = useAlertContext()

  if (!isOpen || !data) return null

  const getHeaderColor = () => {
    switch (data.type) {
      case 'success':
        return 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
      case 'error':
        return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
      case 'info':
      default:
        return 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
    }
  }

  return (
    <div className="modal-overlay active">
      <div className="modal" style={{ maxWidth: '450px' }}>
        <div className="modal-header" style={{ background: getHeaderColor(), color: 'white' }}>
          <h2 className="modal-title" style={{ color: 'white', margin: 0 }}>
            {data.title}
          </h2>
        </div>

        <div style={{ padding: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
            {data.message}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', padding: '16px 28px', borderTop: '1px solid #E5E7EB', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onClose} style={{ padding: '8px 20px' }}>
            {data.buttonLabel || 'OK'}
          </button>
        </div>
      </div>
    </div>
  )
}
