import { useEffect, useState } from "react";
import { getErrorMessage } from "../services/httpClient.js";

export function useApiList(loader) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    setLoading(true); setError("");
    try { const data = await loader(); setRows(Array.isArray(data) ? data : data?.items ?? []); }
    catch (err) { setError(getErrorMessage(err)); setRows([]); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  return { rows, loading, error, reload: load };
}
