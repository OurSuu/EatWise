async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'Noppanatyukun@gmail.com', password: 'password', redirect: false, csrfToken: 'test' })
  });
  const cookie = loginRes.headers.get('set-cookie');
  
  if (!cookie) {
    console.log("Login failed");
    return;
  }
  
  const profileRes = await fetch('http://localhost:3000/api/profile', {
    method: 'GET',
    headers: { 'Cookie': cookie }
  });
  
  console.log("GET /api/profile status:", profileRes.status);
  console.log("Data:", await profileRes.json());
}
test();
