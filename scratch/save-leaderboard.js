import fetch from 'node-fetch';
import fs from 'fs';

async function run() {
  const url = 'https://dak.gg/pubg/ranks';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    const html = await res.text();
    fs.writeFileSync('c:/Users/박승래/Desktop/coding/test/pubg-tracker/scratch/leaderboard.html', html);
    console.log("Saved ranks HTML, length:", html.length);
  } catch (err) {
    console.error(err);
  }
}
run();
