// Mami Wata Mirror - full chart calculator
// Includes: 10 planets, North/South Node, Chiron, Lilith, Part of Fortune, Vertex
// Self-contained, no external libraries

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

const SIGN_NAMES = [“Aries”,“Taurus”,“Gemini”,“Cancer”,“Leo”,“Virgo”,“Libra”,“Scorpio”,“Sagittarius”,“Capricorn”,“Aquarius”,“Pisces”];
const SIGN_SYMBOLS = [”\u2648”,”\u2649”,”\u264A”,”\u264B”,”\u264C”,”\u264D”,”\u264E”,”\u264F”,”\u2650”,”\u2651”,”\u2652”,”\u2653”];

function norm360(x) { x = x % 360; return x < 0 ? x + 360 : x; }

function julianDay(y, m, d, h, min) {
const dayFrac = (h + min/60) / 24;
if (m <= 2) { y -= 1; m += 12; }
const a = Math.floor(y / 100);
const b = 2 - a + Math.floor(a / 4);
return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + dayFrac + b - 1524.5;
}

function splitDMS(lon) {
const norm = norm360(lon);
const sign = Math.floor(norm / 30);
const inSign = norm - sign * 30;
const deg = Math.floor(inSign);
const minF = (inSign - deg) * 60;
const min = Math.floor(minF);
const sec = Math.floor((minF - min) * 60);
return { sign, deg, min, sec };
}

function sunLongitude(T) {
const L0 = 280.46646 + 36000.76983*T + 0.0003032*T*T;
const M = 357.52911 + 35999.05029*T - 0.0001537*T*T;
const Mr = M * DEG;
const C = (1.914602 - 0.004817*T - 0.000014*T*T)*Math.sin(Mr)
+ (0.019993 - 0.000101*T)*Math.sin(2*Mr)
+ 0.000289*Math.sin(3*Mr);
return norm360(L0 + C);
}

function moonLongitude(T) {
const Lp = 218.3164477 + 481267.88123421*T - 0.0015786*T*T;
const D  = 297.8501921 + 445267.1114034*T - 0.0018819*T*T;
const M  = 357.5291092 + 35999.0502909*T;
const Mp = 134.9633964 + 477198.8675055*T + 0.0087414*T*T;
const F  = 93.2720950 + 483202.0175233*T - 0.0036539*T*T;
const Dr = D*DEG, Mr = M*DEG, Mpr = Mp*DEG, Fr = F*DEG;
let L = 6288774*Math.sin(Mpr)
+ 1274027*Math.sin(2*Dr - Mpr)
+  658314*Math.sin(2*Dr)
+  213618*Math.sin(2*Mpr)
-  185116*Math.sin(Mr)
-  114332*Math.sin(2*Fr)
+   58793*Math.sin(2*Dr - 2*Mpr)
+   57066*Math.sin(2*Dr - Mr - Mpr)
+   53322*Math.sin(2*Dr + Mpr)
+   45758*Math.sin(2*Dr - Mr)
-   40923*Math.sin(Mr - Mpr)
-   34720*Math.sin(Dr)
-   30383*Math.sin(Mr + Mpr)
+   15327*Math.sin(2*Dr - 2*Fr)
-   12528*Math.sin(Mpr + 2*Fr)
+   10980*Math.sin(Mpr - 2*Fr)
+   10675*Math.sin(4*Dr - Mpr)
+    8548*Math.sin(4*Dr - 2*Mpr)
-    7888*Math.sin(2*Dr + Mr - Mpr)
-    6766*Math.sin(2*Dr + Mr);
return norm360(Lp + L / 1000000);
}

function planetLongitude(planet, T) {
const elements = {
mercury: { L: 252.250906, n: 149472.6746358, e: 0.20563593, M0: 174.7948, a: 0.387098 },
venus:   { L: 181.979801, n:  58517.8156760, e: 0.00677672, M0:  50.4161, a: 0.723330 },
earth:   { L: 100.466449, n:  35999.3728519, e: 0.01671022, M0: 357.5291, a: 1.000000 },
mars:    { L: 355.433000, n:  19140.2993039, e: 0.09341233, M0:  19.3870, a: 1.523688 },
jupiter: { L:  34.351519, n:   3034.9056606, e: 0.04839266, M0:  20.0202, a: 5.202561 },
saturn:  { L:  50.077444, n:   1222.1138488, e: 0.05415060, M0: 317.0207, a: 9.554747 },
uranus:  { L: 314.055005, n:    428.4669983, e: 0.04716771, M0: 141.0498, a: 19.218140 },
neptune: { L: 304.348665, n:    218.4862002, e: 0.00858587, M0: 256.2250, a: 30.110387 },
pluto:   { L: 238.92881,  n:    145.20780,   e: 0.24882730, M0:  14.882,  a: 39.482117 },
chiron:  { L: 207.224,    n:    50.49,       e: 0.38,       M0: 339.43,   a: 13.708 }
};
const e = elements[planet];
if (!e) return 0;
const M = norm360(e.M0 + e.n * T);
const Mr = M * DEG;
let E = Mr;
for (let i = 0; i < 8; i++) { E = Mr + e.e * Math.sin(E); }
const v = 2 * Math.atan2(Math.sqrt(1+e.e)*Math.sin(E/2), Math.sqrt(1-e.e)*Math.cos(E/2));
const helio = norm360(e.L + v*RAD - M);
if (planet === “earth”) return helio;
const earthEl = elements.earth;
const earthM = norm360(earthEl.M0 + earthEl.n * T);
const earthMr = earthM * DEG;
let earthE = earthMr;
for (let i = 0; i < 6; i++) { earthE = earthMr + earthEl.e * Math.sin(earthE); }
const earthV = 2 * Math.atan2(Math.sqrt(1+earthEl.e)*Math.sin(earthE/2), Math.sqrt(1-earthEl.e)*Math.cos(earthE/2));
const earthHelio = norm360(earthEl.L + earthV*RAD - earthM);
const earthR = earthEl.a * (1 - earthEl.e*Math.cos(earthE));
const r = e.a * (1 - e.e*Math.cos(E));
const xH = r * Math.cos(helio * DEG);
const yH = r * Math.sin(helio * DEG);
const xE = earthR * Math.cos(earthHelio * DEG);
const yE = earthR * Math.sin(earthHelio * DEG);
return norm360(Math.atan2(yH - yE, xH - xE) * RAD);
}

function meanNorthNode(T) {
return norm360(125.04452 - 1934.136261*T + 0.0020708*T*T);
}

function meanLilith(T) {
// Mean Black Moon Lilith (lunar apogee)
return norm360(83.353 + 4069.0137 * T);
}

function obliquity(T) {
return 23.439291 - 0.0130042*T - 1.64e-7*T*T + 5.04e-7*T*T*T;
}

function localSiderealTime(JD, longitude) {
const T = (JD - 2451545.0) / 36525;
const GMST = 280.46061837 + 360.98564736629*(JD - 2451545.0) + 0.000387933*T*T;
return norm360(GMST + longitude);
}

function calcAngles(JD, latitude, longitude) {
const T = (JD - 2451545.0) / 36525;
const eps = obliquity(T) * DEG;
const LST = localSiderealTime(JD, longitude);
const ramc = LST * DEG;
const lat = latitude * DEG;
const mc = norm360(Math.atan2(Math.sin(ramc), Math.cos(ramc)*Math.cos(eps)) * RAD);
const ascRad = Math.atan2(-Math.cos(ramc), Math.sin(ramc)*Math.cos(eps) + Math.tan(lat)*Math.sin(eps));
let asc = norm360(ascRad * RAD);
// Vertex - the western intersection of the prime vertical with the ecliptic
// Using formula: Vx = arctan2(-cos(RAMC), sin(eps)*tan(-lat) + cos(eps)*sin(RAMC))
const vxRad = Math.atan2(-Math.cos(ramc), Math.sin(eps)*Math.tan(-lat) + Math.cos(eps)*Math.sin(ramc));
let vertex = norm360(vxRad * RAD);
return { ascendant: asc, midheaven: mc, vertex: vertex };
}

function porphyryHouses(angles) {
const ascendant = angles.ascendant;
const midheaven = angles.midheaven;
const cusps = new Array(12);
cusps[0] = ascendant;
cusps[9] = midheaven;
cusps[3] = norm360(midheaven + 180);
cusps[6] = norm360(ascendant + 180);
const arcMC_ASC = norm360(ascendant - midheaven);
const arcASC_IC = norm360(cusps[3] - ascendant);
cusps[10] = norm360(midheaven + arcMC_ASC / 3);
cusps[11] = norm360(midheaven + 2 * arcMC_ASC / 3);
cusps[1] = norm360(ascendant + arcASC_IC / 3);
cusps[2] = norm360(ascendant + 2 * arcASC_IC / 3);
cusps[4] = norm360(cusps[3] + arcMC_ASC / 3);
cusps[5] = norm360(cusps[3] + 2 * arcMC_ASC / 3);
cusps[7] = norm360(cusps[6] + arcASC_IC / 3);
cusps[8] = norm360(cusps[6] + 2 * arcASC_IC / 3);
return cusps;
}

function wholeSignHouses(ascendant) {
const ascSign = Math.floor(norm360(ascendant) / 30);
const cusps = new Array(12);
for (let i = 0; i < 12; i++) {
cusps[i] = ((ascSign + i) % 12) * 30;
}
return cusps;
}

function houseOfPlanet(lon, cusps) {
for (let i = 0; i < 12; i++) {
const start = cusps[i];
const end = cusps[(i + 1) % 12];
if (start <= end) {
if (lon >= start && lon < end) return i + 1;
} else {
if (lon >= start || lon < end) return i + 1;
}
}
return null;
}

function partOfFortune(sun, moon, asc, isDay) {
// Day formula: ASC + Moon - Sun
// Night formula: ASC + Sun - Moon
if (isDay) {
return norm360(asc + moon - sun);
} else {
return norm360(asc + sun - moon);
}
}

function isDayBirth(sunLon, ascLon) {
// Simple day/night check based on Sun position relative to horizon
// Check if sun longitude is between DSC and ASC going through MC
const dsc = norm360(ascLon + 180);
let diff = norm360(sunLon - ascLon);
return diff >= 180; // Sun is above horizon
}

const ASPECTS = [
{ type: “conjunction”, angle: 0,   orb: 8 },
{ type: “sextile”,     angle: 60,  orb: 4 },
{ type: “square”,      angle: 90,  orb: 6 },
{ type: “trine”,       angle: 120, orb: 6 },
{ type: “opposition”,  angle: 180, orb: 6 }
];

function calcAspects(points) {
const result = [];
for (let i = 0; i < points.length; i++) {
for (let j = i + 1; j < points.length; j++) {
let diff = Math.abs(points[i].longitude - points[j].longitude);
if (diff > 180) diff = 360 - diff;
for (const asp of ASPECTS) {
const orb = Math.abs(diff - asp.angle);
if (orb <= asp.orb) {
result.push({
point1: points[i].name,
point2: points[j].name,
type: asp.type,
orb: orb.toFixed(2)
});
break;
}
}
}
}
return result;
}

exports.handler = async (event) => {
const headers = {
“Access-Control-Allow-Origin”: “*”,
“Access-Control-Allow-Headers”: “Content-Type”,
“Access-Control-Allow-Methods”: “POST, OPTIONS”,
“Content-Type”: “application/json”
};

if (event.httpMethod === “OPTIONS”) {
return { statusCode: 200, headers, body: “” };
}
if (event.httpMethod !== “POST”) {
return { statusCode: 405, headers, body: JSON.stringify({ error: “Method not allowed” }) };
}

try {
const body = JSON.parse(event.body);
const year = parseInt(body.year);
const month = parseInt(body.month);
const day = parseInt(body.day);
const hour = parseInt(body.hour);
const minute = parseInt(body.minute);
const latitude = parseFloat(body.latitude);
const longitude = parseFloat(body.longitude);
const houseSystem = body.houseSystem || “placidus”;

```
if ([year, month, day, hour, minute, latitude, longitude].some(v => isNaN(v))) {
  return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing or invalid fields" }) };
}

const JD = julianDay(year, month, day, hour, minute);
const T = (JD - 2451545.0) / 36525;

const sunLon = sunLongitude(T);
const moonLon = moonLongitude(T);
const northNodeLon = meanNorthNode(T);
const southNodeLon = norm360(northNodeLon + 180);
const lilithLon = meanLilith(T);

const angles = calcAngles(JD, latitude, longitude);
const isDay = isDayBirth(sunLon, angles.ascendant);
const fortuneLon = partOfFortune(sunLon, moonLon, angles.ascendant, isDay);

const planetData = [
  { name: "Sun",            key: "sun",       symbol: "\u2609", longitude: sunLon },
  { name: "Moon",           key: "moon",      symbol: "\u263D", longitude: moonLon },
  { name: "Mercury",        key: "mercury",   symbol: "\u263F", longitude: planetLongitude("mercury", T) },
  { name: "Venus",          key: "venus",     symbol: "\u2640", longitude: planetLongitude("venus", T) },
  { name: "Mars",           key: "mars",      symbol: "\u2642", longitude: planetLongitude("mars", T) },
  { name: "Jupiter",        key: "jupiter",   symbol: "\u2643", longitude: planetLongitude("jupiter", T) },
  { name: "Saturn",         key: "saturn",    symbol: "\u2644", longitude: planetLongitude("saturn", T) },
  { name: "Uranus",         key: "uranus",    symbol: "\u2645", longitude: planetLongitude("uranus", T) },
  { name: "Neptune",        key: "neptune",   symbol: "\u2646", longitude: planetLongitude("neptune", T) },
  { name: "Pluto",          key: "pluto",     symbol: "\u2647", longitude: planetLongitude("pluto", T) },
  { name: "Chiron",         key: "chiron",    symbol: "\u26B7", longitude: planetLongitude("chiron", T) },
  { name: "North Node",     key: "northnode", symbol: "\u260A", longitude: northNodeLon },
  { name: "South Node",     key: "southnode", symbol: "\u260B", longitude: southNodeLon },
  { name: "Lilith",         key: "lilith",    symbol: "\u26B8", longitude: lilithLon },
  { name: "Part of Fortune",key: "fortune",   symbol: "\u2297", longitude: fortuneLon },
  { name: "Vertex",         key: "vertex",    symbol: "Vx",     longitude: angles.vertex }
];

const cusps = (houseSystem === "whole-sign")
  ? wholeSignHouses(angles.ascendant)
  : porphyryHouses(angles);

const planets = planetData.map(p => {
  const dms = splitDMS(p.longitude);
  return {
    name: p.name,
    key: p.key,
    symbol: p.symbol,
    sign: SIGN_NAMES[dms.sign],
    signSymbol: SIGN_SYMBOLS[dms.sign],
    degreesInSign: dms.deg,
    minutes: dms.min,
    seconds: dms.sec,
    eclipticLongitude: p.longitude,
    house: houseOfPlanet(p.longitude, cusps),
    retrograde: false
  };
});

const ascDms = splitDMS(angles.ascendant);
const mcDms = splitDMS(angles.midheaven);

const houses = cusps.map((lon, i) => {
  const dms = splitDMS(lon);
  return {
    number: i + 1,
    sign: SIGN_NAMES[dms.sign],
    signSymbol: SIGN_SYMBOLS[dms.sign],
    degreesInSign: dms.deg,
    minutes: dms.min,
    eclipticLongitude: lon
  };
});

const aspectPoints = [
  ...planetData.map(p => ({ name: p.name, longitude: p.longitude })),
  { name: "Ascendant", longitude: angles.ascendant },
  { name: "Midheaven", longitude: angles.midheaven }
];
const aspects = calcAspects(aspectPoints);

return {
  statusCode: 200,
  headers,
  body: JSON.stringify({
    success: true,
    planets,
    angles: {
      ascendant: {
        sign: SIGN_NAMES[ascDms.sign],
        signSymbol: SIGN_SYMBOLS[ascDms.sign],
        degreesInSign: ascDms.deg,
        minutes: ascDms.min,
        eclipticLongitude: angles.ascendant
      },
      midheaven: {
        sign: SIGN_NAMES[mcDms.sign],
        signSymbol: SIGN_SYMBOLS[mcDms.sign],
        degreesInSign: mcDms.deg,
        minutes: mcDms.min,
        eclipticLongitude: angles.midheaven
      }
    },
    houses,
    aspects
  })
};
```

} catch (err) {
return {
statusCode: 500,
headers,
body: JSON.stringify({ error: “Calculation failed”, message: err.message })
};
}
};
