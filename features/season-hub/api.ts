export async function fetchSeason(year: number = new Date().getFullYear()) {
  const res = await fetch(`/api/races/${year}`);
  if (!res.ok) throw new Error('Failed to fetch season');
  return res.json();
}
