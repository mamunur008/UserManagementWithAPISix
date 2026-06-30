import { http, unwrap } from './httpClient.js';

export const permissionApi = {
  list: () => http.get('/permissions').then(unwrap),
  get: (name) => http.get(`/permissions/${encodeURIComponent(name)}`).then(unwrap),
  create: (payload) => http.post('/permissions', payload).then(unwrap),
  update: (name, payload) => http.put(`/permissions/${encodeURIComponent(name)}`, payload).then(unwrap),
  remove: (name) => http.delete(`/permissions/${encodeURIComponent(name)}`).then(unwrap)
};
