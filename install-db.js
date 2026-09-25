const { execSync } = require('child_process');
try {
  console.log("Installing...");
  execSync('npm install prisma @prisma/client next-auth bcryptjs @types/bcryptjs', { stdio: 'inherit' });
  console.log("Pushing DB...");
  execSync('npx prisma@5 db push', { stdio: 'inherit' });
  console.log("Done!");
} catch (e) {
  console.error("Error:", e);
}
