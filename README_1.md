# UserManagement — Accounts DB based architecture

This generated project follows the uploaded `admin_api_collection.json` URL and variable style and now maps the backend entities to the uploaded `accounts_db.txt` PostgreSQL schema.

## Important URL contract

Postman-style variables:

```text
gatewayUrl = http://127.0.0.1:9080
apiPrefix  = /api/admin
baseUrl    = {{gatewayUrl}}{{apiPrefix}}
kcBaseUrl  = http://localhost:8080
kcRealm    = usermanagement
```

Main APIs:

```text
GET  {{baseUrl}}/me
GET  {{baseUrl}}/users
POST {{baseUrl}}/users
PUT  {{baseUrl}}/users/{{userId}}
GET  {{baseUrl}}/users/{{userId}}/roles
POST {{baseUrl}}/users/{{userId}}/roles/{{roleId}}
DELETE {{baseUrl}}/users/{{userId}}/roles/{{roleId}}
GET  {{baseUrl}}/roles
POST {{baseUrl}}/roles
PUT  {{baseUrl}}/roles/{{roleId}}/org-types
GET  {{baseUrl}}/organizations
GET  {{baseUrl}}/organization-types
GET  {{baseUrl}}/payment-accounts
POST {{baseUrl}}/payment-accounts
GET  {{baseUrl}}/menu-items
PUT  {{baseUrl}}/menu-items/{{menuItemId}}/roles
```

Login/logout uses the Keycloak hosted flow from React, not a custom username/password login page. The token endpoint remains:

```text
{{kcBaseUrl}}/realms/{{kcRealm}}/protocol/openid-connect/token
```

## Architecture

```text
React + Redux Toolkit + Tailwind latest
        |
        | OIDC Authorization Code + PKCE
        v
Keycloak hosted login page
        |
        | Bearer token
        v
APISIX /api/admin/*
        |
        | forward-auth
        v
AuthService -> Redis session/token cache -> Keycloak introspection when cache misses
        |
        v
UserManagement.Api -> EF Core -> PostgreSQL accounts_db
```

## Backend design

- Controllers contain routing only.
- Business logic lives in services.
- Persistence is behind EF Core `UserManagementDbContext`.
- Local database starts with PostgreSQL and can later be changed by replacing the Infrastructure persistence provider.
- User write-through is orchestrated with `saga_log`:
  - create user in Keycloak
  - create local `user_ref`
  - retry Keycloak operations
  - compensate by deleting Keycloak user when local save fails

## Database mapping from accounts_db.txt

The project maps these uploaded tables directly:

```text
api_key
menu_item
menu_role
organization
organization_type
payment_account
role
role_org_type
saga_log
server_version
user
user_profile
user_ref
user_role
```

The uploaded schema did not include permission tables, so this project adds:

```text
permission
role_permission
```

These are needed for the UI sections Permission and Permission in Role.

## Run

```bash
docker compose down -v
docker compose up -d --build
```

Use `down -v` only for local dev because it removes database volumes and reruns the SQL seed scripts.

## URLs

```text
Frontend:              http://localhost:5173
APISIX Gateway:         http://127.0.0.1:9080
Keycloak:               http://localhost:8080
UserManagement direct:  http://127.0.0.1:9044
AuthService direct:     http://127.0.0.1:8082
Postgres app DB:        localhost:5433 / accounts_db / catena / catena
```

## Local Keycloak

```text
Admin console: http://localhost:8080/admin
Admin user:    admin
Admin pass:    admin
Realm:         usermanagement
App user:      admin@local.test
App pass:      Admin@12345
```

## Entity notes

- `public."user"` is kept as the legacy/local admin table from the uploaded dump.
- Keycloak-backed application users are stored in `public.user_ref`, matching the saga/user references in the dump.
- `public.role` stores local role metadata and the Keycloak realm role id in `keycloak_role_id`.
- `public.user_role` maps `user_ref` to `role`.
- `public.menu_role` maps menu access to roles.
