const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf-8');
  content.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key && val) {
        process.env[key] = val;
      }
    }
  });
}

// Now statically or dynamically import after env is loaded
const dbConnect = require('../lib/mongodb').default;
const Member = require('../models/Member').default;

async function main() {
  await dbConnect();
  const members = await Member.find({});
  console.log('Members in DB:', JSON.stringify(members, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
