import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Buyer, Role } from '../types';
import { storageService } from '../services/storageService';
import { buyerService } from '../services/buyerService';
import { noticeService } from '../services/noticeService';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  currentBuyer: Buyer | null;
  setCurrentBuyer: (buyer: Buyer | null) => Promise<void>;
  readNoticeIds: Set<string>;
  markNoticeRead: (noticeId: string) => Promise<void>;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  allBuyers: Buyer[];
  refreshBuyers: () => Promise<void>;
  isAppReady: boolean;
  logoutBuyer: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>('buyer');
  const [currentBuyer, setCurrentBuyerState] = useState<Buyer | null>(null);
  const [readNoticeIds, setReadNoticeIds] = useState<Set<string>>(new Set());
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [allBuyers, setAllBuyers] = useState<Buyer[]>([]);
  const [isAppReady, setIsAppReady] = useState<boolean>(false);

  // Initialize persisted state on launch
  useEffect(() => {
    async function init() {
      try {
        const savedRole = await storageService.getActiveRole();
        if (savedRole) {
          setRoleState(savedRole);
        }

        const buyers = await buyerService.getAllBuyers();
        setAllBuyers(buyers);

        const savedBuyer = await storageService.getCurrentBuyer();
        if (savedBuyer) {
          // Synchronize with latest buyer state from database
          const freshBuyer = buyers.find((b) => b.id === savedBuyer.id) || savedBuyer;
          setCurrentBuyerState(freshBuyer);

          const readIds = await storageService.getReadNoticeIds(freshBuyer.id);
          setReadNoticeIds(readIds);
        } else {
          // Default demo buyer if none claimed yet (e.g. Unit A-1204 Rahul Sharma)
          const defaultBuyer = buyers.find((b) => b.id === 'A-1204');
          if (defaultBuyer) {
            setCurrentBuyerState(defaultBuyer);
            await storageService.setCurrentBuyer(defaultBuyer);
            const readIds = await storageService.getReadNoticeIds(defaultBuyer.id);
            setReadNoticeIds(readIds);
          }
        }
      } catch (err) {
        console.warn('Initialization error:', err);
      } finally {
        setIsAppReady(true);
      }
    }
    init();
  }, []);

  const setRole = useCallback(async (newRole: Role) => {
    setRoleState(newRole);
    await storageService.setActiveRole(newRole);
  }, []);

  const setCurrentBuyer = useCallback(async (buyer: Buyer | null) => {
    setCurrentBuyerState(buyer);
    await storageService.setCurrentBuyer(buyer);
    if (buyer) {
      const readIds = await storageService.getReadNoticeIds(buyer.id);
      setReadNoticeIds(readIds);
    } else {
      setReadNoticeIds(new Set());
    }
  }, []);

  const logoutBuyer = useCallback(async () => {
    setCurrentBuyerState(null);
    await storageService.setCurrentBuyer(null);
    setReadNoticeIds(new Set());
  }, []);

  const markNoticeRead = useCallback(
    async (noticeId: string) => {
      if (!currentBuyer) return;

      setReadNoticeIds((prev) => {
        const next = new Set(prev);
        next.add(noticeId);
        return next;
      });

      await noticeService.markAsRead(noticeId, currentBuyer);
    },
    [currentBuyer]
  );

  const refreshBuyers = useCallback(async () => {
    const buyers = await buyerService.getAllBuyers();
    setAllBuyers(buyers);
    if (currentBuyer) {
      const fresh = buyers.find((b) => b.id === currentBuyer.id);
      if (fresh) setCurrentBuyerState(fresh);
    }
  }, [currentBuyer]);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentBuyer,
        setCurrentBuyer,
        readNoticeIds,
        markNoticeRead,
        isOffline,
        setIsOffline,
        allBuyers,
        refreshBuyers,
        isAppReady,
        logoutBuyer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
