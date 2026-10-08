import { useId } from "react"

export default function Modal({ open, title, children, onClose, footer }) {
  const titleId = useId()
  if (!open) return null
  return (
    <div className='modal' role='dialog' aria-modal='true' aria-labelledby={titleId} style={{ display: "block" }}>
      <form
        className='modal-dialog modal-animate-top m-auto col-12 col-md-10 col-lg-6'
        onSubmit={(event) => event.preventDefault()}
      >
        <div className='modal-header'>
          <button type='button' className='modal-btn' aria-label={`Close ${title}`} onClick={onClose}>
            &times;
          </button>
          <span id={titleId} className='f-1'>{title}</span>
        </div>
        <div className='modal-body'>{children}</div>
        <div className='modal-footer'>{footer}</div>
      </form>
    </div>
  )
}
