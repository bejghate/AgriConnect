// Types for forum data
export interface ForumUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  role: string;
  reputation: number;
  badges: ForumBadge[];
  joinDate: string;
  postCount: number;
  topicCount: number;
  region?: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parentId?: string;
  isRegional: boolean;
  region?: string;
  topicCount: number;
  postCount: number;
  lastPostAt?: string;
  lastPostAuthor?: Partial<ForumUser>;
  subcategories?: ForumCategory[];
  isActive: boolean;
}

export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  slug: string;
  categoryId: string;
  author: Partial<ForumUser>;
  createdAt: string;
  lastPostAt: string;
  lastPostAuthor?: Partial<ForumUser>;
  viewCount: number;
  replyCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isResolved: boolean;
  tags: string[];
  status: 'published' | 'draft' | 'pending_review' | 'rejected' | 'archived';
  attachments?: ForumAttachment[];
}

export interface ForumPost {
  id: string;
  content: string;
  topicId: string;
  author: Partial<ForumUser>;
  createdAt: string;
  parentId?: string;
  isFirstPost: boolean;
  isEdited: boolean;
  editedAt?: string;
  editedBy?: Partial<ForumUser>;
  likeCount: number;
  status: 'published' | 'pending_review' | 'rejected' | 'hidden';
  isAnswer: boolean;
  attachments?: ForumAttachment[];
  reactions: ForumReaction[];
}

export interface ForumAttachment {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface ForumReaction {
  id: string;
  postId: string;
  userId: string;
  user: Partial<ForumUser>;
  type: 'like' | 'helpful' | 'thanks' | 'insightful' | 'agree' | 'disagree';
  createdAt: string;
}

export interface ForumBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: 'participation' | 'quality' | 'expertise' | 'moderation' | 'special';
  awardedAt: string;
}

export interface ForumSubscription {
  id: string;
  userId: string;
  entityType: 'category' | 'topic';
  entityId: string;
  notificationType: 'all' | 'mentions' | 'none';
  lastReadAt: string;
}

// Sample data for forum categories
export const forumCategories: ForumCategory[] = [
  {
    id: 'cat-1',
    name: 'Cultures',
    description: 'Discussions sur les cultures, techniques agricoles, semences, etc.',
    icon: 'leaf.fill',
    color: '#4CAF50',
    isRegional: false,
    topicCount: 120,
    postCount: 845,
    lastPostAt: '2023-08-15T10:30:00Z',
    isActive: true
  },
  {
    id: 'cat-2',
    name: 'Élevage',
    description: 'Discussions sur l\'élevage, la santé animale, l\'alimentation, etc.',
    icon: 'hare.fill',
    color: '#FF9800',
    isRegional: false,
    topicCount: 85,
    postCount: 623,
    lastPostAt: '2023-08-16T14:20:00Z',
    isActive: true
  },
  {
    id: 'cat-3',
    name: 'Équipement & Machinerie',
    description: 'Discussions sur les équipements agricoles, machines, outils, etc.',
    icon: 'wrench.fill',
    color: '#2196F3',
    isRegional: false,
    topicCount: 65,
    postCount: 412,
    lastPostAt: '2023-08-14T09:15:00Z',
    isActive: true
  },
  {
    id: 'cat-4',
    name: 'Gestion & Finance',
    description: 'Discussions sur la gestion d\'exploitation, finances, subventions, etc.',
    icon: 'chart.bar.fill',
    color: '#9C27B0',
    isRegional: false,
    topicCount: 42,
    postCount: 287,
    lastPostAt: '2023-08-13T16:45:00Z',
    isActive: true
  },
  {
    id: 'cat-5',
    name: 'Bonnes Pratiques',
    description: 'Partage de bonnes pratiques, innovations et techniques améliorées.',
    icon: 'star.fill',
    color: '#FFC107',
    isRegional: false,
    topicCount: 38,
    postCount: 256,
    lastPostAt: '2023-08-12T11:30:00Z',
    isActive: true
  },
  {
    id: 'cat-6',
    name: 'Événements & Formations',
    description: 'Annonces de formations, journées portes ouvertes, démonstrations, etc.',
    icon: 'calendar.badge.plus',
    color: '#3F51B5',
    isRegional: false,
    topicCount: 25,
    postCount: 143,
    lastPostAt: '2023-08-11T13:20:00Z',
    isActive: true
  },
  {
    id: 'cat-7',
    name: 'Forums Régionaux',
    description: 'Discussions spécifiques à votre région.',
    icon: 'map.fill',
    color: '#607D8B',
    isRegional: true,
    topicCount: 95,
    postCount: 578,
    lastPostAt: '2023-08-16T15:10:00Z',
    isActive: true
  }
];

// Sample data for forum topics
export const forumTopics: ForumTopic[] = [
  {
    id: 'topic-1',
    title: 'Technique de compostage qui a amélioré mes rendements de 20%',
    content: 'J\'ai mis en place une nouvelle technique de compostage qui a considérablement amélioré mes rendements...',
    slug: 'technique-compostage-ameliore-rendements',
    categoryId: 'cat-5',
    author: {
      id: 'user-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      role: 'Agriculteur'
    },
    createdAt: '2023-08-10T09:30:00Z',
    lastPostAt: '2023-08-16T14:20:00Z',
    viewCount: 342,
    replyCount: 28,
    isPinned: true,
    isLocked: false,
    isResolved: true,
    tags: ['compostage', 'rendement', 'innovation', 'sol'],
    status: 'published'
  },
  {
    id: 'topic-2',
    title: 'Problème de parasites sur mes plants de tomates',
    content: 'Depuis quelques jours, j\'observe des parasites sur mes plants de tomates...',
    slug: 'probleme-parasites-plants-tomates',
    categoryId: 'cat-1',
    author: {
      id: 'user-2',
      firstName: 'Marie',
      lastName: 'Laurent',
      profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
      role: 'Maraîchère'
    },
    createdAt: '2023-08-12T11:45:00Z',
    lastPostAt: '2023-08-15T16:30:00Z',
    viewCount: 187,
    replyCount: 15,
    isPinned: false,
    isLocked: false,
    isResolved: false,
    tags: ['tomates', 'parasites', 'maraîchage', 'protection'],
    status: 'published'
  },
  {
    id: 'topic-3',
    title: 'Recommandations pour l\'achat d\'un tracteur d\'occasion',
    content: 'Je souhaite acheter un tracteur d\'occasion et j\'aimerais avoir vos conseils...',
    slug: 'recommandations-achat-tracteur-occasion',
    categoryId: 'cat-3',
    author: {
      id: 'user-3',
      firstName: 'Pierre',
      lastName: 'Martin',
      profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
      role: 'Céréalier'
    },
    createdAt: '2023-08-11T14:20:00Z',
    lastPostAt: '2023-08-14T09:15:00Z',
    viewCount: 256,
    replyCount: 22,
    isPinned: false,
    isLocked: false,
    isResolved: true,
    tags: ['tracteur', 'équipement', 'achat', 'occasion'],
    status: 'published'
  },
  {
    id: 'topic-4',
    title: 'Formation sur les techniques d\'irrigation économes en eau',
    content: 'Nous organisons une formation sur les techniques d\'irrigation économes en eau...',
    slug: 'formation-techniques-irrigation-economes-eau',
    categoryId: 'cat-6',
    author: {
      id: 'user-4',
      firstName: 'Sophie',
      lastName: 'Dubois',
      profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      role: 'Formatrice'
    },
    createdAt: '2023-08-09T10:00:00Z',
    lastPostAt: '2023-08-13T16:45:00Z',
    viewCount: 198,
    replyCount: 12,
    isPinned: true,
    isLocked: false,
    isResolved: false,
    tags: ['formation', 'irrigation', 'eau', 'économie'],
    status: 'published'
  },
  {
    id: 'topic-5',
    title: 'Partage d\'expérience : conversion à l\'agriculture biologique',
    content: 'Après 3 ans de conversion à l\'agriculture biologique, je souhaite partager mon expérience...',
    slug: 'partage-experience-conversion-agriculture-biologique',
    categoryId: 'cat-5',
    author: {
      id: 'user-5',
      firstName: 'Thomas',
      lastName: 'Leroy',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
      role: 'Agriculteur Bio'
    },
    createdAt: '2023-08-08T15:30:00Z',
    lastPostAt: '2023-08-12T11:30:00Z',
    viewCount: 312,
    replyCount: 26,
    isPinned: false,
    isLocked: false,
    isResolved: false,
    tags: ['bio', 'conversion', 'expérience', 'certification'],
    status: 'published'
  }
];

// Sample data for forum posts (to be implemented)
export const forumPosts: ForumPost[] = [];

// Sample data for forum users (to be implemented)
export const forumUsers: ForumUser[] = [];

// Sample data for forum badges
export const forumBadges: ForumBadge[] = [
  {
    id: 'badge-1',
    name: 'Expert en Compostage',
    description: 'Attribué aux membres ayant partagé des connaissances précieuses sur le compostage',
    icon: 'leaf.fill',
    color: '#4CAF50',
    level: 'gold',
    category: 'expertise',
    awardedAt: '2023-07-15T10:30:00Z'
  },
  {
    id: 'badge-2',
    name: 'Conseiller Actif',
    description: 'Attribué aux membres ayant fourni de nombreuses réponses utiles',
    icon: 'bubble.left.fill',
    color: '#2196F3',
    level: 'silver',
    category: 'participation',
    awardedAt: '2023-06-20T14:45:00Z'
  },
  {
    id: 'badge-3',
    name: 'Innovateur',
    description: 'Attribué aux membres ayant partagé des techniques innovantes',
    icon: 'lightbulb.fill',
    color: '#FFC107',
    level: 'gold',
    category: 'quality',
    awardedAt: '2023-08-05T09:15:00Z'
  }
];
