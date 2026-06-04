import fetch from 'node-fetch';
import fs from 'fs';

async function run() {
  const url = 'https://cdn.dak.gg/pubg-web/1779518972/_nuxt/b85e9ab.js';
  try {
    const res = await fetch(url);
    const text = await res.text();
    fs.writeFileSync('c:/Users/박승래/Desktop/coding/test/pubg-tracker/scratch/b85e9ab.js', text);
    console.log("Saved b85e9ab.js, length:", text.length);

    // Find any api base url or endpoint patterns
    const regex = /https?:\/\/[^\s"'`<>]+|api\/v\d\/[^\s"'`<>]+/g;
    const matches = text.match(regex) || [];
    console.log("Plausible API patterns:");
    const unique = [...new Set(matches)];
    unique.filter(m => m.includes('api') || m.includes('dak.gg') || m.includes('pubg')).forEach(m => console.log("  ", m));

    // Look for string literals containing /pubg/
    const pubgRegex = /"\/pubg\/[^\s"'`<>]+"/g;
    const pubgMatches = text.match(pubgRegex) || [];
    console.log("Pubg routes/paths:");
    [...new Set(pubgMatches)].forEach(m => console.log("  ", m));
  } catch (err) {
    console.error(err);
  }
}
run();
