import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProgressRingProps {
  progressPercent: number; // 0 - 100
  size?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progressPercent,
}) => {
  const percent = Math.min(100, Math.max(0, progressPercent));

  const milestones = [
    { title: 'Substructure & Foundation', status: 'completed', percent: 100 },
    { title: 'RCC Superstructure (18 Floors)', status: 'completed', percent: 100 },
    { title: 'Brickwork & Wall Plastering', status: 'completed', percent: 100 },
    { title: 'Electrical & Plumbing Riser (MEP)', status: 'in_progress', percent: 85 },
    { title: 'Internal Flooring & Tile Cladding', status: 'in_progress', percent: 50 },
    { title: 'Passenger Elevators & Fixtures', status: 'pending', percent: 20 },
  ];

  return (
    <View style={styles.container}>
      {/* Visual Overall Bar & Large Percentage */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.overallLabel}>OVERALL CONSTRUCTION</Text>
          <Text style={styles.percentText}>{percent}%</Text>
          <Text style={styles.subtext}>On track for timely possession</Text>
        </View>

        <View style={styles.circleBadge}>
          <Ionicons name="shield-checkmark" size={24} color="#059669" />
          <Text style={styles.circleBadgeText}>Verified</Text>
        </View>
      </View>

      {/* Progress Bar Container */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>

      {/* Detailed Milestone Stages Breakdown */}
      <View style={styles.milestoneList}>
        {milestones.map((item, idx) => (
          <View key={idx} style={styles.milestoneRow}>
            <View style={styles.iconCol}>
              {item.status === 'completed' ? (
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
              ) : item.status === 'in_progress' ? (
                <Ionicons name="sync-circle" size={16} color="#2563EB" />
              ) : (
                <Ionicons name="ellipse-outline" size={16} color="#94A3B8" />
              )}
            </View>
            <Text style={styles.milestoneTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.milestonePercent, item.status === 'completed' && styles.completedPercent]}>
              {item.percent}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  overallLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  percentText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 40,
    marginTop: 2,
  },
  subtext: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  circleBadge: {
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  circleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
  },
  track: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  fill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 5,
  },
  milestoneList: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    gap: 8,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCol: {
    width: 24,
    alignItems: 'flex-start',
  },
  milestoneTitle: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  milestonePercent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  completedPercent: {
    color: '#059669',
  },
});
