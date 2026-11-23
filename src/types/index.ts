export type Role = 'builder' | 'buyer';

export type NoticeTargetType = 'all' | 'towers' | 'units';

export type NoticeCategory = 
  | 'construction' 
  | 'milestone' 
  | 'maintenance' 
  | 'legal' 
  | 'payment' 
  | 'event' 
  | 'urgent';

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  targetType: NoticeTargetType;
  targetTowers: string[]; // e.g. ["Tower A", "Tower B"]
  targetUnits: string[];  // e.g. ["A-1204", "B-0301"]
  // Unified audience tokens for single array-contains-any query:
  // e.g. ['ALL'], ['TOWER:Tower A'], ['UNIT:A-1204']
  audience: string[];
  isPinned: boolean;
  readCount: number;
  totalTargetBuyers: number;
  createdAt: number; // Unix timestamp in ms
  createdBy: string;
  authorRole: string;
  imageUrl?: string;
}

export interface ReadReceipt {
  buyerId: string;
  buyerName: string;
  unit: string;
  tower: string;
  phone: string;
  readAt: number; // Unix timestamp in ms
}

export type InviteStatus = 'pending' | 'joined' | 'expired';

export interface Buyer {
  id: string; // usually normalized unit ID e.g. "A-1204" or uuid
  name: string;
  phone: string;
  tower: string; // e.g. "Tower A"
  unit: string;  // e.g. "A-1204"
  configuration: string; // e.g. "3BHK Luxury", "2BHK Premium"
  progressPercent: number; // 0 - 100
  possessionDate: string; // ISO date string e.g. "2027-06-30"
  inviteCode: string; // e.g. "A1204-7KQ"
  inviteStatus: InviteStatus;
  inviteExpiresAt: number; // Unix timestamp ms
  joinedAt?: number | null; // Unix timestamp ms
  createdAt: number;
}

export interface TowerStats {
  tower: string;
  totalUnits: number;
  joinedUnits: number;
  pendingUnits: number;
  joinPercentage: number;
}

export interface ProjectOverview {
  totalUnits: number;
  totalJoined: number;
  totalPending: number;
  overallJoinPercentage: number;
  overallProgressPercent: number;
  possessionDate: string;
  daysToPossession: number;
}

export interface CSVImportResult {
  success: boolean;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  errors: string[];
  buyers: Buyer[];
}

export type FeedFilter = 'all' | 'tower' | 'unit';
