import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { handleCallback } from "./sessionSlice.js";

export function CallbackPage() {
  const processed = useRef(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    async function run() {
      try { await dispatch(handleCallback()).unwrap(); navigate("/", { replace: true }); }
      catch (error) { console.error("Keycloak callback failed", error); navigate("/login", { replace: true }); }
    }
    run();
  }, [dispatch, navigate]);
  return <main className="loading-page"><div className="loading-card"><div className="brand-mark">UM</div><h1>Completing login...</h1><p>Please wait while we complete your Keycloak login.</p></div></main>;
}
