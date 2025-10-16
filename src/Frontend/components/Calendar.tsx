import { useEffect, useMemo, useState } from 'react';
import './Calendar.css';
import { supabase } from '../lib/supabaseClient';
import ButtonRequest from './ButtonRequest.tsx';

interface Leave {
  date: string; // ISO YYYY-MM-DD (local)
  reason?: string;
  source?: 'user' | 'graph';
}

type GraphEvent = {
  id?: string;
  subject?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
};

const isoDateLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const dateAtLocalMidnight = (year: number, monthIndex: number, day: number) => {
  return new Date(year, monthIndex, day);
};

export default function Calendar() {
  const [current, setCurrent] = useState<Date>(() => {
    const now = new Date();
    return dateAtLocalMidnight(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [tick, setTick] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reason, setReason] = useState<string>('');
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [events, setEvents] = useState<GraphEvent[]>([]);

  // auth/session state
  const [sessionLoading, setSessionLoading] = useState(true);
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [checkedOnce, setCheckedOnce] = useState(false); // prevents immediate re-requests

  useEffect(() => {
    // initial session check + subscribe to changes
    let mounted = true;
    const init = async () => {
      setSessionLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;

      const token = (session as any)?.provider_token ?? null;
      setProviderToken(token);
      setCheckedOnce(true); // we've checked session once; do NOT trigger consent automatically
      setSessionLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const token = (session as any)?.provider_token ?? null;
      setProviderToken(token);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Called only when user clicks or when Graph returns 401/403 and user confirms
  const ensureCalendarsScope = async () => {
    // Request only when necessary. Include offline_access so Supabase can obtain refresh tokens.
    const scopes = 'openid profile email offline_access User.Read Calendars.Read';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: { scopes },
    });

    if ((data as any)?.url) window.location.href = (data as any).url;
    if (error) console.error('Calendar consent failed:', error);
  };

  // Fetch events from Graph using provider token
  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      if (!providerToken) {
        console.log('No provider token available, skipping Graph fetch');
        return;
      }

      try {
        const res = await fetch('https://graph.microsoft.com/v1.0/me/events?$select=subject,start,end', {
          headers: {
            Authorization: `Bearer ${providerToken}`,
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          const text = await res.text();
          console.warn('Graph fetch failed', res.status, text);

          // If token doesn't have calendar permission or is invalid, initiate scope request
          if (res.status === 401 || res.status === 403) {
            console.warn('Token missing permissions or invalid. Requesting scopes...');
            await ensureCalendarsScope();
          }
          return;
        }

        const body = await res.json();
        const items: GraphEvent[] = body.value ?? [];
        if (cancelled) return;
        setEvents(items);

        // merge events into leaves (mark as graph-source)
        setLeaves((prev) => {
          const existing = new Map(prev.map((p) => [p.date, p]));
          for (const ev of items) {
            const startStr = ev.start?.dateTime ?? ev.start?.date;
            if (!startStr) continue;
            const key = isoDateLocal(new Date(startStr));
            if (!existing.has(key)) {
              existing.set(key, { date: key, reason: ev.subject ?? 'Event', source: 'graph' });
            }
          }
          return Array.from(existing.values());
        });
      } catch (err) {
        console.error('Failed to fetch events from Graph', err);
      }
    };

    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, [providerToken]);

  // Automatic local-midnight refresh effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const scheduleNextLocalMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const msUntil = nextMidnight.getTime() - now.getTime();
      const safeMsUntil = msUntil > 0 ? msUntil : 1000;
      timer = setTimeout(() => {
        setTick((t) => t + 1); // force rerender so todayIso updates
      }, safeMsUntil);
    };

    scheduleNextLocalMidnight();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [tick]);

  // ---- Move computed date variables BEFORE building cells ----
  const currentLocal = useMemo(() => new Date(current), [current]);
  const monthYearLabel = `${currentLocal.toLocaleString(undefined, { month: 'long' })} ${currentLocal.getFullYear()}`;
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const firstOfMonthLocal = useMemo(
    () => dateAtLocalMidnight(currentLocal.getFullYear(), currentLocal.getMonth(), 1),
    [currentLocal]
  );
  const startDay = (firstOfMonthLocal.getDay() + 6) % 7;
  const daysInMonth = new Date(currentLocal.getFullYear(), currentLocal.getMonth() + 1, 0).getDate();
  const dateFor = (day: number) => {
    const y = currentLocal.getFullYear();
    const m = String(currentLocal.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const todayIso = isoDateLocal(new Date());
  const leavesByDate = useMemo(() => {
    const m = new Map<string, Leave>();
    for (const l of leaves) m.set(l.date, l);
    return m;
  }, [leaves]);
  const eventsByDate = useMemo(() => {
    const m = new Map<string, GraphEvent[]>();
    for (const ev of events) {
      const startStr = ev.start?.dateTime ?? ev.start?.date;
      if (!startStr) continue;
      const evDate = new Date(startStr);
      const key = isoDateLocal(evDate);
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(ev);
    }
    return m;
  }, [events]);
  // ---- end moved block ----

  // Build calendar cells (now safe to use startDay, daysInMonth, dateFor, etc.)
  const cells: Array<{ day?: number; iso?: string }> = [];
  for (let i = 0; i < startDay; i++) cells.push({});
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = dateFor(d);
    cells.push({ day: d, iso });
  }
  while (cells.length % 7 !== 0) cells.push({});

  const onDayClick = (day: number) => setSelectedDate(dateFor(day));
  const prevMonth = () => setCurrent(dateAtLocalMidnight(currentLocal.getFullYear(), currentLocal.getMonth() - 1, 1));
  const nextMonth = () => setCurrent(dateAtLocalMidnight(currentLocal.getFullYear(), currentLocal.getMonth() + 1, 1));
  const goToday = () => {
    const now = new Date();
    setCurrent(dateAtLocalMidnight(now.getFullYear(), now.getMonth(), now.getDate()));
  };
  const saveLeave = () => {
    if (!selectedDate) return;
    setLeaves((prev) => {
      const others = prev.filter((p) => p.date !== selectedDate);
      return [...others, { date: selectedDate, reason: reason || 'Leave', source: 'user' }];
    });
    setReason('');
  };
  const removeLeave = (date: string) => setLeaves((prev) => prev.filter((p) => p.date !== date));

  // If the user is signed in (session exists) but there's no provider token,
  // initiate the OAuth flow to request Calendars.Read so we get provider_token.
  // This only runs when providerToken becomes null after a session exists.
  useEffect(() => {
    // Avoid auto-redirecting during initial load
    if (sessionLoading) return;
    if (!providerToken) {
      console.log('No provider token for current session — requesting Calendars scope...');
      ensureCalendarsScope(); // this will redirect user to consent screen
    }
  }, [sessionLoading, providerToken]);

  return (
    <div className="calendar-root">
      <div className="calendar-main">
        <div className="calendar-nav">
          <div className="nav-left">
            <button onClick={prevMonth} aria-label="Previous month">‹</button>
            <button onClick={goToday}>Today</button>
            <button onClick={nextMonth} aria-label="Next month">›</button>
            <div style={{ width: 12 }} />
            <div className="calendar-title">{monthYearLabel}</div>
          </div>

        </div>

        <div className="calendar-grid" role="grid" aria-label="Calendar">
          {weekdays.map((w) => (
            <div key={w} className="calendar-weekday">{w}</div>
          ))}

          {cells.map((cell, idx) => {
            if (!cell.day) return <div key={idx} className="calendar-cell empty" />;
            const iso = cell.iso!;
            const isToday = iso === todayIso;
            const isSelected = iso === selectedDate;
            const hasLeave = leavesByDate.has(iso);
            const dayEvents = eventsByDate.get(iso) ?? [];

            const classes = [
              'calendar-cell',
              'day',
              isToday ? 'today' : '',
              isSelected ? 'selected' : '',
              hasLeave ? 'leave' : '',
            ].filter(Boolean).join(' ');

            return (
              <div key={idx} className={classes} onClick={() => onDayClick(cell.day!)}>
                <div className="cell-number">{cell.day}</div>
                {hasLeave && <div className="leave-marker" title="Leave/event" />}
                {dayEvents.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#605e5c' }}>
                    {dayEvents.slice(0, 2).map((ev, i) => <div key={i}>{ev.subject}</div>)}
                  </div>

                )}

              </div>
            );
          })}
        </div>

      </div>

      <aside className="calendar-side">
        <h3>Details</h3>

        <ButtonRequest />

        <div className="side-box">
          <h4 style={{ marginTop: 0 }}>Leaves</h4>
          <ul className="leaves-list">
            {leaves.slice().sort((a,b) => a.date.localeCompare(b.date)).map(l => (
              <li key={l.date} className="leave-item">
                <div>
                  <div style={{ fontWeight: 600 }}>{l.date}</div>
                  <div className="leave-reason">{l.reason}</div>
                  <div style={{ fontSize: 11, color: '#8a8886' }}>{l.source === 'graph' ? 'From MS Teams' : 'User'}</div>
                </div>
                <div>
                  <button className="remove-btn" onClick={() => removeLeave(l.date)}>✕</button>
                </div>
              </li>
            ))}
            {leaves.length === 0 && <div style={{ color: '#8a8886' }}>No leaves</div>}
          </ul>
        </div>

        <div className="side-box">
          <h4 style={{ marginTop: 0 }}>Upcoming events (from Teams)</h4>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {events.slice().sort((a,b) => {
              const aStart = a.start?.dateTime ?? a.start?.date ?? '';
              const bStart = b.start?.dateTime ?? b.start?.date ?? '';
              return aStart.localeCompare(bStart);
            }).slice(0,10).map(ev => {
              const startStr = ev.start?.dateTime ?? ev.start?.date ?? '';
              const key = startStr || ev.id || Math.random().toString(36).slice(2,9);
              const evDateIso = startStr ? isoDateLocal(new Date(startStr)) : '';
              return (
                <li key={key} style={{ padding: '8px 0', borderBottom: '1px solid #e1dfdd' }}>
                  <div style={{ fontWeight: 600 }}>{ev.subject}</div>
                  <div style={{ fontSize: 12, color: '#605e5c' }}>{evDateIso}</div>
                </li>
              );
            })}
            {events.length === 0 && <div style={{ color: '#8a8886' }}>No events loaded</div>}
          </ul>
        </div>
      </aside>
    </div>
  );
}