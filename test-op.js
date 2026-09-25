async function test() {
  const q = '[out:json];nwr(around:2000, 13.7384, 100.5320)["amenity"~"restaurant|cafe|food_court"];out center 15;';
  const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q);
  const opRes = await fetch(url, { headers: { 'User-Agent': 'EatWise/1.0' } });
  console.log(opRes.status);
  const data = await opRes.json();
  console.log(data.elements ? data.elements.length : 'no elements');
}
test();
