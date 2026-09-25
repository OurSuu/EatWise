const fetch = require('node-fetch');

async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'Noppanatyukun@gmail.com', password: 'password', redirect: false, csrfToken: 'test' })
  });
  const cookie = loginRes.headers.raw()['set-cookie'];
  
  if (!cookie) {
    console.log("No cookie, login failed.");
    return;
  }
  
  const profileRes = await fetch('http://localhost:3000/api/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie.join('; ')
    },
    body: JSON.stringify({
      gender: 'Woman',
      age: '24',
      height: '165',
      weight: '50',
      lifestyle: 'Active',
      targets: ['High protein', 'Low carb'],
      defaultLocation: 'Home'
    })
  });
  
  console.log("Profile Update Status:", profileRes.status);
  const data = await profileRes.json();
  console.log("Profile Data:", data);
}
test();
