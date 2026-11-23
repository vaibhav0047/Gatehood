import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buyer, Notice, ReadReceipt } from '../types';

const STORAGE_KEYS = {
  CACHED_FEED: '@tower_pulse_cached_feed',
  CURRENT_BUYER: '@tower_pulse_current_buyer',
  READ_NOTICE_IDS: '@tower_pulse_read_notice_ids',
  LOCAL_NOTICES: '@tower_pulse_local_notices',
  LOCAL_BUYERS: '@tower_pulse_local_buyers',
  LOCAL_READS: '@tower_pulse_local_reads',
  ACTIVE_ROLE: '@tower_pulse_active_role',
};

export const storageService = {
  async getCachedFeed(): Promise<Notice[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_FEED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setCachedFeed(notices: Notice[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CACHED_FEED, JSON.stringify(notices));
    } catch {}
  },

  async getCurrentBuyer(): Promise<Buyer | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_BUYER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setCurrentBuyer(buyer: Buyer | null): Promise<void> {
    try {
      if (buyer) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_BUYER, JSON.stringify(buyer));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_BUYER);
      }
    } catch {}
  },

  async getActiveRole(): Promise<'builder' | 'buyer' | null> {
    try {
      return (await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE)) as 'builder' | 'buyer' | null;
    } catch {
      return null;
    }
  },

  async setActiveRole(role: 'builder' | 'buyer'): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    } catch {}
  },

  async getReadNoticeIds(buyerId: string): Promise<Set<string>> {
    try {
      const key = `${STORAGE_KEYS.READ_NOTICE_IDS}_${buyerId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch {
      return new Set();
    }
  },

  async markNoticeReadLocally(buyerId: string, noticeId: string): Promise<void> {
    try {
      const current = await this.getReadNoticeIds(buyerId);
      current.add(noticeId);
      const key = `${STORAGE_KEYS.READ_NOTICE_IDS}_${buyerId}`;
      await AsyncStorage.setItem(key, JSON.stringify(Array.from(current)));
    } catch {}
  },

  async getLocalNotices(): Promise<Notice[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_NOTICES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setLocalNotices(notices: Notice[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_NOTICES, JSON.stringify(notices));
    } catch {}
  },

  async getLocalBuyers(): Promise<Buyer[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LOCAL_BUYERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setLocalBuyers(buyers: Buyer[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCAL_BUYERS, JSON.stringify(buyers));
    } catch {}
  },

  async getLocalReads(noticeId: string): Promise<ReadReceipt[]> {
    try {
      const key = `${STORAGE_KEYS.LOCAL_READS}_${noticeId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveLocalRead(noticeId: string, receipt: ReadReceipt): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.LOCAL_READS}_${noticeId}`;
      const reads = await this.getLocalReads(noticeId);
      if (!reads.some((r) => r.buyerId === receipt.buyerId)) {
        reads.push(receipt);
        await AsyncStorage.setItem(key, JSON.stringify(reads));
      }
    } catch {}
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch {}
  },
};
