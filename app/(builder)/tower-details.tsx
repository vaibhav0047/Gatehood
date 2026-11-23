import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { Buyer } from '../../src/types';
import { formatRelativeTime } from '../../src/utils/dateUtils';

export default function TowerDetailsScreen() {
  const router = useRouter();
  const { towerName } = useLocalSearchParams<{ towerName: string }>();
  const { allBuyers } = useApp();

  const [filter, setFilter] = useState<'all' | 'joined' | 'pending'>('all');
  const [buyers, setBuyers] = useState<Buyer[]>([]);

  useEffect(() => {
    const matched = allBuyers.filter((b) => b.tower === (towerName || 'Tower A'));
    setBuyers(matched);
  }, [towerName, allBuyers]);

  const joinedCount = buyers.filter((b) => b.inviteStatus === 'joined').length;
  const pendingCount = buyers.filter((b) => b.inviteStatus !== 'joined').length;
  const joinRate = buyers.length > 0 ? Math.round((joinedCount / buyers.length) * 100) : 0;

  const filteredBuyers = buyers.filter((b) => {
    if (filter === 'joined') return b.inviteStatus === 'joined';
    if (filter === 'pending') return b.inviteStatus !== 'joined';
    return true;
  });

  const handleShareCode = async (buyer: Buyer) => {
    try {
      await Share.share({
        message: `Hello ${buyer.name}, your invite code for unit ${buyer.unit} on TowerPulse is: ${buyer.inviteCode}.`,
      });
    } catch {
      Alert.alert('Invite Code', `Code: ${buyer.inviteCode}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
          <Text style={styles.backBtnText}>Towers</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{towerName || 'Tower Details'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>TOWER ENROLLMENT</Text>
              <Text style={styles.heroName}>{towerName}</Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{joinRate}% Joined</Text>
            </View>
          </View>

          <View style={styles.ratioRow}>
            <Text style={styles.ratioMain}>
              {joinedCount} / {buyers.length}
            </Text>
            <Text style={styles.ratioSub}>Units Onboarded</Text>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${joinRate}%` }]} />
          </View>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All ({buyers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'joined' && styles.filterPillActive]}
            onPress={() => setFilter('joined')}
          >
            <Text style={[styles.filterText, filter === 'joined' && styles.filterTextActive]}>
              Joined ({joinedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'pending' && styles.filterPillActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
              Pending Claim ({pendingCount})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {filteredBuyers.map((buyer) => {
            const isJoined = buyer.inviteStatus === 'joined';
            const isExpired = buyer.inviteExpiresAt && buyer.inviteExpiresAt < Date.now();

            return (
              <View key={buyer.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.unitLeft}>
                    <View
                      style={[
                        styles.unitBadge,
                        isJoined ? styles.unitJoined : styles.unitPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.unitBadgeText,
                          isJoined ? styles.unitJoinedText : styles.unitPendingText,
                        ]}
                      >
                        {buyer.unit}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.buyerName}>{buyer.name}</Text>
                      <Text style={styles.buyerConfig}>
                        {buyer.configuration} • {buyer.phone}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      isJoined
                        ? styles.statusJoined
                        : isExpired
                        ? styles.statusExpired
                        : styles.statusPending,
                    ]}
                  >
                    <Ionicons
                      name={
                        isJoined
                          ? 'checkmark-circle'
                          : isExpired
                          ? 'time'
                          : 'hourglass-outline'
                      }
                      size={11}
                      color={isJoined ? '#059669' : isExpired ? '#DC2626' : '#B45309'}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        isJoined
                          ? styles.statusTextJoined
                          : isExpired
                          ? styles.statusTextExpired
                          : styles.statusTextPending,
                      ]}
                    >
                      {isJoined ? 'Joined' : isExpired ? 'Expired' : 'Pending'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <View style={styles.codeWrap}>
                    <Text style={styles.codeLabel}>INVITE CODE:</Text>
                    <Text style={styles.codeValue}>{buyer.inviteCode}</Text>
                  </View>

                  {!isJoined ? (
                    <TouchableOpacity
                      style={styles.shareBtn}
                      onPress={() => handleShareCode(buyer)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="share-social-outline" size={13} color="#B45309" />
                      <Text style={styles.shareBtnText}>Share Code</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.joinedDateText}>
                      Joined {buyer.joinedAt ? formatRelativeTime(buyer.joinedAt) : 'recently'}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6EE7B7',
  },
  ratioRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 10,
  },
  ratioMain: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ratioSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  track: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#B45309',
    borderColor: '#B45309',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  unitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  unitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  unitJoined: {
    backgroundColor: '#ECFDF5',
  },
  unitPending: {
    backgroundColor: '#FEF3C7',
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  unitJoinedText: {
    color: '#065F46',
  },
  unitPendingText: {
    color: '#92400E',
  },
  buyerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  buyerConfig: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusJoined: {
    backgroundColor: '#ECFDF5',
  },
  statusPending: {
    backgroundColor: '#FFFBEB',
  },
  statusExpired: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextJoined: {
    color: '#059669',
  },
  statusTextPending: {
    color: '#B45309',
  },
  statusTextExpired: {
    color: '#DC2626',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  codeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  codeValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'monospace',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  joinedDateText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
});
