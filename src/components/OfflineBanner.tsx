import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OfflineBannerProps {
  onRetry?: () => void;
  cachedCount?: number;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onRetry, cachedCount }) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Ionicons name="cloud-offline" size={16} color="#DC2626" />
        <View style={styles.textBlock}>
          <Text style={styles.title}>Offline Mode Active</Text>
          <Text style={styles.subtitle}>
            Showing cached notices {cachedCount !== undefined ? `(${cachedCount} cached)` : ''}
          </Text>
        </View>
      </View>

      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
          <Ionicons name="reload" size={12} color="#DC2626" />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
  },
  subtitle: {
    fontSize: 11,
    color: '#B91C1C',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F87171',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  retryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
});
