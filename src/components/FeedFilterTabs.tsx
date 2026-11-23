import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedFilter } from '../types';

interface FeedFilterTabsProps {
  activeFilter: FeedFilter;
  onSelectFilter: (filter: FeedFilter) => void;
  towerName: string;
  unitName: string;
}

export const FeedFilterTabs: React.FC<FeedFilterTabsProps> = ({
  activeFilter,
  onSelectFilter,
  towerName,
  unitName,
}) => {
  const tabs: Array<{ id: FeedFilter; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { id: 'all', label: 'All Notices', icon: 'grid-outline' },
    { id: 'tower', label: towerName || 'My Tower', icon: 'business-outline' },
    { id: 'unit', label: `Unit ${unitName || ''}`.trim(), icon: 'key-outline' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onSelectFilter(tab.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon}
              size={14}
              color={isActive ? '#1E40AF' : '#64748B'}
            />
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
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
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabLabel: {
    color: '#1E40AF',
    fontWeight: '700',
  },
});
