import fs from 'fs';
import path from 'path';

const searchDirs = [
  'c:/Users/박승래/Desktop/coding/test/pubg-tracker/components',
  'c:/Users/박승래/Desktop/coding/test/pubg-tracker/app'
];

function walk(dir, results = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      walk(fullPath, results);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const files = [];
searchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    walk(dir, files);
  }
});

const queries = ['LandingZonesCard', 'FarmingHeatmapCard'];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  for (const q of queries) {
    if (content.includes(q)) {
      console.log(`MATCH [${q}] in ${file}`);
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes(q)) {
          console.log(`  L${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
}
