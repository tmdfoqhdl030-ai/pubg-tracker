import fetch from 'node-fetch';

async function run() {
  try {
    const res = await fetch('https://pubg0.dakgg.io/api/v1/seasons/active', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dak.gg/'
      }
    });
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("Active season response:");
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
