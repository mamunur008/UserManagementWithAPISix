export function FormField({ label, children }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props) {
  return <input className="input" {...props} />;
}

export function TextArea(props) {
  return <textarea className="input min-h-28" {...props} />;
}

export function SelectInput({ children, ...props }) {
  return <select className="input" {...props}>{children}</select>;
}

export function CheckboxInput({ label, ...props }) {
  return (
    <label className="checkbox-field">
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}
