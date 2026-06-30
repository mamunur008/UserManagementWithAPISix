import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert } from "../../components/ui/Alert.jsx";
import { Card } from "../../components/ui/Card.jsx";
import {
  CheckboxInput,
  FormField,
  TextInput,
} from "../../components/ui/FormField.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { toFriendlyError } from "../../services/httpClient.js";
import { menuItemApi } from "../../services/menuItemApi.js";
const empty = {
  name: "",
  url: "",
  icon: "",
  parentId: "",
  orderIndex: 0,
  isPublic: false,
  active: true,
  roleIds: [],
};
export function MenuItemFormPage() {
  const { id } = useParams();
  const edit = Boolean(id);
  const nav = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (edit)
      menuItemApi
        .get(id)
        .then((m) =>
          setForm({
            ...empty,
            name: m.name || "",
            url: m.url || "",
            icon: m.icon || "",
            parentId: m.parentId || m.parent_id || "",
            orderIndex: m.orderIndex ?? m.order_index ?? 0,
            isPublic: m.isPublic ?? m.is_public ?? false,
            active: m.active !== false,
            roleIds: m.roleIds || [],
          }),
        )
        .catch((e) => setError(toFriendlyError(e)));
  }, [id, edit]);
  function u(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      edit
        ? await menuItemApi.update(id, form)
        : await menuItemApi.create(form);
      nav("/menu-items");
    } catch (e) {
      setError(toFriendlyError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="Menu"
        title={edit ? "Edit menu item" : "Create menu item"}
      />
      <Alert>{error}</Alert>
      <Card>
        <form className="form-grid" onSubmit={submit}>
          <FormField label="Name">
            <TextInput
              value={form.name}
              onChange={(e) => u("name", e.target.value)}
              required
            />
          </FormField>
          <FormField label="URL">
            <TextInput
              value={form.url}
              onChange={(e) => u("url", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Icon">
            <TextInput
              value={form.icon}
              onChange={(e) => u("icon", e.target.value)}
            />
          </FormField>
          <FormField label="Parent ID">
            <TextInput
              value={form.parentId}
              onChange={(e) => u("parentId", e.target.value)}
            />
          </FormField>
          <FormField label="Order index">
            <TextInput
              type="number"
              value={form.orderIndex}
              onChange={(e) => u("orderIndex", Number(e.target.value))}
            />
          </FormField>
          <FormField label="Role IDs">
            <TextInput
              value={form.roleIds.join(",")}
              onChange={(e) =>
                u(
                  "roleIds",
                  e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                )
              }
            />
          </FormField>
          <CheckboxInput
            label="Public"
            checked={form.isPublic}
            onChange={(e) => u("isPublic", e.target.checked)}
          />
          <CheckboxInput
            label="Active"
            checked={form.active}
            onChange={(e) => u("active", e.target.checked)}
          />
          <div className="form-actions">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => nav("/menu-items")}
            >
              Cancel
            </button>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Card>
    </>
  );
}
