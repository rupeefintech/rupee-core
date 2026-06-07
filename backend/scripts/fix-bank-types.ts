/**
 * fix-bank-types.ts
 *
 * Normalises bankType for all banks where it is NULL or inconsistent.
 * Rules (applied in priority order):
 *  1. Known public sector banks by name → 'public'
 *  2. subType contains 'public'          → 'public'
 *  3. subType contains 'private'         → 'private'
 *  4. subType contains 'small finance'   → 'small_finance'
 *  5. subType contains 'payment'         → 'payments'
 *  6. subType contains 'regional rural' OR 'gramin' → 'regional_rural'
 *  7. subType contains 'cooperative'     → 'cooperative'
 *  8. subType contains 'foreign'         → 'foreign'
 *
 * Run:
 *   npx ts-node --project tsconfig.scripts.json scripts/fix-bank-types.ts
 */

import { prisma } from '../src/lib/prisma';

// All 12 scheduled public sector commercial banks (RBI list)
const PUBLIC_SECTOR_BANKS = [
  'State Bank of India',
  'Bank of Baroda',
  'Bank of India',
  'Bank of Maharashtra',
  'Canara Bank',
  'Central Bank of India',
  'Indian Bank',
  'Indian Overseas Bank',
  'Punjab & Sind Bank',
  'Punjab National Bank',
  'UCO Bank',
  'Union Bank of India',
];

async function run() {
  console.log('Fetching all banks with NULL or non-standard bankType...\n');

  const banks = await prisma.banksMaster.findMany({
    select: { id: true, name: true, bankType: true, subType: true },
    orderBy: { name: 'asc' },
  });

  console.log(`Total banks: ${banks.length}`);

  const updates: { id: number; name: string; oldType: string | null; newType: string }[] = [];

  for (const bank of banks) {
    const sub = (bank.subType ?? '').toLowerCase();
    const nm  = bank.name.toLowerCase();
    let newType: string | null = null;

    // Priority 1: known PSB names
    if (PUBLIC_SECTOR_BANKS.some(n => n.toLowerCase() === bank.name.toLowerCase())) {
      newType = 'public';
    }
    // Priority 2-8: derive from subType
    else if (sub.includes('public')) {
      newType = 'public';
    } else if (sub.includes('private')) {
      newType = 'private';
    } else if (sub.includes('small finance')) {
      newType = 'small_finance';
    } else if (sub.includes('payment')) {
      newType = 'payments';
    } else if (sub.includes('regional rural') || sub.includes('gramin')) {
      newType = 'regional_rural';
    } else if (sub.includes('cooperative') || sub.includes('co-operative')) {
      newType = 'cooperative';
    } else if (sub.includes('foreign')) {
      newType = 'foreign';
    }
    // Heuristic from name
    else if (nm.includes('gramin') || nm.includes('kshetriya') || nm.includes('regional rural')) {
      newType = 'regional_rural';
    } else if (nm.includes('cooperative') || nm.includes('co-operative') || nm.includes('sahakari')) {
      newType = 'cooperative';
    } else if (nm.includes('small finance')) {
      newType = 'small_finance';
    } else if (nm.includes('payment')) {
      newType = 'payments';
    }

    if (newType && newType !== bank.bankType) {
      updates.push({ id: bank.id, name: bank.name, oldType: bank.bankType, newType });
    }
  }

  if (updates.length === 0) {
    console.log('\nNo updates needed — all bankType values already correct.');
    return;
  }

  console.log(`\n${updates.length} banks will be updated:\n`);
  const preview = updates.slice(0, 30);
  for (const u of preview) {
    console.log(`  [${u.id}] ${u.name}`);
    console.log(`       ${u.oldType ?? 'NULL'} → ${u.newType}`);
  }
  if (updates.length > 30) console.log(`  ... and ${updates.length - 30} more`);

  console.log('\nApplying updates...');

  // Batch by newType for efficiency
  const byType = updates.reduce<Record<string, number[]>>((acc, u) => {
    if (!acc[u.newType]) acc[u.newType] = [];
    acc[u.newType].push(u.id);
    return acc;
  }, {});

  for (const [type, ids] of Object.entries(byType)) {
    const result = await prisma.banksMaster.updateMany({
      where: { id: { in: ids } },
      data: { bankType: type },
    });
    console.log(`  Set bankType='${type}' on ${result.count} banks`);
  }

  console.log('\nDone! Run the admin banks page with type filter to verify.');
}

run()
  .catch(err => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
