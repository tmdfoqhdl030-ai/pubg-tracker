import fetch from 'node-fetch';

const prefixes = [
  'https://cdn.dak.gg/pubg/images/tiers/s7/rankicon_',
  'https://cdn.dak.gg/pubg/images/tiers/s1/rank-'
];

const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'conqueror', 'elite'];
const levels = ['1', '2', '3', '4', '5', ''];

async function check(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.status === 200) {
      console.log(`FOUND: ${url}`);
      return url;
    }
  } catch (e) {}
  return null;
}

async function run() {
  const urls = [];

  // s7/rankicon_<tier><level>.png
  for (const t of tiers) {
    for (const l of levels) {
      urls.push(`https://cdn.dak.gg/pubg/images/tiers/s7/rankicon_${t}${l}.png`);
    }
  }

  // s1/rank-<tier>.png
  for (const t of tiers) {
    urls.push(`https://cdn.dak.gg/pubg/images/tiers/s1/rank-${t}.png`);
  }

  console.log(`Checking ${urls.length} URLs...`);
  await Promise.all(urls.map(check));
  console.log("Done checking.");
}

run();
