'use client';
import React, { useState } from 'react';

type Props = { value?: number; onChange?: (y: number) => void };
export default function YearSelector({ value, onChange }: Props) {
  const current = new Date().getFullYear();
  const [year, setYear] = useState<number>(value ?? current);
  const options = Array.from({ length: 16 }, (_, i) => current - i);
  return (
    <label>
      Year:
      <select value={year} onChange={(e) => { const v = parseInt(e.target.value, 10); setYear(v); onChange?.(v); }}>
        {options.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </label>
  );
}
