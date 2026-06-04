import fetch from 'node-fetch';

async function run() {
  const url = 'https://cdn.dak.gg/pubg-web/1779518972/_nuxt/5d434e4.js';
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(text);
  } catch (err) {
    console.error(err);
  }
}
run();
