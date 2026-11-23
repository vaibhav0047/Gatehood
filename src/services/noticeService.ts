import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  onSnapshot,
  increment,
  updateDoc,
  DocumentSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { Buyer, FeedFilter, Notice, ReadReceipt } from '../types';
import { storageService } from './storageService';
import seededBundle from '../data/seededData.json';

const PAGE_SIZE = 15;

export interface PaginatedNoticesResult {
  notices: Notice[];
  lastDoc: DocumentSnapshot | number | null;
  hasMore: boolean;
  fromCache?: boolean;
}

export const noticeService = {
  /**
   * Loads paginated notices (15 at a time), filtered for the specific buyer.
   * Pinned notices come first, followed by newest.
   */
  async getFeedNotices(
    buyer: Buyer,
    filter: FeedFilter = 'all',
    cursorDoc: DocumentSnapshot | number | null = null,
    limitCount: number = PAGE_SIZE
  ): Promise<PaginatedNoticesResult> {
    if (!isFirebaseConfigured || !db) {
      return this.getLocalFeedNotices(buyer, filter, cursorDoc, limitCount);
    }

    try {
      let audienceTokens: string[] = [];
      if (filter === 'all') {
        audienceTokens = ['ALL', `TOWER:${buyer.tower}`, `UNIT:${buyer.unit}`];
      } else if (filter === 'tower') {
        audienceTokens = [`TOWER:${buyer.tower}`];
      } else if (filter === 'unit') {
        audienceTokens = [`UNIT:${buyer.unit}`];
      }

      const noticesRef = collection(db, 'notices');
      let q = query(
        noticesRef,
        where('audience', 'array-contains-any', audienceTokens),
        orderBy('isPinned', 'desc'),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limitCount)
      );

      if (cursorDoc && typeof cursorDoc !== 'number') {
        q = query(
          noticesRef,
          where('audience', 'array-contains-any', audienceTokens),
          orderBy('isPinned', 'desc'),
          orderBy('createdAt', 'desc'),
          startAfter(cursorDoc),
          firestoreLimit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      const notices: Notice[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Notice, 'id'>),
      }));

      const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
      const hasMore = snapshot.docs.length === limitCount;

      // Cache the first page for offline access
      if (!cursorDoc && notices.length > 0) {
        await storageService.setCachedFeed(notices);
      }

      return {
        notices,
        lastDoc: lastVisible,
        hasMore,
      };
    } catch (error) {
      console.warn('Firestore fetch failed, attempting cached feed fallback', error);
      const cached = await storageService.getCachedFeed();
      if (cached.length > 0) {
        return {
          notices: cached,
          lastDoc: null,
          hasMore: false,
          fromCache: true,
        };
      }
      // If no async-storage cache, use seeded bundle fallback
      return this.getLocalFeedNotices(buyer, filter, cursorDoc, limitCount);
    }
  },

  /**
   * Subscribes to real-time live updates on the buyer's feed.
   */
  subscribeToFeed(
    buyer: Buyer,
    filter: FeedFilter,
    onUpdate: (notices: Notice[]) => void
  ): Unsubscribe {
    if (!isFirebaseConfigured || !db) {
      // Return a no-op unsubscribe function for offline/local mode
      return () => {};
    }

    let audienceTokens: string[] = [];
    if (filter === 'all') {
      audienceTokens = ['ALL', `TOWER:${buyer.tower}`, `UNIT:${buyer.unit}`];
    } else if (filter === 'tower') {
      audienceTokens = [`TOWER:${buyer.tower}`];
    } else if (filter === 'unit') {
      audienceTokens = [`UNIT:${buyer.unit}`];
    }

    const noticesRef = collection(db, 'notices');
    const q = query(
      noticesRef,
      where('audience', 'array-contains-any', audienceTokens),
      orderBy('isPinned', 'desc'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(PAGE_SIZE)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notices: Notice[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Notice, 'id'>),
        }));
        onUpdate(notices);
      },
      (err) => {
        console.warn('Feed real-time listener error:', err);
      }
    );
  },

  /**
   * Marks a notice as read by a buyer.
   * Records read receipt and increments read count atomically.
   */
  async markAsRead(noticeId: string, buyer: Buyer): Promise<void> {
    // Record locally first for instant UI response
    await storageService.markNoticeReadLocally(buyer.id, noticeId);

    const receipt: ReadReceipt = {
      buyerId: buyer.id,
      buyerName: buyer.name,
      unit: buyer.unit,
      tower: buyer.tower,
      phone: buyer.phone,
      readAt: Date.now(),
    };

    await storageService.saveLocalRead(noticeId, receipt);

    if (!isFirebaseConfigured || !db) {
      // Update in-memory local notices
      const localNotices = await this.getAllLocalNotices();
      const target = localNotices.find((n) => n.id === noticeId);
      if (target) {
        target.readCount = (target.readCount || 0) + 1;
        await storageService.setLocalNotices(localNotices);
      }
      return;
    }

    try {
      const readRef = doc(db, 'notices', noticeId, 'reads', buyer.id);
      const existing = await getDoc(readRef);

      if (!existing.exists()) {
        await setDoc(readRef, receipt);

        // Atomic counter increment
        const noticeRef = doc(db, 'notices', noticeId);
        await updateDoc(noticeRef, {
          readCount: increment(1),
        });
      }
    } catch (e) {
      console.warn('Failed to commit read receipt to Firestore:', e);
    }
  },

  /**
   * Retrieves read analytics for a notice: who has read it and who hasn't.
   */
  async getNoticeReadAnalytics(
    notice: Notice,
    allBuyers: Buyer[]
  ): Promise<{
    readBuyers: ReadReceipt[];
    unreadBuyers: Buyer[];
    readCount: number;
    totalTargetBuyers: number;
    readPercentage: number;
  }> {
    // 1. Determine target audience buyers
    let targetBuyers: Buyer[] = [];
    if (notice.targetType === 'all') {
      targetBuyers = allBuyers;
    } else if (notice.targetType === 'towers') {
      targetBuyers = allBuyers.filter((b) => notice.targetTowers.includes(b.tower));
    } else if (notice.targetType === 'units') {
      targetBuyers = allBuyers.filter((b) => notice.targetUnits.includes(b.unit));
    }

    // 2. Fetch read receipts
    let readReceipts: ReadReceipt[] = [];
    if (isFirebaseConfigured && db) {
      try {
        const readsRef = collection(db, 'notices', notice.id, 'reads');
        const snapshot = await getDocs(readsRef);
        readReceipts = snapshot.docs.map((d) => d.data() as ReadReceipt);
      } catch (e) {
        console.warn('Error reading receipts from Firestore, using local fallback', e);
        readReceipts = await storageService.getLocalReads(notice.id);
      }
    } else {
      readReceipts = await storageService.getLocalReads(notice.id);
    }

    const readBuyerIds = new Set(readReceipts.map((r) => r.buyerId));
    const unreadBuyers = targetBuyers.filter((b) => !readBuyerIds.has(b.id));

    const totalTarget = Math.max(targetBuyers.length, 1);
    const readCount = readReceipts.length;
    const readPercentage = Math.round((readCount / totalTarget) * 100);

    return {
      readBuyers: readReceipts,
      unreadBuyers,
      readCount,
      totalTargetBuyers: targetBuyers.length,
      readPercentage,
    };
  },

  /**
   * Creates a new notice.
   */
  async createNotice(
    noticeData: Omit<Notice, 'id' | 'readCount' | 'audience' | 'createdAt'>,
    allBuyers: Buyer[]
  ): Promise<Notice> {
    // Construct audience tokens
    const audience: string[] = [];
    if (noticeData.targetType === 'all') {
      audience.push('ALL');
    } else if (noticeData.targetType === 'towers') {
      noticeData.targetTowers.forEach((t) => audience.push(`TOWER:${t}`));
    } else if (noticeData.targetType === 'units') {
      noticeData.targetUnits.forEach((u) => audience.push(`UNIT:${u}`));
    }

    // Determine target count
    let totalTargetBuyers = 0;
    if (noticeData.targetType === 'all') {
      totalTargetBuyers = allBuyers.length;
    } else if (noticeData.targetType === 'towers') {
      totalTargetBuyers = allBuyers.filter((b) => noticeData.targetTowers.includes(b.tower)).length;
    } else if (noticeData.targetType === 'units') {
      totalTargetBuyers = allBuyers.filter((b) => noticeData.targetUnits.includes(b.unit)).length;
    }

    const newId = `notice_${Date.now()}`;
    const newNotice: Notice = {
      ...noticeData,
      id: newId,
      audience,
      readCount: 0,
      totalTargetBuyers,
      createdAt: Date.now(),
    };

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'notices', newId);
      await setDoc(docRef, newNotice);
    } else {
      const localNotices = await this.getAllLocalNotices();
      localNotices.unshift(newNotice);
      await storageService.setLocalNotices(localNotices);
    }

    return newNotice;
  },

  /**
   * Gets all notices for Builder management dashboard.
   */
  async getAllNotices(): Promise<Notice[]> {
    if (isFirebaseConfigured && db) {
      try {
        const noticesRef = collection(db, 'notices');
        const q = query(
          noticesRef,
          orderBy('isPinned', 'desc'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Notice, 'id'>),
        }));
      } catch (e) {
        console.warn('Error fetching all notices from Firestore', e);
      }
    }
    return this.getAllLocalNotices();
  },

  // --- Local / Offline Store Helpers ---
  async getAllLocalNotices(): Promise<Notice[]> {
    const stored = await storageService.getLocalNotices();
    if (stored.length > 0) return stored;
    // Fallback to seeded bundle
    const fallbackNotices = (seededBundle.notices as Notice[]) || [];
    await storageService.setLocalNotices(fallbackNotices);
    return fallbackNotices;
  },

  async getLocalFeedNotices(
    buyer: Buyer,
    filter: FeedFilter,
    cursorIndex: any,
    limitCount: number
  ): Promise<PaginatedNoticesResult> {
    const all = await this.getAllLocalNotices();

    // Filter notices meant for this buyer
    const filtered = all.filter((n) => {
      const isAudienceMatch =
        n.audience.includes('ALL') ||
        n.audience.includes(`TOWER:${buyer.tower}`) ||
        n.audience.includes(`UNIT:${buyer.unit}`);

      if (!isAudienceMatch) return false;

      if (filter === 'tower') {
        return n.audience.includes(`TOWER:${buyer.tower}`);
      }
      if (filter === 'unit') {
        return n.audience.includes(`UNIT:${buyer.unit}`);
      }
      return true;
    });

    // Sort: pinned first, then newest
    filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return b.createdAt - a.createdAt;
    });

    const startIndex = typeof cursorIndex === 'number' ? cursorIndex : 0;
    const pageItems = filtered.slice(startIndex, startIndex + limitCount);
    const nextCursor = startIndex + pageItems.length;
    const hasMore = nextCursor < filtered.length;

    return {
      notices: pageItems,
      lastDoc: nextCursor,
      hasMore,
      fromCache: true,
    };
  },
};
