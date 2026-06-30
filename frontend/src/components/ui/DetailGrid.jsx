export function DetailGrid({ items }) {
  return <dl className="detail-grid">{items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value || '—'}</dd></div>)}</dl>;
}
