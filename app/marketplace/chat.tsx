import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  marketplaceListings,
  Conversation,
  Message,
  SellerProfile,
  MarketplaceListing
} from '@/data/marketplace';

// Message bubble component
const MessageBubble = ({ message, isUser }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <ThemedView style={[
      styles.messageBubbleContainer,
      isUser ? styles.userMessageContainer : styles.otherMessageContainer
    ]}>
      <ThemedView style={[
        styles.messageBubble,
        isUser ? styles.userMessage : styles.otherMessage
      ]}>
        <ThemedText style={[
          styles.messageText,
          isUser ? styles.userMessageText : styles.otherMessageText
        ]}>
          {message.content}
        </ThemedText>
      </ThemedView>
      <ThemedText style={styles.messageTime}>
        {formatTime(message.timestamp)}
      </ThemedText>
    </ThemedView>
  );
};

// Date separator component
const DateSeparator = ({ date }) => {
  const formatDate = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };
  
  return (
    <ThemedView style={styles.dateSeparator}>
      <ThemedText style={styles.dateSeparatorText}>
        {formatDate(date)}
      </ThemedText>
    </ThemedView>
  );
};

// Listing preview component
const ListingPreview = ({ listing, onPress }) => {
  if (!listing) return null;
  
  const primaryImage = listing.images.find(img => img.isPrimary) || listing.images[0];
  
  return (
    <TouchableOpacity style={styles.listingPreview} onPress={onPress}>
      <Image
        source={{ uri: primaryImage?.url }}
        style={styles.listingImage}
        contentFit="cover"
        placeholder={require('@/assets/images/react-logo.png')}
        transition={200}
      />
      <ThemedView style={styles.listingInfo}>
        <ThemedText numberOfLines={2} style={styles.listingTitle}>
          {listing.title}
        </ThemedText>
        <ThemedText style={styles.listingPrice}>
          {listing.price.amount.toLocaleString()} {listing.price.currency}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
};

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isOnline } = useOffline();
  const { userId } = useUser();
  
  const [isLoading, setIsLoading] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  const flatListRef = useRef<FlatList>(null);
  
  useEffect(() => {
    // In a real app, this would fetch data from an API
    const loadData = async () => {
      setTimeout(() => {
        const foundConversation = sampleConversations.find(conv => conv.id === id);
        setConversation(foundConversation || null);
        
        if (foundConversation) {
          // Get messages for this conversation
          const conversationMessages = sampleMessages.filter(
            msg => msg.conversationId === foundConversation.id
          );
          
          // Sort messages by timestamp (oldest first)
          const sortedMessages = [...conversationMessages].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          setMessages(sortedMessages);
          
          // Find the seller (participant who is not the current user)
          const sellerId = foundConversation.participants.find(pid => pid !== 'user-1');
          const foundSeller = sellerProfiles.find(s => s.id === sellerId);
          setSeller(foundSeller || null);
          
          // Find the listing if there's a listingId
          if (foundConversation.listingId) {
            const foundListing = marketplaceListings.find(l => l.id === foundConversation.listingId);
            setListing(foundListing || null);
          }
        }
        
        setIsLoading(false);
      }, 1000);
    };
    
    loadData();
  }, [id]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !conversation) return;
    
    // Create a new message
    const newMsg: Message = {
      id: `msg-new-${Date.now()}`,
      conversationId: conversation.id,
      senderId: 'user-1',
      receiverId: seller?.id || '',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    // Add message to the list
    setMessages(prev => [...prev, newMsg]);
    
    // Clear input
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  const navigateBack = () => {
    router.back();
  };
  
  const navigateToListing = () => {
    if (listing) {
      router.push(`/marketplace/listing?id=${listing.id}`);
    }
  };
  
  const navigateToSeller = () => {
    if (seller) {
      router.push(`/marketplace/seller?id=${seller.id}`);
    }
  };
  
  // Group messages by date for date separators
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
  
  // Flatten grouped messages with date separators
  const flattenedMessages = Object.entries(groupedMessages).flatMap(([date, msgs]) => [
    { type: 'date', date, id: `date-${date}` },
    ...msgs.map(msg => ({ type: 'message', ...msg }))
  ]);
  
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading conversation...</ThemedText>
      </ThemedView>
    );
  }
  
  if (!conversation || !seller) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#F44336" />
        <ThemedText type="subtitle" style={styles.errorTitle}>Conversation Not Found</ThemedText>
        <ThemedText style={styles.errorText}>
          The conversation you're looking for doesn't exist or has been removed.
        </ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.sellerInfo} onPress={navigateToSeller}>
          {seller.profileImage ? (
            <Image 
              source={{ uri: seller.profileImage }} 
              style={styles.sellerAvatar}
              contentFit="cover"
              placeholder={require('@/assets/images/react-logo.png')}
              transition={200}
            />
          ) : (
            <ThemedView style={styles.sellerAvatarPlaceholder}>
              <IconSymbol name="person.fill" size={20} color="#757575" />
            </ThemedView>
          )}
          
          <ThemedView>
            <ThemedView style={styles.sellerNameContainer}>
              <ThemedText type="defaultSemiBold" style={styles.sellerName}>
                {seller.name}
              </ThemedText>
              {seller.verified && (
                <IconSymbol name="checkmark.seal.fill" size={14} color="#4CAF50" />
              )}
            </ThemedView>
            <ThemedText style={styles.sellerStatus}>
              {isOnline ? 'Online' : 'Offline'}
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerButton}>
          <IconSymbol name="ellipsis" size={20} color="#0a7ea4" />
        </TouchableOpacity>
      </ThemedView>
      
      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Messages will be sent when you're back online.
          </ThemedText>
        </ThemedView>
      )}
      
      {listing && (
        <ListingPreview listing={listing} onPress={navigateToListing} />
      )}
      
      <FlatList
        ref={flatListRef}
        data={flattenedMessages}
        renderItem={({ item }) => 
          item.type === 'date' ? (
            <DateSeparator date={item.date} />
          ) : (
            <MessageBubble 
              message={item} 
              isUser={item.senderId === 'user-1'} 
            />
          )
        }
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContainer}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      
      <ThemedView style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <IconSymbol name="paperclip" size={20} color="#757575" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton,
            !newMessage.trim() && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <IconSymbol name="paperplane.fill" size={20} color="white" />
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  sellerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  sellerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    marginRight: 4,
  },
  sellerStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  headerButton: {
    padding: 8,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  listingPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 16,
    marginTop: 8,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listingImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a7ea4',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#757575',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubbleContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
  },
  userMessage: {
    backgroundColor: '#0a7ea4',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#f5f5f5',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: 'black',
  },
  messageTime: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#757575',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  attachButton: {
    padding: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#b0bec5',
  },
});
