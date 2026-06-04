import fetch from 'node-fetch';

const prefixes = [
  'https://cdn.dak.gg/pubg/images/tier/',
  'https://cdn.dak.gg/pubg/images/tiers/',
  'https://cdn.dak.gg/pubg/images/rank/',
  'https://cdn.dak.gg/pubg/images/ranks/',
  'https://cdn.dak.gg/pubg/images/emblem/',
  'https://cdn.dak.gg/pubg/images/emblems/',
  'https://cdn.dak.gg/pubg/images/grade/',
  'https://cdn.dak.gg/pubg/images/grades/',
  'https://cdn.dak.gg/pubg/images/',
  'https://cdn.dak.gg/pubg/',
  'https://cdn.dak.gg/images/pubg/tier/',
  'https://cdn.dak.gg/images/pubg/emblem/',
  'https://cdn.dak.gg/images/pubg/',
  'https://cdn.dak.gg/images/tier/',
  'https://cdn.dak.gg/images/rank/'
];

const tiers = [
  'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'conqueror',
  'bronze_1', 'bronze-1', 'gold_1', 'gold-1', 'master_1', 'master-1',
  'conqueror_1', 'conqueror-1', 'unranked'
];

const extensions = ['.png', '.svg', '.webp'];

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', timeout: 3000 });
    if (res.status === 200) {
      console.log(`FOUND (HEAD): ${url}`);
      return url;
    }
  } catch (err) {
    // try GET in case HEAD is not allowed
    try {
      const res = await fetch(url, { method: 'GET', timeout: 3000 });
      if (res.status === 200) {
        console.log(`FOUND (GET): ${url}`);
        return url;
      }
    } catch (e) {
      // ignore
    }
  }
  return null;
}

async function run() {
  const urls = [];
  for (const p of prefixes) {
    for (const t of tiers) {
      for (const ext of extensions) {
        urls.push(`${p}${t}${ext}`);
        urls.push(`${p}${t.toUpperCase()}${ext}`);
        // Capitalized
        const cap = t.charAt(0).toUpperCase() + t.slice(1);
        urls.push(`${p}${cap}${ext}`);
      }
    }
  }

  console.log(`Checking ${urls.length} URLs...`);
  const chunkSize = 20;
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    await Promise.all(chunk.map(checkUrl));
  }
  console.log("Done checking URLs.");
}

run();
