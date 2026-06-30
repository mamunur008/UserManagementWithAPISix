import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { userApi } from '../../services/userApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { matchesSearch, joinName } from '../../utils/filter.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { SearchBar } from '../../components/ui/SearchBar.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

export function UserListPage() {
  const [query, setQuery] = useState('');
  const { data: users = [], loading, error } = useAsync(userApi.list, []);
  const rows = useMemo(() => (users || []).filter((u) => matchesSearch(u, query, ['username', 'email', 'firstName', 'lastName'])), [users, query]);

  const columns = [
    { key: 'username', header: 'Username', render: (u) => <Link className="table-link" to={`/users/${u.id}`}>{u.username}</Link> },
    { key: 'name', header: 'Name', render: (u) => joinName(u.firstName, u.lastName) },
    { key: 'email', header: 'Email' },
    { key: 'enabled', header: 'Status', render: (u) => <Badge tone={u.enabled ? 'success' : 'danger'}>{u.enabled ? 'Enabled' : 'Disabled'}</Badge> },
    { key: 'roles', header: 'Roles', render: (u) => <div className="tag-list">{u.roles?.map((r) => <Badge key={r}>{r}</Badge>)}</div> },
    { key: 'actions', header: 'Actions', render: (u) => <div className="row-actions"><Link to={`/users/${u.id}`}>View</Link><Link to={`/users/${u.id}/edit`}>Edit</Link></div> }
  ];

  return <><PageHeader eyebrow="Directory" title="Users" description="Create, maintain and review Keycloak user accounts." actionTo="/users/new" actionLabel="Add user"><SearchBar value={query} onChange={setQuery} placeholder="Search users..." /></PageHeader><Alert>{error}</Alert><DataTable columns={columns} rows={rows} loading={loading} emptyText="No users found" /></>;
}
