import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Alert } from "../../components/ui/Alert.jsx";
import { userApi } from "../../services/userApi.js";
import { asArray, displayName, getId } from "../../utils/normalize.js";
import { toFriendlyError } from "../../services/httpClient.js";

export function UsersListPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try { setRows(asArray(await userApi.list())); }
    catch (e) { setError(toFriendlyError(e)); }
  }
  useEffect(() => { load(); }, []);

  return (
    <>
      <PageHeader eyebrow="Directory" title="Users" description="Create, maintain and review Keycloak-backed local user references." actions={<Link className="btn btn-primary" to="/users/new">Add user</Link>} />
      <Alert>{error}</Alert>
      <DataTable
        rows={rows}
        columns={[
          { header: "Username", render: (r) => r.username || r.usernameCache || r.username_cache || r.userName || "—" },
          { header: "Name", render: (r) => displayName(r) },
          { header: "Email", render: (r) => r.email || r.emailCache || r.email_cache || "—" },
          { header: "Organization", render: (r) => r.organizationId || r.organization_id || "—" },
          { header: "Status", render: (r) => <Badge tone={r.active === false || r.isActive === false ? "red" : "green"}>{r.active === false || r.isActive === false ? "Disabled" : "Enabled"}</Badge> },
          { header: "Actions", render: (r) => <div className="row-actions"><Link to={`/users/${getId(r)}`}>View</Link><Link to={`/users/${getId(r)}/edit`}>Edit</Link></div> }
        ]}
      />
    </>
  );
}
