-- 003_keycloak_import_using_fdw.sql
-- One-time import/sync from Keycloak PostgreSQL into account_db/usermanagement.
-- Final architecture:
--   Keycloak: identity + login roles only (customer/admin)
--   account_db: application roles, permissions, user_role, role_permission, menu_role
-- This script does NOT import permission roles or role_permission composites from Keycloak.

BEGIN;

CREATE EXTENSION IF NOT EXISTS postgres_fdw;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP SERVER IF EXISTS keycloak_fdw CASCADE;
CREATE SERVER keycloak_fdw FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'keycloak-postgres', port '5432', dbname 'keycloak');
CREATE USER MAPPING FOR CURRENT_USER SERVER keycloak_fdw OPTIONS (user 'keycloak', password 'keycloak');

CREATE SCHEMA IF NOT EXISTS keycloak_fdw;
IMPORT FOREIGN SCHEMA public LIMIT TO (realm, user_entity, keycloak_role, user_role_mapping) FROM SERVER keycloak_fdw INTO keycloak_fdw;

-- Sync Keycloak users to local user_ref.
INSERT INTO public.user_ref(id, keycloak_user_id, username_cache, email_cache, active, voided, created_at, updated_at, server_version)
SELECT gen_random_uuid(), ue.id::uuid, ue.username, ue.email, COALESCE(ue.enabled, true), false,
       extract(epoch from now())::bigint, extract(epoch from now())::bigint, 0
FROM keycloak_fdw.user_entity ue
JOIN keycloak_fdw.realm r ON r.id = ue.realm_id
WHERE r.name = 'usermanagement'
ON CONFLICT (keycloak_user_id) DO UPDATE SET
    username_cache = EXCLUDED.username_cache,
    email_cache = EXCLUDED.email_cache,
    active = EXCLUDED.active,
    updated_at = extract(epoch from now())::bigint;

-- Sync ONLY Keycloak login roles to local role table.
-- Do not sync permission:* roles. Permissions are local DB only.
INSERT INTO public.role(id, keycloak_role_id, name_cache, is_global, is_elevated, description, voided, created_at, updated_at, server_version)
SELECT gen_random_uuid(), kr.id::uuid, lower(kr.name), true,
       CASE WHEN lower(kr.name) = 'admin' THEN true ELSE false END,
       kr.description, false, extract(epoch from now())::bigint, extract(epoch from now())::bigint, 0
FROM keycloak_fdw.keycloak_role kr
JOIN keycloak_fdw.realm r ON r.id = kr.realm_id
WHERE r.name = 'usermanagement'
  AND kr.client_realm_constraint = r.id
  AND lower(kr.name) IN ('admin', 'customer')
ON CONFLICT (name_cache) DO UPDATE SET
    keycloak_role_id = EXCLUDED.keycloak_role_id,
    is_elevated = EXCLUDED.is_elevated,
    description = COALESCE(EXCLUDED.description, public.role.description),
    voided = false,
    updated_at = extract(epoch from now())::bigint;

-- Sync Keycloak user-role mappings for admin/customer into local user_role.
-- This is a bootstrap sync. After that, your app should manage user_role in account_db.
INSERT INTO public.user_role(user_ref_id, role_id, synced_at)
SELECT ur.id, lr.id, now()
FROM keycloak_fdw.user_role_mapping urm
JOIN keycloak_fdw.user_entity ue ON ue.id = urm.user_id
JOIN public.user_ref ur ON ur.keycloak_user_id = ue.id::uuid
JOIN keycloak_fdw.keycloak_role kr ON kr.id = urm.role_id
JOIN public.role lr ON lr.keycloak_role_id = kr.id::uuid
WHERE lower(kr.name) IN ('admin', 'customer')
ON CONFLICT (user_ref_id, role_id) DO UPDATE SET synced_at = now();

-- Re-apply local default role-permission/menu-role policy after Keycloak role ids are synced.
INSERT INTO public.role_permission(role_id, permission_id, synced_at)
SELECT r.id, p.id, now()
FROM public.role r
CROSS JOIN public.permission p
WHERE lower(r.name_cache) = 'admin'
ON CONFLICT (role_id, permission_id) DO UPDATE SET synced_at = now();

INSERT INTO public.role_permission(role_id, permission_id, synced_at)
SELECT r.id, p.id, now()
FROM public.role r
JOIN public.permission p ON p.key IN ('permission:dashboard.read')
WHERE lower(r.name_cache) = 'customer'
ON CONFLICT (role_id, permission_id) DO UPDATE SET synced_at = now();

INSERT INTO public.menu_role(menu_item_id, role_id)
SELECT mi.id, r.id
FROM public.menu_item mi
CROSS JOIN public.role r
WHERE lower(r.name_cache) = 'admin'
  AND mi.url IN ('/dashboard','/users','/roles','/permissions','/user-roles','/role-permissions','/menu-items','/organizations','/organization-types','/payment-accounts')
ON CONFLICT (menu_item_id, role_id) DO NOTHING;

INSERT INTO public.menu_role(menu_item_id, role_id)
SELECT mi.id, r.id
FROM public.menu_item mi
CROSS JOIN public.role r
WHERE lower(r.name_cache) = 'customer'
  AND mi.url IN ('/dashboard')
ON CONFLICT (menu_item_id, role_id) DO NOTHING;

COMMIT;
