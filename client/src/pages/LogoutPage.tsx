import { useEffect } from 'react';

// Hard reset page — clears ALL storage and redirects to login
export default function LogoutPage() {
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
    // Clear all cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    window.location.replace('/login');
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#e2e8f0'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
      <p>Clearing session…</p>
    </div>
  );
}
