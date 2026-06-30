import { CrudPage } from "../../components/ui/CrudPage.jsx";
import { roleApi } from "../../services/roleApi.js";
export function RolesPage() {
  return (
    <CrudPage
      title="Roles"
      eyebrow="ACCESS CONTROL"
      description="Create Keycloak roles and maintain local role references."
      api={roleApi}
      createPermission="permission:roles.create"
      updatePermission="permission:roles.update"
      deletePermission="permission:roles.delete"
      columns={[
        {
          key: "name",
          label: "Role",
          render: (x) => x.name || x.nameCache || x.name_cache || "-",
        },
        { key: "description", label: "Description" },
        {
          key: "isGlobal",
          label: "Global",
          render: (x) => (
            <span
              className={`badge ${(x.isGlobal ?? x.is_global) ? "badge-green" : "badge-gray"}`}
            >
              {(x.isGlobal ?? x.is_global) ? "Yes" : "No"}
            </span>
          ),
        },
        {
          key: "isElevated",
          label: "Elevated",
          render: (x) => (
            <span
              className={`badge ${(x.isElevated ?? x.is_elevated) ? "badge-purple" : "badge-gray"}`}
            >
              {(x.isElevated ?? x.is_elevated) ? "Yes" : "No"}
            </span>
          ),
        },
      ]}
      formFields={[
        { name: "name", label: "Role Name", lockOnEdit: true },
        { name: "description", label: "Description" },
        {
          name: "isGlobal",
          label: "Global",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "isElevated",
          label: "Elevated",
          type: "checkbox",
          defaultValue: false,
        },
      ]}
    />
  );
}
