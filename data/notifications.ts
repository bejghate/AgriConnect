// Types for the notifications module

// Base notification type
export interface BaseNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string; // ISO date string
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  icon: string;
  color: string;
}

// Health alert notification
export interface HealthAlert extends BaseNotification {
  type: 'health_alert';
  diseaseType: 'plant' | 'animal';
  diseaseName: string;
  affectedSpecies: string[];
  location: {
    region: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    radius?: number; // in kilometers
  };
  source: string;
  reportedDate: string; // ISO date string
  recommendedActions: string[];
  linkToInfo?: string;
}

// Agricultural calendar reminder
export interface CalendarReminder extends BaseNotification {
  type: 'calendar_reminder';
  eventType: 'planting' | 'harvesting' | 'fertilizing' | 'pesticide' | 'vaccination' | 'general';
  dueDate: string; // ISO date string
  field?: string;
  crop?: string;
  livestock?: string;
  isRecurring: boolean;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string; // ISO date string
  };
  notes?: string;
}

// Seasonal advice notification
export interface SeasonalAdvice extends BaseNotification {
  type: 'seasonal_advice';
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'rainy' | 'dry';
  applicableUserTypes: string[]; // e.g., 'farmer', 'livestock', etc.
  applicableCrops?: string[];
  applicableLivestock?: string[];
  validFrom: string; // ISO date string
  validTo: string; // ISO date string
  tips: string[];
  imageUrl?: string;
}

// Urgent alert notification
export interface UrgentAlert extends BaseNotification {
  type: 'urgent_alert';
  alertType: 'weather' | 'disease' | 'pest' | 'other';
  alertTitle: string;
  location: {
    region: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    radius?: number; // in kilometers
  };
  source: string;
  reportedDate: string; // ISO date string
  recommendedActions: string[];
  expiresAt: string; // ISO date string
  imageUrl?: string;
}

// Expert message notification
export interface ExpertMessage extends BaseNotification {
  type: 'expert_message';
  expertName: string;
  expertRole: string;
  expertProfileImage?: string;
  messageType: 'advice' | 'response' | 'announcement';
  applicableUserTypes: string[]; // e.g., 'farmer', 'livestock', etc.
  applicableCrops?: string[];
  applicableLivestock?: string[];
  contactInfo?: string;
  attachmentUrl?: string;
}

// Market update notification
export interface MarketUpdate extends BaseNotification {
  type: 'market_update';
  updateType: 'price_change' | 'new_product' | 'demand_change' | 'supply_change' | 'other';
  products: string[];
  priceChange?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  location?: {
    region: string;
    city?: string;
  };
  source: string;
  validUntil: string; // ISO date string
  linkToMarketplace?: string;
}

// AI-driven recommendation notification
export interface AIRecommendation extends BaseNotification {
  type: 'ai_recommendation';
  recommendationType: 'crop_management' | 'livestock_management' | 'resource_optimization' | 'pest_prevention' | 'disease_prevention' | 'market_opportunity';
  confidence: number; // 0-1 value representing AI confidence in the recommendation
  applicableUserTypes: string[]; // e.g., 'farmer', 'livestock', etc.
  applicableCrops?: string[];
  applicableLivestock?: string[];
  dataPoints: string[]; // Data points used to generate this recommendation
  suggestedActions: string[];
  potentialBenefits: string[];
  validUntil?: string; // ISO date string
  imageUrl?: string;
}

// Union type for all notification types
export type Notification = HealthAlert | CalendarReminder | SeasonalAdvice | UrgentAlert | ExpertMessage | MarketUpdate | AIRecommendation;

// Sample health alerts
export const sampleHealthAlerts: HealthAlert[] = [
  {
    id: 'health-alert-1',
    type: 'health_alert',
    title: 'Avian Influenza Outbreak',
    description: 'Cases of avian influenza (H5N1) have been reported in your region. Take precautionary measures to protect your poultry.',
    timestamp: new Date().toISOString(),
    isRead: false,
    priority: 'high',
    icon: 'exclamationmark.triangle.fill',
    color: '#F44336',
    diseaseType: 'animal',
    diseaseName: 'Avian Influenza (H5N1)',
    affectedSpecies: ['Chickens', 'Ducks', 'Turkeys'],
    location: {
      region: 'Central',
      city: 'Ouagadougou',
      coordinates: {
        latitude: 12.3714,
        longitude: -1.5197,
      },
      radius: 50,
    },
    source: 'National Veterinary Services',
    reportedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    recommendedActions: [
      'Isolate your poultry from wild birds',
      'Implement strict biosecurity measures',
      'Monitor birds for symptoms (respiratory distress, decreased egg production)',
      'Report any suspicious deaths to veterinary authorities',
      'Avoid introducing new birds to your flock during the outbreak'
    ],
    linkToInfo: 'encyclopedia/animal-diseases/avian-influenza',
  },
  {
    id: 'health-alert-2',
    type: 'health_alert',
    title: 'Maize Streak Virus Alert',
    description: 'Maize Streak Virus has been detected in neighboring regions. Monitor your maize crops for symptoms.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: true,
    priority: 'medium',
    icon: 'leaf.fill',
    color: '#FF9800',
    diseaseType: 'plant',
    diseaseName: 'Maize Streak Virus',
    affectedSpecies: ['Maize', 'Corn'],
    location: {
      region: 'Western',
      coordinates: {
        latitude: 11.1750,
        longitude: -4.2986,
      },
      radius: 100,
    },
    source: 'Agricultural Research Institute',
    reportedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    recommendedActions: [
      'Monitor crops for yellow streaks on leaves',
      'Control leafhoppers (the virus vector) with appropriate insecticides',
      'Consider planting resistant varieties in future seasons',
      'Remove and destroy infected plants',
      'Maintain weed-free fields to reduce leafhopper habitat'
    ],
    linkToInfo: 'encyclopedia/plant-diseases/maize-streak-virus',
  },
];

// Sample calendar reminders
export const sampleCalendarReminders: CalendarReminder[] = [
  {
    id: 'calendar-1',
    type: 'calendar_reminder',
    title: 'Vaccinate Cattle',
    description: 'Schedule vaccination for your cattle against Foot and Mouth Disease.',
    timestamp: new Date().toISOString(),
    isRead: false,
    priority: 'high',
    icon: 'syringe.fill',
    color: '#2196F3',
    eventType: 'vaccination',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    livestock: 'Cattle',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'yearly',
      interval: 1,
    },
    notes: 'Contact Dr. Diallo at the veterinary clinic to schedule the vaccination. Phone: +226 70 12 34 56',
  },
  {
    id: 'calendar-2',
    type: 'calendar_reminder',
    title: 'Plant Maize',
    description: 'Optimal time to plant maize in North Field based on seasonal forecasts.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: true,
    priority: 'medium',
    icon: 'calendar',
    color: '#4CAF50',
    eventType: 'planting',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    field: 'North Field',
    crop: 'Maize',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'yearly',
      interval: 1,
    },
    notes: 'Use the drought-resistant variety purchased from AgriTech Solutions.',
  },
  {
    id: 'calendar-3',
    type: 'calendar_reminder',
    title: 'Apply Fertilizer',
    description: 'Apply second round of nitrogen fertilizer to wheat crop.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: false,
    priority: 'medium',
    icon: 'drop.fill',
    color: '#9C27B0',
    eventType: 'fertilizing',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    field: 'East Field',
    crop: 'Wheat',
    isRecurring: false,
    notes: 'Apply 40kg/ha of nitrogen fertilizer. Best applied early morning or late evening.',
  },
];

// Sample seasonal advice
export const sampleSeasonalAdvice: SeasonalAdvice[] = [
  {
    id: 'seasonal-1',
    type: 'seasonal_advice',
    title: 'Prepare for Rainy Season',
    description: 'The rainy season is approaching. Here are some tips to prepare your farm.',
    timestamp: new Date().toISOString(),
    isRead: false,
    priority: 'medium',
    icon: 'cloud.rain.fill',
    color: '#2196F3',
    season: 'rainy',
    applicableUserTypes: ['farmer', 'livestock'],
    validFrom: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    validTo: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    tips: [
      'Clean and repair drainage systems to prevent waterlogging',
      'Secure livestock shelters against heavy rain and wind',
      'Stock up on animal feed in case of supply disruptions',
      'Consider planting cover crops to prevent soil erosion',
      'Inspect and repair farm equipment before the busy season'
    ],
    imageUrl: 'https://example.com/images/rainy-season.jpg',
  },
  {
    id: 'seasonal-2',
    type: 'seasonal_advice',
    title: 'Heat Stress Management',
    description: 'Protect your crops and livestock from the upcoming heat wave.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isRead: true,
    priority: 'high',
    icon: 'thermometer.sun.fill',
    color: '#FF9800',
    season: 'summer',
    applicableUserTypes: ['farmer', 'livestock'],
    applicableCrops: ['Maize', 'Tomatoes', 'Peppers'],
    applicableLivestock: ['Cattle', 'Poultry', 'Goats'],
    validFrom: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    validTo: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
    tips: [
      'Increase irrigation frequency but reduce water volume per session',
      'Provide shade for livestock during peak heat hours (10am-4pm)',
      'Ensure animals have constant access to fresh water',
      'Apply mulch to crop beds to retain soil moisture',
      'Consider temporary shade structures for sensitive crops'
    ],
    imageUrl: 'https://example.com/images/heat-management.jpg',
  },
];

// Sample urgent alerts
export const sampleUrgentAlerts: UrgentAlert[] = [
  {
    id: 'urgent-alert-1',
    type: 'urgent_alert',
    title: 'Locust Swarm Approaching',
    description: 'A large swarm of desert locusts has been spotted 100km from your location, moving in your direction. Prepare your crops for potential damage.',
    timestamp: new Date().toISOString(),
    isRead: false,
    priority: 'high',
    icon: 'exclamationmark.triangle.fill',
    color: '#F44336',
    alertType: 'pest',
    alertTitle: 'Desert Locust Swarm',
    location: {
      region: 'Eastern',
      coordinates: {
        latitude: 12.5383,
        longitude: 1.8616,
      },
      radius: 100,
    },
    source: 'National Pest Monitoring Service',
    reportedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    recommendedActions: [
      'Harvest mature crops immediately if possible',
      'Apply recommended pesticides to protect remaining crops',
      'Cover young plants with netting if available',
      'Coordinate with neighboring farmers for collective action',
      'Report sightings to agricultural authorities'
    ],
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    imageUrl: 'https://example.com/images/locust-swarm.jpg',
  },
  {
    id: 'urgent-alert-2',
    type: 'urgent_alert',
    title: 'Severe Storm Warning',
    description: 'A severe thunderstorm with potential for flash flooding is expected in your area within the next 24 hours.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    isRead: true,
    priority: 'high',
    icon: 'cloud.bolt.rain.fill',
    color: '#F44336',
    alertType: 'weather',
    alertTitle: 'Severe Thunderstorm',
    location: {
      region: 'Central',
      city: 'Ouagadougou',
      coordinates: {
        latitude: 12.3714,
        longitude: -1.5197,
      },
      radius: 50,
    },
    source: 'National Meteorological Service',
    reportedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    recommendedActions: [
      'Move livestock to higher ground',
      'Secure farm equipment and loose objects',
      'Reinforce greenhouse structures if applicable',
      'Clear drainage channels to prevent flooding',
      'Delay planting operations until after the storm'
    ],
    expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    imageUrl: 'https://example.com/images/thunderstorm.jpg',
  },
];

// Sample expert messages
export const sampleExpertMessages: ExpertMessage[] = [
  {
    id: 'expert-message-1',
    type: 'expert_message',
    title: 'Sheep Vaccination Recommendation',
    description: 'Based on recent disease outbreaks, we recommend vaccinating your sheep against bluetongue virus.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: false,
    priority: 'medium',
    icon: 'person.fill.badge.plus',
    color: '#2196F3',
    expertName: 'Dr. Aminata Diallo',
    expertRole: 'Veterinary Specialist',
    expertProfileImage: 'https://example.com/images/experts/aminata-diallo.jpg',
    messageType: 'advice',
    applicableUserTypes: ['livestock'],
    applicableLivestock: ['Sheep', 'Goats'],
    contactInfo: 'Phone: +226 70 12 34 56, Email: a.diallo@agrivet.com',
    attachmentUrl: 'https://example.com/documents/sheep-vaccination-guide.pdf',
  },
  {
    id: 'expert-message-2',
    type: 'expert_message',
    title: 'Millet Cultivation Workshop',
    description: 'Join our upcoming workshop on improved millet cultivation techniques adapted to changing climate conditions.',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    isRead: true,
    priority: 'low',
    icon: 'person.fill.badge.plus',
    color: '#2196F3',
    expertName: 'Prof. Ibrahim Ouédraogo',
    expertRole: 'Agronomist',
    expertProfileImage: 'https://example.com/images/experts/ibrahim-ouedraogo.jpg',
    messageType: 'announcement',
    applicableUserTypes: ['farmer'],
    applicableCrops: ['Millet', 'Sorghum'],
    contactInfo: 'Phone: +226 76 98 76 54, Email: i.ouedraogo@agriuniv.edu',
  },
];

// Sample market updates
export const sampleMarketUpdates: MarketUpdate[] = [
  {
    id: 'market-update-1',
    type: 'market_update',
    title: 'Cotton Prices Rising',
    description: 'Cotton prices have increased by 15% over the past month due to reduced global supply. Consider selling your cotton now for maximum profit.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: false,
    priority: 'medium',
    icon: 'chart.line.uptrend.xyaxis.fill',
    color: '#4CAF50',
    updateType: 'price_change',
    products: ['Cotton'],
    priceChange: {
      direction: 'up',
      percentage: 15,
    },
    source: 'Agricultural Market Information Service',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    linkToMarketplace: '/marketplace?category=cotton',
  },
  {
    id: 'market-update-2',
    type: 'market_update',
    title: 'High Demand for Organic Vegetables',
    description: 'Local restaurants and hotels are seeking suppliers of organic vegetables. Register as a supplier on the marketplace to connect with buyers.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isRead: true,
    priority: 'medium',
    icon: 'chart.bar.fill',
    color: '#4CAF50',
    updateType: 'demand_change',
    products: ['Tomatoes', 'Lettuce', 'Carrots', 'Onions'],
    location: {
      region: 'Central',
      city: 'Ouagadougou',
    },
    source: 'Regional Chamber of Commerce',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    linkToMarketplace: '/marketplace?category=vegetables&filter=organic',
  },
];

// Sample AI recommendations
export const sampleAIRecommendations: AIRecommendation[] = [
  {
    id: 'ai-recommendation-1',
    type: 'ai_recommendation',
    title: 'Optimal Irrigation Schedule',
    description: 'Based on soil moisture data and weather forecasts, we recommend adjusting your irrigation schedule for maize crops.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    isRead: false,
    priority: 'medium',
    icon: 'brain',
    color: '#9C27B0',
    recommendationType: 'resource_optimization',
    confidence: 0.87,
    applicableUserTypes: ['farmer'],
    applicableCrops: ['Maize'],
    dataPoints: [
      'Soil moisture sensors: 35% moisture content',
      'Weather forecast: No rainfall expected in next 7 days',
      'Crop growth stage: Tasseling',
      'Historical water usage patterns',
      'Evapotranspiration rate: High'
    ],
    suggestedActions: [
      'Increase irrigation frequency to every 2 days',
      'Reduce water volume per session by 15%',
      'Irrigate during early morning (5-7am) to minimize evaporation',
      'Monitor leaf curling as indicator of water stress'
    ],
    potentialBenefits: [
      'Reduce water usage by approximately 20%',
      'Maintain optimal crop growth during critical tasseling stage',
      'Prevent yield loss from water stress',
      'Save approximately 15,000 liters of water per hectare'
    ],
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    imageUrl: 'https://example.com/images/irrigation-optimization.jpg',
  },
  {
    id: 'ai-recommendation-2',
    type: 'ai_recommendation',
    title: 'Preventive Treatment for Sheep',
    description: 'Based on regional disease patterns and your flock's history, we recommend a preventive treatment for internal parasites.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: true,
    priority: 'high',
    icon: 'brain',
    color: '#9C27B0',
    recommendationType: 'disease_prevention',
    confidence: 0.92,
    applicableUserTypes: ['livestock'],
    applicableLivestock: ['Sheep'],
    dataPoints: [
      'Regional disease reports: Increased parasite load in small ruminants',
      'Your flock's treatment history: Last deworming 3 months ago',
      'Recent rainfall patterns: Favorable for parasite development',
      'Flock behavior: Increased scratching observed',
      'Similar flocks in your area reporting parasite issues'
    ],
    suggestedActions: [
      'Administer broad-spectrum dewormer to all sheep',
      'Move flock to a different pasture if possible',
      'Monitor for symptoms of parasite infestation (weight loss, diarrhea, poor coat)',
      'Consult with veterinarian for specific product recommendations'
    ],
    potentialBenefits: [
      'Prevent productivity losses from parasite infestation',
      'Reduce risk of severe health issues in vulnerable animals',
      'Maintain optimal weight gain in lambs',
      'Prevent spread to other animals in the flock'
    ],
    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
  },
  {
    id: 'ai-recommendation-3',
    type: 'ai_recommendation',
    title: 'Market Opportunity for Organic Tomatoes',
    description: 'Our analysis indicates a growing demand and price premium for organic tomatoes in your region.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    isRead: false,
    priority: 'medium',
    icon: 'brain',
    color: '#9C27B0',
    recommendationType: 'market_opportunity',
    confidence: 0.78,
    applicableUserTypes: ['farmer'],
    applicableCrops: ['Tomatoes'],
    dataPoints: [
      'Market price trends: 35% premium for organic tomatoes',
      'Consumer demand: Increasing search for organic produce on marketplace',
      'Your current production: Suitable for organic conversion',
      'Regional supply gap: Limited organic tomato producers in your area',
      'Seasonal timing: Optimal planting window approaching'
    ],
    suggestedActions: [
      'Consider allocating 0.5-1 hectare for organic tomato production',
      'Source organic seeds and inputs through the marketplace',
      'Review organic certification requirements in the encyclopedia',
      'Connect with existing organic producers through the community forum'
    ],
    potentialBenefits: [
      'Potential 35% price premium over conventional tomatoes',
      'Access to growing market segment',
      'Reduced input costs for synthetic fertilizers and pesticides',
      'Improved soil health through organic practices'
    ],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    imageUrl: 'https://example.com/images/organic-tomatoes.jpg',
  },
];

// Combine all sample notifications
export const sampleNotifications: Notification[] = [
  ...sampleHealthAlerts,
  ...sampleCalendarReminders,
  ...sampleSeasonalAdvice,
  ...sampleUrgentAlerts,
  ...sampleExpertMessages,
  ...sampleMarketUpdates,
  ...sampleAIRecommendations,
];
