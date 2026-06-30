import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../../components/ui/Alert.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { toFriendlyError } from "../../services/httpClient.js";
import { menuItemApi } from "../../services/menuItemApi.js";
import { asArray, getId } from "../../utils/normalize.js";
export function MenuItemsListPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    menuItemApi
      .list()
      .then((d) => setRows(asArray(d)))
      .catch((e) => setError(toFriendlyError(e)));
  }, []);
  return (
    <>
      <PageHeader
        eyebrow="Navigation"
        title="Menu items"
        description="Server-side menu rendered from /me with admin fallback when table is empty."
        actions={
          <Link className="btn btn-primary" to="/menu-items/new">
            Add menu
          </Link>
        }
      />
      <Alert>{error}</Alert>
      <DataTable
        rows={rows}
        columns={[
          { header: "Name", render: (r) => r.name },
          { header: "URL", render: (r) => r.url },
          { header: "Icon", render: (r) => r.icon || "—" },
          {
            header: "Order",
            render: (r) => r.orderIndex ?? r.order_index ?? 0,
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
                <Link to={`/menu-items/${getId(r)}/edit`}>Edit</Link>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
