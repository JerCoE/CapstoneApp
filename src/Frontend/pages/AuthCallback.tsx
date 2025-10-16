import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔍 AuthCallback: starting. URL=', window.location.href);

        // 1) Let Supabase handle URL if it has a helper (v2 has getSessionFromUrl in some builds)
        try {
          // call helper if available (not all SDK builds expose it)
          // @ts-ignore
          if (typeof supabase.auth.getSessionFromUrl === 'function') {
            console.log('🔁 Trying supabase.auth.getSessionFromUrl()');
            // @ts-ignore
            const res = await supabase.auth.getSessionFromUrl();
            console.log('🔁 getSessionFromUrl result:', res);
            if (res?.data?.session) {
              console.log('✅ Session established via getSessionFromUrl:', res.data.session.user.email);
              setProcessing(false);
              navigate('/', { replace: true });
              return;
            }
          }
        } catch (err) {
          console.warn('⚠️ getSessionFromUrl failed or not available:', err);
        }

        // 2) Wait briefly for any server-side processing (Supabase may be redirecting + setting cookies)
        await new Promise((r) => setTimeout(r, 1000));

        // 3) Check if a session already exists (cookies)
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
        console.log('🔍 supabase.auth.getSession() ->', { session, getSessionError });
        if (getSessionError) {
          console.warn('⚠️ getSession error', getSessionError);
        }
        if (session) {
          console.log('✅ Existing session found:', session.user.email);
          setProcessing(false);
          navigate('/', { replace: true });
          return;
        }

        // 4) Fallback: check for tokens in the URL hash (access_token & refresh_token)
        // Supabase sometimes redirects back to the client with tokens in the hash.
        const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
        const hashParams = new URLSearchParams(hash);
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        if (access_token && refresh_token) {
          console.log('🔍 Found tokens in URL hash, calling setSession');
          const { data, error: setErr } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          console.log('🔍 setSession result:', { data, setErr });
          if (setErr) {
            throw setErr;
          }
          if (data?.session) {
            console.log('✅ Session set via setSession:', data.session.user.email);
            setProcessing(false);
            navigate('/', { replace: true });
            return;
          }
        }

        // 5) If we get here, no session. Show error and redirect back to login.
        console.warn('⚠️ No session found after callback. URL may contain an error.');
        // Detect error params from search or hash
        const searchParams = new URLSearchParams(window.location.search);
        const errDesc = searchParams.get('error_description') || hashParams.get('error_description') || null;
        if (errDesc) {
          setError(errDesc);
          console.error('OAuth error from provider:', errDesc);
        } else {
          setError('No session established after OAuth callback.');
        }
        setProcessing(false);
        setTimeout(() => navigate('/', { replace: true }), 3000);
      } catch (err: any) {
        console.error('❌ Unexpected error in AuthCallback:', err);
        setError(err?.message ?? String(err));
        setProcessing(false);
        setTimeout(() => navigate('/', { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (processing) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{
          width: 36, height: 36, border: '4px solid #eee', borderTop: '4px solid #09f', borderRadius: '50%', animation: 'spin 1s linear infinite'
        }} />
        <p>Processing authentication...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg)} 100% { transform: rotate(360deg)} }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h3 style={{ color: '#c62828' }}>Authentication error</h3>
      <p>{error ?? 'Authentication failed. Redirecting to login...'}</p>
      <p style={{ color: '#666' }}>If this repeats, check Supabase/Azure redirect settings and post the network authorize URL.</p>
    </div>
  );
};

export default AuthCallback;