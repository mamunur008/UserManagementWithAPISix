import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { roleApi } from "../../services/roleApi.js";
import { asArray, getId } from "../../utils/normalize.js";
import { toFriendlyError } from "../../services/httpClient.js";

export function RolesListPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { roleApi.list().then((d) => setRows(asArray(d))).catch((e) => setError(toFriendlyError(e))); }, []);
  return (
    <>
      <PageHeader eyebrow="Authorization" title="Roles" description="Manage Keycloak realm roles and local role cache records." actions={<Link className="btn btn-primary" to="/roles/new">Add role</Link>} />
      <Alert>{error}</Alert>
      <DataTable rows={rows} columns={[
        { header: "Name", render: (r) => r.name || r.nameCache || r.name_cache },
        { header: "Keycloak Role ID", render: (r) => r.keycloakRoleId || r.keycloak_role_id || "—" },
        { header: "Global", render: (r) => <Badge tone={r.isGlobal || r.is_global ? "blue" : "gray"}>{r.isGlobal || r.is_global ? "Global" : "Scoped"}</Badge> },
        { header: "Elevated", render: (r) => <Badge tone={r.isElevated || r.is_elevated ? "red" : "green"}>{r.isElevated || r.is_elevated ? "Yes" : "No"}</Badge> },
        { header: "Actions", render: (r) => <div className="row-actions"><Link to={`/roles/${getId(r)}`}>View</Link><Link to={`/roles/${getId(r)}/edit`}>Edit</Link></div> }
      ]} />
    </>
  );
}
