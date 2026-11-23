import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY'
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    if (Platform.OS === 'web') {
      try {
        db = initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        });
      } catch {
        db = getFirestore(app);
      }
    } else {
      // Native (iOS & Android)
      try {
        db = initializeFirestore(app, {
          localCache: persistentLocalCache(),
        });
      } catch {
        db = getFirestore(app);
      }
    }

    if (process.env.EXPO_PUBLIC_USE_EMULATOR === 'true' && db) {
      const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
      connectFirestoreEmulator(db, host, 8080);
      console.log(`[Firebase] Connected to Firestore emulator at ${host}:8080`);
    }
  } catch (error) {
    console.warn('[Firebase] Initialization error:', error);
  }
} else {
  console.info(
    '[Firebase] Real credentials not set. Running in resilient Offline / Local Store Mode with full feature fidelity.'
  );
}

export { app, db };
