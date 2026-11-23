import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { calculateDaysToPossession } from '../../src/utils/dateUtils';
import { ProgressRing } from '../../src/components/ProgressRing';
import { noticeService } from '../../src/services/noticeService';
import { Notice } from '../../src/types';

export default function UnitHomeScreen() {
  const router = useRouter();
  const { currentBuyer, readNoticeIds } = useApp();
  const [latestNotices, setLatestNotices] = useState<Notice[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPreviewNotices = async () => {
    if (!currentBuyer) return;
    try {
      const result = await noticeService.getFeedNotices(currentBuyer, 'all', null, 3);
      setLatestNotices(result.notices.slice(0, 2));
    } catch {}
  };

  useEffect(() => {
    fetchPreviewNotices();
  }, [currentBuyer]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPreviewNotices();
    setRefreshing(false);
  };

  if (!currentBuyer) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="key-outline" size={48} color="#94A3B8" />
        <Text style={styles.noBuyerTitle}>No Unit Linked</Text>
        <Text style={styles.noBuyerSubtitle}>
          Enter an invite code to connect your apartment unit and track its construction.
        </Text>
        <TouchableOpacity
          style={styles.claimButton}
          onPress={() => router.push('/(buyer)/join')}
        >
          <Text style={styles.claimButtonText}>Claim With Invite Code</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const daysRemaining = calculateDaysToPossession(currentBuyer.possessionDate || '2027-06-30');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.greeting}>Welcome home,</Text>
            <Text style={styles.ownerName}>{currentBuyer.name}</Text>
          </View>
          <View style={styles.verifiedTag}>
            <Ionicons name="shield-checkmark" size={12} color="#059669" />
            <Text style={styles.verifiedTagText}>Verified Owner</Text>
          </View>
        </View>

        <View style={styles.specsGrid}>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>UNIT</Text>
            <Text style={styles.specValue}>{currentBuyer.unit}</Text>
          </View>
          <View style={styles.specDivider} />
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>TOWER</Text>
            <Text style={styles.specValue}>{currentBuyer.tower}</Text>
          </View>
          <View style={styles.specDivider} />
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>CONFIG</Text>
            <Text style={styles.specValue} numberOfLines={1}>
              {currentBuyer.configuration || '3BHK Luxury'}
            </Text>
          </View>
        </View>

        <View style={styles.countdownStrip}>
          <View style={styles.countdownLeft}>
            <Ionicons name="calendar-outline" size={20} color="#1E40AF" />
            <View>
              <Text style={styles.countdownTitle}>{daysRemaining} Days to Possession</Text>
              <Text style={styles.countdownSub}>Target Handover: June 30, 2027</Text>
            </View>
          </View>
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownBadgeText}>On Schedule</Text>
          </View>
        </View>
      </View>

      <ProgressRing progressPercent={currentBuyer.progressPercent || 72} />

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>LATEST NOTICES FOR YOU</Text>
        <TouchableOpacity onPress={() => router.push('/(buyer)/feed')}>
          <Text style={styles.viewAllText}>View Feed →</Text>
        </TouchableOpacity>
      </View>

      {latestNotices.length > 0 ? (
        latestNotices.map((notice) => {
          const isRead = readNoticeIds.has(notice.id);
          return (
            <TouchableOpacity
              key={notice.id}
              style={[styles.noticePreviewCard, !isRead && styles.unreadPreviewCard]}
              onPress={() => router.push('/(buyer)/feed')}
              activeOpacity={0.8}
            >
              <View style={styles.noticeIconWrap}>
                <Ionicons
                  name={notice.isPinned ? 'pin' : 'newspaper-outline'}
                  size={16}
                  color={notice.isPinned ? '#B45309' : '#1E40AF'}
                />
              </View>
              <View style={styles.noticeTextWrap}>
                <Text style={styles.noticeTitle} numberOfLines={1}>
                  {notice.title}
                </Text>
                <Text style={styles.noticeSnippet} numberOfLines={1}>
                  {notice.content}
                </Text>
              </View>
              {!isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        })
      ) : (
        <View style={styles.emptyNoticeBox}>
          <Text style={styles.emptyNoticeText}>No recent notices for your unit.</Text>
        </View>
      )}

      <View style={styles.supportCard}>
        <View style={styles.supportHeader}>
          <Ionicons name="headset-outline" size={18} color="#1E293B" />
          <Text style={styles.supportTitle}>Builder Site Office & Support</Text>
        </View>
        <Text style={styles.supportDesc}>
          Site Office: Mon - Sat (9:30 AM - 6:30 PM) • Phone: +91 800-TOWER-00
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  noBuyerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  noBuyerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    maxWidth: 280,
  },
  claimButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  ownerName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6EE7B7',
  },
  specsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  specItem: {
    flex: 1,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  specValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  specDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#475569',
  },
  countdownStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
  },
  countdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countdownTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  countdownSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  countdownBadge: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  countdownBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#93C5FD',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  noticePreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unreadPreviewCard: {
    borderColor: '#93C5FD',
    backgroundColor: '#F8FAFF',
  },
  noticeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  noticeTextWrap: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  noticeSnippet: {
    fontSize: 11,
    color: '#64748B',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 8,
  },
  emptyNoticeBox: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 12,
  },
  emptyNoticeText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  supportCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  supportTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  supportDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
});
