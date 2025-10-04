const KEY = "recent_keywords";

export function pushRecent(q) {
  if (!q) return;
  const arr = [q, ...getRecent().filter(x => x !== q)].slice(0, 5);
  localStorage.setItem(KEY, JSON.stringify(arr));
}

export function getRecent() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
