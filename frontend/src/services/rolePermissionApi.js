import { roleApi } from './roleApi.js';
import { permissionApi } from './permissionApi.js';
import { http, unwrap } from './httpClient.js';

export const rolePermissionApi = {
  list: () => http.get('/role-permissions').then(unwrap),
  get: (roleName) => http.get(`/role-permissions/${encodeURIComponent(roleName)}`).then(unwrap),
  save: (roleName, permissions) =>
    http.post(`/role-permissions/${encodeURIComponent(roleName)}`, { permissions }).then(unwrap),
  loadOptions: async () => {
    const [roles, permissions] = await Promise.all([roleApi.list(), permissionApi.list()]);
    return { roles, permissions };
  }
};
