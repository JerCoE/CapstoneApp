import { useEffect, useState } from 'react';
import Navbar from '../../components/nav/Navbar';
import supabase from '../../lib/supabaseClient';
import { useMsal } from '@azure/msal-react';

type Profile = {
  id?: string;
  email?: string;
  display_name?: string;
  roles?: string[];
};

export default function AdminDashboard() {
  const { instance } = useMsal();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to get the currently authenticated Supabase user
        // (works with Supabase JS v2)
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const user = (userData as any)?.user;

        if (!user) {
          // no supabase session found; still allow viewing a minimal dashboard
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        // Attempt to fetch the profile row using an auth_user_id foreign key
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, email, display_name, roles')
          .eq('auth_user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (fetchError) {
          // If the schema doesn't have auth_user_id, try matching by email
          const fallback = await supabase
            .from('profiles')
            .select('id, email, display_name, roles')
            .eq('email', user.email)
            .limit(1)
            .maybeSingle();

          if (fallback.error) throw fallback.error;
          if (mounted) setProfile(fallback.data ?? null);
        } else {
          if (mounted) setProfile((data as any) ?? null);
        }
      } catch (err: any) {
        if (mounted) setError(err?.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const onLogout = async () => {
    try {
      // Sign out from Supabase client
      await supabase.auth.signOut();
    } catch (err) {
      // ignore
    }

    try {
      // Also trigger MSAL logout if available
      instance?.logoutPopup?.();
    } catch (err) {
      // ignore
    }
  };

  const isAdmin = Array.isArray(profile?.roles) && profile!.roles!.includes('admin');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar onLogout={onLogout} userEmail={profile?.email} />

      <main style={{ padding: '24px', flex: 1 }}>
        <h1>Administration</h1>

        {loading && <p>Loading user info…</p>}
        {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}

        {!loading && !profile && (
          <section>
            <p>You are not signed in to Supabase. Some features will be unavailable.</p>
            <p>Sign in with Microsoft to create or sync your account.</p>
          </section>
        )}

        {!loading && profile && (
          <section>
            <p>
              Signed in as <strong>{profile.display_name ?? profile.email}</strong>
            </p>

            <div style={{ marginTop: '16px' }}>
              <h2>Role tests</h2>
              {isAdmin ? (
                <div>
                  <p>You are an <strong>admin</strong>. Admin navigation and controls will appear here.</p>
                  <div style={{ border: '1px dashed #ccc', padding: '12px', marginTop: '8px' }}>
                    {/* Placeholder admin controls — empty for now */}
                    <em>Admin controls placeholder</em>
                  </div>
                </div>
              ) : (
                <div>
                  <p>You don't have admin privileges.</p>
                  <div style={{ border: '1px dashed #ccc', padding: '12px', marginTop: '8px' }}>
                    <em>Regular user area (placeholder)</em>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
