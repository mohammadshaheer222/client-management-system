const { SignJWT } = require('jose');

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'upreels-crm-secret-key-2026-xk9p');

async function run() {
  const token = await new SignJWT({ memberId: '1', name: 'upreels', role: 'admin', color: '#4f8ef7' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET);
  console.log(token);
}
run();
