import fs from 'fs';

const content = fs.readFileSync('c:/Users/박승래/Desktop/coding/test/pubg-tracker/scratch/b85e9ab.js', 'utf-8');

const regex = /rankicon_[a-zA-Z0-9_-]*/g;
const matches = content.match(regex) || [];
console.log("All matches for rankicon_:");
console.log([...new Set(matches)]);
