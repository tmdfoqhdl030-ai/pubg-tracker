import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const url = 'https://cdn.dak.gg/pubg/images/tiers/s7/rankicon_survivor1.png';
const destDir = 'c:/Users/박승래/Desktop/coding/test/pubg-tracker/public/tiers/s7';

async function run() {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dak.gg/'
      }
    });
    if (res.status === 200) {
      const buffer = await res.buffer();
      fs.writeFileSync(path.join(destDir, 'survivor1.png'), buffer);
      fs.writeFileSync(path.join(destDir, 'survivor.png'), buffer);
      fs.writeFileSync(path.join(destDir, 'conqueror.png'), buffer); // Also save as conqueror.png for compatibility
      console.log(`Saved survivor1.png, survivor.png, conqueror.png (${buffer.length} bytes)`);
    }
  } catch (err) {
    console.error(err);
  }
}
run();
