import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { userApi } from '../../services/userApi.js';
import { roleApi } from '../../services/roleApi.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Checkbox, Field, TextInput } from '../../components/ui/Fields.jsx';

const emptyForm = { username: '', email: '', firstName: '', lastName: '', password: 'User@12345', enabled: true, roles: [] };

export function UserFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    roleApi.list().then(setRoles).catch((e) => setError(e.friendlyMessage || e.message));
    if (mode === 'edit' && id) userApi.get(id).then((u) => setForm({ ...emptyForm, ...u, password: '', roles: u.roles || [] })).catch((e) => setError(e.friendlyMessage || e.message));
  }, [mode, id]);

  function toggleRole(roleName) {
    const exists = form.roles.includes(roleName);
    setForm({ ...form, roles: exists ? form.roles.filter((x) => x !== roleName) : [...form.roles, roleName] });
  }

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (mode === 'create') await userApi.create(form);
      else {
        await userApi.update(id, { email: form.email, firstName: form.firstName, lastName: form.lastName, enabled: form.enabled });
        await userApi.assignRoles(id, form.roles);
      }
      navigate('/users');
    } catch (err) { setError(err.friendlyMessage || err.message); }
    finally { setBusy(false); }
  }

  return (
    <><PageHeader eyebrow="Directory" title={mode === 'create' ? 'Add user' : 'Edit user'} description="Manage Keycloak profile fields and realm role mapping." />
      <Alert>{error}</Alert>
      <Card><form className="form-grid" onSubmit={submit}>
        <Field label="Username"><TextInput disabled={mode === 'edit'} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></Field>
        <Field label="Email"><TextInput type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="First name"><TextInput value={form.firstName || ''} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field>
        <Field label="Last name"><TextInput value={form.lastName || ''} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field>
        {mode === 'create' && <Field label="Temporary password"><TextInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></Field>}
        <div className="field"><span>Status</span><Checkbox label="Enabled" checked={!!form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /></div>
        <div className="field full-span"><span>Realm roles</span><div className="option-grid">{roles.map((r) => <Checkbox key={r.name} label={r.name} checked={form.roles.includes(r.name)} onChange={() => toggleRole(r.name)} />)}</div></div>
        <div className="form-actions full-span"><Link className="btn btn-light" to="/users">Cancel</Link><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save user'}</button></div>
      </form></Card></>
  );
}
