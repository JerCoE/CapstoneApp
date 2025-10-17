import '../styles/FilterList.css';
import { useState } from 'react';

export default function FilterList({
  types = ['All', 'Holiday', 'Vacation', 'Sick', 'Parental'],
  departments = ['All', 'Web 1', 'Quality Assurance', 'HR'],
  onChange = (f: { type: string; department: string }) => console.log(f),
}: {
  types?: string[];
  departments?: string[];
  onChange?: (f: { type: string; department: string }) => void;
}) {
  const [type, setType] = useState<string>(types[0] ?? 'All');
  const [dept, setDept] = useState<string>(departments[0] ?? 'All');

  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setType(e.target.value);
    onChange({ type: e.target.value, department: dept });
  }

  function handleDeptChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setDept(e.target.value);
    onChange({ type, department: e.target.value });
  }

  return (
    <div className="filter-list">
      <label className="filter-label">Filter by leave type</label>
      <select className="filter-select" value={type} onChange={handleTypeChange}>
        {types.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <label className="filter-label">Filter by department</label>
      <select className="filter-select" value={dept} onChange={handleDeptChange}>
        {departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  );
}
