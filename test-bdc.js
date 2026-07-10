const https = require('https');
https.get('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=50.45466&longitude=30.5238&localityLanguage=uk', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
