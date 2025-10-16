import { useEffect, useState } from 'react';

import { supabase } from '../../lib/supabaseClient';

type UserRow = {
  id: string;
  email?: string | null;
  created_at?: string | null;
  role?: string | null;
  [k: string]: any;
};

export default function Masterlist(): React.ReactElement {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const ADMIN_FN_URL = import.meta.env.VITE_ADMIN_FN_URL as string | undefined;

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getAccessToken(): Promise<string | null> {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token ?? null;
      return token;
    } catch (e) {
      return null;
    }
  }

  async function loadUsers() {
    setLoading(true);
    setError(null);

    const token = await getAccessToken();
    if (!token) {
      setError('No session token found. Login as an admin to view users.');
      setLoading(false);
      return;
    }

    if (!ADMIN_FN_URL) {
      setError('Admin function URL not configured. Set VITE_ADMIN_FN_URL in your .env');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(ADMIN_FN_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'list' }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || res.statusText || `status ${res.status}`);
      }

      const body = await res.json();
      setUsers(Array.isArray(body.users) ? body.users : []);
    } catch (err: any) {
      console.error('Failed to load users', err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function performAction(payload: Record<string, any>, successMsg?: string) {
    setError(null);
    const token = await getAccessToken();
    if (!token) {
      setError('No session token found.');
      return;
    }
    if (!ADMIN_FN_URL) {
      setError('Admin function URL not configured.');
      return;
    }
    try {
      setBusyId(payload.target_user ?? 'busy');
      const res = await fetch(ADMIN_FN_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || res.statusText || `status ${res.status}`);
      }
      await loadUsers();
      if (successMsg) alert(successMsg);
    } catch (err: any) {
      console.error('Admin action failed', err);
      setError(err?.message || String(err));
    } finally {
      setBusyId(null);
    }
  }

  async function promote(userId: string) {
    if (!confirm('Promote this user to admin?')) return;
    await performAction({ action: 'add_role', target_user: userId, role: 'admin' }, 'User promoted to admin');
  }

  async function removeRole(userId: string) {
    if (!confirm('Remove admin role from this user?')) return;
    await performAction({ action: 'remove_role', target_user: userId, role: 'admin' }, 'Role removed');
  }

  async function deleteUser(userId: string) {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    await performAction({ action: 'delete', target_user: userId }, 'User deleted');
  }

  return (
    <section style={{ padding: 24 }}>
      <h2>MASTERLIST</h2>

      {loading && <p>Loading users…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && users.length === 0 && <p>No users were returned.</p>}

      {users.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const id = u.id;
              return (
                <tr key={id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '8px 4px' }}>{u.email ?? <i>unknown</i>}</td>
                  <td style={{ textAlign: 'center' }}>{u.role ?? (u.app_metadata?.role ?? '')}</td>
                  <td style={{ textAlign: 'center' }}>{u.created_at ? new Date(u.created_at).toLocaleString() : ''}</td>
                  <td style={{ textAlign: 'center' }}>
                    {busyId === id ? (
                      <em>working…</em>
                    ) : (
                      <>
                        <button onClick={() => promote(id)} style={{ marginRight: 8 }}>
                          Promote
                        </button>
                        <button onClick={() => removeRole(id)} style={{ marginRight: 8 }}>
                          Remove Role
                        </button>
                        <button onClick={() => deleteUser(id)} style={{ color: 'red' }}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}