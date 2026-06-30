import { Link, useParams } from 'react-router-dom';
import { userApi } from '../../services/userApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { DetailGrid } from '../../components/ui/DetailGrid.jsx';
import { joinName } from '../../utils/filter.js';

export function UserViewPage() {
  const { id } = useParams();
  const { data: user, loading, error } = useAsync(() => userApi.get(id), [id]);
  return <><PageHeader eyebrow="Directory" title="User profile" description="Complete Keycloak profile and assigned roles.">{user && <Link className="btn btn-primary" to={`/users/${id}/edit`}>Edit user</Link>}</PageHeader><Alert>{error}</Alert>{loading ? <div className="table-skeleton">Loading user...</div> : user && <Card title={user.username}><DetailGrid items={[{ label: 'Full name', value: joinName(user.firstName, user.lastName) }, { label: 'Email', value: user.email }, { label: 'Status', value: user.enabled ? 'Enabled' : 'Disabled' }, { label: 'User Id', value: user.id }]} /><div className="tag-list spaced">{user.roles?.map((r) => <Badge key={r}>{r}</Badge>)}</div></Card>}</>;
}
