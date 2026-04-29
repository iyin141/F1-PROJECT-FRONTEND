'use client';
import React from 'react';
import type { Season } from '../types';

export default function SeasonOverview({ season }: { season?: Season | null }) {
  if (!season || !season.races?.length) return <em>No season data yet</em>;
  return (
    <div>
      {season.races.map((r) => (
        <div key={r.id}>{r.name} — {r.date}</div>
      ))}
    </div>
  );
}
