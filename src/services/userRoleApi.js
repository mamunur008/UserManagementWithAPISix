import { userApi } from "./userApi.js";
export const userRoleApi = {
  listByUser: (userId) => userApi.roles(userId),
  assign: (userId, roleId) => userApi.assignRole(userId, roleId),
  remove: (userId, roleId) => userApi.removeRole(userId, roleId)
};
