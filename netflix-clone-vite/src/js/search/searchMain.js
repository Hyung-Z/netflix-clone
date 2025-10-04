// searchMain.js (발췌)
import { debounce } from "../utils/debounce.js";
import { searchTitles } from "./api.js";
import { renderResults } from "./render.js";

const input = document.querySelector("#search-input");
const resultLayer = document.querySelector("#result-layer");

// 디바운스된 검색
const handleSearch = debounce(async (q) => {
  const data = await searchTitles({ q });
  renderResults(resultLayer, data, q);  // ✅ q 전달
}, 500);

input.addEventListener("input", (e) => {
  const q = e.target.value.trim();
  if (!q) {
    resultLayer.hidden = true;
    resultLayer.innerHTML = "";
    return;
  }
  handleSearch(q);
});
