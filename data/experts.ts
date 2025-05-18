// Types and data for the Expert Consultation module

// Expert specialties
export type ExpertSpecialty = 
  | 'veterinarian_livestock'
  | 'veterinarian_poultry'
  | 'agronomist_cereals'
  | 'agronomist_vegetables'
  | 'agronomist_fruits'
  | 'soil_specialist'
  | 'pest_control'
  | 'agricultural_economics'
  | 'irrigation_specialist'
  | 'organic_farming'
  | 'livestock_nutrition'
  | 'agricultural_engineering';

// Expert certification levels
export type CertificationLevel = 'basic' | 'certified' | 'advanced' | 'master';

// Expert availability status
export type AvailabilityStatus = 'available_now' | 'busy' | 'available_soon' | 'offline';

// Expert interface
export interface Expert {
  id: string;
  name: string;
  profileImage: string;
  specialties: ExpertSpecialty[];
  primarySpecialty: ExpertSpecialty;
  qualifications: string[];
  certificationLevel: CertificationLevel;
  certificationBadges: string[];
  yearsOfExperience: number;
  languages: string[];
  location: {
    region: string;
    city: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contactInfo: {
    email: string;
    phone: string;
  };
  availability: {
    status: AvailabilityStatus;
    nextAvailableSlot?: string; // ISO date string
    workingHours?: {
      start: string; // HH:MM format
      end: string; // HH:MM format
      days: number[]; // 0-6, where 0 is Sunday
    };
  };
  rating: number; // 1-5 stars
  reviewCount: number;
  consultationCount: number;
  responseRate: number; // Percentage
  responseTime: number; // Average response time in minutes
  verified: boolean;
  featured: boolean;
  bio: string;
  consultationOptions: {
    messageConsultation: boolean;
    audioCall: boolean;
    videoCall: boolean;
    lowDataCall: boolean;
    inPerson: boolean;
  };
  pricing: {
    messageRate: number; // Per message or free
    audioCallRate: number; // Per minute or free
    videoCallRate: number; // Per minute or free
    inPersonRate: number; // Per hour or free
  };
  freeConsultationAvailable: boolean;
  freeConsultationLimit?: number; // Number of free consultations available
}

// Consultation status
export type ConsultationStatus = 
  | 'pending' 
  | 'accepted' 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

// Consultation urgency level
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

// Consultation type
export type ConsultationType = 'message' | 'audio_call' | 'video_call' | 'in_person' | 'group';

// Consultation request interface
export interface ConsultationRequest {
  id: string;
  farmerId: string;
  expertId: string;
  requestDate: string; // ISO date string
  preferredDate?: string; // ISO date string
  preferredTimeSlot?: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  consultationType: ConsultationType;
  urgencyLevel: UrgencyLevel;
  problem: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    symptoms?: string[];
    duration?: string;
    previousActions?: string;
  };
  attachments?: {
    id: string;
    type: 'image' | 'video' | 'document';
    url: string;
    name: string;
    size?: number;
  }[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: ConsultationStatus;
  isGroupConsultation: boolean;
  groupConsultationId?: string;
  notes?: string;
}

// Consultation session interface
export interface ConsultationSession {
  id: string;
  requestId: string;
  farmerId: string;
  expertId: string;
  startTime: string; // ISO date string
  endTime?: string; // ISO date string
  duration?: number; // In minutes
  consultationType: ConsultationType;
  status: ConsultationStatus;
  notes?: string;
  diagnosis?: string;
  recommendations?: string;
  followUpRequired: boolean;
  followUpDate?: string; // ISO date string
  attachments?: {
    id: string;
    type: 'image' | 'video' | 'document';
    url: string;
    name: string;
    size?: number;
  }[];
  cost: number;
  paymentStatus: 'pending' | 'paid' | 'free' | 'cancelled';
  rating?: {
    stars: number; // 1-5
    comment?: string;
    date: string; // ISO date string
  };
  dispute?: {
    id: string;
    reason: string;
    status: 'open' | 'under_review' | 'resolved' | 'closed';
    resolution?: string;
  };
}

// Sample experts data
export const experts: Expert[] = [
  {
    id: 'expert-1',
    name: 'Dr. Aminata Diallo',
    profileImage: require('@/assets/images/experts/expert1.png'),
    specialties: ['veterinarian_livestock', 'veterinarian_poultry'],
    primarySpecialty: 'veterinarian_livestock',
    qualifications: ['DVM', 'PhD in Veterinary Medicine'],
    certificationLevel: 'master',
    certificationBadges: ['Certified Veterinarian', 'Livestock Specialist'],
    yearsOfExperience: 15,
    languages: ['English', 'French', 'Bambara'],
    location: {
      region: 'Central',
      city: 'Ouagadougou',
      coordinates: {
        latitude: 12.3714,
        longitude: -1.5197,
      },
    },
    contactInfo: {
      email: 'a.diallo@agrivet.com',
      phone: '+226 70 12 34 56',
    },
    availability: {
      status: 'available_now',
      workingHours: {
        start: '08:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5], // Monday to Friday
      },
    },
    rating: 4.9,
    reviewCount: 156,
    consultationCount: 342,
    responseRate: 98,
    responseTime: 15,
    verified: true,
    featured: true,
    bio: 'Veterinarian with 15 years of experience specializing in livestock health and disease prevention. Expert in cattle, sheep, and goat health management.',
    consultationOptions: {
      messageConsultation: true,
      audioCall: true,
      videoCall: true,
      lowDataCall: true,
      inPerson: true,
    },
    pricing: {
      messageRate: 0, // Free
      audioCallRate: 5, // Per minute
      videoCallRate: 10, // Per minute
      inPersonRate: 50, // Per hour
    },
    freeConsultationAvailable: true,
    freeConsultationLimit: 1,
  },
  {
    id: 'expert-2',
    name: 'Prof. Ibrahim Ouédraogo',
    profileImage: require('@/assets/images/experts/expert2.png'),
    specialties: ['agronomist_cereals', 'soil_specialist'],
    primarySpecialty: 'agronomist_cereals',
    qualifications: ['PhD in Agronomy', 'MSc in Soil Science'],
    certificationLevel: 'advanced',
    certificationBadges: ['Certified Agronomist', 'Soil Management Expert'],
    yearsOfExperience: 12,
    languages: ['English', 'French', 'Moore'],
    location: {
      region: 'Central',
      city: 'Ouagadougou',
      coordinates: {
        latitude: 12.3714,
        longitude: -1.5197,
      },
    },
    contactInfo: {
      email: 'i.ouedraogo@agriuniv.edu',
      phone: '+226 76 98 76 54',
    },
    availability: {
      status: 'available_soon',
      nextAvailableSlot: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      workingHours: {
        start: '09:00',
        end: '16:00',
        days: [1, 3, 5], // Monday, Wednesday, Friday
      },
    },
    rating: 4.8,
    reviewCount: 98,
    consultationCount: 210,
    responseRate: 95,
    responseTime: 30,
    verified: true,
    featured: true,
    bio: 'Agronomist specializing in cereal crops and soil management. Extensive experience in improving crop yields and sustainable farming practices.',
    consultationOptions: {
      messageConsultation: true,
      audioCall: true,
      videoCall: true,
      lowDataCall: true,
      inPerson: false,
    },
    pricing: {
      messageRate: 0, // Free
      audioCallRate: 4, // Per minute
      videoCallRate: 8, // Per minute
      inPersonRate: 0, // Not available
    },
    freeConsultationAvailable: true,
    freeConsultationLimit: 2,
  },
];

// Sample consultation requests
export const consultationRequests: ConsultationRequest[] = [
  {
    id: 'request-1',
    farmerId: 'user-1',
    expertId: 'expert-1',
    requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    preferredDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    preferredTimeSlot: {
      start: '10:00',
      end: '11:00',
    },
    consultationType: 'video_call',
    urgencyLevel: 'medium',
    problem: {
      title: 'Unusual mortality in chicken flock',
      description: 'I have noticed an unusual number of deaths in my chicken flock over the past week. About 5 out of 50 chickens have died, and several others seem lethargic and are not eating well.',
      category: 'Poultry',
      subcategory: 'Disease',
      symptoms: ['Lethargy', 'Loss of appetite', 'Sudden death'],
      duration: '1 week',
      previousActions: 'Separated sick birds from the flock',
    },
    attachments: [
      {
        id: 'att-1',
        type: 'image',
        url: 'https://example.com/images/chicken1.jpg',
        name: 'Sick chicken 1.jpg',
        size: 1024000,
      },
      {
        id: 'att-2',
        type: 'image',
        url: 'https://example.com/images/chicken2.jpg',
        name: 'Sick chicken 2.jpg',
        size: 1048576,
      },
    ],
    status: 'accepted',
    isGroupConsultation: false,
  },
];

// Sample consultation sessions
export const consultationSessions: ConsultationSession[] = [
  {
    id: 'session-1',
    requestId: 'request-1',
    farmerId: 'user-1',
    expertId: 'expert-1',
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 30 minutes later
    duration: 30,
    consultationType: 'video_call',
    status: 'completed',
    diagnosis: 'Newcastle disease based on symptoms and images provided',
    recommendations: 'Immediate vaccination of remaining flock, isolation of sick birds, disinfection of coop, and supportive care for affected birds.',
    followUpRequired: true,
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    attachments: [
      {
        id: 'att-3',
        type: 'document',
        url: 'https://example.com/documents/newcastle_treatment.pdf',
        name: 'Newcastle Disease Treatment Guide.pdf',
        size: 2097152,
      },
    ],
    cost: 0, // Free consultation
    paymentStatus: 'free',
    rating: {
      stars: 5,
      comment: 'Dr. Diallo was very knowledgeable and helpful. The diagnosis was accurate and the treatment recommendations worked well.',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    },
  },
];
