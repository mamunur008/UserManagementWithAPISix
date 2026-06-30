import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { userRoleApi } from '../../services/userRoleApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { matchesSearch } from '../../utils/filter.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { SearchBar } from '../../components/ui/SearchBar.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

export function UserRoleListPage() {
  const [query, setQuery] = useState('');
  const { data: rowsRaw = [], loading, error } = useAsync(userRoleApi.list, []);
  const rows = useMemo(() => (rowsRaw || []).filter((r) => matchesSearch(r, query, ['username', 'email'])), [rowsRaw, query]);
  const columns = [
    { key: 'username', header: 'User', render: (r) => <Link className="table-link" to={`/user-roles/${r.userId}`}>{r.username}</Link> },
    { key: 'email', header: 'Email' },
    { key: 'roles', header: 'Assigned roles', render: (r) => <div className="tag-list">{r.roles?.map((x) => <Badge key={x}>{x}</Badge>)}</div> },
    { key: 'actions', header: 'Actions', render: (r) => <div className="row-actions"><Link to={`/user-roles/${r.userId}`}>View</Link><Link to={`/user-roles/${r.userId}/edit`}>Edit</Link></div> }
  ];
  return <><PageHeader eyebrow="Mapping" title="User Role" description="Assign Keycloak realm roles to users." actionTo="/user-roles/new" actionLabel="Assign role"><SearchBar value={query} onChange={setQuery} placeholder="Search user mappings..." /></PageHeader><Alert>{error}</Alert><DataTable columns={columns} rows={rows} loading={loading} emptyText="No user role mapping found" /></>;
}
