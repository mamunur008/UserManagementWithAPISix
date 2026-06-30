import { http, unwrap } from "./httpClient.js";
export const paymentAccountApi = {
  list: () => http.get("/payment-accounts").then(unwrap),
  create: (payload) => http.post("/payment-accounts", payload).then(unwrap),
  getByOrganization: (organizationId) => http.get(`/organizations/${organizationId}/payment-accounts`).then(unwrap),
  setDefault: (id) => http.post(`/payment-accounts/${id}/set-default`).then(unwrap)
};
