// Mami Wata’s Mirror — Chart Calculation Function
// Takes birth data (date, time, lat, lng, timezone) and returns full chart data

const { Origin, Horoscope } = require(‘circular-natal-horoscope-js’);

exports.handler = async (event) => {
// CORS headers so this can be called from your Shopify site
const headers = {
‘Access-Control-Allow-Origin’: ‘*’,
‘Access-Control-Allow-Headers’: ‘Content-Type’,
‘Access-Control-Allow-Methods’: ‘POST, OPTIONS’,
‘Content-Type’: ‘application/json’,
};

// Handle preflight requests
if (event.httpMethod === ‘OPTIONS’) {
return { statusCode: 200, headers, body: ‘’ };
}

if (event.httpMethod !== ‘POST’) {
return {
statusCode: 405,
headers,
body: JSON.stringify({ error: ‘Method not allowed’ }),
};
}

try {
const { year, month, day, hour, minute, latitude, longitude, houseSystem } = JSON.parse(event.body);

```
// Validate input
if (
  year == null || month == null || day == null ||
  hour == null || minute == null ||
  latitude == null || longitude == null
) {
  return {
    statusCode: 400,
    headers,
    body: JSON.stringify({ error: 'Missing required birth data fields' }),
  };
}

// Build the Origin (birth moment + place)
// Note: month is 0-indexed in this library (0 = January, 11 = December)
const origin = new Origin({
  year: parseInt(year),
  month: parseInt(month) - 1, // convert from 1-indexed (form) to 0-indexed (library)
  date: parseInt(day),
  hour: parseInt(hour),
  minute: parseInt(minute),
  latitude: parseFloat(latitude),
  longitude: parseFloat(longitude),
});

// Generate the full horoscope
const horoscope = new Horoscope({
  origin,
  houseSystem: houseSystem || 'placidus', // 'placidus' or 'whole-sign'
  zodiac: 'tropical',
  aspectPoints: ['bodies', 'points', 'angles'],
  aspectWithPoints: ['bodies', 'points', 'angles'],
  aspectTypes: ['major'],
  customOrbs: {},
  language: 'en',
});

// Extract the data we need into a clean structure
const planets = horoscope.CelestialBodies.all.map(body => ({
  name: body.label,
  key: body.key,
  symbol: body.symbol,
  sign: body.Sign.label,
  signSymbol: body.Sign.symbol,
  degreesInSign: Math.floor(body.ChartPosition.Ecliptic.ArcDegreesFormatted30.degrees),
  minutes: Math.floor(body.ChartPosition.Ecliptic.ArcDegreesFormatted30.minutes),
  seconds: Math.floor(body.ChartPosition.Ecliptic.ArcDegreesFormatted30.seconds),
  eclipticLongitude: body.ChartPosition.Ecliptic.DecimalDegrees,
  house: body.House ? body.House.id : null,
  retrograde: body.isRetrograde || false,
}));

const angles = {
  ascendant: {
    sign: horoscope.Ascendant.Sign.label,
    signSymbol: horoscope.Ascendant.Sign.symbol,
    degreesInSign: Math.floor(horoscope.Ascendant.ChartPosition.Ecliptic.ArcDegreesFormatted30.degrees),
    minutes: Math.floor(horoscope.Ascendant.ChartPosition.Ecliptic.ArcDegreesFormatted30.minutes),
    eclipticLongitude: horoscope.Ascendant.ChartPosition.Ecliptic.DecimalDegrees,
  },
  midheaven: {
    sign: horoscope.Midheaven.Sign.label,
    signSymbol: horoscope.Midheaven.Sign.symbol,
    degreesInSign: Math.floor(horoscope.Midheaven.ChartPosition.Ecliptic.ArcDegreesFormatted30.degrees),
    minutes: Math.floor(horoscope.Midheaven.ChartPosition.Ecliptic.ArcDegreesFormatted30.minutes),
    eclipticLongitude: horoscope.Midheaven.ChartPosition.Ecliptic.DecimalDegrees,
  },
};

const houses = horoscope.Houses.map(house => ({
  number: house.id,
  sign: house.Sign.label,
  signSymbol: house.Sign.symbol,
  degreesInSign: Math.floor(house.ChartPosition.StartPosition.Ecliptic.ArcDegreesFormatted30.degrees),
  minutes: Math.floor(house.ChartPosition.StartPosition.Ecliptic.ArcDegreesFormatted30.minutes),
  eclipticLongitude: house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees,
}));

const aspects = horoscope.Aspects.all.map(aspect => ({
  point1: aspect.point1Label,
  point2: aspect.point2Label,
  type: aspect.aspectKey,
  orb: aspect.orb,
}));

return {
  statusCode: 200,
  headers,
  body: JSON.stringify({
    success: true,
    planets,
    angles,
    houses,
    aspects,
  }),
};
```

} catch (err) {
return {
statusCode: 500,
headers,
body: JSON.stringify({
error: ‘Calculation failed’,
message: err.message,
}),
};
}
};
