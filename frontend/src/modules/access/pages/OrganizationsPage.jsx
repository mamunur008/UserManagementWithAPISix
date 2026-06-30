import { useEffect, useMemo, useState } from "react";
import { http } from "../../../lib/httpClient.js";
import { CrudDrawerForm } from "../components/CrudDrawerForm.jsx";
import { CrudPageLayout } from "../components/CrudPageLayout.jsx";
import { CrudTableCard } from "../components/CrudTableCard.jsx";
import { CrudToolbar } from "../components/CrudToolbar.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";

const initialForm = {
  name: "",
  typeId: "",
  parentId: "",
  commissionRate: "",
  status: "active",
};

const seedOrganizations = [
  {
    id: 1,
    name: "Head Office",
    typeId: "company",
    parentId: "",
    commissionRate: 0,
    status: "active",
  },
  {
    id: 2,
    name: "Dhaka Branch",
    typeId: "branch",
    parentId: 1,
    commissionRate: 5,
    status: "active",
  },
];

const seedOrganizationTypes = [
  { id: "company", name: "Company" },
  { id: "branch", name: "Branch" },
  { id: "agent", name: "Agent" },
];

function normalizeRows(response) {
  const data = response?.data ?? response ?? [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.organizations)) return data.organizations;
  if (Array.isArray(data.organizationTypes)) return data.organizationTypes;
  return [];
}

function normalizeStatus(row) {
  if (typeof row?.status === "string") return row.status;
  if (typeof row?.active === "boolean") return row.active ? "active" : "inactive";
  if (typeof row?.isActive === "boolean") return row.isActive ? "active" : "inactive";
  return "active";
}

function optionLabel(options, value) {
  if (!value) return "—";
  const item = options.find((x) => String(x.id) === String(value));
  return item?.name || item?.code || value;
}

export function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [organizationTypes, setOrganizationTypes] = useState(seedOrganizationTypes);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadOrganizations();
    loadOrganizationTypes();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  async function loadOrganizations() {
    try {
      setLoading(true);
      const response = await http.get("/organizations");
      const rows = normalizeRows(response).map((row) => ({
        ...row,
        status: normalizeStatus(row),
      }));
      setOrganizations(rows);
    } catch (error) {
      console.warn("Using organization seed data because /organizations failed.", error);
      setOrganizations(seedOrganizations);
    } finally {
      setLoading(false);
    }
  }

  async function loadOrganizationTypes() {
    try {
      const response = await http.get("/organization-types");
      const rows = normalizeRows(response);
      if (rows.length > 0) setOrganizationTypes(rows);
    } catch (error) {
      console.warn("Using organization type seed data because /organization-types failed.", error);
    }
  }

  function resetForm() {
    setEditingOrganization(null);
    setForm(initialForm);
  }

  function openCreateDrawer() {
    resetForm();
    setDrawerOpen(true);
  }

  function openEditDrawer(organization) {
    setEditingOrganization(organization);
    setForm({
      name: organization.name || "",
      typeId: organization.typeId || organization.organizationTypeId || "",
      parentId: organization.parentId || "",
      commissionRate: organization.commissionRate ?? "",
      status: normalizeStatus(organization),
    });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    resetForm();
  }

  async function handleSubmit() {
    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        typeId: form.typeId || null,
        parentId: form.parentId || null,
        commissionRate:
          form.commissionRate === "" ? null : Number(form.commissionRate),
        active: form.status === "active",
      };

      if (!payload.name) return;

      if (editingOrganization) {
        await http.put(`/organizations/${encodeURIComponent(editingOrganization.id)}`, payload);
        setOrganizations((prev) =>
          prev.map((item) =>
            item.id === editingOrganization.id
              ? { ...item, ...payload, id: editingOrganization.id, status: form.status }
              : item,
          ),
        );
        setNotice("Organization updated successfully");
      } else {
        const response = await http.post("/organizations", payload);
        const created = response?.data ?? {
          id: Date.now(),
          ...payload,
          status: form.status,
        };
        setOrganizations((prev) => [
          { ...created, status: normalizeStatus(created) },
          ...prev,
        ]);
        setNotice("Organization created successfully");
      }

      setDrawerOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save organization", error);
      alert(error?.response?.data?.message || error?.friendlyMessage || error?.message || "Failed to save organization.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(organization) {
    const confirmed = window.confirm(`Delete organization "${organization.name}"?`);
    if (!confirmed) return;

    try {
      await http.delete(`/organizations/${encodeURIComponent(organization.id)}`);
      setOrganizations((prev) => prev.filter((item) => item.id !== organization.id));
      setNotice("Organization deleted successfully");
    } catch (error) {
      console.error("Failed to delete organization", error);
      alert(error?.response?.data?.message || error?.friendlyMessage || error?.message || "Failed to delete organization.");
    }
  }

  const filteredOrganizations = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return organizations;

    return organizations.filter((organization) =>
      [
        organization.name,
        optionLabel(organizationTypes, organization.typeId || organization.organizationTypeId),
        optionLabel(organizations, organization.parentId),
        normalizeStatus(organization),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [organizations, organizationTypes, search]);

  return (
    <CrudPageLayout
      title="Organizations"
      description="Manage organization hierarchy, parent organization, type, commission rate, and status."
      actions={
        <button
          type="button"
          onClick={openCreateDrawer}
          className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add Organization
        </button>
      }
    >
      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      ) : null}

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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search organizations..."
                className="w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        }
        actions={
          <button
            type="button"
            onClick={openCreateDrawer}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Add Organization
          </button>
        }
      />

      {loading ? (
        <CrudTableCard title="Organizations">
          <div className="p-6 text-sm text-slate-500">Loading organizations...</div>
        </CrudTableCard>
      ) : filteredOrganizations.length === 0 ? (
        <EmptyState
          title="No organizations found"
          description="Try a different search or create a new organization."
          action={
            <button
              type="button"
              onClick={openCreateDrawer}
              className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add Organization
            </button>
          }
        />
      ) : (
        <CrudTableCard
          title="Organizations"
          subtitle={`${filteredOrganizations.length} result(s)`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Parent</th>
                  <th className="px-4 py-3 font-medium">Commission</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrganizations.map((organization) => (
                  <tr
                    key={organization.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {organization.name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {optionLabel(organizationTypes, organization.typeId || organization.organizationTypeId)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {optionLabel(organizations, organization.parentId)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {organization.commissionRate ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={normalizeStatus(organization)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(organization)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(organization)}
                          className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
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
        title={editingOrganization ? "Edit Organization" : "Create Organization"}
        width="560px"
        loading={saving}
        saveText={editingOrganization ? "Save Changes" : "Create Organization"}
        cancelText="Cancel"
        onSubmit={handleSubmit}
        onCancel={closeDrawer}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {editingOrganization ? "Update organization details" : "Add a new organization"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Select the type and parent organization from existing records.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Enter organization name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Organization Type
            </label>
            <select
              value={form.typeId}
              onChange={(e) => setForm((prev) => ({ ...prev, typeId: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Select type</option>
              {organizationTypes.map((type) => (
                <option key={type.id || type.code || type.name} value={type.id || type.code || type.name}>
                  {type.name || type.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Parent Organization
            </label>
            <select
              value={form.parentId}
              onChange={(e) => setForm((prev) => ({ ...prev, parentId: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">No parent</option>
              {organizations
                .filter((organization) => organization.id !== editingOrganization?.id)
                .map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Commission Rate
            </label>
            <input
              type="number"
              step="0.01"
              value={form.commissionRate}
              onChange={(e) => setForm((prev) => ({ ...prev, commissionRate: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </CrudDrawerForm>
    </CrudPageLayout>
  );
}

export default OrganizationsPage;
