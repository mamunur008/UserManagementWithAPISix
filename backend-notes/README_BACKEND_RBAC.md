# Backend RBAC changes

Use Keycloak only for identity, user provisioning, role provisioning and login.
Use the UserManagement/accounts database as the source of truth for:

- role
- permission
- user_role
- role_permission
- menu_item
- menu_role

## Write flow

User create/update:
1. Start saga_log operation CREATE_USER or UPDATE_USER.
2. Create/update user in Keycloak using Admin API.
3. Create/update local user_ref.
4. Commit saga_log.
5. If local write fails after Keycloak create, compensate by disabling/deleting the Keycloak user.

Role create/update:
1. Start saga_log operation CREATE_ROLE or UPDATE_ROLE.
2. Create/update realm role in Keycloak.
3. Create/update local role.
4. Commit saga_log.
5. If local write fails after Keycloak create, compensate by deleting the Keycloak role if safe.

Permission, user_role, role_permission, menu_role:
Manage locally only in UserManagement DB.

## /me response

Return:

```json
{
  "identity": { ... },
  "roles": ["admin", "Customer"],
  "permissions": ["permission:users.read", "permission:users.update"],
  "menus": [ { "name": "Users", "url": "/users" } ]
}
```

Frontend uses `permissions` for page wrappers and buttons, and `menus` for sidebar generation.
