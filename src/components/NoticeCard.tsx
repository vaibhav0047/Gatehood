import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notice } from '../types';
import { formatRelativeTime } from '../utils/dateUtils';

interface NoticeCardProps {
  notice: Notice;
  isRead: boolean;
  onPress: () => void;
  showBuilderAnalytics?: boolean;
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  urgent: { label: 'URGENT', bg: '#FEE2E2', text: '#991B1B', icon: 'alert-circle' },
  milestone: { label: 'MILESTONE', bg: '#D1FAE5', text: '#065F46', icon: 'trophy' },
  construction: { label: 'CONSTRUCTION', bg: '#FEF3C7', text: '#92400E', icon: 'construct' },
  maintenance: { label: 'MAINTENANCE', bg: '#E0E7FF', text: '#3730A3', icon: 'build' },
  payment: { label: 'PAYMENT', bg: '#FCE7F3', text: '#9D174D', icon: 'card' },
  legal: { label: 'LEGAL / RERA', bg: '#F3E8FF', text: '#6B21A8', icon: 'document-text' },
  event: { label: 'COMMUNITY', bg: '#CCFBF1', text: '#115E59', icon: 'people' },
};

export const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  isRead,
  onPress,
  showBuilderAnalytics = false,
}) => {
  const catConfig = CATEGORY_CONFIG[notice.category] || CATEGORY_CONFIG.construction;

  let audienceLabel = 'All Project';
  if (notice.targetType === 'towers') {
    audienceLabel = notice.targetTowers.join(', ');
  } else if (notice.targetType === 'units') {
    audienceLabel = `Unit ${notice.targetUnits.join(', ')}`;
  }

  const readPercent =
    notice.totalTargetBuyers > 0
      ? Math.round((notice.readCount / notice.totalTargetBuyers) * 100)
      : 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        notice.isPinned && styles.pinnedCard,
        !isRead && styles.unreadCard,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          {notice.isPinned && (
            <View style={styles.pinnedBadge}>
              <Ionicons name="pin" size={12} color="#B45309" />
              <Text style={styles.pinnedText}>PINNED</Text>
            </View>
          )}

          <View style={[styles.categoryBadge, { backgroundColor: catConfig.bg }]}>
            <Ionicons name={catConfig.icon} size={11} color={catConfig.text} />
            <Text style={[styles.categoryText, { color: catConfig.text }]}>
              {catConfig.label}
            </Text>
          </View>

          <View style={styles.audienceBadge}>
            <Ionicons name="layers-outline" size={11} color="#6B7280" />
            <Text style={styles.audienceText} numberOfLines={1}>
              {audienceLabel}
            </Text>
          </View>
        </View>

        {!showBuilderAnalytics && (
          <View style={styles.readIndicator}>
            {!isRead ? (
              <View style={styles.unreadDotBadge}>
                <View style={styles.unreadDot} />
                <Text style={styles.unreadLabel}>New</Text>
              </View>
            ) : (
              <View style={styles.readCheckBadge}>
                <Ionicons name="checkmark-done" size={13} color="#10B981" />
                <Text style={styles.readLabel}>Read</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.contentRow}>
        <View style={styles.textColumn}>
          <Text
            style={[styles.title, !isRead && styles.unreadTitle]}
            numberOfLines={2}
          >
            {notice.title}
          </Text>

          <Text style={styles.snippet} numberOfLines={2}>
            {notice.content}
          </Text>
        </View>

        {notice.imageUrl && (
          <Image source={{ uri: notice.imageUrl }} style={styles.thumbnail} resizeMode="cover" />
        )}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.authorGroup}>
          <Ionicons name="time-outline" size={12} color="#9CA3AF" />
          <Text style={styles.dateText}>{formatRelativeTime(notice.createdAt)}</Text>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.authorText} numberOfLines={1}>
            {notice.authorRole || 'Project Team'}
          </Text>
        </View>

        {showBuilderAnalytics ? (
          <View style={styles.analyticsGroup}>
            <View style={styles.readCountBadge}>
              <Ionicons name="eye-outline" size={13} color="#1D4ED8" />
              <Text style={styles.readCountText}>
                {notice.readCount}/{notice.totalTargetBuyers} ({readPercent}%)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  pinnedCard: {
    borderColor: '#F59E0B',
    borderWidth: 1.5,
    backgroundColor: '#FFFDF7',
  },
  unreadCard: {
    borderColor: '#93C5FD',
    backgroundColor: '#FAF5FF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pinnedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  audienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: 130,
  },
  audienceText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#475569',
  },
  readIndicator: {
    marginLeft: 8,
  },
  unreadDotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  unreadLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  readCheckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  readLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#059669',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 20,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#0F172A',
  },
  snippet: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  bullet: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  authorText: {
    fontSize: 11,
    color: '#64748B',
    maxWidth: 140,
  },
  analyticsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  readCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
  },
});
