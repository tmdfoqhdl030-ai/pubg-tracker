import fetch from 'node-fetch';

async function run() {
  const url = 'https://pubg0.dakgg.io/api/v1/ranks/steam/squad';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dak.gg/'
      }
    });
    const json = await res.json();
    console.log("Entire first rank entry:");
    console.log(JSON.stringify(json.ranks[0], null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
