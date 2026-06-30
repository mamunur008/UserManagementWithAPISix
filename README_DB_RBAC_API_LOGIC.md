# UserManagement API logic rewrite: account_db is authorization source

This patch keeps the existing APISIX and Keycloak setup. It changes only API logic.

## New rule

Keycloak is used for identity/login only.

account_db is the source of truth for:

- user_ref
- role
- permission
- user_role
- role_permission
- menu_item
- menu_role
- organization
- payment_account

## User create flow

Admin/create-user flow:

1. Create user in Keycloak.
2. Assign one Keycloak login role: `customer` or `admin`.
3. Create `user_ref` in account_db using Keycloak user id.
4. Create `user_role` rows in account_db.
5. Commit saga.
6. If account_db insert fails after Keycloak create, compensate by deleting the Keycloak user.

If `roleIds` is empty/missing, backend assigns a default local account_db role:

- `UserManagement:DefaultRoleName` from configuration, or
- `Admin` when `keycloakRoleName = admin`, otherwise `Customer`.

## User update flow

1. Update Keycloak user profile/enabled status.
2. If `keycloakRoleName` is supplied, update Keycloak login role to `customer` or `admin`.
3. Update account_db user_ref.
4. If `roleIds` is supplied, replace account_db user_role rows.

## /me flow

`/api/me` now uses the Keycloak subject only to find the local `user_ref`.

Roles, permissions and menus come from account_db only:

```text
X-User-Id from APISIX/AuthService -> user_ref.keycloak_user_id
user_ref -> user_role -> role
role -> role_permission -> permission
role -> menu_role -> menu_item
```

Token realm roles are not used for app authorization.

## Request example

```json
{
  "username": "mamun",
  "email": "mm@mm.mm",
  "firstName": "Vendor",
  "lastName": "Rashid",
  "organizationId": "f2e0c8a0-df48-49c3-a3a2-991aa15dd5bd",
  "phone": "01979113353",
  "bio": "test",
  "active": true,
  "keycloakRoleName": "customer",
  "roleIds": [
    "PUT-LOCAL-ACCOUNT-DB-ROLE-ID-HERE"
  ]
}
```

For registration, omit `keycloakRoleName` and `roleIds`; backend defaults to Keycloak role `customer` and local default role `Customer`.

## Modified files

- `src/UserManagement.Application/DTOs/Contracts.cs`
- `src/UserManagement.Application/Abstractions/Interfaces.cs`
- `src/UserManagement.Application/Mapping/DtoMapper.cs`
- `src/UserManagement.Infrastructure/Services/UserService.cs`
- `src/UserManagement.Infrastructure/Services/MeService.cs`
- `src/UserManagement.Infrastructure/Services/RolePermissionMenuServices.cs`
- `src/UserManagement.Infrastructure/DependencyInjection.cs`
- `src/UserManagement.Api/Controllers/MeController.cs`

## After copy

```bash
docker compose build --no-cache usermanagement-api
docker compose up -d usermanagement-api
```

Test:

```bash
curl -i http://127.0.0.1:9080/api/admin/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Session-Id: YOUR_SESSION_ID"
```
