import fetch from 'node-fetch';

async function run() {
  const jsUrls = [
    'https://cdn.dak.gg/pubg-web/1779518972/_nuxt/e580aa5.js',
    'https://cdn.dak.gg/pubg-web/1779518972/_nuxt/c9585df.js',
    'https://cdn.dak.gg/pubg-web/1779518972/_nuxt/6ad511e.js',
    'https://cdn.dak.gg/pubg-web/1779518972/_nuxt/b85e9ab.js',
    'https://cdn.dak.gg/pubg-web/1779518972/_nuxt/99bfa17.js'
  ];

  for (const url of jsUrls) {
    try {
      console.log("Fetching JS:", url);
      const res = await fetch(url);
      const text = await res.text();
      // Let's find any occurrences of words ending with .png or containing .png
      const regex = /["']([^"'\s]+?\.(?:png|svg|webp|gif|jpg))["']/gi;
      let match;
      const images = [];
      while ((match = regex.exec(text)) !== null) {
        images.push(match[1]);
      }
      const unique = [...new Set(images)];
      console.log(`Found ${unique.length} images in ${url}:`);
      unique.forEach(img => {
        if (img.includes('tier') || img.includes('rank') || img.includes('emblem') || img.includes('pubg') || img.includes('badge') || img.includes('silver') || img.includes('gold')) {
          console.log("  MATCH:", img);
        }
      });
    } catch (err) {
      console.error(err);
    }
  }
}
run();
