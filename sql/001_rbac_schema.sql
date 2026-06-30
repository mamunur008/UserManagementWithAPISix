-- 001_rbac_schema.sql
-- Rebuild local RBAC permission tables for account_db/usermanagement database.
-- This intentionally DROPS and recreates public.permission and public.role_permission
-- so EF Core can use columns: key, code, module, name.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS public.role_permission;
DROP TABLE IF EXISTS public.permission;

CREATE TABLE public.permission (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key character varying(160) NOT NULL UNIQUE,
    code character varying(160) NOT NULL UNIQUE,
    module character varying(80) NOT NULL,
    name character varying(160) NOT NULL,
    description character varying(400),
    active boolean NOT NULL DEFAULT true,
    voided boolean NOT NULL DEFAULT false,
    created_at bigint NOT NULL DEFAULT extract(epoch from now())::bigint,
    updated_at bigint,
    deleted_at bigint,
    created_by uuid,
    updated_by uuid,
    deleted_by uuid,
    server_version integer NOT NULL DEFAULT 0
);

CREATE TABLE public.role_permission (
    role_id uuid NOT NULL REFERENCES public.role(id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES public.permission(id) ON DELETE CASCADE,
    synced_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX ix_permission_module ON public.permission(module);
CREATE INDEX ix_permission_active ON public.permission(active, voided);
CREATE INDEX ix_role_permission_permission ON public.role_permission(permission_id);

COMMIT;
