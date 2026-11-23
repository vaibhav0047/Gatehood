import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatFullDateTime } from '../../src/utils/dateUtils';

export default function NoticeModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    noticeId: string;
    title: string;
    content: string;
    category: string;
    authorRole: string;
    createdAt: string;
    isPinned: string;
    imageUrl?: string;
  }>();

  const timestamp = parseInt(params.createdAt || '0', 10);
  const isPinned = params.isPinned === 'true';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
          <Text style={styles.backText}>Feed</Text>
        </TouchableOpacity>

        <View style={styles.receiptTag}>
          <Ionicons name="checkmark-done" size={14} color="#059669" />
          <Text style={styles.receiptText}>Marked as Read</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badgesRow}>
          {isPinned && (
            <View style={styles.pinnedBadge}>
              <Ionicons name="pin" size={12} color="#B45309" />
              <Text style={styles.pinnedText}>PINNED NOTICE</Text>
            </View>
          )}

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {(params.category || 'NOTICE').toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{params.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaIcon}>
            <Ionicons name="business" size={16} color="#1E40AF" />
          </View>
          <View>
            <Text style={styles.author}>{params.authorRole || 'Site Engineering Team'}</Text>
            <Text style={styles.date}>
              {timestamp ? formatFullDateTime(timestamp) : 'Recently posted'}
            </Text>
          </View>
        </View>

        {params.imageUrl ? (
          <Image
            source={{ uri: params.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}

        <View style={styles.bodyBox}>
          <Text style={styles.body}>{params.content}</Text>
        </View>

        <View style={styles.readReceiptNotice}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#047857" />
          <Text style={styles.readReceiptNoticeText}>
            Read receipt registered with the builder project office.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  receiptTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  receiptText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pinnedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  metaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  author: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  date: {
    fontSize: 11,
    color: '#64748B',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  bodyBox: {
    marginBottom: 20,
  },
  body: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  },
  readReceiptNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 12,
  },
  readReceiptNoticeText: {
    fontSize: 12,
    color: '#166534',
    flex: 1,
    lineHeight: 16,
  },
});
