import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const prefix = 'https://cdn.dak.gg/pubg/images/tiers/s1/rank-';
const destDir = 'c:/Users/박승래/Desktop/coding/test/pubg-tracker/public/tiers/s1';

const names = [
  'bronze', 'silver', 'gold', 'platinum', 'diamond', 'elite', 'master', 'grandmaster', 'top500', 'unranked'
];

async function download(name) {
  const url = `${prefix}${name}.png`;
  const destPath = path.join(destDir, `${name}.png`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dak.gg/'
      }
    });
    if (res.status === 200) {
      const buffer = await res.buffer();
      fs.writeFileSync(destPath, buffer);
      console.log(`Saved in s1: ${name}.png (${buffer.length} bytes)`);
      return true;
    }
  } catch (err) {
    console.error(`Error downloading s1 ${name}:`, err);
  }
  return false;
}

async function run() {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  console.log("Downloading s1 images...");
  const results = await Promise.all(names.map(download));
  const count = results.filter(Boolean).length;
  console.log(`Finished. Downloaded ${count} images.`);
}

run();
