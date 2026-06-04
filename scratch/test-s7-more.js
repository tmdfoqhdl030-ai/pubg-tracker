import fetch from 'node-fetch';

const prefix = 'https://cdn.dak.gg/pubg/images/tiers/s7/rankicon_';
const names = [
  'elite', 'elite1', 'elite2', 'elite3', 'elite4', 'elite5',
  'top', 'top-500', 'top500', 'grandmaster', 'grandmaster1', 'conqueror', 'conqueror1',
  'challenger', 'challenger1', 'rank', 'rank1', 'pro', 'pro1', 'tier', 'legend', 'legend1'
];

async function check(name) {
  const url = `${prefix}${name}.png`;
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
  console.log("Checking more names in s7...");
  await Promise.all(names.map(check));
  console.log("Done.");
}

run();
