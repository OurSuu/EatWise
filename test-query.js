async function run() {
  const q = '[out:json][timeout:5];node(around:1000, 13.9665087, 100.58423)["amenity"~"restaurant|cafe|food_court"];out 15;';
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: q,
    headers: { 'Accept': 'application/json, */*' }
  });
  console.log(res.status);
  if(res.ok) {
    const d = await res.json();
    console.log(d.elements.length);
  } else {
    console.log(await res.text());
  }
}
run();
