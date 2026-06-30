import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setMenus } from "../../features/menu/menuSlice.js";
import {
  setMe,
  setOidcSession,
  setSessionError,
} from "../../features/session/sessionSlice.js";

import { meApi } from "../../services/meApi.js";
import { completeKeycloakLogin } from "../../services/oidc.js";

export function AuthCallbackPage() {
  const processed = useRef(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    async function run() {
      try {
        const oidcUser = await completeKeycloakLogin();

        dispatch(
          setOidcSession({
            accessToken: oidcUser.access_token,
            refreshToken: oidcUser.refresh_token,
            idToken: oidcUser.id_token,
            profile: oidcUser.profile,
          }),
        );

        try {
          const meResponse = await meApi.get();

          const me = meResponse?.data ?? meResponse ?? {};

          const normalizedMe = {
            identity: me.identity ?? {},
            roles: Array.isArray(me.roles) ? me.roles : [],
            permissions: Array.isArray(me.permissions)
              ? me.permissions
                  .map((p) => (typeof p === "string" ? p : p.code))
                  .filter(Boolean)
              : [],
            permissionItems: Array.isArray(me.permissions)
              ? me.permissions
              : [],
            menus: Array.isArray(me.menus)
              ? me.menus
              : Array.isArray(me.menuItems)
                ? me.menuItems
                : [],
          };

          dispatch(setMe(normalizedMe));
          dispatch(setMenus(normalizedMe.menus));
        } catch (apiError) {
          console.error("/me failed after successful Keycloak login", apiError);
          dispatch(setMenus([]));
        }

        window.history.replaceState({}, document.title, "/");
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Keycloak callback failed", error);
        dispatch(setSessionError(error?.message || "Keycloak callback failed"));
        navigate("/login", { replace: true });
      }
    }

    run();
  }, [dispatch, navigate]);

  return <div className="login-processing">Completing Keycloak login...</div>;
}
