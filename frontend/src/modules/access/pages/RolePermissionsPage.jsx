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
  getPermissionCode,
  getPermissionModule,
  getPermissionName,
  getRoleName,
  hasSearch,
  normalizeRows,
  normalizeStatus,
  toArray,
  uniqueStrings,
} from "../utils/accessPageUtils.js";

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

const seedPermissions = [
  {
    id: "permission:users.view",
    code: "permission:users.view",
    name: "View Users",
    module: "Users",
    status: "active",
  },
  {
    id: "permission:users.create",
    code: "permission:users.create",
    name: "Create Users",
    module: "Users",
    status: "active",
  },
  {
    id: "permission:roles.view",
    code: "permission:roles.view",
    name: "View Roles",
    module: "Roles",
    status: "active",
  },
  {
    id: "permission:roles.update",
    code: "permission:roles.update",
    name: "Update Roles",
    module: "Roles",
    status: "active",
  },
  {
    id: "permission:menu.manage",
    code: "permission:menu.manage",
    name: "Manage Menu",
    module: "Menu",
    status: "active",
  },
];

const seedRolePermissionMap = {
  admin: [
    "permission:users.view",
    "permission:users.create",
    "permission:roles.view",
    "permission:roles.update",
    "permission:menu.manage",
  ],
  manager: ["permission:users.view", "permission:roles.view"],
  viewer: ["permission:users.view"],
};

function getPermissionPrimaryKey(permission) {
  return String(permission?.id ?? permission?.permissionId ?? permission?.code ?? permission?.key ?? permission?.name ?? "");
}

function getRolePrimaryKey(role) {
  return String(role?.id ?? role?.roleId ?? role?.name ?? role?.roleName ?? "");
}

function resolvePermissionKey(value, permissions) {
  if (value === undefined || value === null || value === "") return "";
  const raw = typeof value === "object" ? value : { value };
  const candidate =
    raw.permissionId ??
    raw.id ??
    raw.permission?.id ??
    raw.permission?.permissionId ??
    raw.code ??
    raw.permissionCode ??
    raw.key ??
    raw.name ??
    raw.permission?.code ??
    raw.permission?.name ??
    raw.value;

  const match = permissions.find((permission) => {
    const keys = [
      permission?.id,
      permission?.permissionId,
      permission?.code,
      permission?.key,
      permission?.name,
    ]
      .filter(Boolean)
      .map(String);

    return keys.includes(String(candidate));
  });

  return match ? getPermissionPrimaryKey(match) : String(candidate || "");
}

function getAssignedPermissionsFromRow(row, permissions) {
  const source =
    row?.permissionIds ??
    row?.permissions ??
    row?.assignedPermissions ??
    row?.permissionCodes ??
    row?.permissionNames ??
    [];

  return uniqueStrings(toArray(source).map((item) => resolvePermissionKey(item, permissions)));
}

function buildRolePermissionMap(roles, permissions, summaryRows) {
  const nextMap = {};

  for (const role of roles) {
    const roleKey = getRolePrimaryKey(role);
    const embedded = getAssignedPermissionsFromRow(role, permissions);
    if (embedded.length) nextMap[roleKey] = embedded;
  }

  for (const row of summaryRows || []) {
    const roleKey = String(
      row?.roleId ?? row?.id ?? row?.role?.id ?? row?.roleName ?? row?.name ?? "",
    );
    if (!roleKey) continue;
    nextMap[roleKey] = getAssignedPermissionsFromRow(row, permissions);
  }

  return nextMap;
}

function permissionLabel(permission) {
  return getPermissionName(permission) || getPermissionCode(permission);
}

function PermissionPills({ permissions, permissionIds, limit = 4 }) {
  const selected = (permissionIds || [])
    .map((id) =>
      permissions.find((permission) => getPermissionPrimaryKey(permission) === String(id)),
    )
    .filter(Boolean);

  if (!selected.length) {
    return <span className="text-sm text-slate-400">No permissions assigned</span>;
  }

  const visible = selected.slice(0, limit);
  const remaining = selected.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((permission) => (
        <span
          key={getPermissionPrimaryKey(permission)}
          className="inline-flex max-w-52 truncate rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
          title={getPermissionCode(permission)}
        >
          {permissionLabel(permission)}
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

export function RolePermissionsPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissionMap, setRolePermissionMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState("");
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
      const [rolesResponse, permissionsResponse] = await Promise.all([
        http.get("/roles"),
        http.get("/permissions"),
      ]);

      const nextRoles = normalizeRows(rolesResponse).map((role) => ({
        ...role,
        status: normalizeStatus(role),
      }));
      const nextPermissions = normalizeRows(permissionsResponse).map((permission) => ({
        ...permission,
        status: normalizeStatus(permission),
      }));

      let summaryRows = [];
      try {
        const summaryResponse = await http.get("/role-permissions");
        summaryRows = normalizeRows(summaryResponse);
      } catch (error) {
        console.warn("Role permission summary endpoint is not available yet.", error);
      }

      const finalRoles = nextRoles;
      const finalPermissions = nextPermissions;
      const nextMap = buildRolePermissionMap(finalRoles, finalPermissions, summaryRows);

      setRoles(finalRoles);
      setPermissions(finalPermissions);
      setRolePermissionMap(nextMap);
    } catch (error) {
      console.error("Failed to load role permission pre-data.", error);
      setError(getErrorMessage(error, "Failed to load role and permission pre-data."));
      setRoles([]);
      setPermissions([]);
      setRolePermissionMap({});
    } finally {
      setLoading(false);
    }
  }

  async function loadRolePermissions(role) {
    const roleKey = getRolePrimaryKey(role);
    const cached = rolePermissionMap[roleKey] || [];
    setSelectedPermissionIds(cached);

    try {
      let response;
      try {
        response = await http.get(`/role-permissions/${encodeURIComponent(roleKey)}`);
      } catch {
        response = await http.get(`/roles/${encodeURIComponent(roleKey)}/permissions`);
      }

      const assignedRows = normalizeRows(response);
      const assigned = getAssignedPermissionsFromRow(
        { permissions: assignedRows.length ? assignedRows : response?.data?.permissions },
        permissions,
      );

      if (assigned.length) {
        setSelectedPermissionIds(assigned);
        setRolePermissionMap((prev) => ({ ...prev, [roleKey]: assigned }));
      }
    } catch (error) {
      console.warn("Using cached role permission assignment.", error);
    }
  }

  function openEditDrawer(role) {
    setEditingRole(role);
    setPermissionSearch("");
    setDrawerOpen(true);
    loadRolePermissions(role);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingRole(null);
    setSelectedPermissionIds([]);
    setPermissionSearch("");
  }

  function togglePermission(permission) {
    const permissionKey = getPermissionPrimaryKey(permission);
    setSelectedPermissionIds((current) => {
      if (current.includes(permissionKey)) {
        return current.filter((item) => item !== permissionKey);
      }
      return [...current, permissionKey];
    });
  }

  async function handleSavePermissions() {
    if (!editingRole) return;

    const roleKey = getRolePrimaryKey(editingRole);
    const selectedPermissions = selectedPermissionIds
      .map((id) => permissions.find((permission) => getPermissionPrimaryKey(permission) === String(id)))
      .filter(Boolean);

    const payload = {
      roleId: roleKey,
      permissionIds: selectedPermissionIds,
      permissions: selectedPermissions.map((permission) => getPermissionCode(permission)),
    };

    try {
      setSaving(true);
      try {
        await http.put(`/role-permissions/${encodeURIComponent(roleKey)}`, payload);
      } catch {
        try {
          await http.post(`/role-permissions/${encodeURIComponent(roleKey)}`, payload);
        } catch {
          await http.post(`/roles/${encodeURIComponent(roleKey)}/permissions`, payload);
        }
      }

      setRolePermissionMap((prev) => ({ ...prev, [roleKey]: selectedPermissionIds }));
      setNotice("Role permissions updated successfully");
      closeDrawer();
    } catch (error) {
      alert(getErrorMessage(error, "Failed to save role permissions."));
    } finally {
      setSaving(false);
    }
  }

  const modules = useMemo(() => {
    return Array.from(new Set(permissions.map(getPermissionModule))).sort();
  }, [permissions]);

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return roles.filter((role) => {
      const roleKey = getRolePrimaryKey(role);
      const assignedIds = rolePermissionMap[roleKey] || [];
      const assignedPermissions = assignedIds
        .map((id) => permissions.find((permission) => getPermissionPrimaryKey(permission) === String(id)))
        .filter(Boolean);

      const matchesKeyword =
        !q ||
        [
          getRoleName(role),
          role.description,
          normalizeStatus(role),
          ...assignedPermissions.map(permissionLabel),
          ...assignedPermissions.map(getPermissionCode),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));

      const matchesModule =
        !moduleFilter ||
        assignedPermissions.some(
          (permission) => getPermissionModule(permission) === moduleFilter,
        );

      return matchesKeyword && matchesModule;
    });
  }, [roles, permissions, rolePermissionMap, search, moduleFilter]);

  const visiblePermissions = useMemo(() => {
    return permissions.filter((permission) => {
      const matchesText = [
        permissionLabel(permission),
        getPermissionCode(permission),
        getPermissionModule(permission),
        permission.description,
      ].some((value) => hasSearch(value, permissionSearch));

      return matchesText;
    });
  }, [permissions, permissionSearch]);

  const groupedPermissions = useMemo(() => {
    const grouped = new Map();
    for (const permission of visiblePermissions) {
      const group = getPermissionModule(permission);
      if (!grouped.has(group)) grouped.set(group, []);
      grouped.get(group).push(permission);
    }
    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [visiblePermissions]);

  return (
    <CrudPageLayout
      title="Role Permissions"
      description="List every role, show assigned permission names, and edit all available permissions from a drawer. Permissions are grouped by module instead of hidden inside tabs."
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
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Role or permission name"
                className="w-80 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Permission Module
              </label>
              <select
                value={moduleFilter}
                onChange={(event) => setModuleFilter(event.target.value)}
                className="w-56 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">All modules</option>
                {modules.map((moduleName) => (
                  <option key={moduleName} value={moduleName}>
                    {moduleName}
                  </option>
                ))}
              </select>
            </div>
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
        <CrudTableCard title="Roles">
          <div className="p-6 text-sm text-slate-500">Loading role permissions...</div>
        </CrudTableCard>
      ) : filteredRoles.length === 0 ? (
        <EmptyState
          title="No role permissions found"
          description="Try a different search or module filter."
        />
      ) : (
        <CrudTableCard title="Roles" subtitle={`${filteredRoles.length} result(s)`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Permissions</th>
                  <th className="px-4 py-3 font-medium">Count</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => {
                  const roleKey = getRolePrimaryKey(role);
                  const assignedIds = rolePermissionMap[roleKey] || [];

                  return (
                    <tr key={roleKey} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {getRoleName(role)}
                      </td>
                      <td className="max-w-xs px-4 py-3 text-slate-600">
                        {role.description || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <PermissionPills permissions={permissions} permissionIds={assignedIds} />
                      </td>
                      <td className="px-4 py-3 text-slate-700">{assignedIds.length}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={normalizeStatus(role)} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(role)}
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
        title={editingRole ? `Edit permissions: ${getRoleName(editingRole)}` : "Edit Role Permissions"}
        width="760px"
        loading={saving}
        saveText="Save Permissions"
        cancelText="Cancel"
        onSubmit={handleSavePermissions}
        onCancel={closeDrawer}
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {editingRole ? getRoleName(editingRole) : "Selected role"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {editingRole?.description || "Choose the permissions this role should receive."}
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
              {selectedPermissionIds.length} permission(s) selected
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Search available permissions
            </label>
            <input
              type="text"
              value={permissionSearch}
              onChange={(event) => setPermissionSearch(event.target.value)}
              placeholder="Search by name, code, module, or description"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {groupedPermissions.length === 0 ? (
            <EmptyState
              title="No permissions found"
              description="Try another search keyword."
              className="py-10"
            />
          ) : (
            <div className="space-y-4">
              {groupedPermissions.map(([moduleName, modulePermissions]) => (
                <section
                  key={moduleName}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-slate-900">
                      {moduleName}
                    </h4>
                    <span className="text-xs font-medium text-slate-500">
                      {modulePermissions.length} item(s)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {modulePermissions.map((permission) => {
                      const permissionKey = getPermissionPrimaryKey(permission);
                      const checked = selectedPermissionIds.includes(permissionKey);

                      return (
                        <label
                          key={permissionKey}
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
                            onChange={() => togglePermission(permission)}
                            className="mt-1 h-4 w-4 rounded border-slate-300"
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-slate-900">
                              {permissionLabel(permission)}
                            </span>
                            <span className="mt-0.5 block break-all text-xs text-slate-500">
                              {getPermissionCode(permission)}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </CrudDrawerForm>
    </CrudPageLayout>
  );
}

export default RolePermissionsPage;
