import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useRouter } from 'expo-router';

export const RoleHeader: React.FC = () => {
  const { role, setRole, isOffline, setIsOffline, currentBuyer } = useApp();
  const router = useRouter();

  const handleToggleRole = () => {
    if (role === 'buyer') {
      setRole('builder');
      router.replace('/(builder)');
    } else {
      setRole('buyer');
      if (currentBuyer) {
        router.replace('/(buyer)/unit');
      } else {
        router.replace('/(buyer)/join');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={[styles.roleBadge, role === 'builder' ? styles.builderBadge : styles.buyerBadge]}>
          <Ionicons
            name={role === 'builder' ? 'business-outline' : 'person-outline'}
            size={14}
            color={role === 'builder' ? '#B45309' : '#1D4ED8'}
          />
          <Text style={[styles.roleText, role === 'builder' ? styles.builderText : styles.buyerText]}>
            {role === 'builder' ? 'BUILDER CONSOLE' : `BUYER: ${currentBuyer?.unit || 'PORTAL'}`}
          </Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.simButton, isOffline && styles.simButtonActive]}
          onPress={() => setIsOffline(!isOffline)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isOffline ? 'cloud-offline' : 'cloud-done-outline'}
            size={14}
            color={isOffline ? '#DC2626' : '#6B7280'}
          />
          <Text style={[styles.simText, isOffline && styles.simTextActive]}>
            {isOffline ? 'Offline Mode' : 'Online'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchButton} onPress={handleToggleRole} activeOpacity={0.8}>
          <Ionicons name="swap-horizontal" size={14} color="#FFFFFF" />
          <Text style={styles.switchText}>
            {role === 'buyer' ? 'Builder View' : 'Buyer View'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  builderBadge: {
    backgroundColor: '#FEF3C7',
  },
  buyerBadge: {
    backgroundColor: '#DBEAFE',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  builderText: {
    color: '#92400E',
  },
  buyerText: {
    color: '#1E40AF',
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  simButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  simText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  simTextActive: {
    color: '#DC2626',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  switchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
