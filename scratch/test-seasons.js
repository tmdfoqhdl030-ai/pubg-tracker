import fetch from 'node-fetch';

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
  for (let s = 1; s <= 30; s++) {
    urls.push(`https://cdn.dak.gg/pubg/images/tiers/s${s}/rankicon_bronze1.png`);
    urls.push(`https://cdn.dak.gg/pubg/images/tiers/s${s}/rankicon_master.png`);
    urls.push(`https://cdn.dak.gg/pubg/images/tiers/s${s}/rank-master.png`);
  }

  console.log(`Checking ${urls.length} season URLs...`);
  await Promise.all(urls.map(check));
  console.log("Done checking seasons.");
}

run();
