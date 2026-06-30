import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../../components/ui/Alert.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { toFriendlyError } from "../../services/httpClient.js";
import { permissionApi } from "../../services/permissionApi.js";
import { asArray, getId } from "../../utils/normalize.js";
export function PermissionsListPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    permissionApi
      .list()
      .then((d) => setRows(asArray(d)))
      .catch((e) => setError(toFriendlyError(e)));
  }, []);
  return (
    <>
      <PageHeader
        eyebrow="Authorization"
        title="Permissions"
        description="Fine-grained permission records used by role-permission mapping."
        actions={
          <Link className="btn btn-primary" to="/permissions/new">
            Add permission
          </Link>
        }
      />
      <Alert>{error}</Alert>
      <DataTable
        rows={rows}
        columns={[
          {
            header: "Name",
            render: (r) => r.name || r.code || r.permissionName || "—",
          },
          { header: "Code", render: (r) => r.code || r.key || r.name || "—" },
          { header: "Description", render: (r) => r.description || "—" },
          {
            header: "Actions",
            render: (r) => (
              <div className="row-actions">
                <Link to={`/permissions/${getId(r)}`}>View</Link>
                <Link to={`/permissions/${getId(r)}/edit`}>Edit</Link>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
