import { useEffect, useState } from "react";
import { Alert } from "../../components/ui/Alert.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { toFriendlyError } from "../../services/httpClient.js";
import { paymentAccountApi } from "../../services/paymentAccountApi.js";
import { asArray } from "../../utils/normalize.js";
export function PaymentAccountsListPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    paymentAccountApi
      .list()
      .then((d) => setRows(asArray(d)))
      .catch((e) => setError(toFriendlyError(e)));
  }, []);
  return (
    <>
      <PageHeader
        eyebrow="Accounts"
        title="Payment accounts"
        description="Bank, mobile, cash payment accounts by organization."
      />
      <Alert>{error}</Alert>
      <DataTable
        rows={rows}
        columns={[
          { header: "Holder", render: (r) => r.holder },
          {
            header: "Type",
            render: (r) => <Badge tone="blue">{r.type}</Badge>,
          },
          {
            header: "Organization",
            render: (r) => r.organizationId || r.organization_id || "—",
          },
          {
            header: "Default",
            render: (r) => (
              <Badge tone={r.isDefault || r.is_default ? "green" : "gray"}>
                {r.isDefault || r.is_default ? "Default" : "No"}
              </Badge>
            ),
          },
          {
            header: "Status",
            render: (r) => (
              <Badge tone={r.active === false ? "red" : "green"}>
                {r.active === false ? "Inactive" : "Active"}
              </Badge>
            ),
          },
        ]}
      />
    </>
  );
}
