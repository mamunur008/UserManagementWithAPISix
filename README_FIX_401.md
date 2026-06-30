# 401 Fix Notes

This build fixes APISIX/AuthService 401 after successful Keycloak login.

## What changed

1. Frontend now sends both headers on every API call:
   - `Authorization: Bearer <access_token>`
   - `X-Session-Id: <Keycloak sid claim>`

2. React callback page has a guard so Keycloak authorization code is exchanged only once.

3. AuthService no longer depends on Keycloak token introspection for SPA access-token validation. It validates JWT locally using:
   - issuer: `http://localhost:8080/realms/usermanagement`
   - JWKS: `http://keycloak:8080/realms/usermanagement/protocol/openid-connect/certs`

   This solves the Docker issue where browser-issued tokens contain `localhost` as issuer, while containers must reach Keycloak by service name `keycloak`.

4. APISIX route config is separated correctly from `docker-compose.yml`.

## Run clean

Because Keycloak realm import and Postgres init SQL run only on first volume creation:

```bash
docker compose down -v
docker compose up -d --build
```

## Test

After logging in from frontend, inspect `/api/admin/me` request. It must include:

```text
Authorization: Bearer ...
X-Session-Id: ...
```

Then check AuthService logs:

```bash
docker compose logs -f auth-service
```
