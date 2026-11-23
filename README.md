# 🏢 TowerPulse

> **A real-time residential construction notice & verified buyer feed app built with React Native (Expo), TypeScript, expo-router, and Cloud Firestore.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2058-black.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.88-61dafb.svg)](https://reactnative.dev/)
[![Firestore](https://img.shields.io/badge/Firebase-Firestore-orange.svg)](https://firebase.google.com/)
[![Tests](https://img.shields.io/badge/Tests-Passing%20(12%2F12)-brightgreen.svg)]()

---

## 📌 Problem & Solution

In large residential development projects spanning several towers and hundreds of units:
1. **WhatsApp groups cause information overload**: Critical notices (structural milestones, electrical load guidelines, slab payment demands) get buried under chat noise.
2. **Builders are blind to reach**: Construction companies cannot tell who has seen a notice and who is unaware.
3. **Buyers lack apartment visibility**: Buyers have no direct dashboard showing their specific unit's progress and possession timeline.

**TowerPulse fixes this completely**:
- **Targeted Broadcasting**: Builders broadcast notices to the whole project, selected towers, or specific units.
- **Audit-Grade Read Receipts**: Builders see exact read counts and an unread buyer roster with 1-tap WhatsApp nudges.
- **Personalized Buyer Hub**: Buyers claim their unit via an invite code, tracking progress %, days to handover, and an isolated feed.

---

## 📱 Core Features

### 🏗️ Builder Flow
- **CSV Buyer Import**: Import buyers from CSV files (`tower`, `unit`, `name`, `phone`). TowerPulse automatically provisions human-readable invite codes (e.g. `A1204-7KQ`). Includes duplicate unit detection and 1-tap sample loader.
- **Tower Breakdown**: Real-time onboarding status grouped by tower (Tower A, B, C, D, E) with join % progress bars and pending invite tracking.
- **Targeted Notices & Pinning**: Post updates to `Whole Project`, `Selected Towers`, or `Specific Units`. High-priority notices can be **pinned to top**.
- **Read Reach & Unread Audit**: Real-time read counter, reached % gauge, and a dedicated **Unread Buyers** list with direct WhatsApp/SMS contact shortcuts.

### 🔑 Buyer Flow
- **Invite Code Redemption**: Join via code (e.g. `A1204-7KQ`). Robust handling for:
  - ❌ **Invalid codes**: Instant notification to verify with site office.
  - ⏳ **Expired codes**: Displays exact expiry date with renewal guidance.
  - 🔒 **Already-used codes**: Prevents duplicate claims, showing prior claim timestamp.
- **My Unit Home**: Shows unit designation, tower, flat configuration (e.g., `3BHK Luxury`), live **construction progress %** with milestone breakdown, and **days to possession** countdown.
- **Targeted Updates Feed**:
  - Shows **only** notices meant for the buyer's unit and tower.
  - **Pinned notices appear first**, followed by newest.
  - Filter tabs: `All`, `My tower`, `My unit`.
  - Visual **Read / Unread state** and auto-mark on read.
  - **Live updates** via Firestore real-time listeners.
- **Pagination & Offline Reliability**:
  - Loads 15 notices at a time (`limit(15)` + `startAfter()`).
  - Persistent offline caching via `@react-native-async-storage/async-storage`.
  - Offline banner with cached count and retry button.

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- **Node.js**: v20+ or v22 LTS (ARM64 / x64)
- **npm** or **yarn**

### 2. Clone & Install
```bash
git clone https://github.com/your-username/tower-pulse.git
cd tower-pulse
npm install
```

### 3. Environment Configuration
TowerPulse follows strict security practices: **no credentials are committed**.
Copy the example environment file:
```bash
cp .env.example .env
```
Fill in your Firebase credentials in `.env`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> **Zero-Config Demo Mode**: If `.env` is omitted, TowerPulse runs out-of-the-box in local store mode with full feature fidelity, persistent AsyncStorage caching, and 55 pre-seeded notices.

### 4. Seed the Database
Run the seed script to populate at least 50 notices (55 included) and multi-tower sample buyers:
```bash
npm run seed
```
- If `.env` contains live Firebase keys, it batch-writes directly to Firestore.
- In all modes, it generates `src/data/seededData.json` for offline instant start.

### 5. Run the Application
```bash
# Start in Web Browser (Instant Preview & Recording)
npm run web

# Start on iOS Simulator / Physical Device (Expo Go)
npm run ios

# Start on Android Emulator / Physical Device (Expo Go)
npm run android
```

### 6. Run the Test Suite
Run the 12-point automated verification suite:
```bash
npm test
```

---

## 🗄️ Architecture & Data Model

```
Firestore
├── buyers/{buyerId}
│   ├── id: string ("A-1204")
│   ├── name: string ("Rahul Sharma")
│   ├── phone: string ("+91 98765 43210")
│   ├── tower: string ("Tower A")
│   ├── unit: string ("A-1204")
│   ├── configuration: string ("3BHK Luxury")
│   ├── progressPercent: number (72)
│   ├── possessionDate: string ("2027-04-30")
│   ├── inviteCode: string ("A1204-7KQ")
│   ├── inviteStatus: "pending" | "joined" | "expired"
│   ├── inviteExpiresAt: number
│   ├── joinedAt: number | null
│   └── createdAt: number
│
└── notices/{noticeId}
    ├── id: string ("notice_001")
    ├── title: string ("Mandatory Notice: False Ceiling Guidelines")
    ├── content: string (...)
    ├── category: "construction" | "milestone" | "urgent" | ...
    ├── targetType: "all" | "towers" | "units"
    ├── targetTowers: ["Tower A", "Tower B"]
    ├── targetUnits: ["A-1204"]
    ├── audience: ["ALL", "TOWER:Tower A", "UNIT:A-1204"]
    ├── isPinned: boolean
    ├── readCount: number
    ├── totalTargetBuyers: number
    ├── createdAt: number
    ├── authorRole: string
    │
    └── reads/{buyerId}  <-- Subcollection for scale & auditability
        ├── buyerId: string ("A-1204")
        ├── buyerName: string ("Rahul Sharma")
        ├── unit: string ("A-1204")
        ├── tower: string ("Tower A")
        ├── phone: string ("+91 98765 43210")
        └── readAt: number
```

### Feed Query & Compound Index
The buyer feed uses a single unified query:
```typescript
query(
  collection(db, 'notices'),
  where('audience', 'array-contains-any', ['ALL', `TOWER:${tower}`, `UNIT:${unit}`]),
  orderBy('isPinned', 'desc'),
  orderBy('createdAt', 'desc'),
  limit(15)
);
```
Backed by the compound index in [`firestore.indexes.json`](./firestore.indexes.json):
- `audience` (ARRAY_CONTAINS)
- `isPinned` (DESCENDING)
- `createdAt` (DESCENDING)

---

## 🔒 Security Rules

Authored in [`firestore.rules`](./firestore.rules) following production standards:
- **Default Deny**: All unmapped paths are closed.
- **RBAC**: Builder actions require authenticated builder claims (`role == 'builder'`).
- **Tamper-Proof Code Claiming**: Buyers can only modify `inviteStatus` ('pending' -> 'joined') and `joinedAt` on unexpired codes.
- **Immutable Read Receipts**: Receipts in `notices/{id}/reads/{buyerId}` can only be created once (`buyerId == uid`). Updates and deletes are disabled (`allow update, delete: if false`).
- **Privacy Protection**: Subcollection listings are restricted to builders to prevent exposure of buyer phone numbers.

---

## 🎥 90-Second Demo Video Guide

Use the in-app **Role Header** (top right) to switch between roles during your recording:

| Timestamp | Screen | Actions to Show |
|:---|:---|:---|
| **0:00 - 0:15** | **Builder Console** | 1. View project metrics and Tower Onboarding Breakdown (Tower A to E).<br/>2. Tap a tower (Tower A) to show unit roster, claimed vs pending invite codes. |
| **0:15 - 0:30** | **CSV Import** | 1. Open `Import CSV`.<br/>2. Tap `Load Sample CSV` to demonstrate live parse preview, duplicate handling, and auto-provisioned codes (e.g. `A1204-7KQ`).<br/>3. Tap `Import Buyers`. |
| **0:30 - 0:45** | **Notice Broadcasting** | 1. Open `Post Notice`.<br/>2. Select `Select Towers` -> `Tower A`, toggle `Pin Notice to Top`, select category `Urgent`.<br/>3. Tap `Broadcast Notice`. |
| **0:45 - 0:55** | **Read Analytics** | 1. Tap the notice from Builder dashboard.<br/>2. Review the Read Ratio gauge, toggle to **Unread Buyers** tab, and show the WhatsApp **Nudge** button. |
| **0:55 - 1:15** | **Buyer Join & Unit** | 1. Tap **Buyer View** toggle.<br/>2. In `Claim Code`, test invalid code `XYZ-99` (shows error), then tap demo chip `A1204-7KQ` -> instant claim.<br/>3. Shows **My Unit** home: Unit A-1204, 3BHK, 72% Construction Progress, and countdown to possession. |
| **1:15 - 1:30** | **Buyer Feed & Offline** | 1. Open **Updates Feed**: shows pinned notice first, filtered to Tower A.<br/>2. Tap `My tower` tab, open a notice to show auto-read marking.<br/>3. Tap **Offline Mode** in header: displays offline cache banner and demonstrates cached feed with retry. |

---

## 📄 Submission Note (<= 250 Words)

The complete architectural note is available in [`SUBMISSION_NOTE.md`](./SUBMISSION_NOTE.md).

---

## 🛠️ Tech Stack
- **Framework**: Expo SDK 58 / React Native 0.88
- **Routing**: `expo-router` v5
- **Language**: TypeScript (Strict Mode)
- **Database**: Cloud Firestore (Google Cloud Firebase)
- **Local Cache**: `@react-native-async-storage/async-storage`
- **CSV Engine**: `PapaParse`
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Deployment**: Android, iOS, and Web ready
