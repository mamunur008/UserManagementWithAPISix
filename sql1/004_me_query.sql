-- Backend /me should use this logic.
-- :keycloak_user_id is the token sub claim.
WITH current_user AS (
  SELECT * FROM public.user_ref WHERE keycloak_user_id = :keycloak_user_id::uuid AND voided = false LIMIT 1
), user_roles AS (
  SELECT r.* FROM current_user u JOIN public.user_role ur ON ur.user_ref_id = u.id JOIN public.role r ON r.id = ur.role_id WHERE r.voided = false
), user_permissions AS (
  SELECT DISTINCT p.* FROM user_roles r JOIN public.role_permission rp ON rp.role_id = r.id JOIN public.permission p ON p.id = rp.permission_id WHERE p.active = true AND p.voided = false
), user_menus AS (
  SELECT DISTINCT mi.* FROM public.menu_item mi
  LEFT JOIN public.menu_role mr ON mr.menu_item_id = mi.id
  LEFT JOIN user_roles r ON r.id = mr.role_id
  WHERE mi.active = true AND mi.voided = false AND (mi.is_public = true OR r.id IS NOT NULL)
)
SELECT
  (SELECT row_to_json(u) FROM current_user u) AS identity,
  (SELECT COALESCE(json_agg(name_cache ORDER BY name_cache), '[]'::json) FROM user_roles) AS roles,
  (SELECT COALESCE(json_agg(key ORDER BY key), '[]'::json) FROM user_permissions) AS permissions,
  (SELECT COALESCE(json_agg(row_to_json(m) ORDER BY m.order_index), '[]'::json) FROM user_menus m) AS menus;
