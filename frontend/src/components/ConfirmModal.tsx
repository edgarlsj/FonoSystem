import { useConfirmContext } from '../context/ConfirmContext'

export default function ConfirmModal() {
  const { isOpen, data, onConfirm, onCancel } = useConfirmContext()

  if (!isOpen || !data) return null

  return (
    <div className="modal-overlay active">
      <div className="modal" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{data.title}</h2>
        </div>

        <div style={{ padding: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
            {data.message}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', padding: '16px 28px', borderTop: '1px solid #E5E7EB', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onCancel} style={{ padding: '8px 20px' }}>
            {data.cancelLabel || 'Cancelar'}
          </button>
          <button className="btn btn-primary" onClick={onConfirm} style={{ padding: '8px 20px' }}>
            {data.okLabel || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
