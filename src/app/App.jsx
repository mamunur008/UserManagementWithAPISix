import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadSession } from "../features/session/sessionSlice.js";
import { LoginPage } from "../features/session/LoginPage.jsx";
import { CallbackPage } from "../features/session/CallbackPage.jsx";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import { DashboardPage } from "../pages/dashboard/DashboardPage.jsx";
import { UsersPage } from "../pages/users/UsersPage.jsx";
import { RolesPage } from "../pages/roles/RolesPage.jsx";
import { PermissionsPage } from "../pages/permissions/PermissionsPage.jsx";
import { UserRolesPage } from "../pages/user-roles/UserRolesPage.jsx";
import { RolePermissionsPage } from "../pages/role-permissions/RolePermissionsPage.jsx";
import { MenuItemsPage } from "../pages/menu-items/MenuItemsPage.jsx";
import { OrganizationsPage } from "../pages/organizations/OrganizationsPage.jsx";
import { PaymentAccountsPage } from "../pages/payment-accounts/PaymentAccountsPage.jsx";

function Loading() { return <main className="loading-page"><div className="loading-card"><div className="brand-mark">UM</div><h1>Loading session...</h1><p>Please wait while we check your Keycloak login.</p></div></main>; }
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, bootstrapped } = useSelector((state) => state.session);
  if (!bootstrapped || loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading, bootstrapped } = useSelector((state) => state.session);
  if (!bootstrapped || loading) return <Loading />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}
export default function App() {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(loadSession()); }, [dispatch]);
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/auth/callback" element={<CallbackPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route path="user-roles" element={<UserRolesPage />} />
        <Route path="role-permissions" element={<RolePermissionsPage />} />
        <Route path="menu-items" element={<MenuItemsPage />} />
        <Route path="organizations" element={<OrganizationsPage />} />
        <Route path="payment-accounts" element={<PaymentAccountsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
