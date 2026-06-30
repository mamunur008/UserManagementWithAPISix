export function Field({ label, error, children }) {
  return <label className="field"><span>{label}</span>{children}{error && <small className="field-error">{error}</small>}</label>;
}

export function TextInput(props) {
  return <input className="input" {...props} />;
}

export function TextArea(props) {
  return <textarea className="input textarea" {...props} />;
}

export function Select(props) {
  return <select className="input" {...props} />;
}

export function Checkbox({ label, ...props }) {
  return <label className="checkbox"><input type="checkbox" {...props} /><span>{label}</span></label>;
}
