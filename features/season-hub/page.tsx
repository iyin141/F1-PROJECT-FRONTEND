import React from 'react';
import SeasonOverview from './components/SeasonOverview';

export default function SeasonHubFeature({ year }: { year?: number }) {
  const displayYear = year ?? new Date().getFullYear();
  return (
    <section>
      <h2>Season Hub — {displayYear}</h2>
      <p>Scaffolded feature entry. Implement the full UI in `features/season-hub/components`.</p>
      <SeasonOverview />
    </section>
  );
}
