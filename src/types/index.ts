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
  targetTowers: string[];
  targetUnits: string[];
  audience: string[];
  isPinned: boolean;
  readCount: number;
  totalTargetBuyers: number;
  createdAt: number;
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
  readAt: number;
}

export type InviteStatus = 'pending' | 'joined' | 'expired';

export interface Buyer {
  id: string;
  name: string;
  phone: string;
  tower: string;
  unit: string;
  configuration: string;
  progressPercent: number;
  possessionDate: string;
  inviteCode: string;
  inviteStatus: InviteStatus;
  inviteExpiresAt: number;
  joinedAt?: number | null;
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
