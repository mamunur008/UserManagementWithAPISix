import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout.jsx";
import { DashboardPage } from "../features/menu/DashboardPage.jsx";
import { CallbackPage } from "../features/session/CallbackPage.jsx";
import { ChartOfAccountsPage } from "../modules/access/pages/ChartOfAccountsPage.jsx";
import { LoginPage } from "../features/session/LoginPage.jsx";
import { loadSession } from "../features/session/sessionSlice.js";
import { MenuItemsPage } from "../modules/access/pages/MenuItemsPage.jsx";
import { OrganizationTypesPage } from "../modules/access/pages/OrganizationTypesPage.jsx";
import { OrganizationsPage } from "../modules/access/pages/OrganizationsPage.jsx";
import { PaymentAccountsPage } from "../modules/access/pages/PaymentAccountsPage.jsx";
import { PermissionsPage } from "../modules/access/pages/PermissionsPage.jsx";
import { RolePermissionsPage } from "../modules/access/pages/RolePermissionsPage.jsx";
import { RolesPage } from "../modules/access/pages/RolesPage.jsx";
import { UserRolesPage } from "../modules/access/pages/UserRolesPage.jsx";
import { UsersPage } from "../modules/access/pages/UsersPage.jsx";

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.session.token);

  useEffect(() => {
    dispatch(loadSession());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<CallbackPage />} />

      <Route element={token ? <AppLayout /> : <Navigate to="/login" replace />}>
        <Route index element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/permissions" element={<PermissionsPage />} />
        <Route path="/role-permissions" element={<RolePermissionsPage />} />
        <Route path="/user-roles" element={<UserRolesPage />} />
        <Route path="/organizations" element={<OrganizationsPage />} />
        <Route path="/organization-types" element={<OrganizationTypesPage />} />
        <Route path="/payment-accounts" element={<PaymentAccountsPage />} />
        <Route path="/chart-of-accounts" element={<ChartOfAccountsPage />} />
        <Route path="/menu-items" element={<MenuItemsPage />} />
      </Route>
    </Routes>
  );
}
