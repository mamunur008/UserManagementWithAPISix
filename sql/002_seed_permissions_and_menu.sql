-- 002_seed_permissions_and_menu.sql
-- Clears generated RBAC seed data and regenerates local roles, permissions, menu,
-- role_permission and menu_role data from account_db only.
-- Keycloak is not used for permissions, role_permission or menu.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Clear generated mappings first.
DELETE FROM public.menu_role
WHERE menu_item_id IN (
    SELECT id FROM public.menu_item
    WHERE url IN (
        '/dashboard', '/users', '/roles', '/permissions', '/user-roles',
        '/role-permissions', '/menu-items', '/organizations',
        '/organization-types', '/payment-accounts'
    )
);

TRUNCATE TABLE public.role_permission;
DELETE FROM public.permission;

DELETE FROM public.menu_item
WHERE url IN (
    '/dashboard', '/users', '/roles', '/permissions', '/user-roles',
    '/role-permissions', '/menu-items', '/organizations',
    '/organization-types', '/payment-accounts'
);

-- Ensure local application roles exist.
-- admin/customer may later receive Keycloak role ids from 003_keycloak_import_using_fdw.sql.
INSERT INTO public.role(id, name_cache, is_global, is_elevated, description, voided, created_at, updated_at, server_version)
VALUES
 ('00000000-0000-0000-0000-000000000001', 'admin',        true, true,  'System administrator', false, extract(epoch from now())::bigint, extract(epoch from now())::bigint, 0),
 ('00000000-0000-0000-0000-000000000002', 'customer',     true, false, 'Default registered customer', false, extract(epoch from now())::bigint, extract(epoch from now())::bigint, 0),
 ('00000000-0000-0000-0000-000000000003', 'user-manager', true, false, 'Can manage users and user roles', false, extract(epoch from now())::bigint, extract(epoch from now())::bigint, 0),
 ('00000000-0000-0000-0000-000000000004', 'role-manager', true, false, 'Can manage roles, permissions and menus', false, extract(epoch from now())::bigint, extract(epoch from now())::bigint, 0)
ON CONFLICT (name_cache) DO UPDATE SET
    is_global = EXCLUDED.is_global,
    is_elevated = EXCLUDED.is_elevated,
    description = EXCLUDED.description,
    voided = false,
    updated_at = extract(epoch from now())::bigint;

-- Permissions: code copies key. module is the business area used by EF/API ordering/filtering.
INSERT INTO public.permission(id, key, code, module, name, description, active, voided, created_at, updated_at, server_version)
SELECT gen_random_uuid(), v.key, v.key, v.module, v.name, v.description, true, false,
       extract(epoch from now())::bigint, extract(epoch from now())::bigint, 0
FROM (VALUES
    -- Dashboard
    ('permission:dashboard.read', 'dashboard', 'Dashboard - Read', 'View dashboard'),

    -- Users
    ('permission:users.read', 'user', 'Users - Read', 'View users'),
    ('permission:users.create', 'user', 'Users - Create', 'Create users'),
    ('permission:users.update', 'user', 'Users - Update', 'Edit users'),
    ('permission:users.delete', 'user', 'Users - Delete', 'Delete/deactivate users'),

    -- User roles
    ('permission:userroles.read', 'user-role', 'User Roles - Read', 'View user role mappings'),
    ('permission:userroles.assign', 'user-role', 'User Roles - Assign', 'Assign role to user'),
    ('permission:userroles.remove', 'user-role', 'User Roles - Remove', 'Remove role from user'),

    -- Roles
    ('permission:roles.read', 'role', 'Roles - Read', 'View roles'),
    ('permission:roles.create', 'role', 'Roles - Create', 'Create roles'),
    ('permission:roles.update', 'role', 'Roles - Update', 'Edit roles'),
    ('permission:roles.delete', 'role', 'Roles - Delete', 'Delete roles'),

    -- Permissions
    ('permission:permissions.read', 'permission', 'Permissions - Read', 'View permissions'),
    ('permission:permissions.create', 'permission', 'Permissions - Create', 'Create permissions'),
    ('permission:permissions.update', 'permission', 'Permissions - Update', 'Edit permissions'),
    ('permission:permissions.delete', 'permission', 'Permissions - Delete', 'Delete permissions'),

    -- Role permissions
    ('permission:rolepermissions.read', 'role-permission', 'Role Permissions - Read', 'View role permissions'),
    ('permission:rolepermissions.assign', 'role-permission', 'Role Permissions - Assign', 'Assign permission to role'),
    ('permission:rolepermissions.remove', 'role-permission', 'Role Permissions - Remove', 'Remove permission from role'),

    -- Menu
    ('permission:menu.read', 'menu', 'Menu - Read', 'View menus'),
    ('permission:menu.create', 'menu', 'Menu - Create', 'Create menu'),
    ('permission:menu.update', 'menu', 'Menu - Update', 'Edit menu'),
    ('permission:menu.delete', 'menu', 'Menu - Delete', 'Delete menu'),

    -- Organizations
    ('permission:organizations.read', 'organization', 'Organizations - Read', 'View organizations'),
    ('permission:organizations.create', 'organization', 'Organizations - Create', 'Create organizations'),
    ('permission:organizations.update', 'organization', 'Organizations - Update', 'Edit organizations'),
    ('permission:organizations.delete', 'organization', 'Organizations - Delete', 'Delete organizations'),

    -- Organization types
    ('permission:organizationtypes.read', 'organization-type', 'Organization Types - Read', 'View organization types'),
    ('permission:organizationtypes.create', 'organization-type', 'Organization Types - Create', 'Create organization types'),
    ('permission:organizationtypes.update', 'organization-type', 'Organization Types - Update', 'Edit organization types'),
    ('permission:organizationtypes.delete', 'organization-type', 'Organization Types - Delete', 'Delete organization types'),

    -- Payment accounts
    ('permission:paymentaccounts.read', 'payment-account', 'Payment Accounts - Read', 'View payment accounts'),
    ('permission:paymentaccounts.create', 'payment-account', 'Payment Accounts - Create', 'Create payment accounts'),
    ('permission:paymentaccounts.update', 'payment-account', 'Payment Accounts - Update', 'Edit payment accounts'),
    ('permission:paymentaccounts.delete', 'payment-account', 'Payment Accounts - Delete', 'Delete payment accounts')
) AS v(key, module, name, description)
ON CONFLICT (key) DO UPDATE SET
    code = EXCLUDED.code,
    module = EXCLUDED.module,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    active = true,
    voided = false,
    updated_at = extract(epoch from now())::bigint;

-- Stable menu ids make the script repeatable.
INSERT INTO public.menu_item(id, name, url, icon, parent_id, order_index, is_public, active, voided, created_at, updated_at, server_version)
VALUES
 ('10000000-0000-0000-0000-000000000001','Dashboard','/dashboard','dashboard',NULL,0,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
 ('10000000-0000-0000-0000-000000000002','Users','/users','users',NULL,1,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
 ('10000000-0000-0000-0000-000000000003','Roles','/roles','shield',NULL,2,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
 ('10000000-0000-0000-0000-000000000004','Permissions','/permissions','lock',NULL,3,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
 ('10000000-0000-0000-0000-000000000005','User Roles','/user-roles','link',NULL,4,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
 ('10000000-0000-0000-0000-000000000006','Role Permissions','/role-permissions','check',NULL,5,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
 ('10000000-0000-0000-0000-000000000007','Menu','/menu-items','menu',NULL,6,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
 ('10000000-0000-0000-0000-000000000008','Organizations','/organizations','organization',NULL,7,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
 ('10000000-0000-0000-0000-000000000009','Organization Types','/organization-types','organization',NULL,8,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
 ('10000000-0000-0000-0000-000000000010','Payment Accounts','/payment-accounts','payment',NULL,9,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    url = EXCLUDED.url,
    icon = EXCLUDED.icon,
    parent_id = EXCLUDED.parent_id,
    order_index = EXCLUDED.order_index,
    is_public = EXCLUDED.is_public,
    active = EXCLUDED.active,
    voided = false,
    updated_at = extract(epoch from now())::bigint;

-- Role -> permission policy.
-- Admin gets everything.
INSERT INTO public.role_permission(role_id, permission_id, synced_at)
SELECT r.id, p.id, now()
FROM public.role r
CROSS JOIN public.permission p
WHERE lower(r.name_cache) = 'admin'
ON CONFLICT (role_id, permission_id) DO UPDATE SET synced_at = now();

-- User manager permissions.
INSERT INTO public.role_permission(role_id, permission_id, synced_at)
SELECT r.id, p.id, now()
FROM public.role r
JOIN public.permission p ON p.module IN ('dashboard', 'user', 'user-role', 'organization')
WHERE lower(r.name_cache) = 'user-manager'
ON CONFLICT (role_id, permission_id) DO UPDATE SET synced_at = now();

-- Role manager permissions.
INSERT INTO public.role_permission(role_id, permission_id, synced_at)
SELECT r.id, p.id, now()
FROM public.role r
JOIN public.permission p ON p.module IN ('dashboard', 'role', 'permission', 'role-permission', 'menu')
WHERE lower(r.name_cache) = 'role-manager'
ON CONFLICT (role_id, permission_id) DO UPDATE SET synced_at = now();

-- Customer minimal permissions.
INSERT INTO public.role_permission(role_id, permission_id, synced_at)
SELECT r.id, p.id, now()
FROM public.role r
JOIN public.permission p ON p.key IN ('permission:dashboard.read')
WHERE lower(r.name_cache) = 'customer'
ON CONFLICT (role_id, permission_id) DO UPDATE SET synced_at = now();

-- Menu access by role.
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
WHERE lower(r.name_cache) = 'user-manager'
  AND mi.url IN ('/dashboard','/users','/user-roles','/organizations')
ON CONFLICT (menu_item_id, role_id) DO NOTHING;

INSERT INTO public.menu_role(menu_item_id, role_id)
SELECT mi.id, r.id
FROM public.menu_item mi
CROSS JOIN public.role r
WHERE lower(r.name_cache) = 'role-manager'
  AND mi.url IN ('/dashboard','/roles','/permissions','/role-permissions','/menu-items')
ON CONFLICT (menu_item_id, role_id) DO NOTHING;

INSERT INTO public.menu_role(menu_item_id, role_id)
SELECT mi.id, r.id
FROM public.menu_item mi
CROSS JOIN public.role r
WHERE lower(r.name_cache) = 'customer'
  AND mi.url IN ('/dashboard')
ON CONFLICT (menu_item_id, role_id) DO NOTHING;

COMMIT;
