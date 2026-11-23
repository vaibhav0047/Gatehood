import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { RoleHeader } from '../../src/components/RoleHeader';

export default function BuyerLayout() {
  return (
    <View style={styles.container}>
      <RoleHeader />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#1E40AF',
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
          name="unit"
          options={{
            title: 'My Unit',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={String(color)} />
            ),
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            title: 'Updates Feed',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={size} color={String(color)} />
            ),
          }}
        />
        <Tabs.Screen
          name="join"
          options={{
            title: 'Claim Code',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="key-outline" size={size} color={String(color)} />
            ),
          }}
        />
        <Tabs.Screen
          name="notice-modal"
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
