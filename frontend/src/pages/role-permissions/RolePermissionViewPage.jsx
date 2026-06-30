import { Link, useParams } from 'react-router-dom';
import { rolePermissionApi } from '../../services/rolePermissionApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { DetailGrid } from '../../components/ui/DetailGrid.jsx';

export function RolePermissionViewPage() {
  const { name } = useParams();
  const { data, loading, error } = useAsync(() => rolePermissionApi.get(name), [name]);
  return <><PageHeader eyebrow="Mapping" title="Role permission mapping">{data && <Link className="btn btn-primary" to={`/role-permissions/${encodeURIComponent(data.roleName)}/edit`}>Edit mapping</Link>}</PageHeader><Alert>{error}</Alert>{loading ? <div className="table-skeleton">Loading mapping...</div> : data && <Card title={data.roleName}><DetailGrid items={[{ label: 'Role', value: data.roleName }, { label: 'Description', value: data.description }]} /><div className="tag-list spaced">{data.permissions?.length ? data.permissions.map((p) => <Badge key={p}>{p}</Badge>) : <span className="muted">No permissions mapped yet</span>}</div></Card>}</>;
}
