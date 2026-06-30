import { Link, useParams } from 'react-router-dom';
import { roleApi } from '../../services/roleApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { DetailGrid } from '../../components/ui/DetailGrid.jsx';

export function RoleViewPage() {
  const { name } = useParams();
  const { data: role, loading, error } = useAsync(() => roleApi.get(name), [name]);
  return <><PageHeader eyebrow="Authorization" title="Role details">{role && <Link className="btn btn-primary" to={`/roles/${encodeURIComponent(role.name)}/edit`}>Edit role</Link>}</PageHeader><Alert>{error}</Alert>{loading ? <div className="table-skeleton">Loading role...</div> : role && <Card title={role.name}><DetailGrid items={[{ label: 'Name', value: role.name }, { label: 'Description', value: role.description }, { label: 'Id', value: role.id }]} /></Card>}</>;
}
