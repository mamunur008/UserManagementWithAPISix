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
  normalizeRows,
  normalizeStatus,
  optionLabel,
  toArray,
  uniqueStrings,
} from "../utils/accessPageUtils.js";

const initialForm = {
  name: "",
  description: "",
  isGlobal: false,
  isElevated: false,
  assignableOrgTypeIds: [],
  active: true,
};

function getRoleId(role) {
  return getId(role, ["roleId", "roleName", "name"]);
}

function getOrganizationTypeKey(item) {
  if (typeof item === "string") return item;
  return String(item?.id ?? item?.organizationTypeId ?? item?.code ?? item?.name ?? "");
}

function getAssignableOrgTypeIds(role) {
  const source =
    role?.assignableOrgTypeIds ||
    role?.assignableOrganizationTypeIds ||
    role?.organizationTypeIds ||
    role?.orgTypeIds ||
    role?.assignableOrgTypes ||
    role?.assignableOrganizationTypes ||
    [];

  return uniqueStrings(toArray(source).map(getOrganizationTypeKey));
}

function getOrgTypeText(role, organizationTypes) {
  const ids = getAssignableOrgTypeIds(role);
  if (!ids.length) return "All / not restricted";
  return ids.map((id) => optionLabel(organizationTypes, id)).join(", ");
}

function mapRole(row) {
  return {
    ...row,
    status: normalizeStatus(row),
    active: normalizeStatus(row) === "active",
    assignableOrgTypeIds: getAssignableOrgTypeIds(row),
  };
}

export function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [organizationTypes, setOrganizationTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
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

      const [rolesResponse, organizationTypesResponse] = await Promise.allSettled([
        http.get("/roles"),
        http.get("/organization-types"),
      ]);

      if (rolesResponse.status === "fulfilled") {
        setRoles(normalizeRows(rolesResponse.value).map(mapRole));
      } else {
        setRoles([]);
        setError(getErrorMessage(rolesResponse.reason, "Failed to load roles."));
      }

      if (organizationTypesResponse.status === "fulfilled") {
        setOrganizationTypes(normalizeRows(organizationTypesResponse.value));
      } else {
        console.warn("Organization type metadata could not be loaded.", organizationTypesResponse.reason);
        setOrganizationTypes([]);
      }
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingRole(null);
    setForm(initialForm);
  }

  function openCreateDrawer() {
    resetForm();
    setDrawerOpen(true);
  }

  function openEditDrawer(role) {
    setEditingRole(role);
    setForm({
      name: role?.name || role?.roleName || "",
      description: role?.description || "",
      isGlobal: Boolean(role?.isGlobal ?? role?.global),
      isElevated: Boolean(role?.isElevated ?? role?.elevated),
      assignableOrgTypeIds: getAssignableOrgTypeIds(role),
      active: normalizeStatus(role) === "active",
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

  function toggleOrganizationType(orgType) {
    const orgTypeKey = getOrganizationTypeKey(orgType);
    setForm((prev) => {
      const current = toArray(prev.assignableOrgTypeIds).map(String);
      const next = current.includes(orgTypeKey)
        ? current.filter((item) => item !== orgTypeKey)
        : [...current, orgTypeKey];
      return { ...prev, assignableOrgTypeIds: next };
    });
  }

  async function handleSubmit(event) {
    event?.preventDefault?.();

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      isGlobal: Boolean(form.isGlobal),
      isElevated: Boolean(form.isElevated),
      assignableOrgTypeIds: toArray(form.assignableOrgTypeIds),
      active: Boolean(form.active),
    };

    if (!payload.name) {
      setError("Role name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingRole) {
        const id = getRoleId(editingRole);
        await http.put(`/roles/${encodeURIComponent(id)}`, payload);
        setNotice("Role updated successfully.");
      } else {
        await http.post("/roles", payload);
        setNotice("Role created successfully.");
      }

      setDrawerOpen(false);
      resetForm();
      await loadPageData();
    } catch (err) {
      console.error("Failed to save role", err);
      setError(getErrorMessage(err, "Failed to save role."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(role) {
    const id = getRoleId(role);
    const name = getRoleName(role);
    if (!id || !window.confirm(`Delete role "${name}"?`)) return;

    try {
      await http.delete(`/roles/${encodeURIComponent(id)}`);
      setNotice("Role deleted successfully.");
      await loadPageData();
    } catch (err) {
      console.error("Failed to delete role", err);
      setError(getErrorMessage(err, "Failed to delete role."));
    }
  }

  const filteredRoles = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return roles;

    return roles.filter((role) =>
      [
        getRoleName(role),
        role.description,
        getOrgTypeText(role, organizationTypes),
        normalizeStatus(role),
        role.isGlobal ? "global" : "",
        role.isElevated ? "elevated" : "",
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [roles, organizationTypes, search]);

  return (
    <CrudPageLayout
      title="Roles"
      description="Manage roles and load assignable organization type metadata for each role."
      actions={
        <button
          type="button"
          onClick={openCreateDrawer}
          className="inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add Role
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
                placeholder="Search roles..."
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
        <CrudTableCard title="Roles">
          <div className="p-6 text-sm text-slate-500">Loading roles...</div>
        </CrudTableCard>
      ) : filteredRoles.length === 0 ? (
        <EmptyState
          title="No roles found"
          description="Try a different search or create a new role."
          actionLabel="Add Role"
          onAction={openCreateDrawer}
        />
      ) : (
        <CrudTableCard title="Roles" subtitle={`${filteredRoles.length} result(s)`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Assignable Org Types</th>
                  <th className="px-4 py-3 font-medium">Flags</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={getRoleId(role)} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{getRoleName(role)}</td>
                    <td className="max-w-sm px-4 py-3 text-slate-600">{role.description || "—"}</td>
                    <td className="max-w-md px-4 py-3 text-slate-600">
                      {getOrgTypeText(role, organizationTypes)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex flex-wrap gap-1.5">
                        {role.isGlobal ? (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">Global</span>
                        ) : null}
                        {role.isElevated ? (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">Elevated</span>
                        ) : null}
                        {!role.isGlobal && !role.isElevated ? "—" : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={normalizeStatus(role)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(role)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(role)}
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
        title={editingRole ? "Edit Role" : "Create Role"}
        width="640px"
        loading={saving}
        saveText={editingRole ? "Save Changes" : "Create Role"}
        cancelText="Cancel"
        onSubmit={handleSubmit}
        onCancel={closeDrawer}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {editingRole ? "Update role details" : "Add a new role"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Organization type options are loaded from /organization-types.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Role Name</label>
            <input
              type="text"
              value={form.name}
              disabled={Boolean(editingRole)}
              onChange={(event) => setField("name", event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
              placeholder="e.g. admin"
            />
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

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isGlobal}
                onChange={(event) => setField("isGlobal", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Is Global
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isElevated}
                onChange={(event) => setField("isElevated", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Is Elevated
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-900">Assignable Organization Types</h4>
              <span className="text-xs font-medium text-slate-500">
                {toArray(form.assignableOrgTypeIds).length} selected
              </span>
            </div>
            {organizationTypes.length === 0 ? (
              <p className="text-sm text-slate-500">No organization type metadata loaded.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {organizationTypes.map((orgType) => {
                  const orgTypeKey = getOrganizationTypeKey(orgType);
                  const checked = toArray(form.assignableOrgTypeIds).map(String).includes(orgTypeKey);
                  return (
                    <label
                      key={orgTypeKey}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOrganizationType(orgType)}
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                      />
                      <span>
                        <span className="block font-medium text-slate-900">
                          {orgType.name || orgType.code || orgTypeKey}
                        </span>
                        {orgType.code ? (
                          <span className="block text-xs text-slate-500">{orgType.code}</span>
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

export default RolesPage;
