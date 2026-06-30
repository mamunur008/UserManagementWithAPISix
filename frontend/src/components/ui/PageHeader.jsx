export function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="page-header">
      {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
      <h1 className="page-header-title">{title}</h1>
      {description ? <p className="page-header-description">{description}</p> : null}
    </div>
  );
}
