import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const prefix = 'https://cdn.dak.gg/pubg/images/tiers/s7/rankicon_';
const destDir = 'c:/Users/박승래/Desktop/coding/test/pubg-tracker/public/tiers/s7';

const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'conqueror', 'top500', 'unranked', 'none'];
const levels = ['', '1', '2', '3', '4', '5'];

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
      console.log(`Saved: ${name}.png (${buffer.length} bytes)`);
      return true;
    }
  } catch (err) {
    console.error(`Error downloading ${name}:`, err);
  }
  return false;
}

async function run() {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const list = [];
  for (const t of tiers) {
    for (const l of levels) {
      list.push(`${t}${l}`);
    }
  }

  console.log(`Checking and downloading ${list.length} images...`);
  const results = await Promise.all(list.map(download));
  const count = results.filter(Boolean).length;
  console.log(`Finished. Downloaded ${count} images.`);
}

run();
