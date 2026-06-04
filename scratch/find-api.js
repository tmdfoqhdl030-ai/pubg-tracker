import fetch from 'node-fetch';

async function run() {
  const url = 'https://cdn.dak.gg/pubg-web/1779518972/_nuxt/5d434e4.js';
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log("Ranks page JS bundle fetched, length:", text.length);

    // Let's find any occurrences of words ending with .png or containing .png/svg/webp
    const imgRegex = /["']([^"'\s]+?\.(?:png|svg|webp|gif|jpg))["']/gi;
    let match;
    const images = [];
    while ((match = imgRegex.exec(text)) !== null) {
      images.push(match[1]);
    }
    console.log("Images found in ranks bundle:", [...new Set(images)]);

    // Let's find any API endpoint strings or path patterns
    // Look for strings like "/api/v1/..." or "https://..." or "/pubg/api/..."
    const pathRegex = /["'](\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)+)["']/g;
    const paths = [];
    while ((match = pathRegex.exec(text)) !== null) {
      paths.push(match[1]);
    }
    console.log("Paths found in ranks bundle:", [...new Set(paths)]);

  } catch (err) {
    console.error(err);
  }
}
run();
