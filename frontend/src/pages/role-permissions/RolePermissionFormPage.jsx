import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { rolePermissionApi } from '../../services/rolePermissionApi.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Checkbox, Field, Select } from '../../components/ui/Fields.jsx';

export function RolePermissionFormPage({ mode }) {
  const { name } = useParams();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roleName, setRoleName] = useState(name || '');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { rolePermissionApi.loadOptions().then(({ roles, permissions }) => { setRoles(roles); setPermissions(permissions); const selectedRole = name || roles[0]?.name || ''; setRoleName(selectedRole); if (selectedRole) rolePermissionApi.get(selectedRole).then((m) => setSelectedPermissions(m?.permissions || [])); }).catch((e) => setError(e.friendlyMessage || e.message)); }, [name]);
  useEffect(() => { if (roleName) rolePermissionApi.get(roleName).then((m) => setSelectedPermissions(m?.permissions || [])).catch(() => setSelectedPermissions([])); }, [roleName]);
  function toggle(permissionName) { setSelectedPermissions((current) => current.includes(permissionName) ? current.filter((x) => x !== permissionName) : [...current, permissionName]); }
  async function submit(e) { e.preventDefault(); setBusy(true); setError(''); try { await rolePermissionApi.save(roleName, selectedPermissions); navigate('/role-permissions'); } catch (err) { setError(err.friendlyMessage || err.message); } finally { setBusy(false); } }

  return <><PageHeader eyebrow="Mapping" title={mode === 'create' ? 'Assign role permissions' : 'Edit role permissions'} description="Composite role mapping should be implemented in the backend using Keycloak role composites." /><Alert>{error}</Alert><Card><form className="form-stack" onSubmit={submit}><Field label="Role"><Select disabled={mode === 'edit'} value={roleName} onChange={(e) => setRoleName(e.target.value)}>{roles.map((r) => <option key={r.name} value={r.name}>{r.name}</option>)}</Select></Field><div className="field"><span>Permissions</span><div className="option-grid">{permissions.map((p) => <Checkbox key={p.name} label={p.name} checked={selectedPermissions.includes(p.name)} onChange={() => toggle(p.name)} />)}</div></div><div className="form-actions"><Link className="btn btn-light" to="/role-permissions">Cancel</Link><button className="btn btn-primary" disabled={busy || !roleName}>{busy ? 'Saving...' : 'Save mapping'}</button></div></form></Card></>;
}
