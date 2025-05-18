import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { useUser } from '@/context/UserContext';
import { 
  sampleConversations, 
  sampleMessages, 
  sellerProfiles,
  Conversation,
  Message
} from '@/data/marketplace';

// Conversation item component
const ConversationItem = ({ conversation, lastMessage, seller, onPress, unreadCount }) => {
  // Format timestamp to relative time (e.g., "2h ago", "Yesterday", etc.)
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = Math.floor((now - messageDate) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours === 0 ? 'Just now' : `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };
  
  return (
    <TouchableOpacity style={styles.conversationItem} onPress={onPress}>
      <ThemedView style={styles.avatarContainer}>
        {seller?.profileImage ? (
          <Image 
            source={{ uri: seller.profileImage }} 
            style={styles.avatar}
            contentFit="cover"
            placeholder={require('@/assets/images/react-logo.png')}
            transition={200}
          />
        ) : (
          <ThemedView style={styles.avatarPlaceholder}>
            <IconSymbol name="person.fill" size={24} color="#757575" />
          </ThemedView>
        )}
        {seller?.verified && (
          <ThemedView style={styles.verifiedBadge}>
            <IconSymbol name="checkmark.seal.fill" size={12} color="#4CAF50" />
          </ThemedView>
        )}
      </ThemedView>
      
      <ThemedView style={styles.conversationContent}>
        <ThemedView style={styles.conversationHeader}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.sellerName}>
            {seller?.name || 'Unknown Seller'}
          </ThemedText>
          <ThemedText style={styles.timeText}>
            {lastMessage ? formatRelativeTime(lastMessage.timestamp) : ''}
          </ThemedText>
        </ThemedView>
        
        <ThemedText numberOfLines={1} style={styles.messagePreview}>
          {lastMessage?.content || 'Start a conversation...'}
        </ThemedText>
      </ThemedView>
      
      {unreadCount > 0 && (
        <ThemedView style={styles.unreadBadge}>
          <ThemedText style={styles.unreadCount}>{unreadCount}</ThemedText>
        </ThemedView>
      )}
    </TouchableOpacity>
  );
};

export default function MessagesScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  const { userId } = useUser();
  
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // In a real app, this would fetch conversations from an API
    const loadConversations = async () => {
      setTimeout(() => {
        // Filter conversations where the current user is a participant
        const userConversations = sampleConversations.filter(
          conv => conv.participants.includes('user-1') && !conv.isArchived
        );
        setConversations(userConversations);
        setIsLoading(false);
      }, 1000);
    };
    
    loadConversations();
  }, []);
  
  const getLastMessage = (conversationId) => {
    const conversationMessages = sampleMessages.filter(
      msg => msg.conversationId === conversationId
    );
    
    if (conversationMessages.length === 0) return null;
    
    // Sort messages by timestamp (newest first)
    const sortedMessages = [...conversationMessages].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return sortedMessages[0];
  };
  
  const getUnreadCount = (conversationId) => {
    return sampleMessages.filter(
      msg => msg.conversationId === conversationId && 
             msg.receiverId === 'user-1' && 
             !msg.isRead
    ).length;
  };
  
  const getSeller = (conversation) => {
    // Find the seller ID (participant who is not the current user)
    const sellerId = conversation.participants.find(id => id !== 'user-1');
    return sellerProfiles.find(seller => seller.id === sellerId);
  };
  
  const navigateToChat = (conversationId) => {
    router.push(`/marketplace/chat?id=${conversationId}`);
  };
  
  const navigateBack = () => {
    router.back();
  };
  
  const filteredConversations = conversations.filter(conv => {
    const seller = getSeller(conv);
    return seller?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
        
        <ThemedText type="subtitle" style={styles.headerTitle}>Messages</ThemedText>
        
        <ThemedView style={{ width: 40 }} />
      </ThemedView>
      
      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Messages will be sent when you're back online.
          </ThemedText>
        </ThemedView>
      )}
      
      <ThemedView style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#757575" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </ThemedView>
      
      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Loading conversations...</ThemedText>
        </ThemedView>
      ) : filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              lastMessage={getLastMessage(item.id)}
              seller={getSeller(item)}
              unreadCount={getUnreadCount(item.id)}
              onPress={() => navigateToChat(item.id)}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="bubble.left.and.bubble.right" size={48} color="#0a7ea4" />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No Conversations Yet
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            Start messaging sellers about products or services you're interested in.
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    marginLeft: 4,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  headerTitle: {
    textAlign: 'center',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sellerName: {
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#757575',
  },
  messagePreview: {
    fontSize: 14,
    color: '#757575',
  },
  unreadBadge: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  },
});
