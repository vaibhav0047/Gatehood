# TowerPulse

Mobile application for residential construction projects that replaces WhatsApp broadcast groups with targeted notices, verifiable read receipts, and unit-level buyer feeds. Built with React Native (Expo SDK 58), TypeScript, expo-router, and Cloud Firestore.

## Features

### Builder
- **CSV Buyer Import**: Import buyers from CSV files (`tower`, `unit`, `name`, `phone`). Provisions invite codes (`A1204-7KQ`), checks for duplicate units, and supports sample preview.
- **Tower Breakdown**: Overview of onboarding by tower (Tower A through E) with join percentages and pending invite tracking.
- **Targeted Notices & Pinning**: Broadcast notices to the whole project, selected towers, or specific units. Support for pinned notices and image attachments.
- **Read Analytics**: Real-time read counter, percentage reach, and unread buyer list with WhatsApp/SMS contact shortcuts.

### Buyer
- **Invite Code Onboarding**: Claim units via invite code (e.g., `A1204-7KQ`). Handles invalid codes, expired codes with date display, and previously claimed codes.
- **My Unit Home**: Displays unit number, tower, configuration (e.g. 3BHK Luxury), construction milestone progress %, and days to possession countdown.
- **Updates Feed**: Shows notices targeted to the buyer (whole project, their tower, or their unit). Pinned notices appear first. Filter by All, My tower, or My unit. Live updates via Firestore listeners and unread indicators.
- **Pagination & Offline Cache**: Loads 15 notices per page. Caches feed in AsyncStorage for offline viewing with error recovery and retry.

## Getting Started

### Prerequisites
- Node.js 20+ or 22 LTS
- npm

### Installation
```bash
git clone https://github.com/your-username/tower-pulse.git
cd tower-pulse
npm install
```

### Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```

Configure your Firebase credentials in `.env`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

If `.env` is omitted, the app runs in local offline store mode with full functionality and pre-seeded data.

### Seeding Data
Run the seed script to populate 55 notices and sample buyers:
```bash
npm run seed
```

### Running the App
```bash
# Web browser
npm run web

# iOS simulator
npm run ios

# Android emulator
npm run android
```

### Running Tests
```bash
npm test
```

## Data Model & Indexing

- `buyers/{buyerId}`: Buyer details, unit mapping, invite code, expiration, and joined status.
- `notices/{noticeId}`: Title, content, target type, audience tokens (`ALL`, `TOWER:...`, `UNIT:...`), pinned flag, and read count.
- `notices/{noticeId}/reads/{buyerId}`: Subcollection storing immutable read receipts with timestamps.

### Feed Query
```typescript
query(
  collection(db, 'notices'),
  where('audience', 'array-contains-any', ['ALL', `TOWER:${tower}`, `UNIT:${unit}`]),
  orderBy('isPinned', 'desc'),
  orderBy('createdAt', 'desc'),
  limit(15)
);
```

Compound indexes are defined in `firestore.indexes.json` and security rules in `firestore.rules`.

## Video Walkthrough Guide (90 Seconds)

1. **0:00 - 0:15 (Builder Dashboard)**: Review project metrics, tower onboarding progress, and tap Tower A to view units and code claim status.
2. **0:15 - 0:30 (CSV Import)**: Open Import CSV, load sample data, verify parsed table and generated codes, and execute import.
3. **0:30 - 0:45 (Post Notice)**: Create an urgent notice targeting Tower A, toggle Pin Notice to Top, and publish.
4. **0:45 - 0:55 (Read Analytics)**: Open notice detail, show reach percentage, inspect unread buyers, and demonstrate the nudge shortcut.
5. **0:55 - 1:15 (Buyer Join & Home)**: Switch to Buyer view, test an invalid code, claim code `A1204-7KQ`, and view My Unit dashboard (progress %, countdown, specs).
6. **1:15 - 1:30 (Feed & Offline)**: View updates feed with pinned notice, filter by tower, open notice to mark read, and toggle offline mode to demonstrate cached feed retrieval.
