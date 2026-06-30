import { useDispatch } from "react-redux";
import { login } from "./sessionSlice.js";

export function LoginPage() {
  const dispatch = useDispatch();
  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand-block large"><div className="brand-mark">UM</div><div><strong>UserManagement</strong><span>Keycloak Identity Portal</span></div></div>
        <h1>Secure admin login</h1>
        <p>Login is handled by Keycloak using Authorization Code + PKCE. You can later enable Google, Facebook, GitHub, or SAML without changing this React application.</p>
        <button type="button" className="btn btn-primary full" onClick={() => dispatch(login())}>Continue with Keycloak</button>
      </section>
      <section className="login-hero"><div><span className="hero-pill">Keycloak → APISIX → AuthService → Redis</span><h2>Professional identity control for microservices.</h2><p>APISIX verifies each API call through AuthService. AuthService reads Redis first, then validates with Keycloak and stores the session for next time.</p></div></section>
    </main>
  );
}
