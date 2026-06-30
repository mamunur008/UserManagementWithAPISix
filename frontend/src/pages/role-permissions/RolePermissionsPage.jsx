import { useEffect, useMemo, useState } from 'react';
import { http } from '../../lib/httpClient.js';

function normalizeRows(response) {
  const data = response?.data ?? response ?? [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

function getPermissionCode(permission) {
  return permission?.code || permission?.key || permission?.name || permission?.id;
}

export function RolePermissionsPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [saving, setSaving] = useState(false);

  const selectedRole = useMemo(() => roles.find((x) => x.id === selectedRoleId), [roles, selectedRoleId]);

  useEffect(() => {
    async function loadInitialData() {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        http.get('/roles'),
        http.get('/permissions')
      ]);
      setRoles(normalizeRows(rolesResponse));
      setPermissions(normalizeRows(permissionsResponse));
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadRolePermissions() {
      if (!selectedRoleId) {
        setSelectedPermissionIds([]);
        return;
      }
      const response = await http.get(`/role-permissions/${selectedRoleId}`);
      const assigned = normalizeRows(response);
      setSelectedPermissionIds(assigned.map((x) => x.id || x.permissionId).filter(Boolean));
    }
    loadRolePermissions();
  }, [selectedRoleId]);

  function togglePermission(permissionId) {
    setSelectedPermissionIds((current) => {
      if (current.includes(permissionId)) return current.filter((x) => x !== permissionId);
      return [...current, permissionId];
    });
  }

  async function savePermissions() {
    if (!selectedRoleId) {
      alert('Please select a role first.');
      return;
    }
    try {
      setSaving(true);
      await http.put(`/role-permissions/${selectedRoleId}`, { permissionIds: selectedPermissionIds });
      alert('Permissions updated successfully.');
    } catch (error) {
      console.error('Failed to update role permissions', error);
      alert(error?.response?.data?.message || error?.message || 'Failed to update permissions.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="section-label">Access Control</p>
          <h1 className="m-0 text-4xl font-black tracking-[-0.05em] text-ink">Role Permissions</h1>
          <p className="mt-2 text-muted">Select a role and assign permissions using the checkbox list.</p>
        </div>
        <button type="button" onClick={savePermissions} disabled={!selectedRoleId || saving} className="add-btn">
          {saving ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>

      <div className="card">
        <label>
          <span className="font-black text-ink">Role</span>
          <select value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)} className="form-input max-w-xl">
            <option value="">Select role</option>
            {roles.map((role) => <option key={role.id} value={role.id}>{role.name || role.nameCache || role.description}</option>)}
          </select>
        </label>

        {selectedRole ? (
          <div className="mt-5 rounded-2xl border border-line bg-panel-soft p-4">
            <strong>{selectedRole.name}</strong>
            <p className="mt-1 text-muted">{selectedRole.description || 'No description'}</p>
          </div>
        ) : null}
      </div>

      <div className="card">
        <h2 className="card-title">Permissions</h2>
        <p className="card-description">Checked permissions are already assigned to the selected role.</p>
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {permissions.map((permission) => {
            const checked = selectedPermissionIds.includes(permission.id);
            return (
              <label key={permission.id} className={`cursor-pointer rounded-2xl border p-4 transition ${checked ? 'border-brand bg-brand-soft' : 'border-line bg-white hover:bg-panel-soft'}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={checked} disabled={!selectedRoleId} onChange={() => togglePermission(permission.id)} className="mt-1 h-5 w-5 accent-brand" />
                  <div>
                    <strong className="block text-ink">{permission.name || getPermissionCode(permission)}</strong>
                    <span className="mt-1 block text-sm font-bold text-muted">{getPermissionCode(permission)}</span>
                    {permission.module ? <span className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-black text-brand-dark">{permission.module}</span> : null}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );
}
