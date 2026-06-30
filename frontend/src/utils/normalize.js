export function asArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.roles)) return value.roles;
  if (Array.isArray(value?.users)) return value.users;
  if (Array.isArray(value?.menus)) return value.menus;
  return [];
}

export function displayName(user) {
  return [user?.firstName || user?.first_name, user?.lastName || user?.last_name].filter(Boolean).join(" ") || user?.username || user?.usernameCache || user?.userName || user?.email || "—";
}

export function getId(row) {
  return row?.id || row?.userRefId || row?.roleId || row?.permissionId || row?.keycloakUserId || row?.keycloakRoleId;
}
