import fs from 'fs';
import path from 'path';

const srcDir = 'c:/Users/박승래/Desktop/coding/test/pubg-tracker/public/tiers/s7';
const destDir = 'c:/Users/박승래/Desktop/coding/test/pubg-tracker/public/tiers';

async function run() {
  const files = fs.readdirSync(srcDir);
  for (const f of files) {
    const srcPath = path.join(srcDir, f);
    const destPath = path.join(destDir, f);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${f} to public/tiers/`);
  }
}
run();
