import fs from 'fs';

const content = fs.readFileSync('c:/Users/박승래/Desktop/coding/test/pubg-tracker/scratch/b85e9ab.js', 'utf-8');

// Find occurrences of ranks/ and log context
let idx = 0;
while (true) {
  idx = content.indexOf('ranks/', idx);
  if (idx === -1) break;
  console.log(`--- ranks/ AT INDEX ${idx} ---`);
  console.log(content.substring(idx - 200, idx + 200));
  idx += 6;
}
