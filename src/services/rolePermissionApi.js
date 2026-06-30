import { http, unwrap } from "./httpClient.js";
export const rolePermissionApi = {
  listByRole: (roleId) => http.get(`/roles/${roleId}/permissions`).then(unwrap),
  assign: (roleId, permissionId) => http.post(`/roles/${roleId}/permissions/${permissionId}`).then(unwrap),
  remove: (roleId, permissionId) => http.delete(`/roles/${roleId}/permissions/${permissionId}`).then(unwrap)
};
