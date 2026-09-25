async function test() {
  const fsqUrl = 'https://api.foursquare.com/v3/places/search?ll=13.9665087,100.58423&radius=2000&categories=13000&limit=10';
  const fsqRes = await fetch(fsqUrl, {
    headers: { 'Authorization': 'NTSUIUAMCI3SAYIZ4R5M03YDS3DCXIM4F4GDF4YBLHF2VUAR', 'Accept': 'application/json' }
  });
  console.log(fsqRes.status);
  const data = await fsqRes.json();
  console.log(data);
}
test();
