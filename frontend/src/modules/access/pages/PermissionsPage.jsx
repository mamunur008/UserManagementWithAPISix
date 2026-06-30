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
  normalizeRows,
  normalizeStatus,
  uniqueStrings,
} from "../utils/accessPageUtils.js";

const defaultModules = [
  "dashboard",
  "user",
  "user-role",
  "role",
  "role-permission",
  "permission",
  "menu",
  "organization",
  "organization-type",
  "payment-account",
  "chart-of-account",
];

const initialForm = {
  code: "",
  name: "",
  module: "",
  action: "",
  description: "",
  active: true,
};

function getPermissionId(permission) {
  return getId(permission, ["permissionId", "code", "key", "name"]);
}

function mapPermission(row) {
  return {
    ...row,
    status: normalizeStatus(row),
    active: normalizeStatus(row) === "active",
  };
}

export function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPermissions();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  async function loadPermissions() {
    try {
      setLoading(true);
      setError("");
      const response = await http.get("/permissions");
      setPermissions(normalizeRows(response).map(mapPermission));
    } catch (err) {
      console.error("Failed to load permissions", err);
      setPermissions([]);
      setError(getErrorMessage(err, "Failed to load permissions."));
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingPermission(null);
    setForm(initialForm);
  }

  function openCreateDrawer() {
    resetForm();
    setDrawerOpen(true);
  }

  function openEditDrawer(permission) {
    setEditingPermission(permission);
    setForm({
      code: getPermissionCode(permission) || "",
      name: getPermissionName(permission) || "",
      module: getPermissionModule(permission) || "",
      action: permission?.action || permission?.operation || "",
      description: permission?.description || "",
      active: normalizeStatus(permission) === "active",
    });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    resetForm();
  }

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event?.preventDefault?.();

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      module: form.module.trim(),
      action: form.action.trim(),
      description: form.description.trim(),
      active: Boolean(form.active),
    };

    if (!payload.code || !payload.module) {
      setError("Permission code and module are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingPermission) {
        const id = getPermissionId(editingPermission);
        await http.put(`/permissions/${encodeURIComponent(id)}`, payload);
        setNotice("Permission updated successfully.");
      } else {
        await http.post("/permissions", payload);
        setNotice("Permission created successfully.");
      }

      setDrawerOpen(false);
      resetForm();
      await loadPermissions();
    } catch (err) {
      console.error("Failed to save permission", err);
      setError(getErrorMessage(err, "Failed to save permission."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(permission) {
    const id = getPermissionId(permission);
    const name = getPermissionName(permission);
    if (!id || !window.confirm(`Delete permission "${name}"?`)) return;

    try {
      await http.delete(`/permissions/${encodeURIComponent(id)}`);
      setNotice("Permission deleted successfully.");
      await loadPermissions();
    } catch (err) {
      console.error("Failed to delete permission", err);
      setError(getErrorMessage(err, "Failed to delete permission."));
    }
  }

  const moduleOptions = useMemo(() => {
    return uniqueStrings([
      ...defaultModules,
      ...permissions.map(getPermissionModule),
    ]).sort();
  }, [permissions]);

  const filteredPermissions = useMemo(() => {
    const q = search.toLowerCase().trim();

    return permissions.filter((permission) => {
      const matchesSearch =
        !q ||
        [
          getPermissionCode(permission),
          getPermissionName(permission),
          getPermissionModule(permission),
          permission?.action,
          permission?.description,
          normalizeStatus(permission),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));

      const matchesModule = !moduleFilter || getPermissionModule(permission) === moduleFilter;

      return matchesSearch && matchesModule;
    });
  }, [permissions, search, moduleFilter]);

  return (
    <CrudPageLayout
      title="Permissions"
      description="Manage permission codes and modules. Module options are inferred from loaded permission pre-data."
      actions={
        <button
          type="button"
          onClick={openCreateDrawer}
          className="inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add Permission
        </button>
      }
    >
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
                placeholder="Search permissions..."
                className="h-10 w-80 rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Module
              </label>
              <select
                value={moduleFilter}
                onChange={(event) => setModuleFilter(event.target.value)}
                className="h-10 w-56 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">All modules</option>
                {moduleOptions.map((moduleName) => (
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
            onClick={loadPermissions}
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
        <CrudTableCard title="Permissions">
          <div className="p-6 text-sm text-slate-500">Loading permissions...</div>
        </CrudTableCard>
      ) : filteredPermissions.length === 0 ? (
        <EmptyState
          title="No permissions found"
          description="Try a different search or create a new permission."
          actionLabel="Add Permission"
          onAction={openCreateDrawer}
        />
      ) : (
        <CrudTableCard title="Permissions" subtitle={`${filteredPermissions.length} result(s)`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Display Name</th>
                  <th className="px-4 py-3 font-medium">Module</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPermissions.map((permission) => (
                  <tr key={getPermissionId(permission)} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{getPermissionCode(permission)}</td>
                    <td className="px-4 py-3 text-slate-600">{getPermissionName(permission)}</td>
                    <td className="px-4 py-3 text-slate-600">{getPermissionModule(permission)}</td>
                    <td className="px-4 py-3 text-slate-600">{permission?.action || permission?.operation || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={normalizeStatus(permission)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(permission)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(permission)}
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
        title={editingPermission ? "Edit Permission" : "Create Permission"}
        width="560px"
        loading={saving}
        saveText={editingPermission ? "Save Changes" : "Create Permission"}
        cancelText="Cancel"
        onSubmit={handleSubmit}
        onCancel={closeDrawer}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {editingPermission ? "Update permission details" : "Add a new permission"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Example code: permission:users.create
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Permission Code</label>
            <input
              type="text"
              value={form.code}
              disabled={Boolean(editingPermission)}
              onChange={(event) => setField("code", event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              placeholder="permission:users.create"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Display Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Create Users"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Module</label>
              <select
                value={form.module}
                onChange={(event) => setField("module", event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select module</option>
                {moduleOptions.map((moduleName) => (
                  <option key={moduleName} value={moduleName}>
                    {moduleName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Action</label>
              <input
                type="text"
                value={form.action}
                onChange={(event) => setField("action", event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="view / create / update / delete"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
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

export default PermissionsPage;
