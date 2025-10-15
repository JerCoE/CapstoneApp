import React, { useEffect, useState } from 'react';
import './LeaveRequests.css';
import { useMsal } from '@azure/msal-react';

type LeaveType = 'Vacation' | 'Sick' | 'Personal' | 'Unpaid';

type SavedLeaveRequest = {
  id: string;
  user?: string;
  type: LeaveType;
  from: string; // ISO date
  to: string;   // ISO date
  reason: string;
  days: number;
  submittedAt: string; // ISO datetime
};

const STORAGE_KEY = 'capstone_leave_requests_v1';

function calculateInclusiveDays(fromIso: string, toIso: string) {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  // clear time portion for safety
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.round((to.getTime() - from.getTime()) / msPerDay) + 1;
  return diff > 0 ? diff : 0;
}

export default function LeaveRequests() {
  const { accounts } = useMsal();
  const username = accounts?.[0]?.username ?? accounts?.[0]?.name ?? 'Me';

  const [type, setType] = useState<LeaveType>('Vacation');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedLeaveRequest[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // load saved requests from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch (err) {
      console.error('Failed to load saved leave requests', err);
    }
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!from) e.from = 'Start date is required';
    if (!to) e.to = 'End date is required';
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      if (toDate < fromDate) e.to = 'End date cannot be before start date';
      const days = calculateInclusiveDays(from, to);
      if (days <= 0) e.to = 'Selected date range must include at least 1 day';
    }
    if (!reason || reason.trim().length < 5) e.reason = 'Please provide a reason (min 5 chars)';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!validate()) {
      setMessage('Please fix form errors and try again.');
      return;
    }

    setSubmitting(true);
    try {
      const days = calculateInclusiveDays(from, to);
      const req: SavedLeaveRequest = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        user: username,
        type,
        from,
        to,
        reason: reason.trim(),
        days,
        submittedAt: new Date().toISOString(),
      };

      const updated = [req, ...saved];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSaved(updated);

      // In a real app you'd call your API / supabase here.
      console.log('Leave request saved (local):', req);

      setMessage(`Leave request submitted (${days} day${days === 1 ? '' : 's'}).`);
      // reset form but keep the type
      setFrom('');
      setTo('');
      setReason('');
      setErrors({});
    } catch (err) {
      console.error(err);
      setMessage('Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClearSaved() {
    if (!confirm('Clear all saved leave requests from localStorage?')) return;
    localStorage.removeItem(STORAGE_KEY);
    setSaved([]);
    setMessage('Saved requests cleared.');
  }

  return (
    <div className="leave-requests">
      <h2>Leave Request</h2>

      <form className="leave-form" onSubmit={handleSubmit} noValidate>
        <div className="row">
          <label>Employee</label>
          <div className="field static">{username}</div>
        </div>

        <div className="row">
          <label htmlFor="type">Type</label>
          <select id="type" value={type} onChange={(ev) => setType(ev.target.value as LeaveType)}>
            <option>Vacation</option>
            <option>Sick</option>
            <option>Personal</option>
            <option>Unpaid</option>
          </select>
        </div>

        <div className="row two-col">
          <div>
            <label htmlFor="from">From</label>
            <input id="from" type="date" value={from} onChange={(ev) => setFrom(ev.target.value)} />
            {errors.from && <div className="error">{errors.from}</div>}
          </div>

          <div>
            <label htmlFor="to">To</label>
            <input id="to" type="date" value={to} onChange={(ev) => setTo(ev.target.value)} />
            {errors.to && <div className="error">{errors.to}</div>}
          </div>
        </div>

        <div className="row">
          <label htmlFor="reason">Reason</label>
          <textarea id="reason" rows={4} value={reason} onChange={(ev) => setReason(ev.target.value)} />
          {errors.reason && <div className="error">{errors.reason}</div>}
        </div>

        <div className="actions">
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setFrom('');
              setTo('');
              setReason('');
              setErrors({});
              setMessage(null);
            }}
            disabled={submitting}
          >
            Reset
          </button>
        </div>

        {message && <div className="message">{message}</div>}
      </form>

      <section className="saved-requests">
        <div className="saved-header">
          <h3>Saved requests (local)</h3>
          <div>
            <button className="small" onClick={handleClearSaved} disabled={saved.length === 0}>
              Clear saved
            </button>
          </div>
        </div>

        {saved.length === 0 ? (
          <div className="empty">No saved requests yet.</div>
        ) : (
          <ul>
            {saved.map((s) => (
              <li key={s.id}>
                <div className="meta">
                  <strong>{s.type}</strong> — {s.from} → {s.to} ({s.days} day{s.days === 1 ? '' : 's'})
                </div>
                <div className="by">
                  By {s.user ?? 'Unknown'} on {new Date(s.submittedAt).toLocaleString()}
                </div>
                <div className="reason">{s.reason}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}