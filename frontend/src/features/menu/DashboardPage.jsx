import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';

export function DashboardPage() {
  const me = useSelector((state) => state.session.me);
  const menus = useSelector((state) => state.menu.items);
  const identity = me?.identity || {};
  const roles = Array.isArray(me?.roles) ? me.roles : [];
  const permissions = Array.isArray(me?.permissions) ? me.permissions : [];
  const menuItems = Array.isArray(menus) ? menus : [];

  const stats = [
    { label: 'Menus', value: menuItems.length, to: '/menu-items' },
    { label: 'Roles', value: roles.length, to: '/roles' },
    { label: 'Permissions', value: permissions.length, to: '/permissions' },
    { label: 'User', value: identity.username || '-', to: '/users' }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Access control dashboard"
        description="Operational view of Keycloak login, APISIX forward-auth, Redis session validation, local DB roles, permissions and server-side menus."
      />

      <div className="stats-grid">
        {stats.map((item) => (
          <Link className="stat-card" to={item.to} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </Link>
        ))}
      </div>

      <Card title="Current user" description="This profile is resolved from /api/admin/me using the Keycloak subject and account_db user_ref.">
        <div className="details-grid">
          <div className="detail-box"><span className="detail-label">Username</span><strong className="detail-value">{identity.username || '-'}</strong></div>
          <div className="detail-box"><span className="detail-label">Email</span><strong className="detail-value">{identity.email || '-'}</strong></div>
          <div className="detail-box"><span className="detail-label">Subject</span><strong className="detail-value">{identity.subject || '-'}</strong></div>
          <div className="detail-box"><span className="detail-label">User Ref ID</span><strong className="detail-value">{identity.userRefId || '-'}</strong></div>
          <div className="detail-box"><span className="detail-label">Organization ID</span><strong className="detail-value">{identity.organizationId || '-'}</strong></div>
        </div>
      </Card>

      <Card title="Roles" description="Local roles assigned from account_db.user_role.">
        <div className="badge-list">
          {roles.length === 0 ? <span className="text-muted">No roles found.</span> : roles.map((role) => <span className="badge" key={role}>{role}</span>)}
        </div>
      </Card>

      <Card title="Permissions" description="Permissions resolved from account_db.role_permission.">
        <div className="badge-list">
          {permissions.length === 0 ? <span className="text-muted">No permissions found.</span> : permissions.map((permission) => <span className="badge" key={permission}>{permission}</span>)}
        </div>
      </Card>

      <Card title="Recommended architecture" description="Keep the frontend thin. Keep authorization rules inside UserManagement API and account_db. Keycloak should handle identity/login only.">
        <div className="architecture-flow">
          <span>React Client</span><span>→</span><span>APISIX</span><span>→</span><span>AuthService / Redis</span><span>→</span><span>UserManagement API</span><span>→</span><span>account_db</span>
        </div>
      </Card>
    </>
  );
}
