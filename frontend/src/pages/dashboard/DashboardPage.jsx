import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { permissionApi } from "../../services/permissionApi.js";
import { roleApi } from "../../services/roleApi.js";
import { userApi } from "../../services/userApi.js";

export function DashboardPage() {
  const { data } = useAsync(async () => {
    const [users, roles, permissions] = await Promise.all([
      userApi.list(),
      roleApi.list(),
      permissionApi.list(),
    ]);
    return { users, roles, permissions };
  }, []);

  const stats = [
    { label: "Users", value: data?.users?.length ?? "—", to: "/users" },
    { label: "Roles", value: data?.roles?.length ?? "—", to: "/roles" },
    {
      label: "Permissions",
      value: data?.permissions?.length ?? "—",
      to: "/permissions",
    },
    {
      label: "Mapped users",
      value: data?.users?.filter((x) => x.roles?.length).length ?? "—",
      to: "/user-roles",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Access control dashboard"
        description="Mamun -- Operational view of your Keycloak realm and local AuthService session workflow."
      />
      <div className="stats-grid">
        {stats.map((s) => (
          <Link className="stat-card" to={s.to} key={s.label}>
            <span>{s.label}</span>
            <strong>{s.value}</strong>
          </Link>
        ))}
      </div>
      <Card
        title="Recommended architecture"
        description="Keep the frontend thin. Keep authorization rules inside the backend and Keycloak."
      >
        <div className="architecture-flow">
          <span>React Client</span>
          <b>→</b>
          <span>APISIX</span>
          <b>→</b>
          <span>AuthService / Redis</span>
          <b>→</b>
          <span>UserManagement API</span>
          <b>→</b>
          <span>Keycloak Admin API</span>
        </div>
      </Card>
    </>
  );
}
