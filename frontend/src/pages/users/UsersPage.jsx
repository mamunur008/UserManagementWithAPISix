import { CrudPage } from "../../components/ui/CrudPage.jsx";
import { userApi } from "../../services/userApi.js";
const userName = (x) => x.usernameCache || x.username || x.userName || "-";
export function UsersPage() {
  return (
    <CrudPage
      title="Users"
      eyebrow="DIRECTORY"
      description="Create, maintain and review Keycloak-backed local user references."
      api={userApi}
      createPermission="permission:users.create"
      updatePermission="permission:users.update"
      deletePermission="permission:users.delete"
      columns={[
        { key: "username", label: "Username", render: userName },
        {
          key: "email",
          label: "Email",
          render: (x) => x.emailCache || x.email || "-",
        },
        {
          key: "organizationId",
          label: "Organization",
          render: (x) => x.organizationId || x.organization_id || "-",
        },
        {
          key: "active",
          label: "Status",
          render: (x) => (
            <span
              className={`badge ${x.active === false ? "badge-gray" : "badge-green"}`}
            >
              {x.active === false ? "Inactive" : "Active"}
            </span>
          ),
        },
      ]}
      formFields={[
        { name: "username", label: "Username", lockOnEdit: true },
        { name: "email", label: "Email" },
        { name: "firstName", label: "First Name" },
        { name: "lastName", label: "Last Name" },
        { name: "organizationId", label: "Organization Id" },
        { name: "phone", label: "Phone" },
        { name: "bio", label: "Bio", type: "textarea" },
        {
          name: "active",
          label: "Active",
          type: "checkbox",
          defaultValue: true,
        },
      ]}
    />
  );
}
