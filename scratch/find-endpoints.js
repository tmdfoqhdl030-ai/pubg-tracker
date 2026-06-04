import fs from 'fs';

const content = fs.readFileSync('c:/Users/박승래/Desktop/coding/test/pubg-tracker/scratch/b85e9ab.js', 'utf-8');

const regex = /\.get\(\s*["']([^"'\s]+?)["']/g;
let match;
const endpoints = [];
while ((match = regex.exec(content)) !== null) {
  endpoints.push(match[1]);
}
console.log("Endpoints found:");
console.log([...new Set(endpoints)]);
