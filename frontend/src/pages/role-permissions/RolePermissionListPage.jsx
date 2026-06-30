import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { rolePermissionApi } from '../../services/rolePermissionApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { matchesSearch } from '../../utils/filter.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { SearchBar } from '../../components/ui/SearchBar.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

export function RolePermissionListPage() {
  const [query, setQuery] = useState('');
  const { data: rowsRaw = [], loading, error } = useAsync(rolePermissionApi.list, []);
  const rows = useMemo(() => (rowsRaw || []).filter((r) => matchesSearch(r, query, ['roleName', 'description'])), [rowsRaw, query]);
  const columns = [
    { key: 'roleName', header: 'Role', render: (r) => <Link className="table-link" to={`/role-permissions/${encodeURIComponent(r.roleName)}`}>{r.roleName}</Link> },
    { key: 'permissions', header: 'Permissions', render: (r) => <div className="tag-list">{r.permissions?.length ? r.permissions.map((x) => <Badge key={x}>{x}</Badge>) : <span className="muted">No permissions mapped yet</span>}</div> },
    { key: 'actions', header: 'Actions', render: (r) => <div className="row-actions"><Link to={`/role-permissions/${encodeURIComponent(r.roleName)}`}>View</Link><Link to={`/role-permissions/${encodeURIComponent(r.roleName)}/edit`}>Edit</Link></div> }
  ];
  return <><PageHeader eyebrow="Mapping" title="Role Permission" description="Map fine-grained permissions to roles. Backend endpoint needed: POST /api/roles/{name}/permissions." actionTo="/role-permissions/new" actionLabel="Assign permission"><SearchBar value={query} onChange={setQuery} placeholder="Search role mappings..." /></PageHeader><Alert>{error}</Alert><DataTable columns={columns} rows={rows} loading={loading} rowKey="roleName" emptyText="No role permission mapping found" /></>;
}
