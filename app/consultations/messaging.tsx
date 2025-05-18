import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, FlatList, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { experts, Expert, ConsultationSession } from '@/data/experts';

// Message types
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  attachments?: {
    id: string;
    type: 'image' | 'document' | 'audio';
    url: string;
    name: string;
  }[];
  isRead: boolean;
}

// Sample messages data
const sampleMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'expert-1',
    receiverId: 'user-1',
    text: 'Hello! I received your consultation request about the unusual mortality in your chicken flock. Can you provide more details about when this started?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: true,
  },
  {
    id: 'msg-2',
    senderId: 'user-1',
    receiverId: 'expert-1',
    text: 'Thank you for responding. It started about a week ago. First, I noticed one chicken was lethargic and not eating, then it died the next day. Since then, 4 more have died with similar symptoms.',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
    isRead: true,
  },
  {
    id: 'msg-3',
    senderId: 'expert-1',
    receiverId: 'user-1',
    text: 'I see. Have you noticed any other symptoms like respiratory issues, diarrhea, or discoloration of the comb?',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    isRead: true,
  },
  {
    id: 'msg-4',
    senderId: 'user-1',
    receiverId: 'expert-1',
    text: 'Yes, some of them have had greenish diarrhea, and their combs look paler than usual. I\'ve attached a photo of one of the sick chickens.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    attachments: [
      {
        id: 'att-1',
        type: 'image',
        url: 'https://example.com/images/sick_chicken.jpg',
        name: 'Sick chicken.jpg',
      },
    ],
    isRead: true,
  },
  {
    id: 'msg-5',
    senderId: 'expert-1',
    receiverId: 'user-1',
    text: 'Based on the symptoms and the image, this looks like it could be Newcastle disease or avian influenza. Both are serious viral diseases. Have you vaccinated your flock against these diseases?',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    isRead: true,
  },
  {
    id: 'msg-6',
    senderId: 'user-1',
    receiverId: 'expert-1',
    text: 'I vaccinated them against Newcastle when they were chicks, but that was about 8 months ago. I haven\'t done any vaccinations since then.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    isRead: true,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  expertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expertImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  expertStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  callButtons: {
    flexDirection: 'row',
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  expertMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageSenderImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: '#0a7ea4',
    borderBottomRightRadius: 4,
  },
  expertMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  messageAttachments: {
    marginTop: 8,
  },
  messageAttachment: {
    marginTop: 4,
  },
  messageAttachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  documentAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
  },
  documentName: {
    marginLeft: 8,
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: '#757575',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  attachmentsPreview: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  attachmentPreview: {
    marginRight: 8,
    position: 'relative',
  },
  attachmentPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  documentPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  attachmentButtons: {
    flexDirection: 'row',
  },
  attachmentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default function MessagingScreen() {
  const router = useRouter();
  const { sessionId, expertId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [newMessage, setNewMessage] = useState('');
  const [expert, setExpert] = useState<Expert | null>(null);
  const [isLowDataMode, setIsLowDataMode] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (expertId) {
      const foundExpert = experts.find(e => e.id === expertId);
      if (foundExpert) {
        setExpert(foundExpert);
      }
    }
  }, [expertId]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '' && !attachments.length) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'user-1', // Hardcoded for demo
      receiverId: expertId as string,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      attachments: attachments.length > 0 ? attachments.map(att => ({
        id: att.id,
        type: 'image',
        url: att.uri,
        name: att.name,
      })) : undefined,
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
    setAttachments([]);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const [attachments, setAttachments] = useState<{id: string, uri: string, type: string, name: string}[]>([]);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: isLowDataMode ? 0.5 : 0.8,
    });

    if (!result.canceled) {
      const newAttachment = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        type: 'image',
        name: `Image ${attachments.length + 1}`
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: isLowDataMode ? 0.5 : 0.8,
    });

    if (!result.canceled) {
      const newAttachment = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        type: 'image',
        name: `Photo ${attachments.length + 1}`
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled === false) {
        const newAttachment = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          type: 'document',
          name: result.assets[0].name
        };
        setAttachments([...attachments, newAttachment]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'There was an error selecting the document.');
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleAudioCall = () => {
    Alert.alert(
      'Start Audio Call',
      `Would you like to start an audio call with ${expert?.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start Call',
          onPress: () => {
            // In a real app, this would initiate an audio call
            Alert.alert('Audio Call', 'Initiating audio call...');
          },
        },
      ]
    );
  };

  const handleVideoCall = () => {
    Alert.alert(
      'Start Video Call',
      `Would you like to start a ${isLowDataMode ? 'low-data' : 'video'} call with ${expert?.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start Call',
          onPress: () => {
            // In a real app, this would initiate a video call
            Alert.alert('Video Call', `Initiating ${isLowDataMode ? 'low-data' : 'video'} call...`);
          },
        },
      ]
    );
  };

  const toggleLowDataMode = () => {
    setIsLowDataMode(!isLowDataMode);
    Alert.alert(
      'Low Data Mode',
      `Low data mode is now ${!isLowDataMode ? 'enabled' : 'disabled'}.`,
      [{ text: 'OK' }]
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = item.senderId === 'user-1';

    return (
      <ThemedView
        style={[
          styles.messageContainer,
          isUserMessage ? styles.userMessageContainer : styles.expertMessageContainer
        ]}
      >
        {!isUserMessage && (
          <Image source={expert?.profileImage} style={styles.messageSenderImage} />
        )}

        <ThemedView
          style={[
            styles.messageBubble,
            isUserMessage ? styles.userMessageBubble : styles.expertMessageBubble
          ]}
        >
          <ThemedText style={styles.messageText}>{item.text}</ThemedText>

          {item.attachments && item.attachments.length > 0 && (
            <ThemedView style={styles.messageAttachments}>
              {item.attachments.map(attachment => (
                <ThemedView key={attachment.id} style={styles.messageAttachment}>
                  {attachment.type === 'image' ? (
                    <Image
                      source={{ uri: attachment.url }}
                      style={styles.messageAttachmentImage}
                    />
                  ) : (
                    <ThemedView style={styles.documentAttachment}>
                      <IconSymbol name="doc.fill" size={24} color="#0a7ea4" />
                      <ThemedText style={styles.documentName}>{attachment.name}</ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
              ))}
            </ThemedView>
          )}

          <ThemedText style={styles.messageTime}>{formatTime(item.timestamp)}</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color="#0a7ea4" />
          </TouchableOpacity>

          {expert && (
            <ThemedView style={styles.expertInfo}>
              <Image source={expert.profileImage} style={styles.expertImage} />
              <ThemedView>
                <ThemedText type="defaultSemiBold">{expert.name}</ThemedText>
                <ThemedText style={styles.expertStatus}>
                  {expert.availability.status === 'available_now' ? 'Online' : 'Offline'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          )}

          <ThemedView style={styles.callButtons}>
            <TouchableOpacity style={styles.callButton} onPress={handleAudioCall}>
              <IconSymbol name="phone.fill" size={20} color="#0a7ea4" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.callButton} onPress={handleVideoCall}>
              <IconSymbol name={isLowDataMode ? "video.slash.fill" : "video.fill"} size={20} color="#0a7ea4" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.callButton} onPress={toggleLowDataMode}>
              <IconSymbol name={isLowDataMode ? "wifi.slash" : "wifi"} size={20} color={isLowDataMode ? "#F44336" : "#0a7ea4"} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        />

        {attachments.length > 0 && (
          <ThemedView style={styles.attachmentsPreview}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {attachments.map(attachment => (
                <ThemedView key={attachment.id} style={styles.attachmentPreview}>
                  {attachment.type === 'image' ? (
                    <Image source={{ uri: attachment.uri }} style={styles.attachmentPreviewImage} />
                  ) : (
                    <ThemedView style={styles.documentPreview}>
                      <IconSymbol name="doc.fill" size={24} color="#0a7ea4" />
                    </ThemedView>
                  )}
                  <TouchableOpacity
                    style={styles.removeAttachmentButton}
                    onPress={() => handleRemoveAttachment(attachment.id)}
                  >
                    <IconSymbol name="xmark.circle.fill" size={20} color="#F44336" />
                  </TouchableOpacity>
                </ThemedView>
              ))}
            </ScrollView>
          </ThemedView>
        )}

        <ThemedView style={styles.inputContainer}>
          <ThemedView style={styles.attachmentButtons}>
            <TouchableOpacity style={styles.attachmentButton} onPress={handlePickImage}>
              <IconSymbol name="photo" size={20} color="#0a7ea4" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentButton} onPress={handleTakePhoto}>
              <IconSymbol name="camera.fill" size={20} color="#0a7ea4" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentButton} onPress={handlePickDocument}>
              <IconSymbol name="doc.fill" size={20} color="#0a7ea4" />
            </TouchableOpacity>
          </ThemedView>

          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (newMessage.trim() === '' && !attachments.length) ? styles.sendButtonDisabled : {}
            ]}
            onPress={handleSendMessage}
            disabled={newMessage.trim() === '' && !attachments.length}
          >
            <IconSymbol name="arrow.up.circle.fill" size={32} color={(newMessage.trim() === '' && !attachments.length) ? "#ccc" : "#0a7ea4"} />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
