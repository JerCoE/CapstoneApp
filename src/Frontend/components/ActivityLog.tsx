import './ActivityLog.css';
import React, { useMemo, useState } from 'react';
import RequestForm, { type RequestFormHandle } from './RequestForm.tsx';
import { useRef, useEffect } from 'react';
import ButtonRequest from './ButtonRequest.tsx';


type LeaveItem = {
  id: number;
  type: string;
  name: string;
  from: string;
  to: string;
  appliedOn: string;
  approvedBy: string;
  approvedDate: string;
};

const MOCK: LeaveItem[] = [
  { id: 1, type: 'Vacation', name: 'Estefanee Din', from: '04/22/2025', to: '04/22/2025', appliedOn: '04/22/2025', approvedBy: 'Adriel Matriano', approvedDate: '04/26/2025' },
  { id: 2, type: 'Holiday', name: 'Jhonelle Viseral', from: '04/22/2025', to: '04/22/2025', appliedOn: '04/22/2025', approvedBy: 'Adriel Matriano', approvedDate: '04/26/2025' },
  { id: 3, type: 'Sick', name: 'Dann De Jesus', from: '04/22/2025', to: '04/22/2025', appliedOn: '04/22/2025', approvedBy: 'Adriel Matriano', approvedDate: '04/26/2025' },

];

const monthOptions = [
  'January','February','March','April','May','June','July','August','September','October','November','December'
];

const ActivityLog: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');

  const types = useMemo(() => Array.from(new Set(MOCK.map(m => m.type))), []);

  const filtered = useMemo(() => {
    return MOCK.filter(item => {
      const qLower = query.trim().toLowerCase();
      if (qLower) {
        const inAny = [
          item.type,
          item.name,
          item.from,
          item.to,
          item.appliedOn,
          item.approvedBy,
          item.approvedDate
        ].some(v => v.toLowerCase().includes(qLower));
        if (!inAny) return false;
      }
      if (typeFilter && item.type !== typeFilter) return false;
      if (monthFilter) {
        const m = parseInt(item.from.split('/')[0], 10);
        if (monthFilter && monthOptions[m - 1] !== monthFilter) return false;
      }
      if (yearFilter) {
        const year = item.from.split('/')[2];
        if (year !== yearFilter) return false;
      }
      return true;
    });
  }, [query, typeFilter, monthFilter, yearFilter]);

  const years = useMemo(() => {
    const s = new Set(MOCK.map(m => m.from.split('/')[2]));
    return Array.from(s).sort();
  }, []);

  

  return (
    <div className="activity-page">
      <div className="page-header">
        <h1>Activity Log</h1>
      </div>

      <div className="activity-content">
        <div className="left-card">
          <div className="card-head-row">
            <div>
              <h3>Leave History</h3>
              <p className="subtitle">View all your past leaves</p>
            </div>
            <div className="search-box">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search..."
                aria-label="Search leaves"
              />
            </div>
          </div>

          <div className="table-wrap">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Name</th>
                  <th>Date From</th>
                  <th>Date To</th>
                  <th>Applied On</th>
                  <th>Approved by</th>
                  <th>Approved Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr className="no-results">
                    <td colSpan={7}>No records found.</td>
                  </tr>
                ) : (
                  filtered.map(item => (
                    <tr key={item.id}>
                      <td className="type-cell">{item.type}</td>
                      <td>{item.name}</td>
                      <td>{item.from}</td>
                      <td>{item.to}</td>
                      <td>{item.appliedOn}</td>
                      <td>{item.approvedBy}</td>
                      <td>{item.approvedDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="right-sidebar">
         <ButtonRequest />
           {/* <button className="drafts-btn">Drafts</button>*/}
          <div className="filter-panel">
            <label>Filter by leave type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">Select leave type</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <label>Filter by leave month (from)</label>
            <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
              <option value="">Select month</option>
              {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <label>Filter by leave year (from)</label>
            <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
              <option value="">Select year</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ActivityLog;