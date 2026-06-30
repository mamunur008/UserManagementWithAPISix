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
} from "../utils/accessPageUtils.js";

const iconOptions = [
  "dashboard",
  "users",
  "shield",
  "lock",
  "link",
  "check",
  "menu",
  "organization",
  "payment",
  "chart",
  "account",
];

const initialForm = {
  name: "",
  url: "",
  icon: "menu",
  parentId: "",
  orderIndex: 0,
  isPublic: false,
  roleIds: [],
  status: "active",
};

const seedMenuItems = [
  {
    id: 1,
    name: "Users",
    url: "/users",
    icon: "users",
    parentId: "",
    orderIndex: 10,
    isPublic: false,
    roleIds: ["admin"],
    status: "active",
  },
  {
    id: 2,
    name: "Role Permissions",
    url: "/role-permissions",
    icon: "shield",
    parentId: "",
    orderIndex: 20,
    isPublic: false,
    roleIds: ["admin"],
    status: "active",
  },
  {
    id: 3,
    name: "User Roles",
    url: "/user-roles",
    icon: "lock",
    parentId: "",
    orderIndex: 30,
    isPublic: false,
    roleIds: ["admin"],
    status: "active",
  },
];

const seedRoles = [
  { id: "admin", name: "Admin" },
  { id: "manager", name: "Manager" },
  { id: "viewer", name: "Viewer" },
];

function getMenuItemId(row) {
  return row?.id ?? row?.menuItemId ?? row?.url;
}

function getRoleKey(role) {
  return String(role?.id ?? role?.roleId ?? role?.name ?? "");
}

function roleLabel(roles, roleId) {
  const role = roles.find((item) => getRoleKey(item) === String(roleId));
  return role ? getRoleName(role) : String(roleId);
}

function RolePills({ roles, roleIds }) {
  const ids = toArray(roleIds);

  if (!ids.length) {
    return <span className="text-sm text-slate-400">All / Public</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.slice(0, 3).map((roleId) => (
        <span
          key={String(roleId)}
          className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
        >
          {roleLabel(roles, roleId)}
        </span>
      ))}
      {ids.length > 3 ? (
        <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
          +{ids.length - 3} more
        </span>
      ) : null}
    </div>
  );
}

export function MenuItemsPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [roles, setRoles] = useState(seedRoles);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState("");

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
      const [menuResponse, rolesResponse] = await Promise.allSettled([
        http.get("/menu-items"),
        http.get("/roles"),
      ]);

      if (menuResponse.status === "fulfilled") {
        const rows = normalizeRows(menuResponse.value).map((row) => ({
          ...row,
          status: normalizeStatus(row),
          roleIds: row.roleIds || row.allowedRoleIds || row.roles || [],
        }));
        setMenuItems(rows.length ? rows : seedMenuItems);
      } else {
        setMenuItems(seedMenuItems);
      }

      if (rolesResponse.status === "fulfilled") {
        const roleRows = normalizeRows(rolesResponse.value);
        setRoles(roleRows.length ? roleRows : seedRoles);
      } else {
        setRoles(seedRoles);
      }
    } catch (error) {
      console.warn("Using menu seed data because API loading failed.", error);
      setMenuItems(seedMenuItems);
      setRoles(seedRoles);
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
      url: row.url || "",
      icon: row.icon || "menu",
      parentId: row.parentId || row.parent_id || "",
      orderIndex: row.orderIndex ?? row.order_index ?? 0,
      isPublic: row.isPublic ?? row.is_public ?? false,
      roleIds: toArray(row.roleIds || row.allowedRoleIds || row.roles || []),
      status: normalizeStatus(row),
    });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    resetForm();
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

  async function handleSubmit() {
    const payload = {
      name: form.name.trim(),
      url: form.url.trim(),
      icon: form.icon || "menu",
      parentId: form.parentId || null,
      orderIndex: Number(form.orderIndex || 0),
      isPublic: !!form.isPublic,
      roleIds: form.isPublic ? [] : toArray(form.roleIds),
      active: form.status === "active",
    };

    if (!payload.name || !payload.url) return;

    try {
      setSaving(true);

      if (editingRecord) {
        const id = getMenuItemId(editingRecord);
        await http.put(`/menu-items/${encodeURIComponent(id)}`, payload);
        setMenuItems((prev) =>
          prev.map((item) =>
            getMenuItemId(item) === id
              ? { ...item, ...payload, id, status: form.status }
              : item,
          ),
        );
        setNotice("Menu item updated successfully");
      } else {
        const response = await http.post("/menu-items", payload);
        const created = response?.data ?? {
          id: Date.now(),
          ...payload,
          status: form.status,
        };
        setMenuItems((prev) => [{ ...created, status: normalizeStatus(created) }, ...prev]);
        setNotice("Menu item created successfully");
      }

      closeDrawer();
    } catch (error) {
      alert(getErrorMessage(error, "Failed to save menu item."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    const confirmed = window.confirm(`Delete menu item "${row.name}"?`);
    if (!confirmed) return;

    try {
      const id = getMenuItemId(row);
      await http.delete(`/menu-items/${encodeURIComponent(id)}`);
      setMenuItems((prev) => prev.filter((item) => getMenuItemId(item) !== id));
      setNotice("Menu item deleted successfully");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to delete menu item."));
    }
  }

  const filteredMenuItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return menuItems;

    return menuItems.filter((row) =>
      [
        row.name,
        row.url,
        row.icon,
        optionLabel(menuItems, row.parentId),
        normalizeStatus(row),
        ...toArray(row.roleIds || row.allowedRoleIds || row.roles).map((roleId) => roleLabel(roles, roleId)),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [menuItems, roles, search]);

  return (
    <CrudPageLayout
      title="Menu Items"
      description="Manage server-side menu entries, route URLs, icons, parent menu, order, visibility, and role access."
      actions={
        <button
          type="button"
          onClick={openCreateDrawer}
          className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add Menu Item
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
              placeholder="Menu name, URL, icon, or role"
              className="w-96 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        }
        actions={
          <button
            type="button"
            onClick={openCreateDrawer}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Add Menu
          </button>
        }
      />

      {loading ? (
        <CrudTableCard title="Menu Items">
          <div className="p-6 text-sm text-slate-500">Loading menu items...</div>
        </CrudTableCard>
      ) : filteredMenuItems.length === 0 ? (
        <EmptyState
          title="No menu items found"
          description="Try another search keyword or create a new menu item."
          action={
            <button
              type="button"
              onClick={openCreateDrawer}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Add Menu Item
            </button>
          }
        />
      ) : (
        <CrudTableCard title="Menu Items" subtitle={`${filteredMenuItems.length} result(s)`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">URL</th>
                  <th className="px-4 py-3 font-medium">Icon</th>
                  <th className="px-4 py-3 font-medium">Parent</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Allowed Roles</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenuItems.map((row) => (
                  <tr key={getMenuItemId(row)} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                    <td className="px-4 py-3 text-slate-600">{row.url}</td>
                    <td className="px-4 py-3 text-slate-600">{row.icon || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {optionLabel(menuItems, row.parentId || row.parent_id)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.orderIndex ?? row.order_index ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      {row.isPublic || row.is_public ? (
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                          Public
                        </span>
                      ) : (
                        <RolePills roles={roles} roleIds={row.roleIds || row.allowedRoleIds || row.roles} />
                      )}
                    </td>
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
        title={editingRecord ? "Edit Menu Item" : "Create Menu Item"}
        width="620px"
        loading={saving}
        saveText={editingRecord ? "Save Changes" : "Create Menu"}
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
              placeholder="Example: Role Permissions"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              URL
            </label>
            <input
              type="text"
              value={form.url}
              onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
              placeholder="Example: /role-permissions"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Icon
              </label>
              <select
                value={form.icon}
                onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Order Index
              </label>
              <input
                type="number"
                value={form.orderIndex}
                onChange={(event) => setForm((prev) => ({ ...prev, orderIndex: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Parent Menu
            </label>
            <select
              value={form.parentId}
              onChange={(event) => setForm((prev) => ({ ...prev, parentId: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">No parent</option>
              {menuItems
                .filter((item) => getMenuItemId(item) !== getMenuItemId(editingRecord))
                .map((item) => (
                  <option key={getMenuItemId(item)} value={getMenuItemId(item)}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(event) => setForm((prev) => ({ ...prev, isPublic: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              Public menu
            </label>

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

          {!form.isPublic ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Allowed Roles
                </label>
                <span className="text-xs text-slate-500">
                  {toArray(form.roleIds).length} selected
                </span>
              </div>
              <div className="space-y-2 rounded-xl border border-slate-200 p-3">
                {roles.map((role) => {
                  const roleKey = getRoleKey(role);
                  const checked = toArray(form.roleIds).map(String).includes(roleKey);

                  return (
                    <label
                      key={roleKey}
                      className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRole(role)}
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                      />
                      <span>
                        <span className="block text-sm font-medium text-slate-900">
                          {getRoleName(role)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {role.description || "No description"}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </CrudDrawerForm>
    </CrudPageLayout>
  );
}

export default MenuItemsPage;
