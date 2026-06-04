import fs from 'fs';

const html = fs.readFileSync('c:/Users/박승래/Desktop/coding/test/pubg-tracker/scratch/leaderboard.html', 'utf-8');

const regex = /rankicon_[a-zA-Z0-9_-]*/g;
const matches = html.match(regex) || [];
console.log("Matches in HTML:");
console.log([...new Set(matches)]);
