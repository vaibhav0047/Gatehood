import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { Buyer, CSVImportResult, ProjectOverview, TowerStats } from '../types';
import { storageService } from './storageService';
import { normalizeInviteCode } from '../utils/codeGenerator';
import { parseBuyersCSV } from '../utils/csvParser';
import { calculateDaysToPossession } from '../utils/dateUtils';
import seededBundle from '../data/seededData.json';

export class InviteCodeError extends Error {
  code: 'INVALID_CODE' | 'EXPIRED_CODE' | 'ALREADY_USED';
  dateInfo?: string;

  constructor(
    code: 'INVALID_CODE' | 'EXPIRED_CODE' | 'ALREADY_USED',
    message: string,
    dateInfo?: string
  ) {
    super(message);
    this.name = 'InviteCodeError';
    this.code = code;
    this.dateInfo = dateInfo;
  }
}

export const buyerService = {
  /**
   * Retrieves all buyers across the project.
   */
  async getAllBuyers(): Promise<Buyer[]> {
    if (isFirebaseConfigured && db) {
      try {
        const buyersRef = collection(db, 'buyers');
        const snapshot = await getDocs(buyersRef);
        if (!snapshot.empty) {
          return snapshot.docs.map((d) => d.data() as Buyer);
        }
      } catch (e) {
        console.warn('Error fetching buyers from Firestore, falling back', e);
      }
    }

    const localBuyers = await storageService.getLocalBuyers();
    if (localBuyers.length > 0) {
      return localBuyers;
    }

    const fallback = (seededBundle.buyers as Buyer[]) || [];
    await storageService.setLocalBuyers(fallback);
    return fallback;
  },

  /**
   * Validates and claims an invite code.
   * Handles invalid, already-used, and expired codes rigorously.
   */
  async validateAndClaimInviteCode(rawCode: string): Promise<Buyer> {
    const code = normalizeInviteCode(rawCode);
    if (!code) {
      throw new InviteCodeError('INVALID_CODE', 'Please enter an invite code.');
    }

    let buyer: Buyer | null = null;

    if (isFirebaseConfigured && db) {
      try {
        const buyersRef = collection(db, 'buyers');
        const q = query(buyersRef, where('inviteCode', '==', code));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          buyer = snapshot.docs[0].data() as Buyer;
        }
      } catch (e) {
        console.warn('Firestore invite lookup failed, checking local store', e);
      }
    }

    if (!buyer) {
      const allBuyers = await this.getAllBuyers();
      buyer = allBuyers.find((b) => normalizeInviteCode(b.inviteCode) === code) || null;
    }

    // 1. Invalid Code check
    if (!buyer) {
      throw new InviteCodeError(
        'INVALID_CODE',
        `Invite code "${code}" is not recognized. Please check with your builder site office.`
      );
    }

    // 2. Expired Code check
    if (buyer.inviteExpiresAt && buyer.inviteExpiresAt < Date.now()) {
      const expDate = new Date(buyer.inviteExpiresAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      throw new InviteCodeError(
        'EXPIRED_CODE',
        `This invite code expired on ${expDate}. Please contact your builder for a fresh access code.`,
        expDate
      );
    }

    // 3. Already Used check
    if (buyer.inviteStatus === 'joined') {
      const joinedDate = buyer.joinedAt
        ? new Date(buyer.joinedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'an earlier date';
      throw new InviteCodeError(
        'ALREADY_USED',
        `This unit (${buyer.unit}) was already claimed on ${joinedDate}. If you are the owner, please contact builder support.`,
        joinedDate
      );
    }

    // 4. Valid Code: Claim and activate unit
    const now = Date.now();
    const updatedBuyer: Buyer = {
      ...buyer,
      inviteStatus: 'joined',
      joinedAt: now,
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'buyers', buyer.id);
        await updateDoc(docRef, {
          inviteStatus: 'joined',
          joinedAt: now,
        });
      } catch (e) {
        console.warn('Error updating claimed buyer in Firestore:', e);
      }
    }

    // Update in local store
    const allBuyers = await this.getAllBuyers();
    const updatedList = allBuyers.map((b) => (b.id === buyer?.id ? updatedBuyer : b));
    await storageService.setLocalBuyers(updatedList);

    // Persist as current buyer session
    await storageService.setCurrentBuyer(updatedBuyer);

    return updatedBuyer;
  },

  /**
   * Calculates tower-by-tower statistics and overall project overview.
   */
  async getTowerBreakdown(): Promise<{
    towers: TowerStats[];
    overview: ProjectOverview;
    buyersByTower: Record<string, Buyer[]>;
  }> {
    const allBuyers = await this.getAllBuyers();

    const buyersByTower: Record<string, Buyer[]> = {};
    for (const buyer of allBuyers) {
      if (!buyersByTower[buyer.tower]) {
        buyersByTower[buyer.tower] = [];
      }
      buyersByTower[buyer.tower].push(buyer);
    }

    const towers: TowerStats[] = Object.keys(buyersByTower)
      .sort()
      .map((towerName) => {
        const towerBuyers = buyersByTower[towerName];
        const totalUnits = towerBuyers.length;
        const joinedUnits = towerBuyers.filter((b) => b.inviteStatus === 'joined').length;
        const pendingUnits = totalUnits - joinedUnits;
        const joinPercentage = totalUnits > 0 ? Math.round((joinedUnits / totalUnits) * 100) : 0;

        return {
          tower: towerName,
          totalUnits,
          joinedUnits,
          pendingUnits,
          joinPercentage,
        };
      });

    const totalUnits = allBuyers.length;
    const totalJoined = allBuyers.filter((b) => b.inviteStatus === 'joined').length;
    const totalPending = totalUnits - totalJoined;
    const overallJoinPercentage =
      totalUnits > 0 ? Math.round((totalJoined / totalUnits) * 100) : 0;

    const avgProgress =
      totalUnits > 0
        ? Math.round(
            allBuyers.reduce((acc, b) => acc + (b.progressPercent || 0), 0) / totalUnits
          )
        : 68;

    const possessionDate = '2027-06-30';
    const daysToPossession = calculateDaysToPossession(possessionDate);

    const overview: ProjectOverview = {
      totalUnits,
      totalJoined,
      totalPending,
      overallJoinPercentage,
      overallProgressPercent: avgProgress,
      possessionDate,
      daysToPossession,
    };

    return {
      towers,
      overview,
      buyersByTower,
    };
  },

  /**
   * Imports buyers from raw CSV text content.
   */
  async importBuyersFromCSV(csvContent: string): Promise<CSVImportResult> {
    const parseResult = parseBuyersCSV(csvContent);
    if (!parseResult.success) {
      return parseResult;
    }

    const currentBuyers = await this.getAllBuyers();
    const existingUnitMap = new Map(currentBuyers.map((b) => [b.unit, b]));

    // Merge: insert or update buyers
    for (const newBuyer of parseResult.buyers) {
      existingUnitMap.set(newBuyer.unit, newBuyer);
    }

    const mergedBuyers = Array.from(existingUnitMap.values());

    if (isFirebaseConfigured && db) {
      try {
        const batch = writeBatch(db);
        for (const buyer of parseResult.buyers) {
          const docRef = doc(db, 'buyers', buyer.id);
          batch.set(docRef, buyer, { merge: true });
        }
        await batch.commit();
      } catch (e) {
        console.warn('Error saving imported buyers to Firestore:', e);
      }
    }

    await storageService.setLocalBuyers(mergedBuyers);

    return parseResult;
  },
};
