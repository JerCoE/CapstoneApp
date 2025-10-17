// src/Frontend/pages/Admin/Approvals.tsx

import { useEffect, useState } from 'react';

import RoleChecker from '../../components/nav/RoleChecker';
import supabase from '../../lib/supabaseClient';

type Profile = { roles?: string[]; email?: string; display_name?: string };

export default function Approvals() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = (userData as any)?.user;
        if (!user) {
          if (mounted) setProfile(null);
          return;
        }

        const { data } = await supabase
          .from('profiles')
          .select('roles, email, display_name')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (mounted) setProfile((data as any) ?? null);
      } catch (err) {
        if (mounted) console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const isAdmin = Array.isArray(profile?.roles) && profile!.roles!.includes('admin');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
  <RoleChecker onLogout={() => supabase.auth.signOut()} userEmail={profile?.email} isAdmin={isAdmin} />

      <main style={{ padding: '24px', flex: 1 }}>
        <h1>Approvals</h1>

        {loading && <p>Loading…</p>}

        {!loading && !isAdmin && (
          <p style={{ color: 'crimson' }}>You do not have permission to view approvals.</p>
        )}

        {!loading && isAdmin && (
          <section>
            <p>Here are pending approvals (placeholder).</p>
            {/* TODO: fetch actual approvals rows from your DB and render them */}
            <div style={{ border: '1px dashed #ccc', padding: 12 }}>
              <em>No approvals implemented yet — connect to your approvals table or endpoint.</em>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}