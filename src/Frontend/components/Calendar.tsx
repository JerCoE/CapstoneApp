import { useEffect, useMemo, useState, useRef } from 'react';
import './Calendar.css';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from '../../authConfig';
import RequestForm, { type RequestFormHandle } from './RequestForm.tsx';
import ButtonRequest from './ButtonRequest.tsx';


interface Leave {
  date: string; // ISO YYYY-MM-DD (local PC timezone)
  reason?: string;
  source?: 'user' | 'graph';
}

type GraphEvent = {
  id?: string;
  subject?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
};

// Format a Date as local YYYY-MM-DD
const isoDateLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Create a Date at local midnight for given Y/M/D
const dateAtLocalMidnight = (year: number, monthIndex: number, day: number) => {
  return new Date(year, monthIndex, day);
};

export default function Calendar() {
  // Initialize calendar anchor to local midnight today so month matches local "today"
  const [current, setCurrent] = useState<Date>(() => {
    const now = new Date();
    return dateAtLocalMidnight(now.getFullYear(), now.getMonth(), now.getDate());
  });

  // tick will be used to force re-render at local midnight
  const [tick, setTick] = useState(0);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [reason, setReason] = useState<string>('');
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [events, setEvents] = useState<GraphEvent[]>([]);

  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  // currentLocal is local Date view of current anchor
  const currentLocal = useMemo(() => new Date(current), [current]);
  const monthYearLabel = `${currentLocal.toLocaleString(undefined, { month: 'long' })} ${currentLocal.getFullYear()}`;

  // Monday-first weekday headers
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // first day of month as local midnight
  const firstOfMonthLocal = useMemo(
    () => dateAtLocalMidnight(currentLocal.getFullYear(), currentLocal.getMonth(), 1),
    [currentLocal]
  );

  // start offset for Monday-first (map JS 0=Sun..6=Sat to Monday-first)
  const startDay = (firstOfMonthLocal.getDay() + 6) % 7;

  // days in month using local Date
  const daysInMonth = new Date(currentLocal.getFullYear(), currentLocal.getMonth() + 1, 0).getDate();

  // deterministic date string for a day in the current month (local)
  const dateFor = (day: number) => {
    const y = currentLocal.getFullYear();
    const m = String(currentLocal.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // today in local timezone
  const todayIso = isoDateLocal(new Date());

  // maps for quick lookup
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
      const evDate = new Date(startStr); // Date parses ISO/offset and yields local fields
      const key = isoDateLocal(evDate);
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(ev);
    }
    return m;
  }, [events]);

  const onDayClick = (day: number) => {
    setSelectedDate(dateFor(day));
  };

  const prevMonth = () =>
    setCurrent(() => {
      const y = currentLocal.getFullYear();
      const m = currentLocal.getMonth() - 1;
      return dateAtLocalMidnight(y, m, 1);
    });

  const nextMonth = () =>
    setCurrent(() => {
      const y = currentLocal.getFullYear();
      const m = currentLocal.getMonth() + 1;
      return dateAtLocalMidnight(y, m, 1);
    });

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

  const removeLeave = (date: string) => {
    setLeaves((prev) => prev.filter((p) => p.date !== date));
  };
     //API INTEGRATION for CALENDAR MS TEAMS
  // MSAL / Graph integration (unchanged) - events will be mapped to local days above
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchEvents = async () => {
      try {
        if (!accounts || accounts.length === 0) return;
        const account = accounts[0];
        const resp = await instance.acquireTokenSilent({ ...loginRequest, account });
        const token = resp.accessToken;
        const res = await fetch('https://graph.microsoft.com/v1.0/me/events?$select=subject,start,end', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        if (!res.ok) {
          console.warn('Graph fetch failed', res.status, await res.text());
          return;
        }
        const body = await res.json();
        const items: GraphEvent[] = body.value ?? [];
        setEvents(items);

        // merge events into leaves (mark as graph-source) without duplicating
        setLeaves((prev) => {
          const existing = new Map(prev.map((p) => [p.date, p]));
          for (const ev of items) {
            const startStr = ev.start?.dateTime ?? ev.start?.date;
            if (!startStr) continue;
            const key = isoDateLocal(new Date(startStr)); // map to local day
            if (!existing.has(key)) {
              existing.set(key, { date: key, reason: ev.subject ?? 'Event', source: 'graph' });
            }
          }
          return Array.from(existing.values());
        });
      } catch (err) {
        console.error('Failed to fetch events', err);
      }
    };

    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, instance, accounts]);

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

  // Build calendar cells
  const cells: Array<{ day?: number; iso?: string }> = [];
  for (let i = 0; i < startDay; i++) cells.push({});
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = dateFor(d);
    cells.push({ day: d, iso });
  }
  while (cells.length % 7 !== 0) cells.push({});

  const [showForm, setShowForm] = useState(false);
  const requestFormRef = useRef<RequestFormHandle | null>(null);
  // When showForm becomes true, the RequestForm will mount;
// call its scrollTo/focus method (if exposed) after mount.
useEffect(() => {
  if (showForm) {
    // call the method exposed by the RequestForm handle
    // (use optional chaining in case the method or ref is missing)
    requestFormRef.current?.scrollTo?.();
  }
}, [showForm]);

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
          {/*
          <div className="nav-right">
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 13, color: '#605e5c' }}>{accounts?.[0]?.name ?? accounts?.[0]?.username}</div>
                <button onClick={() => instance.logoutPopup()}>Sign out</button>
              </div>
            ) : (
              <button onClick={() => instance.loginPopup(loginRequest)}>Sign in</button>
            )}
          </div>
          */}

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
          {showForm && (<RequestForm ref={requestFormRef}
              onClose={() => setShowForm(false)} />
                )}
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