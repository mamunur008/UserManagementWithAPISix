export function matchesSearch(row, query, keys) {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  return keys.some((key) => String(row[key] ?? '').toLowerCase().includes(needle));
}

export function joinName(firstName, lastName, fallback = '—') {
  const name = [firstName, lastName].filter(Boolean).join(' ');
  return name || fallback;
}
