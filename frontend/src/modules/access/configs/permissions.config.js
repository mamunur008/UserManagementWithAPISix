export const permissionsConfig = {
  title: "Permissions",
  description: "Manage permissions and group them by module or capability.",
  tableTitle: "Permission Catalog",
  tableDescription: "Review and maintain application permissions.",
  drawerWidth: "560px",
  defaultForm: {
    id: null,
    name: "",
    module: "",
    action: "",
    status: "active",
  },
  filters: {
    statuses: ["active", "inactive"],
    modules: ["Users", "Roles", "Permissions", "Reports", "Settings"],
  },
};
