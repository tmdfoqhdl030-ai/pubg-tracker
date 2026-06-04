import fetch from 'node-fetch';

const prefix = 'https://cdn.dak.gg/pubg/images/tiers/s1/rank-';
const names = [
  'bronze', 'silver', 'gold', 'platinum', 'diamond', 'elite', 'master', 'conqueror', 'grandmaster', 'top500', 'unranked'
];

async function check(name) {
  const url = `${prefix}${name}.png`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.status === 200) {
      console.log(`FOUND in s1: ${url}`);
      return url;
    }
  } catch (e) {}
  return null;
}

async function run() {
  console.log("Checking names in s1...");
  await Promise.all(names.map(check));
  console.log("Done.");
}

run();
