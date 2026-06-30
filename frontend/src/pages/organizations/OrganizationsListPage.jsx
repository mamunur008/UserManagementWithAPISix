import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../../components/ui/Alert.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { toFriendlyError } from "../../services/httpClient.js";
import { organizationApi } from "../../services/organizationApi.js";
import { asArray, getId } from "../../utils/normalize.js";
export function OrganizationsListPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    organizationApi
      .list()
      .then((d) => setRows(asArray(d)))
      .catch((e) => setError(toFriendlyError(e)));
  }, []);
  return (
    <>
      <PageHeader
        eyebrow="Accounts"
        title="Organizations"
        description="Organization tree and partner/mother organization types."
        actions={
          <Link className="btn btn-primary" to="/organizations/new">
            Add organization
          </Link>
        }
      />
      <Alert>{error}</Alert>
      <DataTable
        rows={rows}
        columns={[
          { header: "Name", render: (r) => r.name },
          { header: "Type", render: (r) => r.typeId || r.type_id || "—" },
          { header: "Parent", render: (r) => r.parentId || r.parent_id || "—" },
          {
            header: "Commission",
            render: (r) => r.commissionRate ?? r.commission_rate ?? "—",
          },
          {
            header: "Status",
            render: (r) => (
              <Badge tone={r.active === false ? "red" : "green"}>
                {r.active === false ? "Inactive" : "Active"}
              </Badge>
            ),
          },
          {
            header: "Actions",
            render: (r) => (
              <div className="row-actions">
                <Link to={`/organizations/${getId(r)}/edit`}>Edit</Link>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
