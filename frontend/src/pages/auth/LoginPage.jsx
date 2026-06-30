import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

export function LoginPage() {
  const { auth, login } = useAuth();
  const [form, setForm] = useState({ username: 'admin@local.test', password: 'Admin@12345' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (auth) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try { await login(form); }
    catch (err) { setError(err.friendlyMessage || err.message); }
    finally { setBusy(false); }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand-block large"><div className="brand-mark">UM</div><div><strong>UserManagement</strong><span>Enterprise IAM Portal</span></div></div>
        <h1>Secure admin login</h1>
        <p>Login through APISIX and Keycloak. Session data is verified through AuthService and Redis.</p>
        <Alert>{error}</Alert>
        <form className="form-stack" onSubmit={submit}>
          <label className="field"><span>Username</span><input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
          <label className="field"><span>Password</span><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <button className="btn btn-primary full" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </section>
      <section className="login-hero"><div><span className="hero-pill">Keycloak + APISIX + Redis</span><h2>Professional identity control for microservices.</h2><p>Manage users, roles, permissions, user-role mappings and role-permission mappings from one clean React admin console.</p></div></section>
    </main>
  );
}
