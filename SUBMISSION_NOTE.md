# TowerPulse - Architecture & System Design Note

**Data Model**: Two root collections: `buyers` and `notices`. `buyers` stores unit, tower, configuration, progress %, possession date, and invite codes with expiration/claim states. `notices` stores target scope, pinning, counter, and a computed `audience` token array (`['ALL']`, `['TOWER:A']`, `['UNIT:A-1204']`). Subcollection `notices/{id}/reads/{buyerId}` stores immutable read receipts.

**Feed Query**: Single unified query uses `array-contains-any` matching the buyer's tokens (`['ALL', 'TOWER:' + tower, 'UNIT:' + unit]`), sorted by `isPinned DESC, createdAt DESC`, paginated 15/page with `startAfter()`. Filter tabs query exact sub-tokens without client-side over-fetching.

**Read Accuracy at Scale**: Direct counter updates on hot documents hit Firestore's 1 write/sec limit. TowerPulse records idempotent receipt documents (`reads/{buyerId}`) and increments a counter. At high scale, writes shard across distributed counter documents (`shards/{0..N}`) or aggregate via background Cloud Functions and `getCountFromServer()`, eliminating document contention while ensuring exact receipt auditability.

**Security Rules**: Default-deny model. Authority derives from verified auth claims (`role == 'builder'`). Buyers can only claim pending, unexpired codes via field-restricted updates (`inviteStatus`, `joinedAt`). Notices and receipts are protected: buyers can only write their own receipt once (`buyerId == uid`), receipts are immutable, and read listings are restricted to builders to protect buyer PII.

**Trade-offs**: Tokenized `audience` enables fast single-roundtrip queries within Firestore's disjunction limits, trading minor write-time fanout for O(1) query latency. Subcollection receipts trade extra document reads for zero-conflict concurrency and tamper-proof auditability.
