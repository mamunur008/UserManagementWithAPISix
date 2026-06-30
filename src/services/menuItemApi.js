import { http, unwrap } from "./httpClient.js";
export const menuItemApi = {
  list: () => http.get("/menu-items").then(unwrap),
  get: (id) => http.get(`/menu-items/${id}`).then(unwrap),
  create: (payload) => http.post("/menu-items", payload).then(unwrap),
  updateRoles: (id, roleIds) => http.put(`/menu-items/${id}/roles`, { roleIds }).then(unwrap)
};
