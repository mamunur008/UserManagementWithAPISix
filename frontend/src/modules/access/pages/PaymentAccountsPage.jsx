import { useEffect, useMemo, useState } from "react";
import { http } from "../../../lib/httpClient.js";
import { CrudDrawerForm } from "../components/CrudDrawerForm.jsx";
import { CrudPageLayout } from "../components/CrudPageLayout.jsx";
import { CrudTableCard } from "../components/CrudTableCard.jsx";
import { CrudToolbar } from "../components/CrudToolbar.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";

const accountTypes = ["bank", "cash", "mobile-banking", "card", "other"];

const initialForm = {
  organizationId: "",
  type: "bank",
  holder: "",
  details: "",
  chartOfAccountId: "",
  isDefault: false,
  status: "active",
};

const seedPaymentAccounts = [
  {
    id: 1,
    organizationId: 1,
    type: "bank",
    holder: "Head Office Bank Account",
    details: "Sample account",
    chartOfAccountId: "",
    isDefault: true,
    status: "active",
  },
];

const seedOrganizations = [
  { id: 1, name: "Head Office" },
  { id: 2, name: "Dhaka Branch" },
];

function normalizeRows(response) {
  const data = response?.data ?? response ?? [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.organizations)) return data.organizations;
  if (Array.isArray(data.paymentAccounts)) return data.paymentAccounts;
  if (Array.isArray(data.chartOfAccounts)) return data.chartOfAccounts;
  if (Array.isArray(data.accounts)) return data.accounts;
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
  const item = options.find((x) =>
    [x?.id, x?.accountId, x?.chartOfAccountId, x?.code, x?.accountCode, x?.name]
      .filter(Boolean)
      .map(String)
      .includes(String(value)),
  );
  return item?.name || item?.accountName || item?.title || item?.code || item?.accountCode || value;
}

function optionValue(option) {
  return option?.id || option?.accountId || option?.chartOfAccountId || option?.code || option?.accountCode || "";
}

function accountLabel(account) {
  const code = account?.code || account?.accountCode;
  const name = account?.name || account?.accountName || account?.title;
  return [code, name].filter(Boolean).join(" — ") || optionValue(account);
}

export function PaymentAccountsPage() {
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [organizations, setOrganizations] = useState(seedOrganizations);
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadPaymentAccounts();
    loadOrganizations();
    loadChartOfAccounts();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  async function loadPaymentAccounts() {
    try {
      setLoading(true);
      const response = await http.get("/payment-accounts");
      const rows = normalizeRows(response).map((row) => ({
        ...row,
        status: normalizeStatus(row),
      }));
      setPaymentAccounts(rows);
    } catch (error) {
      console.warn("Using payment account seed data because /payment-accounts failed.", error);
      setPaymentAccounts(seedPaymentAccounts);
    } finally {
      setLoading(false);
    }
  }

  async function loadOrganizations() {
    try {
      const response = await http.get("/organizations");
      const rows = normalizeRows(response);
      if (rows.length > 0) setOrganizations(rows);
    } catch (error) {
      console.warn("Using organization seed data because /organizations failed.", error);
    }
  }

  async function loadChartOfAccounts() {
    try {
      const response = await http.get("/chart-of-accounts");
      const rows = normalizeRows(response);
      if (rows.length > 0) setChartOfAccounts(rows);
    } catch (error) {
      console.warn("Chart of Accounts endpoint is not available. Falling back to text input.", error);
    }
  }

  function resetForm() {
    setEditingAccount(null);
    setForm(initialForm);
  }

  function openCreateDrawer() {
    resetForm();
    setDrawerOpen(true);
  }

  function openEditDrawer(account) {
    setEditingAccount(account);
    setForm({
      organizationId: account.organizationId || "",
      type: account.type || "bank",
      holder: account.holder || account.accountHolder || "",
      details: account.details || "",
      chartOfAccountId: account.chartOfAccountId || "",
      isDefault: !!account.isDefault,
      status: normalizeStatus(account),
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
        organizationId: form.organizationId || null,
        type: form.type,
        holder: form.holder.trim(),
        details: form.details.trim(),
        chartOfAccountId: form.chartOfAccountId || null,
        isDefault: !!form.isDefault,
        active: form.status === "active",
      };

      if (!payload.organizationId || !payload.type || !payload.holder) return;

      if (editingAccount) {
        await http.put(`/payment-accounts/${encodeURIComponent(editingAccount.id)}`, payload);
        setPaymentAccounts((prev) =>
          prev.map((item) =>
            item.id === editingAccount.id
              ? { ...item, ...payload, id: editingAccount.id, status: form.status }
              : item,
          ),
        );
        setNotice("Payment account updated successfully");
      } else {
        const response = await http.post("/payment-accounts", payload);
        const created = response?.data ?? {
          id: Date.now(),
          ...payload,
          status: form.status,
        };
        setPaymentAccounts((prev) => [
          { ...created, status: normalizeStatus(created) },
          ...prev,
        ]);
        setNotice("Payment account created successfully");
      }

      setDrawerOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save payment account", error);
      alert(error?.response?.data?.message || error?.friendlyMessage || error?.message || "Failed to save payment account.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(account) {
    const confirmed = window.confirm(`Delete payment account "${account.holder}"?`);
    if (!confirmed) return;

    try {
      await http.delete(`/payment-accounts/${encodeURIComponent(account.id)}`);
      setPaymentAccounts((prev) => prev.filter((item) => item.id !== account.id));
      setNotice("Payment account deleted successfully");
    } catch (error) {
      console.error("Failed to delete payment account", error);
      alert(error?.response?.data?.message || error?.friendlyMessage || error?.message || "Failed to delete payment account.");
    }
  }

  async function handleSetDefault(account) {
    try {
      await http.post(`/payment-accounts/${encodeURIComponent(account.id)}/set-default`);
      setPaymentAccounts((prev) =>
        prev.map((item) => ({
          ...item,
          isDefault: item.id === account.id,
        })),
      );
      setNotice("Default payment account updated successfully");
    } catch (error) {
      console.error("Failed to set default payment account", error);
      alert(error?.response?.data?.message || error?.friendlyMessage || error?.message || "Failed to set default payment account.");
    }
  }

  const filteredPaymentAccounts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return paymentAccounts;

    return paymentAccounts.filter((account) =>
      [
        account.holder,
        account.type,
        account.details,
        optionLabel(organizations, account.organizationId),
        optionLabel(chartOfAccounts, account.chartOfAccountId),
        normalizeStatus(account),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [paymentAccounts, organizations, chartOfAccounts, search]);

  return (
    <CrudPageLayout
      title="Payment Accounts"
      description="Manage organization bank, mobile banking, cash, card, and other payment accounts."
      actions={
        <button
          type="button"
          onClick={openCreateDrawer}
          className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add Payment Account
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
                placeholder="Search payment accounts..."
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
            Add Payment Account
          </button>
        }
      />

      {loading ? (
        <CrudTableCard title="Payment Accounts">
          <div className="p-6 text-sm text-slate-500">Loading payment accounts...</div>
        </CrudTableCard>
      ) : filteredPaymentAccounts.length === 0 ? (
        <EmptyState
          title="No payment accounts found"
          description="Try a different search or create a new payment account."
          action={
            <button
              type="button"
              onClick={openCreateDrawer}
              className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Add Payment Account
            </button>
          }
        />
      ) : (
        <CrudTableCard
          title="Payment Accounts"
          subtitle={`${filteredPaymentAccounts.length} result(s)`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Holder</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Organization</th>
                  <th className="px-4 py-3 font-medium">Chart of Account</th>
                  <th className="px-4 py-3 font-medium">Default</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPaymentAccounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {account.holder || account.accountHolder}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{account.type}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {optionLabel(organizations, account.organizationId)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {optionLabel(chartOfAccounts, account.chartOfAccountId)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {account.isDefault ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={normalizeStatus(account)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {!account.isDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(account)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Set Default
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => openEditDrawer(account)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(account)}
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
        title={editingAccount ? "Edit Payment Account" : "Create Payment Account"}
        width="580px"
        loading={saving}
        saveText={editingAccount ? "Save Changes" : "Create Payment Account"}
        cancelText="Cancel"
        onSubmit={handleSubmit}
        onCancel={closeDrawer}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {editingAccount ? "Update payment account details" : "Add a new payment account"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Select an existing organization and optionally connect a chart of account.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Organization
            </label>
            <select
              value={form.organizationId}
              onChange={(e) => setForm((prev) => ({ ...prev, organizationId: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">Select organization</option>
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              {accountTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Holder
            </label>
            <input
              type="text"
              value={form.holder}
              onChange={(e) => setForm((prev) => ({ ...prev, holder: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Account holder name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Details
            </label>
            <textarea
              value={form.details}
              onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              placeholder="Bank account number, mobile number, branch, notes..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Chart Of Account
            </label>
            {chartOfAccounts.length > 0 ? (
              <select
                value={form.chartOfAccountId}
                onChange={(e) => setForm((prev) => ({ ...prev, chartOfAccountId: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select chart of account</option>
                {chartOfAccounts.map((account) => (
                  <option key={optionValue(account)} value={optionValue(account)}>
                    {accountLabel(account)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.chartOfAccountId}
                onChange={(e) => setForm((prev) => ({ ...prev, chartOfAccountId: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Enter Chart Of Account ID"
              />
            )}
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300"
            />
            Make this the default account
          </label>

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

export default PaymentAccountsPage;
