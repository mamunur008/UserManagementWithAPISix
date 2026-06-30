-- One-time import/sync from Keycloak PostgreSQL into UserManagement DB.
-- Run in app-postgres DB. It assumes app-postgres can reach host keycloak-postgres:5432.
-- Keycloak role names beginning with 'permission:' become local permissions.
-- Other realm roles become local roles.
CREATE EXTENSION IF NOT EXISTS postgres_fdw;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP SERVER IF EXISTS keycloak_fdw CASCADE;
CREATE SERVER keycloak_fdw FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'keycloak-postgres', port '5432', dbname 'keycloak');
CREATE USER MAPPING FOR CURRENT_USER SERVER keycloak_fdw OPTIONS (user 'keycloak', password 'keycloak');

CREATE SCHEMA IF NOT EXISTS keycloak_fdw;
IMPORT FOREIGN SCHEMA public LIMIT TO (realm, user_entity, keycloak_role, user_role_mapping, composite_role) FROM SERVER keycloak_fdw INTO keycloak_fdw;

-- Sync users to user_ref
INSERT INTO public.user_ref(id, keycloak_user_id, username_cache, email_cache, active, voided, created_at, updated_at, server_version)
SELECT gen_random_uuid(), ue.id::uuid, ue.username, ue.email, COALESCE(ue.enabled, true), false, extract(epoch from now())::bigint, extract(epoch from now())::bigint, 0
FROM keycloak_fdw.user_entity ue
JOIN keycloak_fdw.realm r ON r.id = ue.realm_id
WHERE r.name = 'usermanagement'
ON CONFLICT (keycloak_user_id) DO UPDATE SET username_cache=EXCLUDED.username_cache, email_cache=EXCLUDED.email_cache, active=EXCLUDED.active, updated_at=extract(epoch from now())::bigint;

-- Sync roles from Keycloak except permissions and default/offline roles
INSERT INTO public.role(id, keycloak_role_id, name_cache, is_global, is_elevated, description, voided, created_at, updated_at, server_version)
SELECT gen_random_uuid(), kr.id::uuid, kr.name, true, false, kr.description, false, extract(epoch from now())::bigint, extract(epoch from now())::bigint, 0
FROM keycloak_fdw.keycloak_role kr
JOIN keycloak_fdw.realm r ON r.id = kr.realm_id
WHERE r.name='usermanagement'
  AND kr.client_realm_constraint = r.id
  AND kr.name NOT LIKE 'permission:%'
  AND kr.name NOT IN ('offline_access','uma_authorization','default-roles-usermanagement')
ON CONFLICT (name_cache) DO UPDATE SET keycloak_role_id=EXCLUDED.keycloak_role_id, description=EXCLUDED.description, voided=false, updated_at=extract(epoch from now())::bigint;

-- Sync Keycloak permission roles into local permission table
INSERT INTO public.permission(id, key, name, description, active, voided, created_at, updated_at, server_version)
SELECT gen_random_uuid(), kr.name, kr.name, kr.description, true, false, extract(epoch from now())::bigint, extract(epoch from now())::bigint, 0
FROM keycloak_fdw.keycloak_role kr
JOIN keycloak_fdw.realm r ON r.id = kr.realm_id
WHERE r.name='usermanagement' AND kr.name LIKE 'permission:%'
ON CONFLICT (key) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, active=true, voided=false, updated_at=extract(epoch from now())::bigint;

-- Sync Keycloak user-role mappings into local user_role. Only local roles are used after import.
INSERT INTO public.user_role(user_ref_id, role_id, synced_at)
SELECT ur.id, lr.id, now()
FROM keycloak_fdw.user_role_mapping urm
JOIN keycloak_fdw.user_entity ue ON ue.id = urm.user_id
JOIN public.user_ref ur ON ur.keycloak_user_id = ue.id::uuid
JOIN public.role lr ON lr.keycloak_role_id = urm.role_id::uuid
ON CONFLICT (user_ref_id, role_id) DO UPDATE SET synced_at = now();

-- Sync Keycloak composite role mappings to role_permission when parent role contains child permission role.
/*
INSERT INTO public.role_permission(role_id, permission_id, synced_at)
SELECT parent_local.id, p.id, now()
FROM keycloak_fdw.composite_role cr
JOIN keycloak_fdw.keycloak_role parent_kr ON parent_kr.id = cr.composite
JOIN keycloak_fdw.keycloak_role child_kr ON child_kr.id = cr.child_role
JOIN public.role parent_local ON parent_local.keycloak_role_id = parent_kr.id::uuid
JOIN public.permission p ON p.key = child_kr.name
WHERE child_kr.name LIKE 'permission:%'
ON CONFLICT (role_id, permission_id) DO UPDATE SET synced_at = now(); */

-- for Admin permission
WITH src AS (
    SELECT 
        r.id AS role_id,
        p.id AS permission_id,
        now() AS synced_at
    FROM public."role" r
    CROSS JOIN public.permission p
    WHERE r.name_cache = 'admin'
      AND p.key LIKE 'permission:%'
)
INSERT INTO public.role_permission (
    role_id,
    permission_id,
    synced_at
)
SELECT 
    role_id,
    permission_id,
    synced_at
FROM src
ON CONFLICT ON CONSTRAINT role_permission_pkey
DO UPDATE SET 
    synced_at = EXCLUDED.synced_at;
	
-- check if Admin gets permission
SELECT 
    r.name_cache AS role_name,
    p.key AS permission_key,
    rp.synced_at
FROM public.role_permission rp
JOIN public."role" r 
    ON r.id = rp.role_id
JOIN public.permission p 
    ON p.id = rp.permission_id
ORDER BY r.name_cache, p.key;	

-- For user-manager, run:
WITH src AS (
    SELECT 
        r.id AS role_id,
        p.id AS permission_id,
        now() AS synced_at
    FROM public."role" r
    JOIN public.permission p 
        ON p.key IN (
            'permission:users.read',
            'permission:users.create',
            'permission:users.update'
        )
    WHERE r.name_cache = 'user-manager'
)
INSERT INTO public.role_permission (
    role_id,
    permission_id,
    synced_at
)
SELECT 
    role_id,
    permission_id,
    synced_at
FROM src
ON CONFLICT ON CONSTRAINT role_permission_pkey
DO UPDATE SET 
    synced_at = EXCLUDED.synced_at;
	
-- for Role-manager run below
WITH src AS (
    SELECT 
        r.id AS role_id,
        p.id AS permission_id,
        now() AS synced_at
    FROM public."role" r
    JOIN public.permission p 
        ON p.key IN (
            'permission:roles.read',
            'permission:roles.assign'
        )
    WHERE r.name_cache = 'role-manager'
)
INSERT INTO public.role_permission (
    role_id,
    permission_id,
    synced_at
)
SELECT 
    role_id,
    permission_id,
    synced_at
FROM src
ON CONFLICT ON CONSTRAINT role_permission_pkey
DO UPDATE SET 
    synced_at = EXCLUDED.synced_at;	