const fs = require('fs');
let env = fs.readFileSync('.env.local', 'utf8');
if (!env.includes('NEXTAUTH_SECRET=')) {
  env += '\nNEXTAUTH_SECRET="eatwise-super-secret-key-for-dev-123"\n';
  fs.writeFileSync('.env.local', env);
}
