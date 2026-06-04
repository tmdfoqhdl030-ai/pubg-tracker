import fs from 'fs';

const content = fs.readFileSync('c:/Users/박승래/Desktop/coding/test/pubg-tracker/scratch/b85e9ab.js', 'utf-8');

function findContext(query) {
  let idx = 0;
  while (true) {
    idx = content.indexOf(query, idx);
    if (idx === -1) break;
    console.log(`--- MATCH FOR "${query}" AT INDEX ${idx} ---`);
    console.log(content.substring(idx - 150, idx + 150));
    idx += query.length;
  }
}

findContext('/ranks/');
