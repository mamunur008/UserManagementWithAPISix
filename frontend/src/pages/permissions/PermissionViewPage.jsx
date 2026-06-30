import { Link, useParams } from 'react-router-dom';
import { permissionApi } from '../../services/permissionApi.js';
import { useAsync } from '../../hooks/useAsync.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { DetailGrid } from '../../components/ui/DetailGrid.jsx';

export function PermissionViewPage() {
  const { name } = useParams();
  const { data: permission, loading, error } = useAsync(() => permissionApi.get(name), [name]);
  return <><PageHeader eyebrow="Authorization" title="Permission details">{permission && <Link className="btn btn-primary" to={`/permissions/${encodeURIComponent(permission.name)}/edit`}>Edit permission</Link>}</PageHeader><Alert>{error}</Alert>{loading ? <div className="table-skeleton">Loading permission...</div> : permission && <Card title={permission.name}><DetailGrid items={[{ label: 'Name', value: permission.name }, { label: 'Description', value: permission.description }, { label: 'Id', value: permission.id }]} /></Card>}</>;
}
