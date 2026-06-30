import { useSelector } from 'react-redux';
import { startKeycloakLogin } from '../../services/oidc.js';

export function LoginPage() {
  const error = useSelector((state) => state.session.error);

  async function handleLogin() {
    try {
      await startKeycloakLogin();
    } catch (err) {
      console.error('Failed to start Keycloak login', err);
    }
  }

  return (
    <main className="min-h-screen bg-app-bg text-ink">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex items-center justify-center overflow-hidden px-6 py-12">
          <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
          <div className="absolute bottom-[-160px] right-[-120px] h-96 w-96 rounded-full bg-brand-soft blur-3xl" />

          <div className="relative w-full max-w-xl">
            <div className="mb-8 flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-brand text-xl font-black text-white shadow-card">UM</div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-ink">UserManagement</h1>
                <p className="mt-1 font-bold text-muted">Keycloak Identity Portal</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-line bg-white/90 p-8 shadow-card backdrop-blur">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.45em] text-brand">Secure admin login</p>
              <h2 className="text-4xl font-black leading-tight tracking-[-0.055em] text-ink">Sign in through Keycloak</h2>
              <p className="mt-5 text-base leading-7 text-muted">Login is handled by Keycloak using Authorization Code + PKCE. APISIX forwards protected API calls to AuthService, and Redis stores validated sessions.</p>

              {error ? <div className="mt-6 rounded-2xl border border-danger/20 bg-red-50 px-4 py-3 text-sm font-bold text-danger">{error}</div> : null}

              <button type="button" onClick={handleLogin} className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-sidebar px-6 py-4 text-base font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-900 md:w-auto">
                Continue with Keycloak
              </button>

              <div className="mt-7 grid grid-cols-1 gap-3 text-sm text-muted sm:grid-cols-3">
                <div className="rounded-2xl border border-line bg-panel-soft p-4"><strong className="block text-ink">Keycloak</strong>Identity login</div>
                <div className="rounded-2xl border border-line bg-panel-soft p-4"><strong className="block text-ink">APISIX</strong>Gateway auth</div>
                <div className="rounded-2xl border border-line bg-panel-soft p-4"><strong className="block text-ink">Redis</strong>Session cache</div>
              </div>
            </div>
          </div>
        </section>

        <section className="hidden items-center justify-center bg-sidebar px-10 py-12 text-white lg:flex">
          <div className="max-w-lg">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.45em] text-brand-soft">Microservice security</p>
            <h2 className="text-5xl font-black leading-tight tracking-[-0.06em]">Professional identity control for your platform.</h2>
            <p className="mt-6 text-lg leading-8 text-slate-300">Keep your frontend thin. Let Keycloak handle identity, APISIX handle gateway enforcement, AuthService validate sessions, and account_db control roles, permissions and menus.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
