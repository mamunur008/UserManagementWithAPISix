export function normalizeRows(response) {
  const data = response?.data ?? response ?? [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.roles)) return data.roles;
  if (Array.isArray(data.users)) return data.users;
  if (Array.isArray(data.permissions)) return data.permissions;
  if (Array.isArray(data.menuItems)) return data.menuItems;
  if (Array.isArray(data.organizationTypes)) return data.organizationTypes;
  if (Array.isArray(data.paymentAccounts)) return data.paymentAccounts;
  if (Array.isArray(data.chartOfAccounts)) return data.chartOfAccounts;
  if (Array.isArray(data.accounts)) return data.accounts;
  return [];
}

export function normalizeStatus(row) {
  if (typeof row?.status === "string") return row.status.toLowerCase();
  if (typeof row?.active === "boolean") return row.active ? "active" : "inactive";
  if (typeof row?.isActive === "boolean") return row.isActive ? "active" : "inactive";
  if (typeof row?.enabled === "boolean") return row.enabled ? "active" : "inactive";
  if (typeof row?.disabled === "boolean") return row.disabled ? "inactive" : "active";
  return "active";
}

export function getId(row, fallbackKeys = []) {
  const keys = ["id", "userId", "roleId", "permissionId", "keycloakId", "code", "name", ...fallbackKeys];
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && value !== "") return String(value);
  }
  return "";
}

export function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

export function uniqueStrings(values) {
  return Array.from(new Set((values || []).map((value) => String(value)).filter(Boolean)));
}

export function getErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    error?.friendlyMessage ||
    error?.message ||
    fallback
  );
}

export function hasSearch(value, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return true;
  return String(value || "").toLowerCase().includes(q);
}

export function optionLabel(options, value, labelKeys = ["name", "displayName", "code", "email", "username", "title"]) {
  if (value === undefined || value === null || value === "") return "—";
  const option = (options || []).find((item) => String(getId(item)) === String(value));
  if (!option) return String(value);
  for (const key of labelKeys) {
    if (option?.[key]) return String(option[key]);
  }
  return String(value);
}

export function getRoleName(role) {
  return role?.name || role?.roleName || role?.nameCache || role?.displayName || role?.description || getId(role);
}

export function getUserName(user) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  return user?.name || user?.displayName || fullName || user?.username || user?.email || getId(user);
}

export function getPermissionCode(permission) {
  return permission?.code || permission?.key || permission?.name || permission?.permissionName || getId(permission);
}

export function getPermissionName(permission) {
  return permission?.name || permission?.displayName || permission?.description || getPermissionCode(permission);
}

export function getPermissionModule(permission) {
  return permission?.module || permission?.group || permission?.category || "General";
}
