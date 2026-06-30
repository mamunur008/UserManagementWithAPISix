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
  normalizeRows,
  normalizeStatus,
} from "../utils/accessPageUtils.js";

const initialForm = {
  name: "",
  code: "",
  status: "active",
};

const seedOrganizationTypes = [
  { id: 1, name: "Head Office", code: "HEAD_OFFICE", status: "active" },
  { id: 2, name: "Branch", code: "BRANCH", status: "active" },
  { id: 3, name: "Partner", code: "PARTNER", status: "active" },
];

function getOrganizationTypeId(row) {
  return row?.id ?? row?.organizationTypeId ?? row?.code;
}

export function OrganizationTypesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  async function loadRows() {
    try {
      setLoading(true);
      const response = await http.get("/organization-types");
      const data = normalizeRows(response).map((row) => ({
        ...row,
        status: normalizeStatus(row),
      }));
      setRows(data.length ? data : seedOrganizationTypes);
    } catch (error) {
      console.warn("Using organization type seed data because API loading failed.", error);
      setRows(seedOrganizationTypes);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingRecord(null);
    setForm(initialForm);
  }

  function openCreateDrawer() {
    resetForm();
    setDrawerOpen(true);
  }

  function openEditDrawer(row) {
    setEditingRecord(row);
    setForm({
      name: row.name || "",
      code: row.code || "",
      status: normalizeStatus(row),
    });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    resetForm();
  }

  async function handleSubmit() {
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      active: form.status === "active",
    };

    if (!payload.name || !payload.code) return;

    try {
      setSaving(true);

      if (editingRecord) {
        const id = getOrganizationTypeId(editingRecord);
        await http.put(`/organization-types/${encodeURIComponent(id)}`, payload);
        setRows((prev) =>
          prev.map((item) =>
            getOrganizationTypeId(item) === id
              ? { ...item, ...payload, id, status: form.status }
              : item,
          ),
        );
        setNotice("Organization type updated successfully");
      } else {
        const response = await http.post("/organization-types", payload);
        const created = response?.data ?? {
          id: Date.now(),
          ...payload,
          status: form.status,
        };
        setRows((prev) => [{ ...created, status: normalizeStatus(created) }, ...prev]);
        setNotice("Organization type created successfully");
      }

      closeDrawer();
    } catch (error) {
      alert(getErrorMessage(error, "Failed to save organization type."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    const confirmed = window.confirm(`Delete organization type "${row.name}"?`);
    if (!confirmed) return;

    try {
      const id = getOrganizationTypeId(row);
      await http.delete(`/organization-types/${encodeURIComponent(id)}`);
      setRows((prev) => prev.filter((item) => getOrganizationTypeId(item) !== id));
      setNotice("Organization type deleted successfully");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to delete organization type."));
    }
  }

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.name, row.code, normalizeStatus(row)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [rows, search]);

  return (
    <CrudPageLayout
      title="Organization Types"
      description="Manage organization classification such as Head Office, Branch, Partner, and customer groups."
      actions={
        <button
          type="button"
          onClick={openCreateDrawer}
          className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add Organization Type
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
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, code, or status"
              className="w-80 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        }
        actions={
          <button
            type="button"
            onClick={openCreateDrawer}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Add Type
          </button>
        }
      />

      {loading ? (
        <CrudTableCard title="Organization Types">
          <div className="p-6 text-sm text-slate-500">Loading organization types...</div>
        </CrudTableCard>
      ) : filteredRows.length === 0 ? (
        <EmptyState
          title="No organization types found"
          description="Try a different search or create a new type."
          action={
            <button
              type="button"
              onClick={openCreateDrawer}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Add Organization Type
            </button>
          }
        />
      ) : (
        <CrudTableCard title="Organization Types" subtitle={`${filteredRows.length} result(s)`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={getOrganizationTypeId(row)} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                    <td className="px-4 py-3 text-slate-600">{row.code}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={normalizeStatus(row)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(row)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
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
        title={editingRecord ? "Edit Organization Type" : "Create Organization Type"}
        width="520px"
        loading={saving}
        saveText={editingRecord ? "Save Changes" : "Create Type"}
        cancelText="Cancel"
        onSubmit={handleSubmit}
        onCancel={closeDrawer}
      >
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Example: Branch"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Code
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
              placeholder="Example: BRANCH"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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

export default OrganizationTypesPage;
