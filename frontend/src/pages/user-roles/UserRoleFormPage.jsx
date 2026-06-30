import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { userApi } from '../../services/userApi.js';
import { roleApi } from '../../services/roleApi.js';
import { userRoleApi } from '../../services/userRoleApi.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Checkbox, Field, Select } from '../../components/ui/Fields.jsx';

export function UserRoleFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userId, setUserId] = useState(id || '');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { Promise.all([userApi.list(), roleApi.list()]).then(([u, r]) => { setUsers(u); setRoles(r); const selectedUserId = id || u[0]?.id || ''; setUserId(selectedUserId); if (selectedUserId) userRoleApi.get(selectedUserId).then((m) => setSelectedRoles(m.roles || [])); }).catch((e) => setError(e.friendlyMessage || e.message)); }, [id]);
  useEffect(() => { if (userId) userRoleApi.get(userId).then((m) => setSelectedRoles(m.roles || [])).catch(() => setSelectedRoles([])); }, [userId]);
  function toggle(roleName) { setSelectedRoles((current) => current.includes(roleName) ? current.filter((x) => x !== roleName) : [...current, roleName]); }
  async function submit(e) { e.preventDefault(); setBusy(true); setError(''); try { await userRoleApi.save(userId, selectedRoles); navigate('/user-roles'); } catch (err) { setError(err.friendlyMessage || err.message); } finally { setBusy(false); } }

  return <><PageHeader eyebrow="Mapping" title={mode === 'create' ? 'Assign user roles' : 'Edit user roles'} description="This uses POST /api/users/{id}/roles in the current backend." /><Alert>{error}</Alert><Card><form className="form-stack" onSubmit={submit}><Field label="User"><Select disabled={mode === 'edit'} value={userId} onChange={(e) => setUserId(e.target.value)}>{users.map((u) => <option key={u.id} value={u.id}>{u.username} — {u.email}</option>)}</Select></Field><div className="field"><span>Roles</span><div className="option-grid">{roles.map((r) => <Checkbox key={r.name} label={r.name} checked={selectedRoles.includes(r.name)} onChange={() => toggle(r.name)} />)}</div></div><div className="form-actions"><Link className="btn btn-light" to="/user-roles">Cancel</Link><button className="btn btn-primary" disabled={busy || !userId}>{busy ? 'Saving...' : 'Save mapping'}</button></div></form></Card></>;
}
