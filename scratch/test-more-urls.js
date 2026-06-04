import fetch from 'node-fetch';

const prefix = 'https://cdn.dak.gg/images/pubg/tier/';
const names = [
  'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'conqueror', 'grandmaster',
  'bronze-1', 'bronze-2', 'bronze-3', 'bronze-4', 'bronze-5',
  'silver-1', 'silver-2', 'silver-3', 'silver-4', 'silver-5',
  'gold-1', 'gold-2', 'gold-3', 'gold-4', 'gold-5',
  'platinum-1', 'platinum-2', 'platinum-3', 'platinum-4', 'platinum-5',
  'diamond-1', 'diamond-2', 'diamond-3', 'diamond-4', 'diamond-5',
  'master-1', 'master-2', 'master-3', 'master-4', 'master-5',
  'unranked', 'none', 'unknown', 'rank', 'top500', 'top-500'
];

async function check(name) {
  const url = `${prefix}${name}.png`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.status === 200) {
      console.log(`FOUND: ${url}`);
      return url;
    }
  } catch (err) {}
  return null;
}

async function run() {
  console.log("Checking more files...");
  await Promise.all(names.map(check));
  console.log("Done.");
}

run();
