export function CrudPage({ title, eyebrow, description, columns = [], rows = [], loading = false, error = "", onAdd, extra }) {
  const safeRows = Array.isArray(rows) ? rows : rows?.items ?? [];
  return (
    <section>
      <div className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1 className="page-title">{title}</h1><p className="page-description">{description}</p></div>{onAdd && <button className="btn btn-primary" onClick={onAdd}>Add</button>}</div>
      {error && <div className="alert alert-error">{error}</div>}
      {extra}
      <div className="table-wrap"><table className="data-table"><thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead><tbody>
        {loading ? <tr><td colSpan={columns.length}>Loading...</td></tr> : safeRows.length === 0 ? <tr><td colSpan={columns.length}>No records found.</td></tr> : safeRows.map((row, idx) => <tr key={row.id || row.keycloakUserId || row.name || idx}>{columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : (row[c.key] ?? "-")}</td>)}</tr>)}
      </tbody></table></div>
    </section>
  );
}
