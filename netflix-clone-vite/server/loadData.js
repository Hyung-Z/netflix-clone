import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METADATA_PATH = path.resolve(__dirname, "../public/metadata.json");

const PLACEHOLDER = "/db/돋보기.png";

export function loadTitles() {
  const raw = fs.readFileSync(METADATA_PATH, "utf-8");
  const meta = JSON.parse(raw); // { "작품명": { 장르:[], 공개일:[] }, ... }

  // 배열로 평탄화: [{ id, name, genres, releasedAt, type, image }]
  let id = 1;
  const titles = Object.entries(meta).map(([name, info]) => {
    const genres = Array.isArray(info?.["장르"]) ? info["장르"] : [];
    const releasedAtArr = Array.isArray(info?.["공개일"]) ? info["공개일"] : [];
    const releasedAt = releasedAtArr[0] ?? null;

    // type이 없다면 규칙 정하기: 장르에 "시리즈" 포함이면 series, 아니면 movie 등
    const type = genres.includes("시리즈") ? "series" : "movie";

    return {
      id: id++,
      name,
      genres,               // ["스릴러","SF"]
      releasedAt,           // "2019-07-04"
      type,                 // "series" | "movie" (임의 규칙)
      image: PLACEHOLDER,   // 메타에 이미지가 없으므로 기본값
    };
  });

  return titles;
}
