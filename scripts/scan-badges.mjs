import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "public", "tiers", "tier-badges.png");

async function scan() {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  console.log(`Image: ${width}x${height}, channels: ${channels}\n`);

  // 밝기 맵 생성: 각 픽셀의 밝기 계산
  const bright = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * channels;
    bright[i] = data[idx] * 0.299 + data[idx+1] * 0.587 + data[idx+2] * 0.114;
  }

  // 밝은 영역 (threshold > 60) 의 바운딩 박스를 찾기 위해
  // connected component labeling 수행
  const THRESH = 55;
  const visited = new Uint8Array(width * height);
  const regions = [];

  function floodFill(startX, startY) {
    const stack = [[startX, startY]];
    let minX = startX, maxX = startX, minY = startY, maxY = startY;
    let count = 0;

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      const pos = y * width + x;
      if (visited[pos]) continue;
      if (bright[pos] < THRESH) continue;

      visited[pos] = 1;
      count++;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      // 4방향 + 대각선 (8방향)
      stack.push([x-1,y],[x+1,y],[x,y-1],[x,y+1]);
      stack.push([x-1,y-1],[x+1,y-1],[x-1,y+1],[x+1,y+1]);
    }

    return { minX, maxX, minY, maxY, count };
  }

  // 전체 이미지 스캔해서 밝은 영역 찾기
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      if (visited[pos]) continue;
      if (bright[pos] < THRESH) { visited[pos] = 1; continue; }

      const region = floodFill(x, y);
      // 최소 1000 픽셀 이상인 영역만 배지로 인정
      if (region.count > 1000) {
        const w = region.maxX - region.minX;
        const h = region.maxY - region.minY;
        // 너무 넓은 영역(가로선 등)은 제외
        if (w < 500 && h < 400) {
          regions.push(region);
        }
      }
    }
  }

  // x 좌표 기준 정렬 후 상단/하단 분리
  regions.sort((a, b) => {
    const aY = (a.minY + a.maxY) / 2;
    const bY = (b.minY + b.maxY) / 2;
    if (Math.abs(aY - bY) > 100) return aY - bY;
    return (a.minX + a.maxX) / 2 - (b.minX + b.maxX) / 2;
  });

  console.log(`발견된 배지 영역: ${regions.length}개\n`);

  const tierNames = ["bronze","silver","gold","platinum","diamond","master","conqueror"];
  
  regions.forEach((r, i) => {
    const cx = Math.round((r.minX + r.maxX) / 2);
    const cy = Math.round((r.minY + r.maxY) / 2);
    const w = r.maxX - r.minX;
    const h = r.maxY - r.minY;
    const name = tierNames[i] || `unknown_${i}`;
    // 10% 마진 추가
    const margin = Math.round(Math.max(w, h) * 0.08);
    const cropLeft = Math.max(0, r.minX - margin);
    const cropTop = Math.max(0, r.minY - margin);
    const cropW = Math.min(width - cropLeft, w + margin * 2);
    const cropH = Math.min(height - cropTop, h + margin * 2);
    
    console.log(`[${name}] center=(${cx},${cy}) size=${w}x${h} pixels=${r.count}`);
    console.log(`  crop: { left: ${cropLeft}, top: ${cropTop}, width: ${cropW}, height: ${cropH} }\n`);
  });
}

scan().catch(console.error);
