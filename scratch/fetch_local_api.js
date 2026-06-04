async function testLocalApis() {
  const host = 'http://localhost:3001';
  const nickname = '20241218';
  const platform = 'steam';

  console.log('--- Fetching farming-heatmap ---');
  try {
    const res = await fetch(`${host}/api/v1/farming-heatmap?nickname=${nickname}&platform=${platform}`);
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error fetching farming-heatmap:', e);
  }

  console.log('\n--- Fetching match-weapons ---');
  try {
    const res = await fetch(`${host}/api/v1/match-weapons?nickname=${nickname}&platform=${platform}`);
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error fetching match-weapons:', e);
  }
}

testLocalApis();
