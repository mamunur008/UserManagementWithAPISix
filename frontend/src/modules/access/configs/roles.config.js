export const rolesConfig = {
  title: "Roles",
  description: "Define role structure and control access responsibilities.",
  tableTitle: "Role Directory",
  tableDescription:
    "Maintain role definitions and their current lifecycle state.",
  drawerWidth: "520px",
  defaultForm: {
    id: null,
    name: "",
    description: "",
    status: "active",
  },
  filters: {
    statuses: ["active", "inactive"],
  },
};
