import { Link, useParams } from 'react-router-dom';
import { userRoleApi } from '../../services/userRoleApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { DetailGrid } from '../../components/ui/DetailGrid.jsx';

export function UserRoleViewPage() {
  const { id } = useParams();
  const { data, loading, error } = useAsync(() => userRoleApi.get(id), [id]);
  return <><PageHeader eyebrow="Mapping" title="User role mapping">{data && <Link className="btn btn-primary" to={`/user-roles/${id}/edit`}>Edit mapping</Link>}</PageHeader><Alert>{error}</Alert>{loading ? <div className="table-skeleton">Loading mapping...</div> : data && <Card title={data.username}><DetailGrid items={[{ label: 'User Id', value: data.userId }, { label: 'Email', value: data.email }]} /><div className="tag-list spaced">{data.roles?.map((r) => <Badge key={r}>{r}</Badge>)}</div></Card>}</>;
}
