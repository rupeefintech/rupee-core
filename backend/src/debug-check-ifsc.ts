import { getDb } from './database';

async function main() {
  const ifsc = (process.argv[2] || '').toUpperCase().trim();
  if (!ifsc) {
    console.error('Usage: npx tsx src/debug-check-ifsc.ts <IFSC>');
    process.exit(1);
  }

  const db = await getDb();
  const stmt = db.prepare('SELECT ifsc, branch_name, city, pincode FROM branches WHERE ifsc = ?');
  stmt.bind([ifsc]);
  if (stmt.step()) {
    console.log('Found row:', stmt.getAsObject());
  } else {
    console.log('No row found for IFSC:', ifsc);
  }
  stmt.free();
}

main().catch(err => { console.error(err); process.exit(1); });