import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
const kcBaseUrl = import.meta.env.VITE_KC_BASE_URL || 'http://localhost:8080';
const realm = import.meta.env.VITE_KC_REALM || 'usermanagement';
const clientId = import.meta.env.VITE_KC_CLIENT_ID || 'usermanagement-web';
export const oidcManager = new UserManager({
  authority: `${kcBaseUrl}/realms/${realm}`,
  client_id: clientId,
  redirect_uri: `${window.location.origin}/auth/callback`,
  post_logout_redirect_uri: `${window.location.origin}/login`,
  response_type: 'code',
  scope: 'openid profile email roles',
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.localStorage })
});
export function loginRedirect(){ return oidcManager.signinRedirect(); }
export function completeLogin(){ return oidcManager.signinRedirectCallback(); }
export function logoutRedirect(idToken){ return oidcManager.signoutRedirect({ id_token_hint: idToken }); }
