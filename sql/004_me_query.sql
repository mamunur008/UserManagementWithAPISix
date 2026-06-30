-- 004_me_query.sql
-- Backend /me query using account_db only for roles, permissions and menus.
-- :keycloak_user_id is the JWT sub claim from X-User-Id header.

WITH current_user AS (
    SELECT *
    FROM public.user_ref
    WHERE keycloak_user_id = :keycloak_user_id::uuid
      AND voided = false
    LIMIT 1
), user_roles AS (
    SELECT DISTINCT r.*
    FROM current_user u
    JOIN public.user_role ur ON ur.user_ref_id = u.id
    JOIN public.role r ON r.id = ur.role_id
    WHERE r.voided = false
), user_permissions AS (
    SELECT DISTINCT p.*
    FROM user_roles r
    JOIN public.role_permission rp ON rp.role_id = r.id
    JOIN public.permission p ON p.id = rp.permission_id
    WHERE p.active = true
      AND p.voided = false
), user_menus AS (
    SELECT DISTINCT mi.*
    FROM public.menu_item mi
    LEFT JOIN public.menu_role mr ON mr.menu_item_id = mi.id
    LEFT JOIN user_roles r ON r.id = mr.role_id
    WHERE mi.active = true
      AND mi.voided = false
      AND (mi.is_public = true OR r.id IS NOT NULL)
)
SELECT
    (
        SELECT json_build_object(
            'id', u.id,
            'subject', u.keycloak_user_id,
            'username', u.username_cache,
            'email', u.email_cache,
            'organizationId', u.organization_id,
            'active', u.active
        )
        FROM current_user u
    ) AS identity,
    (
        SELECT COALESCE(json_agg(json_build_object(
            'id', r.id,
            'name', r.name_cache,
            'isGlobal', r.is_global,
            'isElevated', r.is_elevated
        ) ORDER BY r.name_cache), '[]'::json)
        FROM user_roles r
    ) AS roles,
    (
        SELECT COALESCE(json_agg(json_build_object(
            'id', p.id,
            'key', p.key,
            'code', p.code,
            'module', p.module,
            'name', p.name
        ) ORDER BY p.module, p.key), '[]'::json)
        FROM user_permissions p
    ) AS permissions,
    (
        SELECT COALESCE(json_agg(json_build_object(
            'id', m.id,
            'name', m.name,
            'url', m.url,
            'icon', m.icon,
            'parentId', m.parent_id,
            'orderIndex', m.order_index,
            'isPublic', m.is_public,
            'active', m.active
        ) ORDER BY m.order_index), '[]'::json)
        FROM user_menus m
    ) AS menus;
