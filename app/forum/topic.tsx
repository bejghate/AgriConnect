import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button, Divider, Menu, IconButton } from 'react-native-paper';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { useUser } from '@/context/UserContext';
import {
  forumTopics,
  forumCategories,
  ForumTopic,
  ForumPost,
  ForumCategory,
  ForumReaction
} from '@/data/forum';

// Sample posts for the topic
const samplePosts: ForumPost[] = [
  {
    id: 'post-1',
    content: 'J\'ai mis en place une nouvelle technique de compostage qui a considérablement amélioré mes rendements. Le principe est simple : je mélange des déchets verts (tontes de gazon, feuilles) avec des déchets bruns (branches broyées, paille) en couches alternées. J\'ajoute également du fumier de mes animaux pour enrichir le mélange. Je retourne le tas tous les 15 jours pour accélérer la décomposition. Après 3-4 mois, j\'obtiens un compost riche que j\'utilise pour fertiliser mes cultures. Depuis que j\'ai adopté cette méthode, mes rendements ont augmenté de 20% en moyenne !',
    topicId: 'topic-1',
    author: {
      id: 'user-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      role: 'Agriculteur'
    },
    createdAt: '2023-08-10T09:30:00Z',
    isFirstPost: true,
    isEdited: false,
    likeCount: 15,
    status: 'published',
    isAnswer: false,
    reactions: [
      {
        id: 'reaction-1',
        postId: 'post-1',
        userId: 'user-2',
        user: {
          id: 'user-2',
          firstName: 'Marie',
          lastName: 'Laurent'
        },
        type: 'like',
        createdAt: '2023-08-10T10:15:00Z'
      },
      {
        id: 'reaction-2',
        postId: 'post-1',
        userId: 'user-3',
        user: {
          id: 'user-3',
          firstName: 'Pierre',
          lastName: 'Martin'
        },
        type: 'helpful',
        createdAt: '2023-08-10T11:20:00Z'
      }
    ]
  },
  {
    id: 'post-2',
    content: 'Merci pour ce partage ! J\'ai une question : quelle est la taille de ton tas de compost pour une exploitation de taille moyenne ?',
    topicId: 'topic-1',
    author: {
      id: 'user-2',
      firstName: 'Marie',
      lastName: 'Laurent',
      profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
      role: 'Maraîchère'
    },
    createdAt: '2023-08-11T14:45:00Z',
    isFirstPost: false,
    isEdited: false,
    likeCount: 3,
    status: 'published',
    isAnswer: false,
    reactions: []
  },
  {
    id: 'post-3',
    content: 'Pour mon exploitation de 5 hectares, j\'ai 3 tas de compost de 2m x 2m x 1m. Cela me permet de produire suffisamment de compost pour mes besoins. Je conseille de prévoir environ 1 tas de cette taille pour 1,5-2 hectares de culture.',
    topicId: 'topic-1',
    author: {
      id: 'user-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      role: 'Agriculteur'
    },
    createdAt: '2023-08-12T08:30:00Z',
    isFirstPost: false,
    isEdited: false,
    likeCount: 5,
    status: 'published',
    isAnswer: true,
    reactions: []
  },
  {
    id: 'post-4',
    content: 'J\'ai essayé cette méthode et je confirme qu\'elle fonctionne très bien. J\'ai aussi ajouté des coquilles d\'œufs broyées pour enrichir le compost en calcium, ce qui a été bénéfique pour mes tomates.',
    topicId: 'topic-1',
    author: {
      id: 'user-4',
      firstName: 'Sophie',
      lastName: 'Dubois',
      profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      role: 'Formatrice'
    },
    createdAt: '2023-08-13T16:20:00Z',
    isFirstPost: false,
    isEdited: false,
    likeCount: 7,
    status: 'published',
    isAnswer: false,
    reactions: []
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: '#4CAF50',
    fontWeight: '500',
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
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 18,
    color: '#F44336',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    padding: 8,
    paddingHorizontal: 16,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  topicHeader: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  topicTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  categoryName: {
    fontSize: 12,
    color: '#757575',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagItem: {
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#4CAF50',
  },
  topicStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  topicStatText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  resolvedText: {
    fontSize: 10,
    color: 'white',
    marginLeft: 2,
  },
  postContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  answerContainer: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  answerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 10,
    color: 'white',
    marginLeft: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  authorInfo: {
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 14,
    marginBottom: 2,
  },
  authorRole: {
    fontSize: 12,
    color: '#757575',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postDate: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reactionsContainer: {
    flexDirection: 'row',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  reactionText: {
    fontSize: 12,
    marginLeft: 4,
  },
  markAnswerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAnswerText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  reactionsListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 4,
    marginBottom: 4,
  },
  reactionItemText: {
    fontSize: 10,
    color: '#757575',
    marginLeft: 2,
  },
  postDivider: {
    marginVertical: 8,
  },
  replyContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 12,
    backgroundColor: '#fff',
  },
  replyInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  attachButton: {
    padding: 8,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#bdbdbd',
  },
  menu: {
    marginTop: 40,
  },
});

export default function TopicScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isOnline } = useOffline();
  const { user } = useUser();
  const scrollViewRef = useRef<ScrollView>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [postMenuVisible, setPostMenuVisible] = useState(false);

  // Load topic data
  useEffect(() => {
    const loadTopicData = async () => {
      try {
        // In a real app, this would fetch data from an API
        setTimeout(() => {
          // Find the topic
          const foundTopic = forumTopics.find(t => t.id === id);

          if (foundTopic) {
            setTopic(foundTopic);

            // Find the category
            const foundCategory = forumCategories.find(cat => cat.id === foundTopic.categoryId);
            if (foundCategory) {
              setCategory(foundCategory);
            }

            // Get posts for this topic
            setPosts(samplePosts);
          }

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading topic data:', error);
        setIsLoading(false);
      }
    };

    if (id) {
      loadTopicData();
    }
  }, [id]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // In a real app, this would refresh data from an API
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing topic data:', error);
      setRefreshing(false);
    }
  };

  // Navigate back
  const navigateBack = () => {
    router.back();
  };

  // Navigate to category
  const navigateToCategory = () => {
    if (category) {
      router.push(`/forum/category?id=${category.id}`);
    }
  };

  // Navigate to user profile
  const navigateToUserProfile = (userId: string) => {
    router.push(`/forum/user-profile?id=${userId}`);
  };

  // Handle reply submission
  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would send the reply to an API
      setTimeout(() => {
        // Create a new post
        const newPost: ForumPost = {
          id: `post-${Date.now()}`,
          content: replyContent,
          topicId: id as string,
          author: {
            id: 'user-1', // Current user
            firstName: 'Jean',
            lastName: 'Dupont',
            profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
            role: 'Agriculteur'
          },
          createdAt: new Date().toISOString(),
          isFirstPost: false,
          isEdited: false,
          likeCount: 0,
          status: 'published',
          isAnswer: false,
          reactions: []
        };

        // Add the new post to the list
        setPosts([...posts, newPost]);

        // Clear the input
        setReplyContent('');

        // Scroll to the bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error('Error submitting reply:', error);
      setIsSubmitting(false);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi de votre réponse.');
    }
  };

  // Handle reaction
  const handleReaction = (post: ForumPost, reactionType: string) => {
    // In a real app, this would send the reaction to an API
    Alert.alert('Réaction', `Vous avez réagi avec "${reactionType}" au message de ${post.author.firstName}`);
  };

  // Handle mark as answer
  const handleMarkAsAnswer = (post: ForumPost) => {
    // In a real app, this would send the mark as answer to an API
    Alert.alert('Solution', `Le message de ${post.author.firstName} a été marqué comme solution`);
  };

  // Handle copy content
  const handleCopyContent = async (content: string) => {
    await Clipboard.setStringAsync(content);
    Alert.alert('Copié', 'Le contenu a été copié dans le presse-papiers');
  };

  // Handle report
  const handleReport = (post: ForumPost) => {
    Alert.alert('Signaler', 'Voulez-vous signaler ce message ?', [
      {
        text: 'Annuler',
        style: 'cancel'
      },
      {
        text: 'Signaler',
        onPress: () => {
          // In a real app, this would send the report to an API
          Alert.alert('Signalé', 'Le message a été signalé aux modérateurs');
        }
      }
    ]);
  };

  // Render post item
  const renderPostItem = ({ item, index }: { item: ForumPost, index: number }) => (
    <ThemedView
      style={[
        styles.postContainer,
        item.isAnswer && styles.answerContainer
      ]}
    >
      {item.isAnswer && (
        <ThemedView style={styles.answerBadge}>
          <IconSymbol name="checkmark.circle.fill" size={16} color="white" />
          <ThemedText style={styles.answerText}>Solution validée</ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.postHeader}>
        <TouchableOpacity
          style={styles.authorContainer}
          onPress={() => navigateToUserProfile(item.author.id)}
        >
          <Image
            source={{ uri: item.author.profileImage || 'https://via.placeholder.com/40' }}
            style={styles.authorImage}
          />

          <ThemedView style={styles.authorInfo}>
            <ThemedText type="defaultSemiBold" style={styles.authorName}>
              {item.author.firstName} {item.author.lastName}
            </ThemedText>

            <ThemedText style={styles.authorRole}>
              {item.author.role}
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>

        <ThemedView style={styles.postMeta}>
          <ThemedText style={styles.postDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </ThemedText>

          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => {
              setSelectedPost(item);
              setPostMenuVisible(true);
            }}
          />
        </ThemedView>
      </ThemedView>

      <ThemedText style={styles.postContent}>
        {item.content}
      </ThemedText>

      <ThemedView style={styles.postActions}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.reactionsContainer}
        >
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => handleReaction(item, 'like')}
          >
            <IconSymbol name="hand.thumbsup.fill" size={16} color="#4CAF50" />
            <ThemedText style={styles.reactionText}>J'aime</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => handleReaction(item, 'helpful')}
          >
            <IconSymbol name="lightbulb.fill" size={16} color="#FF9800" />
            <ThemedText style={styles.reactionText}>Utile</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => handleReaction(item, 'thanks')}
          >
            <IconSymbol name="heart.fill" size={16} color="#F44336" />
            <ThemedText style={styles.reactionText}>Merci</ThemedText>
          </TouchableOpacity>
        </ScrollView>

        {topic?.author.id === user?.id && !item.isFirstPost && !item.isAnswer && (
          <TouchableOpacity
            style={styles.markAnswerButton}
            onPress={() => handleMarkAsAnswer(item)}
          >
            <IconSymbol name="checkmark.circle" size={16} color="#4CAF50" />
            <ThemedText style={styles.markAnswerText}>Marquer comme solution</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      {item.reactions.length > 0 && (
        <ThemedView style={styles.reactionsListContainer}>
          {item.reactions.map(reaction => (
            <ThemedView key={reaction.id} style={styles.reactionItem}>
              <IconSymbol
                name={
                  reaction.type === 'like' ? 'hand.thumbsup.fill' :
                  reaction.type === 'helpful' ? 'lightbulb.fill' :
                  'heart.fill'
                }
                size={12}
                color={
                  reaction.type === 'like' ? '#4CAF50' :
                  reaction.type === 'helpful' ? '#FF9800' :
                  '#F44336'
                }
              />
              <ThemedText style={styles.reactionItemText}>
                {reaction.user.firstName}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={styles.loadingText}>Chargement du sujet...</ThemedText>
      </ThemedView>
    );
  }

  if (!topic) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#F44336" />
        <ThemedText style={styles.errorText}>Sujet non trouvé</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ThemedText style={styles.backButtonText}>Retour au forum</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={24} color="#4CAF50" />
        </TouchableOpacity>

        <ThemedText type="title" numberOfLines={1} style={styles.headerTitle}>
          Discussion
        </ThemedText>

        <IconButton
          icon="dots-vertical"
          size={24}
          onPress={() => setMenuVisible(true)}
        />

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={{ x: 0, y: 0 }}
          style={styles.menu}
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigateToCategory();
            }}
            title="Voir la catégorie"
            leadingIcon="folder"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleCopyContent(`${topic.title}\n\n${posts[0]?.content}`);
            }}
            title="Copier le contenu"
            leadingIcon="content-copy"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleReport(posts[0]);
            }}
            title="Signaler"
            leadingIcon="flag"
          />
        </Menu>
      </ThemedView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
          </ThemedText>
        </ThemedView>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView style={styles.topicHeader}>
          <ThemedText type="subtitle" style={styles.topicTitle}>
            {topic.title}
          </ThemedText>

          <TouchableOpacity
            style={styles.categoryButton}
            onPress={navigateToCategory}
          >
            <ThemedView style={[styles.categoryIcon, { backgroundColor: category?.color || '#4CAF50' }]}>
              <IconSymbol name={category?.icon || 'folder.fill'} size={16} color="white" />
            </ThemedView>
            <ThemedText style={styles.categoryName}>{category?.name || 'Catégorie'}</ThemedText>
          </TouchableOpacity>

          {topic.tags.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tagsContainer}
            >
              {topic.tags.map(tag => (
                <ThemedView key={tag} style={styles.tagItem}>
                  <ThemedText style={styles.tagText}>#{tag}</ThemedText>
                </ThemedView>
              ))}
            </ScrollView>
          )}

          <ThemedView style={styles.topicStats}>
            <ThemedView style={styles.topicStatItem}>
              <IconSymbol name="eye.fill" size={12} color="#757575" />
              <ThemedText style={styles.topicStatText}>
                {topic.viewCount} vues
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.topicStatItem}>
              <IconSymbol name="bubble.left.fill" size={12} color="#757575" />
              <ThemedText style={styles.topicStatText}>
                {topic.replyCount} réponses
              </ThemedText>
            </ThemedView>

            {topic.isResolved && (
              <ThemedView style={styles.resolvedBadge}>
                <IconSymbol name="checkmark.circle.fill" size={12} color="white" />
                <ThemedText style={styles.resolvedText}>Résolu</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>

        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <Divider style={styles.postDivider} />}
        />
      </ScrollView>

      <ThemedView style={styles.replyContainer}>
        <TextInput
          style={styles.replyInput}
          placeholder="Écrire une réponse..."
          value={replyContent}
          onChangeText={setReplyContent}
          multiline
        />

        <ThemedView style={styles.replyActions}>
          <TouchableOpacity style={styles.attachButton}>
            <IconSymbol name="paperclip" size={20} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!replyContent.trim() || isSubmitting) && styles.sendButtonDisabled
            ]}
            onPress={handleSubmitReply}
            disabled={!replyContent.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <IconSymbol name="paperplane.fill" size={20} color="white" />
            )}
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <Menu
        visible={postMenuVisible}
        onDismiss={() => setPostMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}
        style={styles.menu}
      >
        <Menu.Item
          onPress={() => {
            setPostMenuVisible(false);
            if (selectedPost) {
              handleCopyContent(selectedPost.content);
            }
          }}
          title="Copier le contenu"
          leadingIcon="content-copy"
        />
        {selectedPost && !selectedPost.isFirstPost && !selectedPost.isAnswer && topic?.author.id === user?.id && (
          <Menu.Item
            onPress={() => {
              setPostMenuVisible(false);
              if (selectedPost) {
                handleMarkAsAnswer(selectedPost);
              }
            }}
            title="Marquer comme solution"
            leadingIcon="check-circle"
          />
        )}
        <Menu.Item
          onPress={() => {
            setPostMenuVisible(false);
            if (selectedPost) {
              handleReport(selectedPost);
            }
          }}
          title="Signaler"
          leadingIcon="flag"
        />
      </Menu>
    </KeyboardAvoidingView>
  );
}
