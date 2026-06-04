import fetch from 'node-fetch';

async function run() {
  const url = 'https://cdn.dak.gg/images/pubg/tier/silver.png';
  try {
    const res = await fetch(url);
    console.log("GET status:", res.status);
    console.log("Headers:");
    for (const [k, v] of res.headers.entries()) {
      console.log(`${k}: ${v}`);
    }
    const text = await res.text();
    console.log("Content start:", text.substring(0, 200));
  } catch (err) {
    console.error(err);
  }
}
run();
