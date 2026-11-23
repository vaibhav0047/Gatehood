import * as fs from 'fs';
import * as path from 'path';
import { generateSeedNotices, INITIAL_BUYERS } from '../src/data/seedData';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line: string) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && val) {
        process.env[key.trim()] = val;
      }
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY'
);

async function runSeed() {
  const notices = generateSeedNotices();
  const buyers = INITIAL_BUYERS;

  const dataDir = path.resolve(__dirname, '../src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const exportBundle = {
    notices,
    buyers,
    timestamp: Date.now(),
  };

  fs.writeFileSync(
    path.join(dataDir, 'seededData.json'),
    JSON.stringify(exportBundle, null, 2),
    'utf8'
  );

  if (!isConfigured) {
    console.log(`Seeded ${notices.length} notices and ${buyers.length} buyers into local dataset.`);
    return;
  }

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    const buyerBatch = writeBatch(db);
    for (const buyer of buyers) {
      const ref = doc(db, 'buyers', buyer.id);
      buyerBatch.set(ref, buyer, { merge: true });
    }
    await buyerBatch.commit();

    const chunkSize = 20;
    for (let i = 0; i < notices.length; i += chunkSize) {
      const chunk = notices.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const notice of chunk) {
        const ref = doc(db, 'notices', notice.id);
        batch.set(ref, notice, { merge: true });
      }
      await batch.commit();
    }
    console.log(`Seeded ${notices.length} notices and ${buyers.length} buyers into Firestore.`);
  } catch (error) {
    console.error('Firestore seeding failed:', error);
  }
}

runSeed();
