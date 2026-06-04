const fs = require('fs');
const envPath = 'c:\\Users\\박승래\\Desktop\\coding\\test\\pubg-tracker\\.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/PUBG_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : '';

const nickname = '20241218';
const platform = 'steam';
const BASE_URL = 'https://api.pubg.com/shards';

async function testTelemetry() {
  // 1. Get player
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
  const matchIds = (player.relationships?.matches?.data ?? []).map(m => m.id).slice(0, 5);
  console.log('Testing matches:', matchIds);

  for (const matchId of matchIds) {
    try {
      const matchUrl = `${BASE_URL}/${platform}/matches/${matchId}`;
      const matchRes = await fetch(matchUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/vnd.api+json',
        }
      });
      console.log(`Match ${matchId} fetch status: ${matchRes.status}`);
      if (!matchRes.ok) {
        console.error(`Match error: ${await matchRes.text()}`);
        continue;
      }
      const matchData = await matchRes.json();
      
      // Get telemetry URL
      const included = matchData.included ?? [];
      const asset = included.find(item => item.type === 'asset' && item.attributes?.name === 'telemetry');
      const telemetryUrl = asset?.attributes?.URL;
      console.log(`Match ${matchId} telemetry URL: ${telemetryUrl}`);
      
      if (telemetryUrl) {
        const telRes = await fetch(telemetryUrl, {
          headers: { "Accept-Encoding": "gzip" }
        });
        console.log(`Telemetry HTTP Status: ${telRes.status}`);
        if (!telRes.ok) {
          console.error(`Telemetry error: ${await telRes.text()}`);
        } else {
          const events = await telRes.json();
          console.log(`Successfully fetched telemetry. Event count: ${events.length}`);
          const pickupCount = events.filter(e => e._T === 'LogItemPickup' && e.character?.accountId === player.id).length;
          const fireCount = events.filter(e => e._T === 'LogWeaponFireCount' && e.character?.accountId === player.id).length;
          console.log(`- LogItemPickup for player: ${pickupCount}`);
          console.log(`- LogWeaponFireCount for player: ${fireCount}`);
        }
      }
    } catch (e) {
      console.error(`Error on match ${matchId}:`, e);
    }
  }
}

testTelemetry();
