export function Card({ title, description, children }) {
  return (
    <section className="card">
      {title ? <h2 className="card-title">{title}</h2> : null}
      {description ? <p className="card-description">{description}</p> : null}
      {children}
    </section>
  );
}
