async function test() {
  const url = 'https://nominatim.openstreetmap.org/search?q=restaurant+near+13.9665,100.5842&format=json&limit=50&namedetails=1';
  const res = await fetch(url, { headers: {'User-Agent': 'EatWiseApp/1.0'} });
  const data = await res.json();
  const lat = 13.9665;
  const lng = 100.5842;
  let count = 0;
  data.forEach(el => {
      const rLat = parseFloat(el.lat);
      const rLon = parseFloat(el.lon);
      const R = 6371e3;
      const f1 = lat * Math.PI/180;
      const f2 = rLat * Math.PI/180;
      const df = (rLat-lat) * Math.PI/180;
      const dl = (rLon-lng) * Math.PI/180;
      const a = Math.sin(df/2) * Math.sin(df/2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dl/2) * Math.sin(dl/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const straightDistance = Math.round(R * c);
      const distance = Math.round(straightDistance * 1.5);
      const walkTime = Math.ceil(distance / 65);
      if (walkTime <= 40) { count++; }
  });
  console.log("Valid within 40 mins:", count);
}
test();
