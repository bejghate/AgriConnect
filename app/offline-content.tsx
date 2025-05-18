import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { formatBytes, getStorageSize, STORAGE_KEYS, getData } from '@/utils/storage';

// Content type definitions
const CONTENT_TYPES = {
  ENCYCLOPEDIA: 'encyclopedia',
  ARTICLES: 'articles',
  GUIDES: 'guides',
};

// Interface for offline content item
interface OfflineContentItem {
  id: string;
  title: string;
  type: string;
  size: number;
  timestamp: number;
  icon: string;
}

export default function OfflineContentScreen() {
  const router = useRouter();
  const { isOnline, syncData, isSyncing, lastSyncTime } = useOffline();
  
  const [offlineContent, setOfflineContent] = useState<OfflineContentItem[]>([]);
  const [storageUsed, setStorageUsed] = useState<string>('0 KB');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load offline content
  useEffect(() => {
    const loadOfflineContent = async () => {
      setIsLoading(true);
      
      try {
        // Get storage size
        const size = await getStorageSize();
        setStorageUsed(formatBytes(size));
        
        // Load offline content
        const encyclopediaContent = await getData<any>(`${STORAGE_KEYS.OFFLINE_ARTICLES}_${CONTENT_TYPES.ENCYCLOPEDIA}`);
        const articlesContent = await getData<any>(`${STORAGE_KEYS.OFFLINE_ARTICLES}_${CONTENT_TYPES.ARTICLES}`);
        const guidesContent = await getData<any>(`${STORAGE_KEYS.OFFLINE_ARTICLES}_${CONTENT_TYPES.GUIDES}`);
        
        const content: OfflineContentItem[] = [];
        
        // Process encyclopedia content
        if (encyclopediaContent) {
          Object.entries(encyclopediaContent).forEach(([id, data]: [string, any]) => {
            content.push({
              id,
              title: data.data.title || `Encyclopedia Item ${id}`,
              type: CONTENT_TYPES.ENCYCLOPEDIA,
              size: new Blob([JSON.stringify(data.data)]).size,
              timestamp: data.timestamp,
              icon: 'book.fill',
            });
          });
        }
        
        // Process articles content
        if (articlesContent) {
          Object.entries(articlesContent).forEach(([id, data]: [string, any]) => {
            content.push({
              id,
              title: data.data.title || `Article ${id}`,
              type: CONTENT_TYPES.ARTICLES,
              size: new Blob([JSON.stringify(data.data)]).size,
              timestamp: data.timestamp,
              icon: 'doc.text.fill',
            });
          });
        }
        
        // Process guides content
        if (guidesContent) {
          Object.entries(guidesContent).forEach(([id, data]: [string, any]) => {
            content.push({
              id,
              title: data.data.title || `Guide ${id}`,
              type: CONTENT_TYPES.GUIDES,
              size: new Blob([JSON.stringify(data.data)]).size,
              timestamp: data.timestamp,
              icon: 'list.bullet.rectangle',
            });
          });
        }
        
        // Sort by timestamp (newest first)
        content.sort((a, b) => b.timestamp - a.timestamp);
        
        setOfflineContent(content);
      } catch (error) {
        console.error('Error loading offline content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOfflineContent();
  }, []);
  
  // Format timestamp to readable date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Render content item
  const renderContentItem = ({ item }: { item: OfflineContentItem }) => (
    <TouchableOpacity 
      style={styles.contentItem}
      onPress={() => {
        // Navigate to the appropriate screen based on content type
        if (item.type === CONTENT_TYPES.ENCYCLOPEDIA) {
          // Navigate to encyclopedia detail
          console.log(`Navigate to encyclopedia detail for ${item.id}`);
        } else if (item.type === CONTENT_TYPES.ARTICLES) {
          // Navigate to article detail
          console.log(`Navigate to article detail for ${item.id}`);
        } else if (item.type === CONTENT_TYPES.GUIDES) {
          // Navigate to guide detail
          console.log(`Navigate to guide detail for ${item.id}`);
        }
      }}
    >
      <ThemedView style={[styles.contentIcon, getIconBackgroundColor(item.type)]}>
        <IconSymbol size={24} name={item.icon} color="white" />
      </ThemedView>
      <ThemedView style={styles.contentInfo}>
        <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
        <ThemedText style={styles.contentType}>{getContentTypeLabel(item.type)}</ThemedText>
        <ThemedView style={styles.contentMeta}>
          <ThemedText style={styles.contentSize}>{formatBytes(item.size)}</ThemedText>
          <ThemedText style={styles.contentDate}>Downloaded: {formatDate(item.timestamp)}</ThemedText>
        </ThemedView>
      </ThemedView>
      <IconSymbol name="chevron.right" size={20} color="#0a7ea4" />
    </TouchableOpacity>
  );
  
  // Get content type label
  const getContentTypeLabel = (type: string): string => {
    switch (type) {
      case CONTENT_TYPES.ENCYCLOPEDIA:
        return 'Encyclopedia';
      case CONTENT_TYPES.ARTICLES:
        return 'Article';
      case CONTENT_TYPES.GUIDES:
        return 'Guide';
      default:
        return 'Content';
    }
  };
  
  // Get icon background color based on content type
  const getIconBackgroundColor = (type: string): { backgroundColor: string } => {
    switch (type) {
      case CONTENT_TYPES.ENCYCLOPEDIA:
        return { backgroundColor: '#4CAF50' };
      case CONTENT_TYPES.ARTICLES:
        return { backgroundColor: '#2196F3' };
      case CONTENT_TYPES.GUIDES:
        return { backgroundColor: '#FF9800' };
      default:
        return { backgroundColor: '#9C27B0' };
    }
  };
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E1F5FE', dark: '#01579B' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#0a7ea4"
          name="arrow.down.circle.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Offline Content</ThemedText>
      </ThemedView>
      
      <ThemedText style={styles.introText}>
        Access your downloaded content even when you're offline. Sync when connected to update with the latest information.
      </ThemedText>
      
      <ThemedView style={styles.statusContainer}>
        <ThemedView style={styles.statusItem}>
          <IconSymbol 
            name={isOnline ? 'wifi' : 'wifi.slash'} 
            size={20} 
            color={isOnline ? '#4CAF50' : '#F44336'} 
          />
          <ThemedText style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.statusItem}>
          <IconSymbol name="internaldrive.fill" size={20} color="#0a7ea4" />
          <ThemedText style={styles.statusText}>
            {storageUsed} used
          </ThemedText>
        </ThemedView>
      </ThemedView>
      
      <TouchableOpacity 
        style={[styles.syncButton, !isOnline && styles.disabledButton]}
        onPress={syncData}
        disabled={!isOnline || isSyncing}
      >
        {isSyncing ? (
          <ActivityIndicator color="white" style={styles.syncButtonIcon} />
        ) : (
          <IconSymbol name="arrow.clockwise" size={20} color="white" style={styles.syncButtonIcon} />
        )}
        <ThemedText style={styles.syncButtonText}>
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </ThemedText>
      </TouchableOpacity>
      
      {lastSyncTime > 0 && (
        <ThemedText style={styles.lastSyncText}>
          Last synced: {formatDate(lastSyncTime)}
        </ThemedText>
      )}
      
      <ThemedText type="subtitle" style={styles.sectionTitle}>Your Downloaded Content</ThemedText>
      
      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Loading your content...</ThemedText>
        </ThemedView>
      ) : offlineContent.length > 0 ? (
        <FlatList
          data={offlineContent}
          renderItem={renderContentItem}
          keyExtractor={item => `${item.type}-${item.id}`}
          scrollEnabled={false}
          contentContainerStyle={styles.contentList}
        />
      ) : (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="tray.fill" size={48} color="#0a7ea4" style={styles.emptyIcon} />
          <ThemedText style={styles.emptyTitle}>No Offline Content</ThemedText>
          <ThemedText style={styles.emptyText}>
            Download articles, guides, and encyclopedia entries to access them offline.
          </ThemedText>
        </ThemedView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -50,
    right: 20,
    position: 'absolute',
    opacity: 0.8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  introText: {
    marginBottom: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
  },
  syncButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  syncButtonIcon: {
    marginRight: 8,
  },
  syncButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  lastSyncText: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
    color: '#757575',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  contentList: {
    gap: 12,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 8,
  },
  contentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contentInfo: {
    flex: 1,
  },
  contentType: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  contentMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  contentSize: {
    fontSize: 12,
    color: '#757575',
    marginRight: 16,
  },
  contentDate: {
    fontSize: 12,
    color: '#757575',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  },
});
