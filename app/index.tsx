import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';

export default function IndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAppReady, role, setRole, currentBuyer } = useApp();

  useEffect(() => {
    if (isAppReady) {
      if (role === 'builder') {
        router.replace('/(builder)');
      } else if (currentBuyer) {
        router.replace('/(buyer)/unit');
      }
    }
  }, [isAppReady]);

  if (!isAppReady) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.brandSection}>
        <View style={styles.logoBadge}>
          <Ionicons name="business" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>TowerPulse</Text>
        <Text style={styles.subtitle}>
          Residential Project Updates & Verified Buyer Feed
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.sectionHeader}>SELECT PORTAL</Text>

        <TouchableOpacity
          style={styles.roleCard}
          onPress={async () => {
            await setRole('buyer');
            if (currentBuyer) {
              router.push('/(buyer)/unit');
            } else {
              router.push('/(buyer)/join');
            }
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="key" size={24} color="#1E40AF" />
          </View>
          <View style={styles.roleTextContainer}>
            <Text style={styles.roleTitle}>Buyer Portal</Text>
            <Text style={styles.roleDesc}>
              {currentBuyer
                ? `Active unit: ${currentBuyer.unit} (${currentBuyer.name})`
                : 'Enter invite code to connect unit and view updates'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleCard}
          onPress={async () => {
            await setRole('builder');
            router.push('/(builder)');
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrapper, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="construct" size={24} color="#B45309" />
          </View>
          <View style={styles.roleTextContainer}>
            <Text style={styles.roleTitle}>Builder Console</Text>
            <Text style={styles.roleDesc}>
              Manage buyers, broadcast notices, and monitor read receipts
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <View style={styles.footerNote}>
        <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
        <Text style={styles.footerText}>
          Real-time updates • Verified delivery
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  brandSection: {
    alignItems: 'center',
    marginTop: 30,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 20,
  },
  cardContainer: {
    width: '100%',
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  footerText: {
    fontSize: 11,
    color: '#64748B',
  },
});
