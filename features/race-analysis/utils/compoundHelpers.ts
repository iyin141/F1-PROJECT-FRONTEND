export type CanonicalCompound = 'soft' | 'medium' | 'hard' | 'inter' | 'wet' | 'unknown';

export function normalizeCompound(raw?: string | null): CanonicalCompound {
  if (!raw) return 'unknown';
  const key = String(raw).toLowerCase().trim();
  if (key === 's' || key === 'soft') return 'soft';
  if (key === 'm' || key === 'medium') return 'medium';
  if (key === 'h' || key === 'hard') return 'hard';
  if (key === 'i' || key === 'inter' || key === 'intermediate') return 'inter';
  if (key === 'w' || key === 'wet') return 'wet';
  if (['soft', 'medium', 'hard', 'inter', 'wet'].includes(key)) return key as CanonicalCompound;
  if (key.includes('soft')) return 'soft';
  if (key.includes('medium')) return 'medium';
  if (key.includes('hard')) return 'hard';
  if (key.includes('inter')) return 'inter';
  if (key.includes('wet')) return 'wet';
  return 'unknown';
}

export function isKnownCompound(raw?: string | null): raw is Exclude<CanonicalCompound, 'unknown'> {
  return normalizeCompound(raw) !== 'unknown';
}
