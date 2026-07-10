const https = require('https');
https.get('https://geocoding-api.open-meteo.com/v1/search?name=Kyiv&count=1', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
