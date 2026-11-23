import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { noticeService } from '../../src/services/noticeService';
import { Buyer, Notice, ReadReceipt } from '../../src/types';
import { formatFullDateTime, formatRelativeTime } from '../../src/utils/dateUtils';

export default function NoticeDetailAnalyticsScreen() {
  const router = useRouter();
  const { noticeId } = useLocalSearchParams<{ noticeId: string }>();
  const { allBuyers } = useApp();

  const [notice, setNotice] = useState<Notice | null>(null);
  const [readBuyers, setReadBuyers] = useState<ReadReceipt[]>([]);
  const [unreadBuyers, setUnreadBuyers] = useState<Buyer[]>([]);
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const allNotices = await noticeService.getAllNotices();
        const target = allNotices.find((n) => n.id === noticeId) || null;
        setNotice(target);

        if (target) {
          const analytics = await noticeService.getNoticeReadAnalytics(target, allBuyers);
          setReadBuyers(analytics.readBuyers);
          setUnreadBuyers(analytics.unreadBuyers);
        }
      } catch (e) {
        console.warn('Failed to load notice analytics', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [noticeId, allBuyers]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#B45309" />
        <Text style={styles.loadingText}>Loading Read Analytics...</Text>
      </View>
    );
  }

  if (!notice) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notFoundText}>Notice not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalTarget = Math.max(unreadBuyers.length + readBuyers.length, 1);
  const readPercentage = Math.round((readBuyers.length / totalTarget) * 100);

  const handleNudge = (buyer: Buyer) => {
    const text = encodeURIComponent(
      `Hello ${buyer.name}, this is regarding an important construction notice for your unit (${buyer.unit}) on TowerPulse. Please review it on the app.`
    );
    const cleanPhone = buyer.phone.replace(/[^0-9+]/g, '');
    const url = `whatsapp://send?phone=${cleanPhone}&text=${text}`;
    Linking.openURL(url).catch(() => {
      // Fallback to SMS
      Linking.openURL(`sms:${cleanPhone}?body=${text}`).catch(() => {});
    });
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
          <Text style={styles.headerBackText}>Overview</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Read Receipt Audit</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Notice Info Card */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeBadges}>
            {notice.isPinned && (
              <View style={styles.pinnedBadge}>
                <Ionicons name="pin" size={11} color="#B45309" />
                <Text style={styles.pinnedText}>PINNED</Text>
              </View>
            )}
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{notice.category.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.title}>{notice.title}</Text>
          <Text style={styles.noticeDate}>
            Posted {formatRelativeTime(notice.createdAt)} by {notice.authorRole}
          </Text>
        </View>

        {/* Read Count Analytics Card */}
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>ENGAGEMENT & READ REACH</Text>
          <View style={styles.ratioRow}>
            <View>
              <Text style={styles.ratioMain}>
                {readBuyers.length}{' '}
                <Text style={styles.ratioSub}>/ {totalTarget} Buyers Read</Text>
              </Text>
              <Text style={styles.unreadCallout}>
                {unreadBuyers.length} buyers have NOT seen this notice
              </Text>
            </View>
            <View style={styles.percentageCircle}>
              <Text style={styles.percentageText}>{readPercentage}%</Text>
              <Text style={styles.percentageLabel}>Reached</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${readPercentage}%` }]} />
          </View>
        </View>

        {/* Tabs: Unread (Nudge list) vs Read */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'unread' && styles.tabActive]}
            onPress={() => setActiveTab('unread')}
          >
            <Ionicons
              name="alert-circle-outline"
              size={14}
              color={activeTab === 'unread' ? '#DC2626' : '#64748B'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'unread' && styles.tabLabelActiveUnread,
              ]}
            >
              Unread Buyers ({unreadBuyers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'read' && styles.tabActive]}
            onPress={() => setActiveTab('read')}
          >
            <Ionicons
              name="checkmark-done"
              size={14}
              color={activeTab === 'read' ? '#059669' : '#64748B'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'read' && styles.tabLabelActiveRead,
              ]}
            >
              Read Receipts ({readBuyers.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Unread Buyers List with Nudge Action */}
        {activeTab === 'unread' && (
          <View style={styles.listContainer}>
            {unreadBuyers.length === 0 ? (
              <View style={styles.allReadBox}>
                <Ionicons name="checkmark-circle" size={32} color="#059669" />
                <Text style={styles.allReadTitle}>100% Read Coverage!</Text>
                <Text style={styles.allReadDesc}>
                  Every targeted buyer in the audience has opened and read this notice.
                </Text>
              </View>
            ) : (
              unreadBuyers.map((buyer) => (
                <View key={buyer.id} style={styles.buyerRow}>
                  <View style={styles.buyerLeft}>
                    <View style={styles.unitBadge}>
                      <Text style={styles.unitBadgeText}>{buyer.unit}</Text>
                    </View>
                    <View style={styles.buyerInfo}>
                      <Text style={styles.buyerName}>{buyer.name}</Text>
                      <Text style={styles.buyerTower}>
                        {buyer.tower} • {buyer.phone}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.nudgeBtn}
                    onPress={() => handleNudge(buyer)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="logo-whatsapp" size={13} color="#047857" />
                    <Text style={styles.nudgeText}>Nudge</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* Tab 2: Read Receipts List */}
        {activeTab === 'read' && (
          <View style={styles.listContainer}>
            {readBuyers.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="time-outline" size={28} color="#94A3B8" />
                <Text style={styles.emptyBoxText}>No reads recorded yet.</Text>
              </View>
            ) : (
              readBuyers.map((receipt, idx) => (
                <View key={idx} style={styles.buyerRow}>
                  <View style={styles.buyerLeft}>
                    <View style={[styles.unitBadge, styles.readUnitBadge]}>
                      <Text style={styles.readUnitBadgeText}>{receipt.unit}</Text>
                    </View>
                    <View style={styles.buyerInfo}>
                      <Text style={styles.buyerName}>{receipt.buyerName}</Text>
                      <Text style={styles.buyerTower}>{receipt.tower}</Text>
                    </View>
                  </View>

                  <View style={styles.readTimestamp}>
                    <Ionicons name="checkmark-done" size={14} color="#059669" />
                    <Text style={styles.readTimeText}>
                      {formatFullDateTime(receipt.readAt)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  backBtn: {
    backgroundColor: '#B45309',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  noticeBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pinnedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  catBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 6,
  },
  noticeDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  analyticsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  ratioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratioMain: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  ratioSub: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  unreadCallout: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 2,
  },
  percentageCircle: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E40AF',
  },
  percentageLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#3B82F6',
  },
  track: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelActiveUnread: {
    color: '#DC2626',
    fontWeight: '700',
  },
  tabLabelActiveRead: {
    color: '#059669',
    fontWeight: '700',
  },
  listContainer: {
    gap: 8,
  },
  buyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buyerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  unitBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B',
  },
  readUnitBadge: {
    backgroundColor: '#ECFDF5',
  },
  readUnitBadgeText: {
    color: '#065F46',
  },
  buyerInfo: {
    flex: 1,
  },
  buyerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  buyerTower: {
    fontSize: 11,
    color: '#64748B',
  },
  nudgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  nudgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  readTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTimeText: {
    fontSize: 10,
    color: '#64748B',
  },
  allReadBox: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  allReadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 8,
  },
  allReadDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyBox: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyBoxText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
});
