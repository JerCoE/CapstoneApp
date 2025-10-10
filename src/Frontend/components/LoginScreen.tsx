import React from 'react';
import './LoginScreen.css';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../authConfig';

const LoginScreen: React.FC = () => {
  const { instance, accounts } = useMsal();

  const handleLogin = async () => {
    try {
      const loginResponse = await instance.loginPopup(loginRequest);
      const idToken = loginResponse.idToken;

      // Acquire access token for Graph: try silent first, then popup fallback
      let accessToken: string | undefined;
      try {
        const tokenResponse = await instance.acquireTokenSilent({ ...loginRequest, account: loginResponse.account });
        accessToken = tokenResponse.accessToken;
      } catch (silentErr) {
        // silent failed (first-time or not cached) - use popup
        const tokenResponse = await instance.acquireTokenPopup({ ...loginRequest, account: loginResponse.account });
        accessToken = tokenResponse.accessToken;
      }

      if (!accessToken) {
        console.error('Could not obtain access token for Graph');
        return;
      }

      // fetch basic profile from Graph using access token
      const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!profileRes.ok) {
        const text = await profileRes.text();
        console.error('Failed to fetch Graph profile', profileRes.status, text);
        return;
      }

      const profile = await profileRes.json();

      // send profile to backend for upsert — include id token for verification
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const functionUrl = `${supabaseUrl}/functions/v1/microsoft-sync`;
      
      const backendRes = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          id: profile.id,
          email: profile.mail ?? profile.userPrincipalName,
          display_name: profile.displayName,
          given_name: profile.givenName,
          surname: profile.surname,
          job_title: profile.jobTitle,
          department: profile.department,
          office_location: profile.officeLocation,
          preferred_language: profile.preferredLanguage,
          mobile_phone: profile.mobilePhone,
          metadata: profile,
          id_token: idToken  // Send token in body instead of header
        })
      });

      if (!backendRes.ok) {
        const body = await backendRes.text();
        console.error('Backend upsert failed', backendRes.status, body);
      } else {
        console.log('Profile upserted successfully');
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  return (
    <div className="BackgroundPortal">
      <div className="login-container">
        <h2 style={{ textAlign: 'center' }}>ERNI Login Portal</h2>
        <p style={{ textAlign: 'center' }}>{accounts[0]?.username ?? ''}</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={handleLogin}>Sign in with Microsoft</button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;