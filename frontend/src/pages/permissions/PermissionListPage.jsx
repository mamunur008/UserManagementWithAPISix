import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { permissionApi } from '../../services/permissionApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { matchesSearch } from '../../utils/filter.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { SearchBar } from '../../components/ui/SearchBar.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

export function PermissionListPage() {
  const [query, setQuery] = useState('');
  const { data: permissions = [], loading, error } = useAsync(permissionApi.list, []);
  const rows = useMemo(() => (permissions || []).filter((p) => matchesSearch(p, query, ['name', 'description'])), [permissions, query]);
  const columns = [
    { key: 'name', header: 'Permission', render: (p) => <Link className="table-link" to={`/permissions/${encodeURIComponent(p.name)}`}>{p.name}</Link> },
    { key: 'description', header: 'Description' },
    { key: 'actions', header: 'Actions', render: (p) => <div className="row-actions"><Link to={`/permissions/${encodeURIComponent(p.name)}`}>View</Link><Link to={`/permissions/${encodeURIComponent(p.name)}/edit`}>Edit</Link></div> }
  ];
  return <><PageHeader eyebrow="Authorization" title="Permissions" description="Fine-grained permissions stored as Keycloak realm roles with permission: prefix." actionTo="/permissions/new" actionLabel="Add permission"><SearchBar value={query} onChange={setQuery} placeholder="Search permissions..." /></PageHeader><Alert>{error}</Alert><DataTable columns={columns} rows={rows} loading={loading} rowKey="name" emptyText="No permissions found" /></>;
}
