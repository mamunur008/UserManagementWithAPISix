import { EmptyState } from './EmptyState.jsx';

export function DataTable({ columns, rows, rowKey = 'id', loading, emptyText = 'No records found' }) {
  if (loading) return <div className="table-skeleton">Loading data...</div>;
  if (!rows?.length) return <EmptyState title={emptyText} description="Create a new record or adjust your search filter." />;

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead><tr>{columns.map((c) => <th key={c.key}>{c.header}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={typeof rowKey === 'function' ? rowKey(row) : row[rowKey] || index}>
              {columns.map((c) => <td key={c.key} data-label={c.header}>{c.render ? c.render(row) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
