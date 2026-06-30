import { http, unwrap } from './httpClient.js';

export const roleApi = {
  list: () => http.get('/roles').then(unwrap),
  get: (name) => http.get(`/roles/${encodeURIComponent(name)}`).then(unwrap),
  create: (payload) => http.post('/roles', payload).then(unwrap),
  update: (name, payload) => http.put(`/roles/${encodeURIComponent(name)}`, payload).then(unwrap),
  remove: (name) => http.delete(`/roles/${encodeURIComponent(name)}`).then(unwrap),
  permissions: (name) => http.get(`/roles/${encodeURIComponent(name)}/permissions`).then(unwrap),
  savePermissions: (name, permissions) =>
    http.post(`/roles/${encodeURIComponent(name)}/permissions`, { permissions }).then(unwrap)
};
