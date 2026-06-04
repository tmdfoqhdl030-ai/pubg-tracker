import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const prefix = 'https://cdn.dak.gg/images/pubg/tier/';
const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];
const destDir = 'c:/Users/박승래/Desktop/coding/test/pubg-tracker/public/tiers';

async function download(tier) {
  const url = `${prefix}${tier}.png`;
  const destPath = path.join(destDir, `${tier}.png`);
  console.log(`Downloading ${url} -> ${destPath}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dak.gg/'
      }
    });
    if (!res.ok) {
      console.error(`Failed to download ${tier}: ${res.status} ${res.statusText}`);
      return;
    }
    const buffer = await res.buffer();
    fs.writeFileSync(destPath, buffer);
    console.log(`Saved ${tier}.png successfully (${buffer.length} bytes).`);
  } catch (err) {
    console.error(`Error downloading ${tier}:`, err);
  }
}

async function run() {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  for (const tier of tiers) {
    await download(tier);
  }
  console.log("Download complete.");
}

run();
