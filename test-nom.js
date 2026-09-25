async function test() {
  const url = 'https://nominatim.openstreetmap.org/search?q=restaurant+near+13.9665,100.5842&format=json&limit=5';
  const res = await fetch(url, { headers: {'User-Agent': 'EatWiseApp/1.0'} });
  console.log(res.status);
  const data = await res.json();
  console.log(data.length);
  console.log(data);
}
test();
