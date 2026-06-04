import fetch from 'node-fetch';

async function run() {
  try {
    const res = await fetch('https://dak.gg/pubg/leaderboard');
    const html = await res.text();
    console.log("HTML length:", html.length);
    const regex = /["']([^"']+\.(?:png|svg|webp|jpg))["']/gi;
    let match;
    const matches = [];
    while ((match = regex.exec(html)) !== null) {
      matches.push(match[1]);
    }
    console.log("Unique matches from leaderboard page:");
    const unique = [...new Set(matches)];
    unique.forEach(m => console.log(m));
  } catch (err) {
    console.error(err);
  }
}
run();
