import express from "express";
import cors from "cors";
import { loadTitles } from "./loadData.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 서버 시작 시 1회 로드
const TITLES = loadTitles();

// GET /api/search?q=키워드&genre=장르명&year=YYYY
app.get("/api/search", async (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const genre = String(req.query.genre || "").trim();
  const year = String(req.query.year || "").trim();

  // 1초 지연 (요구사항)
  await new Promise(r => setTimeout(r, 1000));

  let items = TITLES;

  // 키워드: 작품명 기준 부분일치
  if (q) {
    items = items.filter(t => t.name.toLowerCase().includes(q));
  }

  // 장르 필터 (선택)
  if (genre) {
    items = items.filter(t => t.genres?.includes(genre));
  }

  // 연도 필터 (선택) - 공개일 "YYYY-MM-DD"에서 YYYY 비교
  if (year) {
    items = items.filter(t => (t.releasedAt ?? "").slice(0,4) === year);
  }

  res.json({ items, total: items.length });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
