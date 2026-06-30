-- Seed base permissions and menu items.
INSERT INTO public.permission(id, key, name, description, active, voided, created_at, updated_at)
SELECT gen_random_uuid(), v.key, v.name, v.description, true, false, extract(epoch from now())::bigint, extract(epoch from now())::bigint
FROM (VALUES
 ('permission:users.read','Users - Read','View users'),('permission:users.create','Users - Create','Create users'),('permission:users.update','Users - Update','Edit users'),('permission:users.delete','Users - Delete','Delete/deactivate users'),('permission:users.roles.read','User Roles - Read','View user role mappings'),('permission:users.roles.assign','User Roles - Assign','Assign role to user'),('permission:users.roles.remove','User Roles - Remove','Remove role from user'),
 ('permission:roles.read','Roles - Read','View roles'),('permission:roles.create','Roles - Create','Create roles'),('permission:roles.update','Roles - Update','Edit roles'),('permission:roles.delete','Roles - Delete','Delete roles'),
 ('permission:permissions.read','Permissions - Read','View permissions'),('permission:permissions.create','Permissions - Create','Create permissions'),('permission:permissions.update','Permissions - Update','Edit permissions'),('permission:permissions.delete','Permissions - Delete','Delete permissions'),
 ('permission:rolepermissions.read','Role Permissions - Read','View role permissions'),('permission:rolepermissions.create','Role Permissions - Create','Assign permission to role'),('permission:rolepermissions.update','Role Permissions - Update','Edit role permissions'),('permission:rolepermissions.delete','Role Permissions - Delete','Remove permission from role'),
 ('permission:menu.read','Menu - Read','View menus'),('permission:menu.create','Menu - Create','Create menu'),('permission:menu.update','Menu - Update','Edit menu'),('permission:menu.delete','Menu - Delete','Delete menu'),
 ('permission:organizations.read','Organizations - Read','View organizations'),('permission:organizations.create','Organizations - Create','Create organizations'),('permission:organizations.update','Organizations - Update','Edit organizations'),('permission:organizations.delete','Organizations - Delete','Delete organizations'),
 ('permission:paymentaccounts.read','Payment Accounts - Read','View payment accounts'),('permission:paymentaccounts.create','Payment Accounts - Create','Create payment accounts'),('permission:paymentaccounts.update','Payment Accounts - Update','Edit payment accounts'),('permission:paymentaccounts.delete','Payment Accounts - Delete','Delete payment accounts')
) AS v(key,name,description)
ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, active = true, voided = false, updated_at = extract(epoch from now())::bigint;

INSERT INTO public.menu_item(id, name, url, icon, parent_id, order_index, is_public, active, voided, created_at, updated_at, server_version)
SELECT gen_random_uuid(), v.name, v.url, v.icon, NULL, v.order_index, false, true, false, extract(epoch from now())::bigint, extract(epoch from now())::bigint, 0
FROM (VALUES
 ('Users','/users','users',1),('Roles','/roles','shield',2),('Permissions','/permissions','lock',3),('User Roles','/user-roles','link',4),('Role Permissions','/role-permissions','check',5),('Menu','/menu-items','menu',6),('Organizations','/organizations','organization',7),('Payment Accounts','/payment-accounts','payment',8)
) AS v(name,url,icon,order_index)
ON CONFLICT (id) DO NOTHING;
