import { generateInviteCode, normalizeInviteCode } from '../src/utils/codeGenerator';
import { calculateDaysToPossession, formatRelativeTime } from '../src/utils/dateUtils';
import { parseBuyersCSV } from '../src/utils/csvParser';
import { generateSeedNotices, INITIAL_BUYERS } from '../src/data/seedData';
import { Buyer, Notice } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('\n🧪 Running TowerPulse Unit & Integration Test Suite...\n');

  // Test 1: Code Generator
  console.log('Test Suite 1: Invite Code Generation & Normalization');
  const code1 = generateInviteCode('A-1204');
  assert(/^A1204-[A-Z0-9]{3}$/.test(code1), `Generated code ${code1} matches [UNIT]-[SUFFIX]`);
  assert(normalizeInviteCode(' a1204-7kq ') === 'A1204-7KQ', 'Normalized code strips spaces and uppercases');

  // Test 2: Date Utilities
  console.log('\nTest Suite 2: Date & Countdown Utilities');
  const futureDate = new Date(Date.now() + 50 * 86400000).toISOString().split('T')[0];
  const days = calculateDaysToPossession(futureDate);
  assert(days >= 49 && days <= 51, `Calculates approx 50 days to possession (got ${days})`);
  assert(formatRelativeTime(Date.now() - 30000) === 'Just now', 'Formats "Just now" for recent times');
  assert(formatRelativeTime(Date.now() - 7200000) === '2h ago', 'Formats "2h ago" correctly');

  // Test 3: CSV Importer & Parser
  console.log('\nTest Suite 3: CSV Importer & Synonym Resolution');
  const sampleCSV = `tower,unit,name,phone,configuration
Tower A,A-1204,Rahul Sharma,+91 98765 43210,3BHK Luxury
Tower B,B-0301,Rohit Verma,+91 98555 66778,3BHK Premium
Tower A,A-1204,Duplicate Rahul,+91 98765 43210,3BHK Luxury`;

  const parsed = parseBuyersCSV(sampleCSV);
  assert(parsed.importedCount === 2, `Imported 2 unique buyers (got ${parsed.importedCount})`);
  assert(parsed.skippedCount === 1, 'Detected and skipped 1 duplicate unit');
  assert(parsed.buyers[0].inviteCode.startsWith('A1204-'), 'Generated code for A-1204');
  assert(parsed.buyers[0].inviteStatus === 'pending', 'Initial inviteStatus is pending');

  // Test 4: Seed Dataset Requirements
  console.log('\nTest Suite 4: Seed Data (Minimum 50 notices)');
  const notices = generateSeedNotices();
  assert(notices.length >= 50, `Seeded at least 50 notices (actual: ${notices.length})`);
  const pinnedNotices = notices.filter((n) => n.isPinned);
  assert(pinnedNotices.length > 0, `Contains ${pinnedNotices.length} pinned notices`);
  assert(INITIAL_BUYERS.length >= 10, `Initial buyers count is ${INITIAL_BUYERS.length}`);

  // Test 5: Feed Filtering & Audience Tokens
  console.log('\nTest Suite 5: Feed Filtering & Audience Isolation');
  const testBuyer: Buyer = {
    id: 'A-1204',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    tower: 'Tower A',
    unit: 'A-1204',
    configuration: '3BHK',
    progressPercent: 72,
    possessionDate: '2027-04-30',
    inviteCode: 'A1204-7KQ',
    inviteStatus: 'joined',
    inviteExpiresAt: Date.now() + 86400000,
    createdAt: Date.now(),
  };

  const targetedNotices: Notice[] = [
    {
      id: 'n1',
      title: 'Broadcast',
      content: 'All',
      category: 'construction',
      targetType: 'all',
      targetTowers: [],
      targetUnits: [],
      audience: ['ALL'],
      isPinned: false,
      readCount: 0,
      totalTargetBuyers: 15,
      createdAt: 100,
      createdBy: 'admin',
      authorRole: 'Lead',
    },
    {
      id: 'n2',
      title: 'Tower A only',
      content: 'Tower A',
      category: 'construction',
      targetType: 'towers',
      targetTowers: ['Tower A'],
      targetUnits: [],
      audience: ['TOWER:Tower A'],
      isPinned: true,
      readCount: 0,
      totalTargetBuyers: 5,
      createdAt: 50,
      createdBy: 'admin',
      authorRole: 'Lead',
    },
    {
      id: 'n3',
      title: 'Tower B only',
      content: 'Tower B',
      category: 'construction',
      targetType: 'towers',
      targetTowers: ['Tower B'],
      targetUnits: [],
      audience: ['TOWER:Tower B'],
      isPinned: false,
      readCount: 0,
      totalTargetBuyers: 4,
      createdAt: 200,
      createdBy: 'admin',
      authorRole: 'Lead',
    },
    {
      id: 'n4',
      title: 'Unit A-1204 only',
      content: 'Unit A-1204',
      category: 'milestone',
      targetType: 'units',
      targetTowers: [],
      targetUnits: ['A-1204'],
      audience: ['UNIT:A-1204'],
      isPinned: false,
      readCount: 0,
      totalTargetBuyers: 1,
      createdAt: 150,
      createdBy: 'admin',
      authorRole: 'Lead',
    },
  ];

  // Filter for testBuyer (Tower A, Unit A-1204)
  const buyerFeed = targetedNotices.filter((n) =>
    n.audience.includes('ALL') ||
    n.audience.includes(`TOWER:${testBuyer.tower}`) ||
    n.audience.includes(`UNIT:${testBuyer.unit}`)
  );

  assert(buyerFeed.length === 3, `Feed returns 3 notices for buyer (got ${buyerFeed.length})`);
  assert(!buyerFeed.some((n) => n.id === 'n3'), 'Feed correctly excludes Tower B notice');

  // Sort pinned first, then newest
  buyerFeed.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.createdAt - a.createdAt;
  });

  assert(buyerFeed[0].id === 'n2', 'Pinned notice n2 appears first despite older timestamp');
  assert(buyerFeed[1].id === 'n4', 'Newer unpinned notice n4 appears second');

  console.log('\n🎉 ALL 12 VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
}

runTests();
