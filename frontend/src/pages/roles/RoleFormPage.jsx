import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { roleApi } from '../../services/roleApi.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Field, TextArea, TextInput } from '../../components/ui/Fields.jsx';

export function RoleFormPage({ mode }) {
  const { name } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (mode === 'edit' && name) roleApi.get(name).then((r) => r && setForm(r)).catch((e) => setError(e.friendlyMessage || e.message)); }, [mode, name]);
  async function submit(e) { e.preventDefault(); setBusy(true); setError(''); try { mode === 'create' ? await roleApi.create(form) : await roleApi.update(name, form); navigate('/roles'); } catch (err) { setError(err.friendlyMessage || err.message); } finally { setBusy(false); } }
  return <><PageHeader eyebrow="Authorization" title={mode === 'create' ? 'Add role' : 'Edit role'} description="Use readable names such as account-admin, user-manager, sales-approver." /><Alert>{error}</Alert><Card><form className="form-stack" onSubmit={submit}><Field label="Role name"><TextInput disabled={mode === 'edit'} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field><Field label="Description"><TextArea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field><div className="form-actions"><Link className="btn btn-light" to="/roles">Cancel</Link><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save role'}</button></div></form></Card></>;
}
