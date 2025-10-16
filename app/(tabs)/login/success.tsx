import { useEffect, useState } from 'react';

const API_BASE =
  (process as any).env?.EXPO_PUBLIC_API_BASE ||
  (globalThis as any).process?.env?.EXPO_PUBLIC_API_BASE ||
  'https://sports-betting-app-da82e41ab1fd.herokuapp.com';

export default function LoginSuccess() {
  const [me, setMe] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/me`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : Promise.reject(`${r.status} ${r.statusText}`)))
      .then(setMe)
      .catch(e => setErr(String(e)));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Logged in</h1>
      {err && <p style={{ color: 'crimson' }}>Error: {err}</p>}
      <pre>{JSON.stringify(me, null, 2)}</pre>
      <a href="/">Go home</a>
    </div>
  );
}
