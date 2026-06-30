import { CrudPage } from "../../components/ui/CrudPage.jsx";
import { menuItemApi } from "../../services/menuItemApi.js";
export function MenuItemsPage() {
  return (
    <CrudPage
      title="Menu Items"
      eyebrow="NAVIGATION"
      description="Manage server-side menu items and role access."
      api={menuItemApi}
      createPermission="permission:menu.create"
      updatePermission="permission:menu.update"
      deletePermission="permission:menu.delete"
      columns={[
        { key: "name", label: "Name" },
        { key: "url", label: "URL" },
        { key: "icon", label: "Icon" },
        { key: "orderIndex", label: "Order" },
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
        { name: "name", label: "Name" },
        { name: "url", label: "URL" },
        { name: "icon", label: "Icon" },
        { name: "orderIndex", label: "Order Index" },
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
