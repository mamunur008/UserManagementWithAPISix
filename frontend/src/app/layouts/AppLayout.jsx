import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, Outlet } from "react-router-dom";

import { setMenus } from "../../features/menu/menuSlice.js";
import { setMe } from "../../features/session/sessionSlice.js";
import { meApi } from "../../services/meApi.js";

function normalizeMe(meResponse) {
  const me = meResponse?.data ?? meResponse ?? {};

  return {
    identity: me.identity ?? {},
    roles: Array.isArray(me.roles) ? me.roles : [],
    permissions: Array.isArray(me.permissions)
      ? me.permissions
          .map((p) => (typeof p === "string" ? p : p.code || p.key || p.name))
          .filter(Boolean)
      : [],
    permissionItems: Array.isArray(me.permissions) ? me.permissions : [],
    menus: Array.isArray(me.menus)
      ? me.menus
      : Array.isArray(me.menuItems)
        ? me.menuItems
        : [],
  };
}

export function AppLayout() {
  const dispatch = useDispatch();

  const menus = useSelector((state) => state.menu.items);
  const me = useSelector((state) => state.session.me);

  const identity = me?.identity || {};

  useEffect(() => {
    async function loadMe() {
      try {
        const response = await meApi.get();
        const normalizedMe = normalizeMe(response);

        dispatch(setMe(normalizedMe));
        dispatch(setMenus(normalizedMe.menus));
      } catch (error) {
        console.error("Failed to load /me", error);
      }
    }

    loadMe();
  }, [dispatch]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">UM</div>
          <div>
            <h1>UserManagement</h1>
            <p>Accounts Admin</p>
          </div>
        </div>

        <nav className="side-nav">
          {menus.map((item) => (
            <NavLink
              key={item.id || item.url}
              to={item.url}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span className="nav-icon">{item.icon || "•"}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">APISIX → AUTHSERVICE → REDIS → KEYCLOAK</p>
            <h2>Identity & Access Management</h2>
          </div>

          <div className="user-card">
            <div className="avatar">
              {(identity.username || "S").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <strong>{identity.username || "System Admin"}</strong>
              <p>Active session</p>
            </div>
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </header>

        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
