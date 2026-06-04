import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "public", "tiers", "tier-badges.png");
const OUT = path.join(__dirname, "..", "public", "tiers");

// 이미지: 1024x576
// 스캔으로 찾은 밝은 영역 중심 + 반지름 (원형 마스크 적용)
const badges = {
  // 상단 행: 배지 약 180-200px 지름
  bronze:    { cx: 328, cy: 199, r: 120 },
  silver:    { cx: 509, cy: 195, r: 120 },
  gold:      { cx: 692, cy: 190, r: 130 },
  // 하단 행: 배지 약 220-260px 지름
  platinum:  { cx: 219, cy: 376, r: 145 },
  diamond:   { cx: 409, cy: 375, r: 140 },
  master:    { cx: 609, cy: 376, r: 140 },
  conqueror: { cx: 800, cy: 376, r: 140 },
};

const IMG_W = 1024;
const IMG_H = 576;

async function extractBadge(name, { cx, cy, r }) {
  // 크롭 영역 (중심에서 반지름+여유분 만큼)
  const pad = 10;
  const cropSize = (r + pad) * 2;
  const left = Math.max(0, cx - r - pad);
  const top  = Math.max(0, cy - r - pad);
  const width  = Math.min(cropSize, IMG_W - left);
  const height = Math.min(cropSize, IMG_H - top);
  
  console.log(`\n✂️  [${name}] center=(${cx},${cy}) r=${r} → crop ${width}x${height}`);

  // 1. 크롭 + raw 픽셀
  const { data, info } = await sharp(SRC)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = Buffer.from(data);
  const w = info.width;
  const h = info.height;
  const ch = info.channels;
  
  // 크롭 내에서의 중심점
  const localCx = cx - left;
  const localCy = cy - top;

  // 2. 배경색 샘플링 (모서리 5px 밴드)
  let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
  const B = 5;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x < B || x >= w - B || y < B || y >= h - B) {
        const idx = (y * w + x) * ch;
        bgR += px[idx]; bgG += px[idx+1]; bgB += px[idx+2];
        bgCount++;
      }
    }
  }
  bgR /= bgCount; bgG /= bgCount; bgB /= bgCount;

  // 3. 배경 제거 + 원형 마스크 동시 적용
  const HARD = 32;  // 배경색과 이 거리 이내 → 투명
  const SOFT = 55;  // 페이드 구간
  const EDGE_FADE = r * 0.15; // 원형 마스크 페이드 폭

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * ch;
      const pr = px[idx], pg = px[idx+1], pb = px[idx+2];
      
      // (a) 배경색 거리 기반 알파
      const bgDist = Math.sqrt((pr-bgR)**2 + (pg-bgG)**2 + (pb-bgB)**2);
      let alphaFromBg = 255;
      if (bgDist < HARD) {
        alphaFromBg = 0;
      } else if (bgDist < SOFT) {
        alphaFromBg = Math.round(((bgDist - HARD) / (SOFT - HARD)) * 255);
      }

      // (b) 원형 마스크: 중심으로부터의 거리
      const dx = x - localCx;
      const dy = y - localCy;
      const distFromCenter = Math.sqrt(dx*dx + dy*dy);
      let alphaFromCircle = 255;
      if (distFromCenter > r) {
        alphaFromCircle = 0;
      } else if (distFromCenter > r - EDGE_FADE) {
        alphaFromCircle = Math.round(((r - distFromCenter) / EDGE_FADE) * 255);
      }

      // 최종 알파: 둘 중 작은 값
      px[idx+3] = Math.min(alphaFromBg, alphaFromCircle);
    }
  }

  // 4. trim → 정사각형 패딩 → 저장
  const processed = await sharp(px, { raw: { width: w, height: h, channels: ch } })
    .png()
    .toBuffer();

  const trimmed = await sharp(processed).trim({ threshold: 5 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  const tw = meta.width || w;
  const th = meta.height || h;
  const maxDim = Math.max(tw, th);

  const outPath = path.join(OUT, `${name}.png`);
  await sharp(trimmed)
    .extend({
      top: Math.floor((maxDim - th) / 2),
      bottom: Math.ceil((maxDim - th) / 2),
      left: Math.floor((maxDim - tw) / 2),
      right: Math.ceil((maxDim - tw) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(`   ✅ ${name}.png → ${maxDim}x${maxDim}`);
}

async function main() {
  console.log("🎖️  PUBG 배지 누끼 추출 v3 (원형 마스크 + 배경색 제거)\n");

  for (const [name, cfg] of Object.entries(badges)) {
    await extractBadge(name, cfg);
  }

  console.log("\n🎉 완료!");
}

main().catch(err => { console.error("❌", err); process.exit(1); });
