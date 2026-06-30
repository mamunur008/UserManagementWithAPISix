import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const keycloakBaseUrl = import.meta.env.VITE_KC_BASE_URL || "http://localhost:8080";
const realm = import.meta.env.VITE_KC_REALM || "usermanagement";
const authority = import.meta.env.VITE_KC_AUTHORITY || `${keycloakBaseUrl}/realms/${realm}`;
const clientId = import.meta.env.VITE_KC_CLIENT_ID || "usermanagement-web";

export const oidcUserManager = new UserManager({
  authority,
  client_id: clientId,
  redirect_uri: import.meta.env.VITE_REDIRECT_URI || "http://localhost:5173/auth/callback",
  post_logout_redirect_uri:
    import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI || "http://localhost:5173/login",
  response_type: "code",
  scope: "openid profile email",
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: false
});

export async function loginWithKeycloak() {
  await oidcUserManager.signinRedirect();
}

export async function logoutFromKeycloak() {
  await oidcUserManager.removeUser();
  localStorage.removeItem("token");
  await oidcUserManager.signoutRedirect();
}
