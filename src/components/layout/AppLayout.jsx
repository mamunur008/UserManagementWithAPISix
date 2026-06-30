import { NavLink, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchMe } from "../../features/menu/menuSlice.js";
import { logout } from "../../features/session/sessionSlice.js";

export function AppLayout() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.menu);
  const { user } = useSelector((state) => state.session);

  useEffect(() => { dispatch(fetchMe()); }, [dispatch]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block large"><div className="brand-mark">UM</div><div><strong>UserManagement</strong><span>Accounts Admin</span></div></div>
        <nav className="nav-stack">
          {items.map((item) => (
            <NavLink key={item.id || item.url} to={item.url || "/"} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <span>{item.icon || "•"}</span><span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-shell">
        <header className="topbar">
          <div><p className="eyebrow">APISIX → AUTHSERVICE → REDIS → KEYCLOAK</p><h1 className="topbar-title">Identity & Access Management</h1></div>
          <div className="topbar-actions"><div className="user-chip"><div className="user-avatar">{(user?.given_name || user?.preferred_username || "U").slice(0,1).toUpperCase()}</div><div><strong>{user?.name || user?.preferred_username || "User"}</strong><span>Active session</span></div></div><button className="btn btn-secondary" onClick={() => dispatch(logout())}>Logout</button></div>
        </header>
        <section className="content-shell"><Outlet /></section>
      </main>
    </div>
  );
}
