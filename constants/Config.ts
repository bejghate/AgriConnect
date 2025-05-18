// URL de base de l'API
// Pour le développement, utilisez une API locale ou un mock
export const API_URL = 'http://localhost:3000/api';

// Clés d'API pour les services tiers
export const API_KEYS = {
  MAPS_API_KEY: 'YOUR_MAPS_API_KEY',
  WEATHER_API_KEY: 'YOUR_WEATHER_API_KEY',
};

// Configuration Firebase
export const FIREBASE_CONFIG = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_FIREBASE_AUTH_DOMAIN',
  projectId: 'YOUR_FIREBASE_PROJECT_ID',
  storageBucket: 'YOUR_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'YOUR_FIREBASE_APP_ID',
  measurementId: 'YOUR_FIREBASE_MEASUREMENT_ID',
};

// Configuration des notifications push
export const PUSH_NOTIFICATION_CONFIG = {
  android: {
    channelId: 'agriconnect-default-channel',
    channelName: 'AgriConnect Notifications',
    channelDescription: 'Notifications pour l\'application AgriConnect',
    importance: 'high',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0a7ea4',
  },
  ios: {
    sound: true,
    badge: true,
    alert: true,
  },
};

// Configuration du cache
export const CACHE_CONFIG = {
  // Durée de validité du cache en millisecondes
  DEFAULT_CACHE_TIME: 3600000, // 1 heure
  ENCYCLOPEDIA_CACHE_TIME: 86400000, // 24 heures
  MARKETPLACE_CACHE_TIME: 1800000, // 30 minutes
  WEATHER_CACHE_TIME: 900000, // 15 minutes

  // Taille maximale du cache en octets
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50 MB
};

// Configuration de l'application
export const APP_CONFIG = {
  // Versions minimales supportées
  MIN_ANDROID_VERSION: '6.0',
  MIN_IOS_VERSION: '12.0',

  // Paramètres de synchronisation
  DEFAULT_SYNC_INTERVAL: 60, // minutes
  BACKGROUND_SYNC_ENABLED: true,
  SYNC_ON_RECONNECT: true,
  SYNC_ON_APP_FOREGROUND: true,
  SYNC_RETRY_COUNT: 3,
  SYNC_RETRY_DELAY: 5000, // 5 secondes

  // Paramètres de localisation
  DEFAULT_LOCATION_REFRESH_INTERVAL: 15, // minutes
  LOCATION_ACCURACY: 'high',
  LOCATION_DISTANCE_FILTER: 100, // mètres
  LOCATION_TIMEOUT: 15000, // 15 secondes
  LOCATION_MAXIMUM_AGE: 60000, // 1 minute
  LOCATION_BACKGROUND_UPDATE: true,

  // Paramètres de langue
  DEFAULT_LANGUAGE: 'fr',
  SUPPORTED_LANGUAGES: ['fr', 'en'],
  AUTO_DETECT_LANGUAGE: true,

  // Paramètres de thème
  DEFAULT_THEME: 'light',
  SUPPORTED_THEMES: ['light', 'dark', 'system'],
  AUTO_SWITCH_THEME: true,

  // Paramètres de taille de police
  DEFAULT_FONT_SIZE: 'medium',
  SUPPORTED_FONT_SIZES: ['small', 'medium', 'large', 'extra-large'],
  DYNAMIC_FONT_SCALING: true,

  // Paramètres de sécurité
  SECURITY: {
    JWT_EXPIRATION: 86400, // 24 heures en secondes
    REFRESH_TOKEN_EXPIRATION: 2592000, // 30 jours en secondes
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_UPPERCASE: true,
    PASSWORD_REQUIRE_LOWERCASE: true,
    PASSWORD_REQUIRE_NUMBER: true,
    PASSWORD_REQUIRE_SPECIAL_CHAR: true,
    TWO_FACTOR_AUTH_ENABLED: true,
    BIOMETRIC_AUTH_ENABLED: true,
    PIN_AUTH_ENABLED: true,
    PIN_LENGTH: 6,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 300, // 5 minutes en secondes
    SESSION_TIMEOUT: 1800, // 30 minutes en secondes
    ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  },

  // Paramètres de performance
  PERFORMANCE: {
    IMAGE_QUALITY: 0.8,
    MAX_IMAGE_WIDTH: 1200,
    MAX_IMAGE_HEIGHT: 1200,
    LAZY_LOADING_ENABLED: true,
    PAGINATION_LIMIT: 20,
    INFINITE_SCROLL_THRESHOLD: 0.8,
    DEBOUNCE_DELAY: 300, // 300 millisecondes
    THROTTLE_DELAY: 200, // 200 millisecondes
    ANIMATION_DURATION: 300, // 300 millisecondes
  },

  // Paramètres de connectivité
  CONNECTIVITY: {
    OFFLINE_MODE_ENABLED: true,
    LOW_BANDWIDTH_MODE_THRESHOLD: 150, // kbps
    CONNECTION_TIMEOUT: 30000, // 30 secondes
    RETRY_ON_CONNECTION_ERROR: true,
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000, // 2 secondes
    EXPONENTIAL_BACKOFF: true,
  },

  // Paramètres d'accessibilité
  ACCESSIBILITY: {
    SCREEN_READER_SUPPORT: true,
    HIGH_CONTRAST_MODE: true,
    REDUCED_MOTION: true,
    LARGE_TEXT_SUPPORT: true,
    KEYBOARD_NAVIGATION: true,
  },
};

// Endpoints de l'API
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    TWO_FACTOR_REQUEST: '/auth/two-factor/request',
    TWO_FACTOR_VERIFY: '/auth/two-factor/verify',
    BIOMETRIC_REGISTER: '/auth/biometric/register',
    BIOMETRIC_VERIFY: '/auth/biometric/verify',
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    PREFERENCES: '/users/preferences',
    DEVICES: '/users/devices',
    ACTIVITY_LOG: '/users/activity-log',
    SECURITY_SETTINGS: '/users/security-settings',
  },
  ENCYCLOPEDIA: {
    ARTICLES: '/encyclopedia/articles',
    CATEGORIES: '/encyclopedia/categories',
    SEARCH: '/encyclopedia/search',
    FAVORITES: '/encyclopedia/favorites',
    RECENT: '/encyclopedia/recent',
    SYNC: '/encyclopedia/sync',
  },
  MARKETPLACE: {
    PRODUCTS: '/marketplace/products',
    SERVICES: '/marketplace/services',
    CART: '/marketplace/cart',
    ORDERS: '/marketplace/orders',
    FAVORITES: '/marketplace/favorites',
    REVIEWS: '/marketplace/reviews',
    CATEGORIES: '/marketplace/categories',
    SEARCH: '/marketplace/search',
    VENDORS: '/marketplace/vendors',
    PAYMENTS: '/marketplace/payments',
  },
  FARM_MANAGEMENT: {
    LOG_ENTRIES: '/farm-management/log-entries',
    STATISTICS: '/farm-management/statistics',
    EXPORT: '/farm-management/export',
    CROPS: '/farm-management/crops',
    LIVESTOCK: '/farm-management/livestock',
    INVENTORY: '/farm-management/inventory',
    TASKS: '/farm-management/tasks',
    CALENDAR: '/farm-management/calendar',
    REPORTS: '/farm-management/reports',
    FIELDS: '/farm-management/fields',
  },
  CONSULTATIONS: {
    EXPERTS: '/consultations/experts',
    SESSIONS: '/consultations/sessions',
    MESSAGES: '/consultations/messages',
    REVIEWS: '/consultations/reviews',
    AVAILABILITY: '/consultations/availability',
    CATEGORIES: '/consultations/categories',
    PAYMENTS: '/consultations/payments',
  },
  FINANCIAL_SERVICES: {
    PRODUCTS: '/financial-services/products',
    INSTITUTIONS: '/financial-services/institutions',
    APPLICATIONS: '/financial-services/applications',
    APPLICATION_DOCUMENTS: '/financial-services/application-documents',
    REPAYMENTS: '/financial-services/repayments',
    EDUCATION: '/financial-services/education',
    CALCULATORS: '/financial-services/calculators',
    ELIGIBILITY: '/financial-services/eligibility',
    DOCUMENTS: '/financial-services/documents',
  },
  COMMUNITY: {
    FORUMS: '/community/forums',
    TOPICS: '/community/topics',
    POSTS: '/community/posts',
    COMMENTS: '/community/comments',
    USERS: '/community/users',
    CATEGORIES: '/community/categories',
    TAGS: '/community/tags',
    SEARCH: '/community/search',
    NOTIFICATIONS: '/community/notifications',
  },
  NOTIFICATIONS: {
    REGISTER_DEVICE: '/notifications/register-device',
    SETTINGS: '/notifications/settings',
    HISTORY: '/notifications/history',
    PREFERENCES: '/notifications/preferences',
    TOPICS: '/notifications/topics',
    SEND: '/notifications/send',
    READ: '/notifications/read',
    DELETE: '/notifications/delete',
  },
  WEATHER: {
    CURRENT: '/weather/current',
    FORECAST: '/weather/forecast',
    ALERTS: '/weather/alerts',
    HISTORICAL: '/weather/historical',
    LOCATIONS: '/weather/locations',
    AGRICULTURAL: '/weather/agricultural',
  },
  SYNC: {
    STATUS: '/sync/status',
    ENCYCLOPEDIA: '/sync/encyclopedia',
    MARKETPLACE: '/sync/marketplace',
    FARM_MANAGEMENT: '/sync/farm-management',
    CONSULTATIONS: '/sync/consultations',
    FINANCIAL_SERVICES: '/sync/financial-services',
    COMMUNITY: '/sync/community',
    WEATHER: '/sync/weather',
    USER: '/sync/user',
  },
  ANALYTICS: {
    EVENTS: '/analytics/events',
    USER_ACTIVITY: '/analytics/user-activity',
    APP_USAGE: '/analytics/app-usage',
    FEATURE_USAGE: '/analytics/feature-usage',
    ERRORS: '/analytics/errors',
    PERFORMANCE: '/analytics/performance',
  },
};
