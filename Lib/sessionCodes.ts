/*
 * Lib/sessionCodes.ts
 *
 * Utilities for normalizing session identifiers between backend/adapters
 * and the project's canonical session codes used in query keys and API calls.
 */

export type CanonicalSessionCode = 'R' | 'S' | 'Q' | 'SQ' | 'FP1' | 'FP2' | 'FP3';

export const API_SESSION_CODES: CanonicalSessionCode[] = ['R', 'S', 'Q', 'SQ', 'FP1', 'FP2', 'FP3'];

/**
 * Normalize various backend session ids/names into the project's canonical
 * session codes used in query keys and API calls.
 */
export function normalizeSessionForApi(input?: string | null): CanonicalSessionCode | null {
  if (!input) return null;
  const s = String(input).toLowerCase().trim().replace(/[_\s]+/g, '-');

  if (s === 'r' || s === 'race') return 'R';
  if (s === 'q' || s === 'qualifying') return 'Q';

  // Sprint shootout / sprint qualifying variants map to SQ
  if (s.includes('sprint') && (s.includes('shoot') || s.includes('qualif') || s.includes('shootout'))) return 'SQ';

  // plain sprint -> S
  if (s === 'sprint' || s === 's') return 'S';

  // Practice variants
  if (s === 'fp1' || s === 'practice-1' || s === 'practice1' || (s.includes('practice') && s.includes('1'))) return 'FP1';
  if (s === 'fp2' || s === 'practice-2' || s === 'practice2' || (s.includes('practice') && s.includes('2'))) return 'FP2';
  if (s === 'fp3' || s === 'practice-3' || s === 'practice3' || (s.includes('practice') && s.includes('3'))) return 'FP3';

  return null;
}

/**
 * Backwards-compatible alias used by other modules that expect a `map*` name.
 */
export function mapSessionIdToApiCode(session?: string | null): CanonicalSessionCode | null {
  return normalizeSessionForApi(session);
}

export function formatSessionLabel(code?: string | null): string {
  if (!code) return '';
  const up = String(code).toUpperCase();
  switch (up) {
    case 'FP1':
    case 'FP2':
    case 'FP3':
      return up;
    case 'Q':
      return 'QUALIFYING';
    case 'R':
      return 'RACE';
    case 'S':
      return 'SPRINT';
    case 'SQ':
      return 'SPRINT QUALIFYING';
    default:
      return up;
  }
}
