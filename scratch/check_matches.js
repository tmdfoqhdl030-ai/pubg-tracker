const fs = require('fs');
const envPath = 'c:\\Users\\박승래\\Desktop\\coding\\test\\pubg-tracker\\.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/PUBG_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : '';

const nickname = '20241218';
const platform = 'steam';
const BASE_URL = 'https://api.pubg.com/shards';

async function checkMatches() {
  const playerUrl = `${BASE_URL}/${platform}/players?filter[playerNames]=${encodeURIComponent(nickname)}`;
  const res = await fetch(playerUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/vnd.api+json',
    }
  });
  const data = await res.json();
  const player = data.data?.[0];
  if (!player) {
    console.log('Player not found');
    return;
  }
  const matchData = player.relationships?.matches?.data ?? [];
  console.log('Total matches returned in relationships:', matchData.length);
  console.log('Match list:', matchData.slice(0, 10));
}

checkMatches();
