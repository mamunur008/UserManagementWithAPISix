-- Additive tables for the professional UserManagement UI.
-- accounts_db.txt has role/user/menu/organization/payment/saga tables; it does not include permission and role_permission.
CREATE TABLE IF NOT EXISTS public.permission (
    id uuid PRIMARY KEY,
    name character varying(160) NOT NULL,
    code character varying(160),
    module character varying(80),
    description character varying(400),
    active boolean DEFAULT true,
    voided boolean DEFAULT false,
    created_at bigint,
    updated_at bigint,
    deleted_at bigint,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    server_version integer DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_permission_code ON public.permission(code) WHERE code IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.role_permission (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    synced_at timestamp with time zone,
    CONSTRAINT role_permission_pkey PRIMARY KEY (role_id, permission_id),
    CONSTRAINT role_permission_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT role_permission_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permission(id) ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO public.menu_item (id, name, url, icon, parent_id, order_index, is_public, active, voided, created_at, updated_at, server_version)
VALUES
('00000000-0000-0000-0000-000000000101','Users','/users','users',NULL,1,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
('00000000-0000-0000-0000-000000000102','Roles','/roles','shield',NULL,2,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
('00000000-0000-0000-0000-000000000103','Permissions','/permissions','lock',NULL,3,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
('00000000-0000-0000-0000-000000000104','User Roles','/user-roles','link',NULL,4,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
('00000000-0000-0000-0000-000000000105','Role Permissions','/role-permissions','check',NULL,5,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
('00000000-0000-0000-0000-000000000106','Menu Items','/menu-items','menu',NULL,6,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
('00000000-0000-0000-0000-000000000107','Organizations','/organizations','building',NULL,7,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0),
('00000000-0000-0000-0000-000000000108','Payment Accounts','/payment-accounts','wallet',NULL,8,false,true,false,extract(epoch from now())::bigint,extract(epoch from now())::bigint,0)
ON CONFLICT (id) DO NOTHING;
