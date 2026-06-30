import { useEffect, useMemo, useState } from "react";
import { http } from "../../../lib/httpClient.js";
import { CrudDrawerForm } from "../components/CrudDrawerForm.jsx";
import { CrudPageLayout } from "../components/CrudPageLayout.jsx";
import { CrudTableCard } from "../components/CrudTableCard.jsx";
import { CrudToolbar } from "../components/CrudToolbar.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import {
  getErrorMessage,
  getId,
  getRoleName,
  getUserName,
  normalizeRows,
  normalizeStatus,
  optionLabel,
  toArray,
} from "../utils/accessPageUtils.js";

const initialForm = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  organizationId: "",
  phone: "",
  bio: "",
  password: "",
  roleIds: [],
  active: true,
};

function getUserId(user) {
  return getId(user, ["keycloakUserId", "subject", "sub", "username"]);
}

function getRoleKey(role) {
  return String(role?.id ?? role?.roleId ?? role?.name ?? role?.roleName ?? "");
}

function getEmail(user) {
  return user?.emailCache || user?.email || "—";
}

function getRoles(user) {
  return toArray(user?.roles || user?.roleNames || user?.roleIds || user?.assignedRoles)
    .map((role) => {
      if (typeof role === "string") return role;
      return role?.name || role?.roleName || role?.code || role?.id || "";
    })
    .filter(Boolean);
}

function getRolesText(user) {
  const values = getRoles(user);
  return values.length ? values.join(", ") : "—";
}

function mapUser(row) {
  return {
    ...row,
    status: normalizeStatus(row),
    active: normalizeStatus(row) === "active",
  };
}

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  async function loadPageData() {
    try {
      setLoading(true);
      setError("");

      const [usersResponse, organizationsResponse, rolesResponse] = await Promise.allSettled([
        http.get("/users"),
        http.get("/organizations"),
        http.get("/roles"),
      ]);

      if (usersResponse.status === "fulfilled") {
        setUsers(normalizeRows(usersResponse.value).map(mapUser));
      } else {
        setUsers([]);
        setError(getErrorMessage(usersResponse.reason, "Failed to load users."));
      }

      if (organizationsResponse.status === "fulfilled") {
        setOrganizations(normalizeRows(organizationsResponse.value));
      } else {
        console.warn("Organization metadata could not be loaded.", organizationsResponse.reason);
        setOrganizations([]);
      }

      if (rolesResponse.status === "fulfilled") {
        setRoles(normalizeRows(rolesResponse.value));
      } else {
        console.warn("Role metadata could not be loaded.", rolesResponse.reason);
        setRoles([]);
      }
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingUser(null);
    setForm(initialForm);
  }

  function openCreateDrawer() {
    resetForm();
    setDrawerOpen(true);
  }

  function openEditDrawer(user) {
    setEditingUser(user);
    setForm({
      username: user?.usernameCache || user?.username || user?.userName || "",
      email: user?.emailCache || user?.email || "",
      firstName: user?.firstName || user?.first_name || "",
      lastName: user?.lastName || user?.last_name || "",
      organizationId: user?.organizationId || user?.organization_id || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      password: "",
      roleIds: getRoles(user),
      active: normalizeStatus(user) === "active",
    });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleRole(role) {
    const roleKey = getRoleKey(role);
    setForm((prev) => {
      const current = toArray(prev.roleIds).map(String);
      const next = current.includes(roleKey)
        ? current.filter((item) => item !== roleKey)
        : [...current, roleKey];
      return { ...prev, roleIds: next };
    });
  }

  async function handleSubmit(event) {
    event?.preventDefault?.();

    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      organizationId: form.organizationId || null,
      phone: form.phone.trim(),
      bio: form.bio.trim(),
      roleIds: toArray(form.roleIds),
      active: Boolean(form.active),
    };

    if (!editingUser && form.password.trim()) {
      payload.password = form.password.trim();
    }

    if (!payload.username || !payload.email) {
      setError("Username and email are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingUser) {
        const id = getUserId(editingUser);
        await http.put(`/users/${encodeURIComponent(id)}`, payload);
        setNotice("User updated successfully.");
      } else {
        await http.post("/users", payload);
        setNotice("User created successfully.");
      }

      setDrawerOpen(false);
      resetForm();
      await loadPageData();
    } catch (err) {
      console.error("Failed to save user", err);
      setError(getErrorMessage(err, "Failed to save user."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    const id = getUserId(user);
    const name = getUserName(user);
    if (!id || !window.confirm(`Delete user "${name}"?`)) return;

    try {
      await http.delete(`/users/${encodeURIComponent(id)}`);
      setNotice("User deleted successfully.");
      await loadPageData();
    } catch (err) {
      console.error("Failed to delete user", err);
      setError(getErrorMessage(err, "Failed to delete user."));
    }
  }

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;

    return users.filter((user) =>
      [
        getUserName(user),
        user?.usernameCache,
        user?.username,
        user?.userName,
        getEmail(user),
        optionLabel(organizations, user?.organizationId || user?.organization_id),
        getRolesText(user),
        normalizeStatus(user),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [users, organizations, search]);

  return (
    <CrudPageLayout
      title="Users"
      description="Create, maintain, and review Keycloak-backed local user references. Organization and role options are loaded as pre-data."
      actions={
        <button
          type="button"
          onClick={openCreateDrawer}
          className="inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add User
        </button>
      }
    >
      <CrudToolbar
        filters={
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users by username, email, role..."
                className="h-10 w-80 rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        }
        actions={
          <button
            type="button"
            onClick={loadPageData}
            disabled={loading}
            className="inline-flex h-10 items-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Refresh
          </button>
        }
      />

      {notice ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <CrudTableCard title="Users">
          <div className="p-6 text-sm text-slate-500">Loading users...</div>
        </CrudTableCard>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try a different search or create a new user."
          actionLabel="Add User"
          onAction={openCreateDrawer}
        />
      ) : (
        <CrudTableCard title="Users" subtitle={`${filteredUsers.length} result(s)`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Username</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Organization</th>
                  <th className="px-4 py-3 font-medium">Roles</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={getUserId(user)} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {user?.usernameCache || user?.username || user?.userName || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{getUserName(user)}</td>
                    <td className="px-4 py-3 text-slate-600">{getEmail(user)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {optionLabel(organizations, user?.organizationId || user?.organization_id)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{getRolesText(user)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={normalizeStatus(user)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(user)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CrudTableCard>
      )}

      <CrudDrawerForm
        modelValue={drawerOpen}
        onUpdateModelValue={setDrawerOpen}
        title={editingUser ? "Edit User" : "Create User"}
        width="640px"
        loading={saving}
        saveText={editingUser ? "Save Changes" : "Create User"}
        cancelText="Cancel"
        onSubmit={handleSubmit}
        onCancel={closeDrawer}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {editingUser ? "Update user details" : "Add a new user"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Username and email are required. Organization and role lists are loaded from the API.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                value={form.username}
                disabled={Boolean(editingUser)}
                onChange={(event) => setField("username", event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                placeholder="e.g. mamun"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(event) => setField("firstName", event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(event) => setField("lastName", event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Organization</label>
              <select
                value={form.organizationId}
                onChange={(event) => setField("organizationId", event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select organization</option>
                {organizations.map((organization) => (
                  <option key={getId(organization)} value={getId(organization)}>
                    {organization.name || organization.displayName || getId(organization)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {!editingUser ? (
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setField("password", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  placeholder="Optional, depending on backend create-user DTO"
                />
              </div>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Bio</label>
            <textarea
              value={form.bio}
              onChange={(event) => setField("bio", event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-900">Roles</h4>
              <span className="text-xs font-medium text-slate-500">
                {toArray(form.roleIds).length} selected
              </span>
            </div>
            {roles.length === 0 ? (
              <p className="text-sm text-slate-500">No role metadata loaded.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {roles.map((role) => {
                  const roleKey = getRoleKey(role);
                  const checked = toArray(form.roleIds).map(String).includes(roleKey);
                  return (
                    <label
                      key={roleKey}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRole(role)}
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                      />
                      <span>
                        <span className="block font-medium text-slate-900">{getRoleName(role)}</span>
                        {role.description ? (
                          <span className="block text-xs text-slate-500">{role.description}</span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => setField("active", event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Active
          </label>
        </div>
      </CrudDrawerForm>
    </CrudPageLayout>
  );
}

export default UsersPage;
