export const usersConfig = {
  title: "Users",
  description: "Manage user accounts, roles, status, and access visibility.",
  tableTitle: "User Directory",
  tableDescription: "Review, search, and manage platform users.",
  drawerWidth: "520px",
  defaultForm: {
    id: null,
    name: "",
    email: "",
    role: "",
    status: "active",
  },
  filters: {
    statuses: ["active", "inactive"],
    roles: ["Admin", "Manager", "Viewer"],
  },
};
