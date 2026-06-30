import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const keycloakBaseUrl =
  import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';

const realm =
  import.meta.env.VITE_KEYCLOAK_REALM || 'usermanagement';

const clientId =
  import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'usermanagement-web';

const appBaseUrl =
  import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5173';

const authority = `${keycloakBaseUrl}/realms/${realm}`;

export const userManager = new UserManager({
  authority,
  client_id: clientId,
  redirect_uri: `${appBaseUrl}/auth/callback`,
  post_logout_redirect_uri: `${appBaseUrl}/login`,
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: false,
  loadUserInfo: true,
  userStore: new WebStorageStateStore({
    store: window.localStorage
  })
});

export async function startKeycloakLogin() {
  await userManager.signinRedirect();
}

export async function completeKeycloakLogin() {
  const user = await userManager.signinRedirectCallback();

  if (!user?.access_token) {
    throw new Error('Keycloak login completed but access token was not returned.');
  }

  localStorage.setItem('access_token', user.access_token);

  if (user.refresh_token) localStorage.setItem('refresh_token', user.refresh_token);
  if (user.id_token) localStorage.setItem('id_token', user.id_token);

  const sessionId = user.profile?.sid || user.profile?.session_state || user.profile?.sub || '';
  if (sessionId) localStorage.setItem('session_id', sessionId);

  return user;
}

export async function getCurrentOidcUser() {
  return await userManager.getUser();
}

export async function logoutFromKeycloak() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('session_id');
  await userManager.signoutRedirect();
}
