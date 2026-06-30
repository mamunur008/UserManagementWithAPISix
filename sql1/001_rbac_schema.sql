-- Adds local RBAC tables missing from accounts_db.txt.
-- Run against the usermanagement/accounts database.
CREATE TABLE IF NOT EXISTS public.permission (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key character varying(160) NOT NULL UNIQUE,
    name character varying(160),
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

CREATE TABLE IF NOT EXISTS public.role_permission (
    role_id uuid NOT NULL REFERENCES public.role(id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES public.permission(id) ON DELETE CASCADE,
    synced_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS ix_permission_active ON public.permission(active, voided);
CREATE INDEX IF NOT EXISTS ix_role_permission_permission ON public.role_permission(permission_id);
