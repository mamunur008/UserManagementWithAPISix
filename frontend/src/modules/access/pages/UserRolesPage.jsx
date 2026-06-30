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
  hasSearch,
  normalizeRows,
  normalizeStatus,
  toArray,
  uniqueStrings,
} from "../utils/accessPageUtils.js";

const seedUsers = [
  {
    id: "john",
    username: "john",
    name: "John Doe",
    email: "john@example.com",
    status: "active",
  },
  {
    id: "jane",
    username: "jane",
    name: "Jane Smith",
    email: "jane@example.com",
    status: "active",
  },
];

const seedRoles = [
  {
    id: "admin",
    name: "Admin",
    description: "Full administrative access",
    status: "active",
  },
  {
    id: "manager",
    name: "Manager",
    description: "Operational management access",
    status: "active",
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access",
    status: "active",
  },
];

const seedUserRoleMap = {
  john: ["admin"],
  jane: ["manager", "viewer"],
};

function getUserPrimaryKey(user) {
  return String(user?.id ?? user?.userId ?? user?.keycloakId ?? user?.username ?? user?.email ?? "");
}

function getRolePrimaryKey(role) {
  return String(role?.id ?? role?.roleId ?? role?.name ?? role?.roleName ?? "");
}

function resolveRoleKey(value, roles) {
  if (value === undefined || value === null || value === "") return "";
  const raw = typeof value === "object" ? value : { value };
  const candidate =
    raw.roleId ??
    raw.id ??
    raw.role?.id ??
    raw.role?.roleId ??
    raw.name ??
    raw.roleName ??
    raw.nameCache ??
    raw.role?.name ??
    raw.role?.roleName ??
    raw.value;

  const match = roles.find((role) => {
    const keys = [role?.id, role?.roleId, role?.name, role?.roleName, role?.nameCache]
      .filter(Boolean)
      .map(String);
    return keys.includes(String(candidate));
  });

  return match ? getRolePrimaryKey(match) : String(candidate || "");
}

function getAssignedRolesFromRow(row, roles) {
  const source = row?.roleIds ?? row?.roles ?? row?.assignedRoles ?? row?.roleNames ?? [];
  return uniqueStrings(toArray(source).map((item) => resolveRoleKey(item, roles)));
}

function buildUserRoleMap(users, roles, summaryRows) {
  const nextMap = {};

  for (const user of users) {
    const userKey = getUserPrimaryKey(user);
    const embedded = getAssignedRolesFromRow(user, roles);
    if (embedded.length) nextMap[userKey] = embedded;
  }

  for (const row of summaryRows || []) {
    const userKey = String(
      row?.userId ?? row?.id ?? row?.user?.id ?? row?.keycloakId ?? row?.username ?? row?.email ?? "",
    );
    if (!userKey) continue;
    nextMap[userKey] = getAssignedRolesFromRow(row, roles);
  }

  return nextMap;
}

function RolePills({ roles, roleIds, limit = 4 }) {
  const selected = (roleIds || [])
    .map((id) => roles.find((role) => getRolePrimaryKey(role) === String(id)))
    .filter(Boolean);

  if (!selected.length) {
    return <span className="text-sm text-slate-400">No roles assigned</span>;
  }

  const visible = selected.slice(0, limit);
  const remaining = selected.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((role) => (
        <span
          key={getRolePrimaryKey(role)}
          className="inline-flex max-w-52 truncate rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
          title={role.description || getRoleName(role)}
        >
          {getRoleName(role)}
        </span>
      ))}
      {remaining > 0 ? (
        <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
          +{remaining} more
        </span>
      ) : null}
    </div>
  );
}

export function UserRolesPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userRoleMap, setUserRoleMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [roleSearch, setRoleSearch] = useState("");
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
      const [usersResponse, rolesResponse] = await Promise.all([
        http.get("/users"),
        http.get("/roles"),
      ]);

      const nextUsers = normalizeRows(usersResponse).map((user) => ({
        ...user,
        status: normalizeStatus(user),
      }));
      const nextRoles = normalizeRows(rolesResponse).map((role) => ({
        ...role,
        status: normalizeStatus(role),
      }));

      let summaryRows = [];
      try {
        const summaryResponse = await http.get("/user-roles");
        summaryRows = normalizeRows(summaryResponse);
      } catch (error) {
        console.warn("User role summary endpoint is not available yet.", error);
      }

      const finalUsers = nextUsers;
      const finalRoles = nextRoles;
      const nextMap = buildUserRoleMap(finalUsers, finalRoles, summaryRows);

      setUsers(finalUsers);
      setRoles(finalRoles);
      setUserRoleMap(nextMap);
    } catch (error) {
      console.error("Failed to load user role pre-data.", error);
      setError(getErrorMessage(error, "Failed to load user and role pre-data."));
      setUsers([]);
      setRoles([]);
      setUserRoleMap({});
    } finally {
      setLoading(false);
    }
  }

  async function loadUserRoles(user) {
    const userKey = getUserPrimaryKey(user);
    const cached = userRoleMap[userKey] || [];
    setSelectedRoleIds(cached);

    try {
      let response;
      try {
        response = await http.get(`/user-roles/${encodeURIComponent(userKey)}`);
      } catch {
        response = await http.get(`/users/${encodeURIComponent(userKey)}/roles`);
      }

      const assignedRows = normalizeRows(response);
      const assigned = getAssignedRolesFromRow(
        { roles: assignedRows.length ? assignedRows : response?.data?.roles },
        roles,
      );

      if (assigned.length) {
        setSelectedRoleIds(assigned);
        setUserRoleMap((prev) => ({ ...prev, [userKey]: assigned }));
      }
    } catch (error) {
      console.warn("Using cached user role assignment.", error);
    }
  }

  function openEditDrawer(user) {
    setEditingUser(user);
    setRoleSearch("");
    setDrawerOpen(true);
    loadUserRoles(user);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingUser(null);
    setSelectedRoleIds([]);
    setRoleSearch("");
  }

  function toggleRole(role) {
    const roleKey = getRolePrimaryKey(role);
    setSelectedRoleIds((current) => {
      if (current.includes(roleKey)) return current.filter((item) => item !== roleKey);
      return [...current, roleKey];
    });
  }

  async function handleSaveUserRoles() {
    if (!editingUser) return;

    const userKey = getUserPrimaryKey(editingUser);
    const selectedRoles = selectedRoleIds
      .map((id) => roles.find((role) => getRolePrimaryKey(role) === String(id)))
      .filter(Boolean);

    const payload = {
      userId: userKey,
      roleIds: selectedRoleIds,
      roles: selectedRoles.map((role) => getRoleName(role)),
    };

    try {
      setSaving(true);
      try {
        await http.put(`/user-roles/${encodeURIComponent(userKey)}`, payload);
      } catch {
        try {
          await http.post(`/user-roles/${encodeURIComponent(userKey)}`, payload);
        } catch {
          await http.post(`/users/${encodeURIComponent(userKey)}/roles`, payload);
        }
      }

      setUserRoleMap((prev) => ({ ...prev, [userKey]: selectedRoleIds }));
      setNotice("User roles updated successfully");
      closeDrawer();
    } catch (error) {
      alert(getErrorMessage(error, "Failed to save user roles."));
    } finally {
      setSaving(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const userKey = getUserPrimaryKey(user);
      const assignedIds = userRoleMap[userKey] || [];
      const assignedRoles = assignedIds
        .map((id) => roles.find((role) => getRolePrimaryKey(role) === String(id)))
        .filter(Boolean);

      return (
        !q ||
        [
          getUserName(user),
          user.username,
          user.email,
          user.phone,
          normalizeStatus(user),
          ...assignedRoles.map(getRoleName),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q))
      );
    });
  }, [users, roles, userRoleMap, search]);

  const visibleRoles = useMemo(() => {
    return roles.filter((role) =>
      [getRoleName(role), role.description, normalizeStatus(role)].some((value) =>
        hasSearch(value, roleSearch),
      ),
    );
  }, [roles, roleSearch]);

  return (
    <CrudPageLayout
      title="User Roles"
      description="List every user with assigned role names and edit the user's roles from a drawer."
    >
      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <CrudToolbar
        filters={
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="User, email, username, or role"
              className="w-96 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        }
        actions={
          <button
            type="button"
            onClick={loadPageData}
            disabled={loading}
            className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Refresh
          </button>
        }
      />

      {loading ? (
        <CrudTableCard title="Users">
          <div className="p-6 text-sm text-slate-500">Loading user roles...</div>
        </CrudTableCard>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No user roles found"
          description="Try a different search keyword."
        />
      ) : (
        <CrudTableCard title="Users" subtitle={`${filteredUsers.length} result(s)`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Assigned Roles</th>
                  <th className="px-4 py-3 font-medium">Count</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const userKey = getUserPrimaryKey(user);
                  const assignedIds = userRoleMap[userKey] || [];

                  return (
                    <tr key={userKey} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{getUserName(user)}</div>
                        <div className="text-xs text-slate-500">{user.username || userKey}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{user.email || "—"}</td>
                      <td className="px-4 py-3">
                        <RolePills roles={roles} roleIds={assignedIds} />
                      </td>
                      <td className="px-4 py-3 text-slate-700">{assignedIds.length}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={normalizeStatus(user)} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(user)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CrudTableCard>
      )}

      <CrudDrawerForm
        modelValue={drawerOpen}
        onUpdateModelValue={setDrawerOpen}
        title={editingUser ? `Edit roles: ${getUserName(editingUser)}` : "Edit User Roles"}
        width="680px"
        loading={saving}
        saveText="Save Roles"
        cancelText="Cancel"
        onSubmit={handleSaveUserRoles}
        onCancel={closeDrawer}
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {editingUser ? getUserName(editingUser) : "Selected user"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {editingUser?.email || editingUser?.username || "Choose the roles this user should receive."}
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
              {selectedRoleIds.length} role(s) selected
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Search available roles
            </label>
            <input
              type="text"
              value={roleSearch}
              onChange={(event) => setRoleSearch(event.target.value)}
              placeholder="Search by role name or description"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {visibleRoles.length === 0 ? (
            <EmptyState
              title="No roles found"
              description="Try another search keyword."
              className="py-10"
            />
          ) : (
            <div className="space-y-2">
              {visibleRoles.map((role) => {
                const roleKey = getRolePrimaryKey(role);
                const checked = selectedRoleIds.includes(roleKey);

                return (
                  <label
                    key={roleKey}
                    className={[
                      "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition",
                      checked
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRole(role)}
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-900">
                        {getRoleName(role)}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {role.description || "No description"}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </CrudDrawerForm>
    </CrudPageLayout>
  );
}

export default UserRolesPage;
