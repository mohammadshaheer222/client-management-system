import crypto from 'crypto';

const targetHash = "6161b2838ffa6ce17b84db3b45b4f8437855ecf43e75de2d1ad0008eaae91aa0";

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

for (let i = 0; i <= 9999; i++) {
  const pin = String(i).padStart(4, '0');
  if (hashPin(pin) === targetHash) {
    console.log('FOUND PIN:', pin);
    process.exit(0);
  }
}

console.log('PIN not found in 0000-9999 range');
process.exit(1);
