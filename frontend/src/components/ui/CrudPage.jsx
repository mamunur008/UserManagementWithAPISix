import { useEffect, useMemo, useState } from "react";
import { http } from "../../lib/httpClient.js";
import { SelectPlus } from "./SelectPlus.jsx";

const customSchemas = {
  "/users": {
    fields: [
      { name: "username", label: "Username", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "firstName", label: "First Name", type: "text" },
      { name: "lastName", label: "Last Name", type: "text" },
      {
        name: "organizationId",
        label: "Organization",
        type: "lookup-select",
        lookup: { endpoint: "/organizations" },
        valueKey: "id",
        labelKey: "name",
        placeholder: "Select organization",
      },
      { name: "phone", label: "Phone", type: "text" },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "avatarUrl", label: "Avatar URL", type: "text" },
      { name: "active", label: "Active", type: "boolean", defaultValue: true },
      {
        name: "password",
        label: "Password",
        type: "password",
        createOnly: true,
      },
      {
        name: "roles",
        label: "Keycloak Login Roles",
        type: "multi-select",
        options: ["customer", "admin"],
        defaultValue: ["customer"],
      },
      {
        name: "roleIds",
        label: "Local DB Roles",
        type: "multi-select",
        lookup: { endpoint: "/roles" },
        valueKey: "id",
        labelKey: "name",
        defaultValue: [],
      },
    ],
  },

  "/roles": {
    fields: [
      {
        name: "name",
        label: "Role Name",
        type: "text",
        required: true,
        createOnly: true,
      },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "isGlobal",
        label: "Is Global",
        type: "boolean",
        defaultValue: false,
      },
      {
        name: "isElevated",
        label: "Is Elevated",
        type: "boolean",
        defaultValue: false,
      },
      {
        name: "assignableOrgTypeIds",
        label: "Assignable Organization Types",
        type: "multi-select",
        lookup: { endpoint: "/organization-types" },
        valueKey: "id",
        labelKey: "name",
        defaultValue: [],
      },
    ],
  },

  "/permissions": {
    fields: [
      {
        name: "code",
        label: "Permission Code",
        type: "text",
        required: true,
        placeholder: "permission:users.create",
      },
      {
        name: "module",
        label: "Module",
        type: "select",
        required: true,
        options: [
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
        ],
      },
      { name: "name", label: "Display Name", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "active", label: "Active", type: "boolean", defaultValue: true },
    ],
  },

  "/organization-types": {
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "code", label: "Code", type: "text", required: true },
      { name: "active", label: "Active", type: "boolean", defaultValue: true },
    ],
  },

  "/organizations": {
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      {
        name: "typeId",
        label: "Type",
        type: "multi-select",
        lookup: { endpoint: "/organization-types" },
        valueKey: "id",
        labelKey: "name",
        single: true,
        defaultValue: [],
      },
      {
        name: "parentId",
        label: "Parent Organization",
        type: "lookup-select",
        lookup: { endpoint: "/organizations" },
        valueKey: "id",
        labelKey: "name",
        placeholder: "Select parent organization",
      },
      { name: "commissionRate", label: "Commission Rate", type: "number" },
      { name: "active", label: "Active", type: "boolean", defaultValue: true },
    ],
  },

  "/payment-accounts": {
    fields: [
      {
        name: "organizationId",
        label: "Organization",
        type: "lookup-select",
        lookup: { endpoint: "/organizations" },
        valueKey: "id",
        labelKey: "name",
        placeholder: "Select organization",
      },
      {
        name: "type",
        label: "Type",
        type: "select",
        required: true,
        options: ["bank", "cash", "mobile-banking", "card", "other"],
      },
      { name: "holder", label: "Holder", type: "text", required: true },
      { name: "details", label: "Details", type: "textarea" },
      { name: "chartOfAccountId", label: "Chart Of Account ID", type: "text" },
      {
        name: "isDefault",
        label: "Is Default",
        type: "boolean",
        defaultValue: false,
      },
      { name: "active", label: "Active", type: "boolean", defaultValue: true },
    ],
  },

  "/menu-items": {
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      {
        name: "url",
        label: "URL",
        type: "text",
        required: true,
        placeholder: "/users",
      },
      {
        name: "icon",
        label: "Icon",
        type: "select",
        options: [
          "dashboard",
          "users",
          "shield",
          "lock",
          "link",
          "check",
          "menu",
          "organization",
          "payment",
        ],
      },
      {
        name: "parentId",
        label: "Parent Menu",
        type: "lookup-select",
        lookup: { endpoint: "/menu-items" },
        valueKey: "id",
        labelKey: "name",
        placeholder: "Select parent menu",
      },
      {
        name: "orderIndex",
        label: "Order Index",
        type: "number",
        defaultValue: 0,
      },
      {
        name: "isPublic",
        label: "Is Public",
        type: "boolean",
        defaultValue: false,
      },
      { name: "active", label: "Active", type: "boolean", defaultValue: true },
      {
        name: "roleIds",
        label: "Allowed Roles",
        type: "multi-select",
        lookup: { endpoint: "/roles" },
        valueKey: "id",
        labelKey: "name",
        defaultValue: [],
      },
    ],
  },
};

const inputClass =
  "mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted";

function normalizeRows(response) {
  const data = response?.data ?? response ?? [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

function getRowId(row) {
  return row?.id || row?.userId || row?.roleId || row?.permissionId;
}

function toLabel(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (text) => text.toUpperCase());
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getSchema(endpoint, rows) {
  const custom = customSchemas[endpoint];
  if (custom) return custom;

  const firstRow = rows?.[0] || {};

  return {
    fields: Object.keys(firstRow)
      .filter((key) => {
        const lower = key.toLowerCase();
        return !(
          lower === "id" ||
          lower.endsWith("id") ||
          lower.includes("created") ||
          lower.includes("updated") ||
          lower.includes("deleted") ||
          lower === "serverversion"
        );
      })
      .map((key) => ({
        name: key,
        label: toLabel(key),
        type: typeof firstRow[key] === "boolean" ? "boolean" : "text",
      })),
  };
}

function buildInitialForm(schema, mode, row) {
  const form = {};

  for (const field of schema.fields) {
    if (mode === "edit" && field.createOnly) continue;

    let value = row?.[field.name];

    if (value === undefined || value === null) {
      value = field.defaultValue ?? "";
    }

    if (field.type === "boolean") {
      value = Boolean(value);
    }

    if (field.type === "multi-select") {
      if (Array.isArray(value)) {
        value = value;
      } else if (field.single && value) {
        value = [value];
      } else {
        value = Array.isArray(field.defaultValue) ? field.defaultValue : [];
      }
    }

    if (field.type === "lookup-select") {
      value = value || "";
    }

    form[field.name] = value;
  }

  return form;
}

function cleanPayload(form, schema, mode) {
  const payload = {};

  for (const field of schema.fields) {
    if (mode === "edit" && field.createOnly) continue;

    let value = form[field.name];
    const lower = field.name.toLowerCase();

    if (field.type === "multi-select") {
      const selected = Array.isArray(value) ? value : [];
      value = field.single ? selected[0] || null : selected;
    }

    if (field.type === "lookup-select") {
      value = value || null;
    }

    if (field.type === "number") {
      value =
        value === "" || value === null || value === undefined
          ? null
          : Number(value);
    }

    if (field.type === "boolean") {
      value = Boolean(value);
    }

    if ((lower === "id" || lower.endsWith("id")) && value === "") {
      value = null;
    }

    if (value === "") {
      value = null;
    }

    payload[field.name] = value;
  }

  return payload;
}

function getOptionValue(option, field) {
  if (typeof option === "string") return option;
  return (
    option?.[field.valueKey || "id"] ||
    option?.id ||
    option?.code ||
    option?.name ||
    ""
  );
}

function getOptionLabel(option, field) {
  if (typeof option === "string") return option;
  return (
    option?.[field.labelKey || "name"] ||
    option?.name ||
    option?.code ||
    option?.email ||
    option?.username ||
    option?.id ||
    ""
  );
}

function FormField({ field, value, onChange, readOnly }) {
  if (field.type === "textarea") {
    return (
      <textarea
        value={value || ""}
        readOnly={readOnly}
        placeholder={field.placeholder || ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        className={`${inputClass} h-auto min-h-20 resize-y`}
      />
    );
  }

  if (field.type === "boolean") {
    return (
      <label className="mt-1.5 flex h-10 items-center gap-2 rounded-xl border border-line bg-panel-soft px-3">
        <input
          type="checkbox"
          checked={Boolean(value)}
          disabled={readOnly}
          onChange={(e) => onChange(field.name, e.target.checked)}
          className="h-4 w-4 accent-brand"
        />
        <span className="text-sm font-bold text-ink">
          {Boolean(value) ? "Yes" : "No"}
        </span>
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={value || ""}
        disabled={readOnly}
        onChange={(e) => onChange(field.name, e.target.value)}
        className={inputClass}
      >
        <option value="">Select {field.label}</option>
        {(field.options || []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "lookup-select") {
    return (
      <select
        value={value || ""}
        disabled={readOnly}
        onChange={(e) => onChange(field.name, e.target.value)}
        className={inputClass}
      >
        <option value="">{field.placeholder || `Select ${field.label}`}</option>
        {(field.options || []).map((option) => {
          const optionValue = getOptionValue(option, field);
          const optionLabel = getOptionLabel(option, field);
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    );
  }

  if (field.type === "multi-select") {
    return (
      <SelectPlus
        value={Array.isArray(value) ? value : []}
        options={field.options || []}
        valueKey={field.valueKey || "id"}
        labelKey={field.labelKey || "name"}
        placeholder={field.placeholder || `Select ${field.label}`}
        disabled={readOnly}
        onChange={(next) =>
          onChange(field.name, field.single ? next.slice(-1) : next)
        }
      />
    );
  }

  return (
    <input
      type={
        field.type === "password"
          ? "password"
          : field.type === "number"
            ? "number"
            : field.type === "email"
              ? "email"
              : "text"
      }
      value={value || ""}
      readOnly={readOnly}
      placeholder={field.placeholder || ""}
      onChange={(e) => onChange(field.name, e.target.value)}
      className={inputClass}
    />
  );
}

export function CrudPage({ title, endpoint, note }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [form, setForm] = useState({});
  const [lookups, setLookups] = useState({});

  const schema = useMemo(() => getSchema(endpoint, rows), [endpoint, rows]);

  const columns = useMemo(() => {
    if (!rows.length) return [];
    return Array.from(new Set(rows.flatMap((row) => Object.keys(row || {}))));
  }, [rows]);

  async function loadRows() {
    try {
      setLoading(true);
      setError("");
      const response = await http.get(endpoint);
      setRows(normalizeRows(response));
    } catch (err) {
      console.error(`Failed to load ${endpoint}`, err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRows();
  }, [endpoint]);

  useEffect(() => {
    let alive = true;

    async function loadLookups() {
      const lookupFields = schema.fields.filter((x) => x.lookup);
      if (!lookupFields.length) return;

      const nextLookups = {};

      for (const field of lookupFields) {
        try {
          const response = await http.get(field.lookup.endpoint);
          nextLookups[field.name] = normalizeRows(response);
        } catch (err) {
          console.error(`Failed to load lookup for ${field.name}`, err);
          nextLookups[field.name] = [];
        }
      }

      if (alive) {
        setLookups((current) => ({ ...current, ...nextLookups }));
      }
    }

    loadLookups();

    return () => {
      alive = false;
    };
  }, [schema]);

  function updateForm(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function openAdd() {
    setSelectedRow(null);
    setForm(buildInitialForm(schema, "add", null));
    setModalMode("add");
  }

  function openView(row) {
    setSelectedRow(row);
    setForm(buildInitialForm(schema, "view", row));
    setModalMode("view");
  }

  function openEdit(row) {
    setSelectedRow(row);
    setForm(buildInitialForm(schema, "edit", row));
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setSelectedRow(null);
    setForm({});
  }

  async function submitAdd() {
    try {
      await http.post(endpoint, cleanPayload(form, schema, "add"));
      closeModal();
      await loadRows();
    } catch (err) {
      console.error("Add failed", err);
      alert(err?.response?.data?.message || err?.message || "Add failed.");
    }
  }

  async function submitEdit() {
    try {
      const id = getRowId(selectedRow);
      if (!id) {
        alert("Cannot update because row id was not found.");
        return;
      }
      await http.put(`${endpoint}/${id}`, cleanPayload(form, schema, "edit"));
      closeModal();
      await loadRows();
    } catch (err) {
      console.error("Update failed", err);
      alert(err?.response?.data?.message || err?.message || "Update failed.");
    }
  }

  async function deleteRow(row) {
    const id = getRowId(row);
    if (!id) {
      alert("Cannot delete because row id was not found.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await http.delete(`${endpoint}/${id}`);
      await loadRows();
    } catch (err) {
      console.error("Delete failed", err);
      alert(err?.response?.data?.message || err?.message || "Delete failed.");
    }
  }

  const modalTitle =
    modalMode === "add"
      ? `Add ${title.replace(/s$/, "")}`
      : modalMode === "edit"
        ? `Edit ${title.replace(/s$/, "")}`
        : `View ${title.replace(/s$/, "")}`;

  return (
    <>
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="section-label">Directory</p>
          <h1 className="m-0 text-4xl font-black tracking-[-0.05em] text-ink">
            {title}
          </h1>
          <p className="mt-2 text-muted">
            {note ||
              `Manage ${title.toLowerCase()} from the UserManagement API.`}
          </p>
        </div>
        <button type="button" onClick={openAdd} className="add-btn">
          Add {title.replace(/s$/, "")}
        </button>
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="table-card">
        {loading ? (
          <div className="p-8 text-muted">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-muted">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{toLabel(column)}</th>
                  ))}
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={getRowId(row) || index}>
                    {columns.map((column) => (
                      <td key={column} className="max-w-[260px]">
                        <span className="line-clamp-2 break-words">
                          {formatValue(row[column])}
                        </span>
                      </td>
                    ))}
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openView(row)}
                          className="view-btn"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="rounded-xl bg-brand px-4 py-2 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRow(row)}
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-red-700"
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
        )}
      </div>

      {modalMode ? (
        <div className="modal-overlay">
          <div className="modal-panel max-w-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="m-0 text-2xl font-black tracking-tight text-ink">
                  {modalTitle}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {modalMode === "view"
                    ? "Read-only record details."
                    : "Fill in the fields below and save the record."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl bg-slate-100 px-4 py-2 font-black text-ink shadow-none"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {schema.fields.map((field) => {
                if (modalMode === "edit" && field.createOnly) return null;

                const fieldWithOptions = {
                  ...field,
                  options: field.lookup
                    ? lookups[field.name] || []
                    : field.options,
                };

                return (
                  <label
                    key={field.name}
                    className={field.type === "textarea" ? "md:col-span-2" : ""}
                  >
                    <span className="text-sm font-black text-ink">
                      {field.label}
                      {field.required ? (
                        <span className="text-red-600"> *</span>
                      ) : null}
                    </span>
                    <FormField
                      field={fieldWithOptions}
                      value={form[field.name]}
                      readOnly={modalMode === "view"}
                      onChange={updateForm}
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-black text-ink shadow-soft"
              >
                Cancel
              </button>
              {modalMode === "add" ? (
                <button type="button" onClick={submitAdd} className="add-btn">
                  Save
                </button>
              ) : null}
              {modalMode === "edit" ? (
                <button
                  type="button"
                  onClick={submitEdit}
                  className="rounded-xl bg-brand px-4 py-2.5 text-sm font-black text-white shadow-lg"
                >
                  Update
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
