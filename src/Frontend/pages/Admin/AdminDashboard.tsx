import Navbar from '../../components/nav/Navbar';
import { Outlet } from 'react-router-dom';
import React from 'react';
import { useAuth } from '../../lib/AuthContext';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const isAdmin = Array.isArray(user?.roles) && user!.roles!.includes('admin');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar userEmail={user?.email ?? undefined} isAdmin={isAdmin} />

      <main style={{ padding: '24px', flex: 1 }}>
        <h1>Administration</h1>

        {loading && <p>Loading user info…</p>}

        {!loading && user && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ marginTop: '20px' }}>
              <Outlet />
            </div>
          </div>
        )}

        {!loading && !user && (
          <section>
            <p>You are not signed in. Sign in to access admin features.</p>
          </section>
        )}
      </main>
    </div>
  );
}
