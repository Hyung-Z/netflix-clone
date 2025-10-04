export async function searchTitles({ q, genre = "", year = "" }) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (genre) params.set("genre", genre);
  if (year) params.set("year", year);

  const res = await fetch(`http://localhost:3001/api/search?${params.toString()}`);
  return res.json();
}