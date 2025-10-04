// render.js
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function highlight(text, term) {
  if (!term) return text;
  const re = new RegExp(`(${escapeRegExp(term)})`, "ig");
  return text.replace(re, "<mark>$1</mark>");
}

export function renderResults(layer, data, q = "") {
  const term = q.trim().toLowerCase();
  const all = Array.isArray(data?.items) ? data.items : [];

  // ✅ 입력어 포함 항목만 클라이언트에서 한 번 더 필터
  const items = term
    ? all.filter(i => i?.name?.toLowerCase().includes(term))
    : [];

  if (!term || items.length === 0) {
    layer.hidden = true;
    layer.innerHTML = ""; // 옵션: "검색 결과 없음" 메시지 원하면 여기에 넣기
    return;
  }

  layer.innerHTML = `
    <ul>
      ${items.map(item => `
        <li class="result">
          <img src="/db/${item.name}.jpg" alt="${item.name}" />
          <div class="meta">
            <strong>${highlight(item.name, term)}</strong>
          </div>
        </li>
      `).join("")}
    </ul>`;
  layer.hidden = false;
}
