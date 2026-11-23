import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { noticeService } from '../../src/services/noticeService';
import { FeedFilter, Notice } from '../../src/types';
import { NoticeCard } from '../../src/components/NoticeCard';
import { FeedFilterTabs } from '../../src/components/FeedFilterTabs';
import { OfflineBanner } from '../../src/components/OfflineBanner';
import { EmptyState } from '../../src/components/EmptyState';
import { Ionicons } from '@expo/vector-icons';

export default function FeedScreen() {
  const router = useRouter();
  const { currentBuyer, readNoticeIds, markNoticeRead, isOffline } = useApp();

  const [filter, setFilter] = useState<FeedFilter>('all');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [cachedCount, setCachedCount] = useState<number>(0);

  const cursorRef = useRef<any>(null);

  const loadInitialFeed = useCallback(async () => {
    if (!currentBuyer) return;
    setLoading(true);
    setError(null);
    cursorRef.current = null;

    try {
      const result = await noticeService.getFeedNotices(
        currentBuyer,
        filter,
        null,
        15
      );

      setNotices(result.notices);
      cursorRef.current = result.lastDoc;
      setHasMore(result.hasMore);
      setIsFromCache(Boolean(result.fromCache || isOffline));
      if (result.fromCache || isOffline) {
        setCachedCount(result.notices.length);
      }
    } catch {
      setError('Unable to reach server. Check connection or tap retry.');
    } finally {
      setLoading(false);
    }
  }, [currentBuyer, filter, isOffline]);

  useEffect(() => {
    loadInitialFeed();
  }, [loadInitialFeed]);

  useEffect(() => {
    if (!currentBuyer || isOffline) return;

    const unsubscribe = noticeService.subscribeToFeed(currentBuyer, filter, (liveNotices) => {
      setNotices((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newItems = liveNotices.filter((n) => !existingIds.has(n.id));
        if (newItems.length > 0) {
          const merged = [...newItems, ...prev];
          merged.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return b.createdAt - a.createdAt;
          });
          return merged;
        }
        return prev;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [currentBuyer, filter, isOffline]);

  const handleLoadMore = async () => {
    if (!currentBuyer || loadingMore || !hasMore || loading) return;

    setLoadingMore(true);
    try {
      const result = await noticeService.getFeedNotices(
        currentBuyer,
        filter,
        cursorRef.current,
        15
      );

      setNotices((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const fresh = result.notices.filter((n) => !existingIds.has(n.id));
        return [...prev, ...fresh];
      });

      cursorRef.current = result.lastDoc;
      setHasMore(result.hasMore);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialFeed();
    setRefreshing(false);
  };

  const handleNoticePress = async (notice: Notice) => {
    await markNoticeRead(notice.id);
    router.push({
      pathname: '/(buyer)/notice-modal',
      params: {
        noticeId: notice.id,
        title: notice.title,
        content: notice.content,
        category: notice.category,
        authorRole: notice.authorRole,
        createdAt: notice.createdAt.toString(),
        isPinned: notice.isPinned ? 'true' : 'false',
        imageUrl: notice.imageUrl || '',
      },
    });
  };

  if (!currentBuyer) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          icon="key-outline"
          title="Unit Not Linked"
          description="Enter your invite code to view verified notices for your tower and unit."
          actionLabel="Enter Invite Code"
          onAction={() => router.push('/(buyer)/join')}
        />
      </View>
    );
  }

  const unreadCount = notices.filter((n) => !readNoticeIds.has(n.id)).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.feedTitle}>Project Updates Feed</Text>
          <Text style={styles.feedSubtitle}>
            {currentBuyer.tower} • Unit {currentBuyer.unit}
          </Text>
        </View>

        {unreadCount > 0 && (
          <View style={styles.unreadCounterBadge}>
            <View style={styles.unreadPulseDot} />
            <Text style={styles.unreadCounterText}>{unreadCount} Unread</Text>
          </View>
        )}
      </View>

      {(isOffline || isFromCache) && (
        <OfflineBanner
          onRetry={loadInitialFeed}
          cachedCount={notices.length}
        />
      )}

      <FeedFilterTabs
        activeFilter={filter}
        onSelectFilter={(newFilter) => setFilter(newFilter)}
        towerName={currentBuyer.tower}
        unitName={currentBuyer.unit}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingFeedText}>Loading notices...</Text>
        </View>
      ) : error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Could Not Load Feed"
          description={error}
          actionLabel="Retry Connection"
          onAction={loadInitialFeed}
          isError={true}
        />
      ) : notices.length === 0 ? (
        <EmptyState
          icon="file-tray-outline"
          title="No Notices Found"
          description={`There are currently no updates targeted to ${
            filter === 'all'
              ? 'your unit or tower'
              : filter === 'tower'
              ? currentBuyer.tower
              : `Unit ${currentBuyer.unit}`
          }.`}
          actionLabel="Refresh"
          onAction={loadInitialFeed}
        />
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoticeCard
              notice={item}
              isRead={readNoticeIds.has(item.id)}
              onPress={() => handleNoticePress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#1E40AF" />
                <Text style={styles.loadingMoreText}>Loading more notices...</Text>
              </View>
            ) : !hasMore && notices.length > 0 ? (
              <View style={styles.footerEnd}>
                <Ionicons name="checkmark-circle-outline" size={14} color="#94A3B8" />
                <Text style={styles.footerEndText}>
                  All {notices.length} notices caught up
                </Text>
              </View>
            ) : undefined
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  feedSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  unreadCounterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  unreadCounterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingFeedText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 24,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadingMoreText: {
    fontSize: 12,
    color: '#64748B',
  },
  footerEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 18,
  },
  footerEndText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
