import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { setMenus, clearMenus } from '../../features/menu/menuSlice.js';
import { setMe, clearSession } from '../../features/session/sessionSlice.js';
import { meApi } from '../../services/meApi.js';

const iconMap = {
  dashboard: '▦',
  users: '👥',
  shield: '🛡️',
  lock: '🔐',
  link: '🔗',
  check: '✓',
  menu: '☰',
  organization: '🏢',
  payment: '💳',
  chart: '📒',
  account: '📘'
};

function AppMenuIcon({ name }) {
  return <span className="nav-icon-symbol">{iconMap[name] || '•'}</span>;
}

function normalizeMe(meResponse) {
  const me = meResponse?.data ?? meResponse ?? {};
  return {
    identity: me.identity ?? {},
    roles: Array.isArray(me.roles) ? me.roles : [],
    permissions: Array.isArray(me.permissions)
      ? me.permissions.map((p) => (typeof p === 'string' ? p : p.code || p.key || p.name)).filter(Boolean)
      : [],
    permissionItems: Array.isArray(me.permissions) ? me.permissions : [],
    menus: Array.isArray(me.menus) ? me.menus : Array.isArray(me.menuItems) ? me.menuItems : []
  };
}

function uniqueMenus(menus) {
  const map = new Map();
  for (const item of menus || []) {
    if (!item?.url) continue;
    if (item.url === '/' || item.url === '/dashboard') continue;
    map.set(item.url, item);
  }
  return Array.from(map.values()).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
}

export function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menus = useSelector((state) => state.menu.items);
  const me = useSelector((state) => state.session.me);
  const identity = me?.identity || {};
  const visibleMenus = uniqueMenus(menus);

  useEffect(() => {
    async function loadMe() {
      try {
        const response = await meApi.get();
        const normalizedMe = normalizeMe(response);
        dispatch(setMe(normalizedMe));
        dispatch(setMenus(normalizedMe.menus));
      } catch (error) {
        console.error('Failed to load /me', error);
        dispatch(setMenus([]));
      }
    }
    loadMe();
  }, [dispatch]);

  function handleLogout() {
    dispatch(clearSession());
    dispatch(clearMenus());
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">UM</div>
          <div>
            <h1 className="brand-title">UserManagement</h1>
            <p className="brand-subtitle">Accounts Admin</p>
          </div>
        </div>

        <nav className="side-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <AppMenuIcon name="dashboard" />
            <span>Dashboard</span>
          </NavLink>

          {visibleMenus.map((item) => (
            <NavLink key={item.id || item.url} to={item.url} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <AppMenuIcon name={item.icon} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">APISIX → AUTHSERVICE → REDIS → KEYCLOAK</p>
            <h2 className="topbar-title">Identity & Access Management</h2>
          </div>

          <div className="topbar-actions">
            <div className="user-card">
              <div className="avatar">{(identity.username || 'A').slice(0, 1).toUpperCase()}</div>
              <div>
                <strong>{identity.username || 'Administrator'}</strong>
                <p className="text-sm font-bold text-muted">Active session</p>
              </div>
            </div>
            <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
