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
  normalizeRows,
  normalizeStatus,
} from "../utils/accessPageUtils.js";

const initialForm = {
  code: "",
  name: "",
  type: "asset",
  parentId: "",
  active: true,
};

const accountTypes = ["asset", "liability", "equity", "income", "expense"];

function getAccountId(account) {
  return getId(account, ["accountId", "chartOfAccountId", "code", "accountCode"]);
}

function getAccountCode(account) {
  return account?.code || account?.accountCode || "";
}

function getAccountName(account) {
  return account?.name || account?.accountName || account?.title || getAccountCode(account) || getAccountId(account);
}

function getAccountType(account) {
  return account?.type || account?.accountType || account?.category || "asset";
}

function mapAccount(row) {
  return {
    ...row,
    status: normalizeStatus(row),
    active: normalizeStatus(row) === "active",
  };
}

function accountLabel(account) {
  return [getAccountCode(account), getAccountName(account)].filter(Boolean).join(" — ");
}

export function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  async function loadAccounts() {
    try {
      setLoading(true);
      setError("");
      const response = await http.get("/chart-of-accounts");
      setAccounts(normalizeRows(response).map(mapAccount));
    } catch (err) {
      console.error("Failed to load chart of accounts", err);
      setAccounts([]);
      setError(getErrorMessage(err, "Failed to load chart of accounts."));
    } finally {
      setLoading(false);
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
      code: getAccountCode(account),
      name: getAccountName(account),
      type: getAccountType(account),
      parentId: account?.parentId || account?.parentAccountId || "",
      active: normalizeStatus(account) === "active",
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
      type: form.type,
      parentId: form.parentId || null,
      active: Boolean(form.active),
    };

    if (!payload.code || !payload.name) {
      setError("Account code and name are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingAccount) {
        const id = getAccountId(editingAccount);
        await http.put(`/chart-of-accounts/${encodeURIComponent(id)}`, payload);
        setNotice("Chart of account updated successfully.");
      } else {
        await http.post("/chart-of-accounts", payload);
        setNotice("Chart of account created successfully.");
      }

      setDrawerOpen(false);
      resetForm();
      await loadAccounts();
    } catch (err) {
      console.error("Failed to save chart of account", err);
      setError(getErrorMessage(err, "Failed to save chart of account."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(account) {
    const id = getAccountId(account);
    const name = getAccountName(account);
    if (!id || !window.confirm(`Delete chart of account "${name}"?`)) return;

    try {
      await http.delete(`/chart-of-accounts/${encodeURIComponent(id)}`);
      setNotice("Chart of account deleted successfully.");
      await loadAccounts();
    } catch (err) {
      console.error("Failed to delete chart of account", err);
      setError(getErrorMessage(err, "Failed to delete chart of account."));
    }
  }

  const filteredAccounts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return accounts;

    return accounts.filter((account) =>
      [
        getAccountCode(account),
        getAccountName(account),
        getAccountType(account),
        normalizeStatus(account),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [accounts, search]);

  return (
    <CrudPageLayout
      title="Chart Of Accounts"
      description="Maintain chart of account records used by Payment Accounts as pre-data."
      actions={
        <button
          type="button"
          onClick={openCreateDrawer}
          className="inline-flex h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add Account
        </button>
      }
    >
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
              placeholder="Search by account code, name, or type..."
              className="h-10 w-80 rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        }
        actions={
          <button
            type="button"
            onClick={loadAccounts}
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
        <CrudTableCard title="Chart Of Accounts">
          <div className="p-6 text-sm text-slate-500">Loading chart of accounts...</div>
        </CrudTableCard>
      ) : filteredAccounts.length === 0 ? (
        <EmptyState
          title="No chart of accounts found"
          description="Create a chart of account record, then it will appear in Payment Accounts dropdown."
          actionLabel="Add Account"
          onAction={openCreateDrawer}
        />
      ) : (
        <CrudTableCard title="Chart Of Accounts" subtitle={`${filteredAccounts.length} result(s)`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Parent</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={getAccountId(account)} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{getAccountCode(account) || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{getAccountName(account)}</td>
                    <td className="px-4 py-3 text-slate-600">{getAccountType(account)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {account.parentId || account.parentAccountId || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={normalizeStatus(account)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
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
        title={editingAccount ? "Edit Chart Of Account" : "Create Chart Of Account"}
        width="560px"
        loading={saving}
        saveText={editingAccount ? "Save Changes" : "Create Account"}
        cancelText="Cancel"
        onSubmit={handleSubmit}
        onCancel={closeDrawer}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {editingAccount ? "Update account details" : "Add a new chart of account"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              These records are loaded into the Payment Accounts page dropdown.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Code</label>
              <input
                type="text"
                value={form.code}
                disabled={Boolean(editingAccount)}
                onChange={(event) => setField("code", event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                placeholder="1001"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Cash in Bank"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
              <select
                value={form.type}
                onChange={(event) => setField("type", event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                {accountTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Parent Account</label>
              <select
                value={form.parentId}
                onChange={(event) => setField("parentId", event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">No parent</option>
                {accounts
                  .filter((account) => getAccountId(account) !== getAccountId(editingAccount))
                  .map((account) => (
                    <option key={getAccountId(account)} value={getAccountId(account)}>
                      {accountLabel(account)}
                    </option>
                  ))}
              </select>
            </div>
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

export default ChartOfAccountsPage;
