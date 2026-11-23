import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { buyerService } from '../../src/services/buyerService';
import { noticeService } from '../../src/services/noticeService';
import { Notice, ProjectOverview, TowerStats } from '../../src/types';
import { NoticeCard } from '../../src/components/NoticeCard';

export default function BuilderOverviewScreen() {
  const router = useRouter();
  const { allBuyers } = useApp();

  const [towers, setTowers] = useState<TowerStats[]>([]);
  const [overview, setOverview] = useState<ProjectOverview | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const breakdown = await buyerService.getTowerBreakdown();
      setTowers(breakdown.towers);
      setOverview(breakdown.overview);

      const allNotices = await noticeService.getAllNotices();
      setNotices(allNotices.slice(0, 10)); // show latest 10
    } catch (e) {
      console.warn('Dashboard load error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, allBuyers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#B45309" />
        <Text style={styles.loadingText}>Loading Builder Console...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Top Banner / Project Metrics */}
      <View style={styles.projectHero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.projectSuper}>PROJECT DASHBOARD</Text>
            <Text style={styles.projectName}>Skyline Grandeur Heights</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Active</Text>
          </View>
        </View>

        {overview && (
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>TOTAL UNITS</Text>
              <Text style={styles.metricNumber}>{overview.totalUnits}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>JOINED BUYERS</Text>
              <Text style={[styles.metricNumber, { color: '#10B981' }]}>
                {overview.totalJoined}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>PENDING</Text>
              <Text style={[styles.metricNumber, { color: '#F59E0B' }]}>
                {overview.totalPending}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>JOINED %</Text>
              <Text style={[styles.metricNumber, { color: '#3B82F6' }]}>
                {overview.overallJoinPercentage}%
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Quick Action Shortcuts */}
      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={styles.postNoticeBtn}
          onPress={() => router.push('/(builder)/create-notice')}
          activeOpacity={0.8}
        >
          <Ionicons name="megaphone" size={16} color="#FFFFFF" />
          <Text style={styles.postNoticeBtnText}>Post New Notice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.importBtn}
          onPress={() => router.push('/(builder)/import-buyers')}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-upload-outline" size={16} color="#1E293B" />
          <Text style={styles.importBtnText}>Import Buyers CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Tower Join Breakdown Section */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>BUYER ONBOARDING BY TOWER</Text>
          <Text style={styles.sectionSubtitle}>
            Track which towers have claimed invite codes
          </Text>
        </View>
      </View>

      <View style={styles.towersList}>
        {towers.map((item) => (
          <TouchableOpacity
            key={item.tower}
            style={styles.towerCard}
            onPress={() =>
              router.push({
                pathname: '/(builder)/tower-details',
                params: { towerName: item.tower },
              })
            }
            activeOpacity={0.8}
          >
            <View style={styles.towerCardHeader}>
              <View style={styles.towerLeft}>
                <Ionicons name="business" size={18} color="#B45309" />
                <Text style={styles.towerName}>{item.tower}</Text>
              </View>
              <View style={styles.towerRight}>
                <Text style={styles.towerJoinedRatio}>
                  <Text style={styles.boldRatio}>{item.joinedUnits}</Text> / {item.totalUnits} Units
                </Text>
                <Text style={styles.towerPercentBadge}>{item.joinPercentage}%</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.towerProgressBar}>
              <View
                style={[
                  styles.towerProgressFill,
                  { width: `${Math.min(100, Math.max(0, item.joinPercentage))}%` },
                ]}
              />
            </View>

            <View style={styles.towerFooter}>
              <Text style={styles.towerFooterText}>
                {item.pendingUnits} pending invite code claim
              </Text>
              <View style={styles.viewUnitsLink}>
                <Text style={styles.viewUnitsText}>View Unit List</Text>
                <Ionicons name="chevron-forward" size={13} color="#B45309" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notices with Read Count Section */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>NOTICES & READ RECEIPTS</Text>
          <Text style={styles.sectionSubtitle}>
            Tap a notice to see who has read it and who hasn't
          </Text>
        </View>
      </View>

      {notices.map((notice) => (
        <NoticeCard
          key={notice.id}
          notice={notice}
          isRead={true}
          showBuilderAnalytics={true}
          onPress={() =>
            router.push({
              pathname: '/(builder)/notice-detail',
              params: { noticeId: notice.id },
            })
          }
        />
      ))}
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
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  projectHero: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  projectSuper: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  postNoticeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#B45309',
    borderRadius: 10,
    paddingVertical: 12,
  },
  postNoticeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  importBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 12,
  },
  importBtnText: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  towersList: {
    gap: 10,
    marginBottom: 24,
  },
  towerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  towerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  towerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  towerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  towerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  towerJoinedRatio: {
    fontSize: 12,
    color: '#64748B',
  },
  boldRatio: {
    fontWeight: '800',
    color: '#0F172A',
  },
  towerPercentBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  towerProgressBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  towerProgressFill: {
    height: '100%',
    backgroundColor: '#D97706',
    borderRadius: 3,
  },
  towerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  towerFooterText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  viewUnitsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewUnitsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
});
