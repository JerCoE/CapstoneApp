import React from 'react';
import './LoginScreen.css';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../authConfig';

const LoginScreen: React.FC = () => {
  const { instance, accounts } = useMsal();

  const handleLogin = async () => {
    try {
      // Step 1: Microsoft login popup
      const loginResponse = await instance.loginPopup(loginRequest);
      const idToken = loginResponse.idToken;

      // Step 2: Acquire access token for Microsoft Graph API
      let accessToken: string | undefined;
      try {
        const tokenResponse = await instance.acquireTokenSilent({ 
          ...loginRequest, 
          account: loginResponse.account 
        });
        accessToken = tokenResponse.accessToken;
      } catch (silentErr) {
        // Silent token acquisition failed, use popup fallback
        const tokenResponse = await instance.acquireTokenPopup({ 
          ...loginRequest, 
          account: loginResponse.account 
        });
        accessToken = tokenResponse.accessToken;
      }

      if (!accessToken) {
        console.error('❌ Could not obtain access token for Microsoft Graph');
        return;
      }

      // Step 3: Fetch user profile from Microsoft Graph API
      const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!profileRes.ok) {
        const text = await profileRes.text();
        console.error('❌ Failed to fetch Graph profile', profileRes.status, text);
        return;
      }

      const profile = await profileRes.json();
      console.log('✅ Microsoft Graph profile fetched:', profile);

      // Step 4: Send profile data to Supabase Edge Function
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
          id_token: idToken
        })
      });

      if (!backendRes.ok) {
        const body = await backendRes.text();
        console.error('❌ Edge Function upsert failed', backendRes.status, body);
      } else {
        const result = await backendRes.json();
        console.log('✅ Profile synced to Supabase:', result);
      }
    } catch (err) {
      console.error('❌ Login failed', err);
    }
  };

  return (
    <div className="Pausepoint">
      <span className="pausepoint-text">PausePoint</span>
      <div className="BackgroundLogo">
        <div className="BGtext">
          <div className="login-container">
            <h2 style={{ textAlign: 'center', fontWeight: '600', color: '#113372' }}>Login</h2>
            {accounts.length > 0 ? (
              <p style={{ textAlign: 'center', color: '#113372' }}>
                Welcome, {accounts[0].username}
              </p>
            ) : (
              <p style={{ textAlign: 'center', color: '#666' }}>
                Sign in with your Microsoft account
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={handleLogin} type="button">
                Sign in with Microsoft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;