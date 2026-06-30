import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { roleApi } from '../../services/roleApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { matchesSearch } from '../../utils/filter.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { SearchBar } from '../../components/ui/SearchBar.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

export function RoleListPage() {
  const [query, setQuery] = useState('');
  const { data: roles = [], loading, error } = useAsync(roleApi.list, []);
  const rows = useMemo(() => (roles || []).filter((r) => matchesSearch(r, query, ['name', 'description'])), [roles, query]);
  const columns = [
    { key: 'name', header: 'Role', render: (r) => <Link className="table-link" to={`/roles/${encodeURIComponent(r.name)}`}>{r.name}</Link> },
    { key: 'description', header: 'Description' },
    { key: 'actions', header: 'Actions', render: (r) => <div className="row-actions"><Link to={`/roles/${encodeURIComponent(r.name)}`}>View</Link><Link to={`/roles/${encodeURIComponent(r.name)}/edit`}>Edit</Link></div> }
  ];
  return <><PageHeader eyebrow="Authorization" title="Roles" description="Realm roles used for application access groups." actionTo="/roles/new" actionLabel="Add role"><SearchBar value={query} onChange={setQuery} placeholder="Search roles..." /></PageHeader><Alert>{error}</Alert><DataTable columns={columns} rows={rows} loading={loading} rowKey="name" emptyText="No roles found" /></>;
}
