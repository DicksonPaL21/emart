export default function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null
  return (
    <div class='modal' style='display:block'>
      <form
        class='modal-dialog modal-animate-top m-auto col-12 col-md-10 col-lg-6'
        onSubmit={(event) => event.preventDefault()}
      >
        <div class='modal-header'>
          <span class='modal-btn' onClick={onClose}>
            &times;
          </span>
          <label class='f-1'>{title}</label>
        </div>
        <div class='modal-body'>{children}</div>
        <div class='modal-footer'>{footer}</div>
      </form>
    </div>
  )
}
