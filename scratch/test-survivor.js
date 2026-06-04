import fetch from 'node-fetch';

const prefix = 'https://cdn.dak.gg/pubg/images/tiers/s7/rankicon_';
const names = [
  'survivor', 'survivor1', 'survivor2', 'survivor3', 'survivor4', 'survivor5',
  'survivor_1', 'survivor-1', 'grandmaster', 'top500'
];

async function check(name) {
  const url = `${prefix}${name}.png`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.status === 200) {
      console.log(`FOUND SURVIVOR ASSET: ${url}`);
      return url;
    }
  } catch (e) {}
  return null;
}

async function run() {
  console.log("Checking survivor names in s7...");
  await Promise.all(names.map(check));
  console.log("Done.");
}

run();
