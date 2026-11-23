import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { RoleHeader } from '../../src/components/RoleHeader';

export default function BuilderLayout() {
  return (
    <View style={styles.container}>
      <RoleHeader />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#B45309',
          tabBarInactiveTintColor: '#64748B',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E2E8F0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Towers & Notices',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={String(color)} />
            ),
          }}
        />
        <Tabs.Screen
          name="create-notice"
          options={{
            title: 'Post Notice',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle" size={size} color={String(color)} />
            ),
          }}
        />
        <Tabs.Screen
          name="import-buyers"
          options={{
            title: 'Import CSV',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cloud-upload" size={size} color={String(color)} />
            ),
          }}
        />
        <Tabs.Screen
          name="notice-detail"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="tower-details"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
