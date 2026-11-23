import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  isError?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'documents-outline',
  title,
  description,
  actionLabel,
  onAction,
  isError = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, isError && styles.errorCircle]}>
        <Ionicons
          name={icon}
          size={32}
          color={isError ? '#DC2626' : '#64748B'}
        />
      </View>
      <Text style={[styles.title, isError && styles.errorTitle]}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, isError && styles.errorButton]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          {isError && <Ionicons name="refresh" size={14} color="#FFFFFF" />}
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorCircle: {
    backgroundColor: '#FEE2E2',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#991B1B',
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E40AF',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  errorButton: {
    backgroundColor: '#DC2626',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
