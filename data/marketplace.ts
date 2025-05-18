// Types for the marketplace module

// Market statistics and price trends
export interface PricePoint {
  date: string; // ISO date string
  price: number;
  currency: string;
  region?: string;
}

export interface PriceTrend {
  productId: string;
  productName: string;
  category: string;
  currentPrice: {
    amount: number;
    currency: string;
  };
  historicalPrices: PricePoint[];
  forecastPrices?: PricePoint[];
  seasonalTrend?: 'rising' | 'falling' | 'stable';
  comparedToLastMonth?: number; // Percentage change
  comparedToLastYear?: number; // Percentage change
  regionalPrices?: {
    region: string;
    price: number;
    currency: string;
  }[];
}

export interface MarketStatistics {
  lastUpdated: string; // ISO date string
  topSellingProducts: {
    productId: string;
    productName: string;
    category: string;
    volumeSold: number;
    unit: string;
  }[];
  priceIndices: {
    category: string;
    currentIndex: number;
    previousIndex: number;
    percentageChange: number;
  }[];
  regionalActivity: {
    region: string;
    transactionVolume: number;
    activeListings: number;
    popularCategories: string[];
  }[];
}

// Group selling for cooperatives
export interface GroupSelling {
  id: string;
  title: string;
  description: string;
  cooperativeId: string;
  cooperativeName: string;
  memberCount: number;
  productCategory: string;
  totalQuantity: number;
  quantityUnit: string;
  pricePerUnit: number;
  currency: string;
  minOrderQuantity?: number;
  bulkDiscounts?: Array<{quantity: number, discountPercentage: number}>;
  location: {
    region: string;
    city: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  deliveryOptions: DeliveryOption[];
  images: ProductImage[];
  qualityCertifications: string[];
  expiryDate: string; // ISO date string
  status: 'active' | 'pending' | 'completed' | 'canceled';
  createdAt: string; // ISO date string
}

// Message and conversation types for buyer-seller messaging
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  originalContent?: string; // Original content before translation
  originalLanguage?: string; // Language code of the original message
  translatedTo?: string; // Language code the message was translated to
  isTranslated: boolean;
  timestamp: string; // ISO date string
  isRead: boolean;
  attachments?: MessageAttachment[];
  isPriceOffer?: boolean; // Indicates if this message contains a price offer
  priceOffer?: {
    amount: number;
    currency: string;
    listingId: string;
    quantity: number;
    expiresAt?: string; // ISO date string
    status?: 'pending' | 'accepted' | 'rejected' | 'expired';
  };
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document';
  url: string;
  name?: string;
  size?: number;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  listingId?: string; // Optional reference to a listing
  orderId?: string; // Optional reference to an order
  lastMessage?: Message;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isArchived?: boolean;
}

// Review types for seller and product ratings
export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerImage?: string;
  targetId: string; // ID of seller or listing being reviewed
  targetType: 'seller' | 'listing';
  orderId?: string;
  rating: number; // 1-5 stars
  comment: string;
  timestamp: string; // ISO date string
  helpful: number; // Number of users who found this review helpful
  images?: string[]; // Optional images attached to the review
}

export interface SellerProfile {
  id: string;
  name: string;
  sellerType: SellerType;
  location: {
    region: string;
    city: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contactInfo: {
    phone: string;
    email?: string;
    website?: string;
  };
  rating: number; // 1-5 stars
  reviewCount: number;
  verified: boolean;
  memberSince: string; // ISO date string
  description: string;
  profileImage?: string;
  specialties?: string[];
  taxId?: string; // For professional sellers
  businessRegistration?: string; // For professional sellers
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export type ListingType = 'product' | 'service' | 'farmer_product';

export type ProductCategory =
  | 'seeds'
  | 'fertilizers'
  | 'pesticides'
  | 'animal_feed'
  | 'veterinary_products'
  | 'tools_equipment'
  | 'irrigation';

export type ServiceCategory =
  | 'equipment_rental'
  | 'transportation'
  | 'consulting'
  | 'labor'
  | 'processing'
  | 'storage'
  | 'veterinary_services';

export type FarmerProductCategory =
  | 'grains'
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'meat'
  | 'poultry'
  | 'other_farm_products';

export type SellerType = 'individual' | 'professional' | 'cooperative';

export type DeliveryOption =
  | 'pickup_only'
  | 'local_delivery'
  | 'shipping'
  | 'negotiable';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'canceled';

export interface MarketplaceListing {
  id: string;
  title: string;
  type: ListingType;
  category: ProductCategory | ServiceCategory | FarmerProductCategory;
  description: string;
  price: {
    amount: number;
    currency: string;
    unit?: string; // e.g., "per kg", "per hour", "per hectare"
    negotiable: boolean;
    minOrderQuantity?: number; // Minimum order quantity
    bulkDiscounts?: Array<{quantity: number, discountPercentage: number}>; // Bulk discounts
    installmentOptions?: Array<{
      months: number;
      interestRate: number;
      minAmount: number;
    }>; // Payment in installments
  };
  images: ProductImage[];
  seller: SellerProfile;
  location: {
    region: string;
    city: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    distanceToUser?: number; // Calculated distance to the current user in km
  };
  availability: {
    inStock?: boolean; // For products
    quantity?: number; // For products
    availableFrom?: string; // ISO date string, for services
    availableTo?: string; // ISO date string, for services
    harvestDate?: string; // For farmer products
    expiryDate?: string; // For farmer products
    restockDate?: string; // When out-of-stock products will be available again
  };
  delivery: {
    options: DeliveryOption[];
    freeDeliveryMinimum?: number; // Minimum order for free delivery
    deliveryRadius?: number; // In kilometers for local delivery
    deliveryFee?: number; // Base delivery fee
    estimatedDeliveryTime?: string; // e.g., "1-3 days"
    expeditedDelivery?: {
      available: boolean;
      fee: number;
      estimatedTime: string;
    };
  };
  specifications?: Record<string, string | number | boolean>; // Flexible specifications
  qualityControl: {
    verified: boolean; // Whether the product has been verified by AgriConnect
    verificationDate?: string; // When the product was last verified
    verifiedBy?: string; // Who verified the product (e.g., "AgriConnect Quality Team")
    qualityScore?: number; // 1-5 rating of product quality
    laboratoryTested?: boolean; // Whether the product has been tested in a laboratory
    testResults?: {
      date: string;
      parameter: string;
      result: string;
      standard: string;
      passed: boolean;
    }[];
  };
  certifications?: string[]; // e.g., "Organic", "Non-GMO", "Quality Certified"
  certificationDetails?: {
    name: string;
    issuedBy: string;
    issuedDate: string;
    expiryDate: string;
    certificateNumber: string;
    verificationUrl?: string;
  }[];
  datePosted: string; // ISO date string
  lastUpdated: string; // ISO date string
  featured: boolean;
  tags: string[];
  // Farmer product specific fields
  gradeOrQuality?: string; // e.g., "Premium", "Grade A", "Standard"
  productionMethod?: string; // e.g., "Organic", "Conventional", "Hydroponic"
  seasonality?: string; // e.g., "In season", "Off season"
  // Group selling
  isGroupSelling?: boolean;
  groupSellingDetails?: {
    cooperativeId: string;
    cooperativeName: string;
    memberCount: number;
    totalContributors: number;
  };
  // Market statistics
  priceHistory?: PricePoint[];
  marketTrend?: {
    trend: 'rising' | 'falling' | 'stable';
    percentageChange: number;
    period: 'day' | 'week' | 'month' | 'year';
  };
  similarListingsAveragePrice?: number;
  // Reviews and ratings
  rating?: number; // Average rating (1-5)
  reviewCount?: number; // Number of reviews
  verifiedPurchaseReviewCount?: number; // Number of reviews from verified purchases
}

// Sample seller profiles
export const sellerProfiles: SellerProfile[] = [
  {
    id: 'seller-1',
    name: 'AgriTech Solutions',
    sellerType: 'professional',
    location: {
      region: 'Central',
      city: 'Ouagadougou',
      coordinates: {
        latitude: 12.3714,
        longitude: -1.5197,
      },
    },
    contactInfo: {
      phone: '+226 70 12 34 56',
      email: 'contact@agritech.com',
      website: 'www.agritech-solutions.com',
    },
    rating: 4.8,
    reviewCount: 156,
    verified: true,
    memberSince: '2020-03-15',
    description: 'Leading provider of agricultural inputs and technology solutions for modern farming.',
    profileImage: 'https://example.com/profiles/agritech.jpg',
    specialties: ['Certified Seeds', 'Organic Fertilizers', 'Smart Irrigation'],
    taxId: 'TAX123456',
    businessRegistration: 'BR789012',
  },
  {
    id: 'seller-2',
    name: 'Tractors & More',
    sellerType: 'professional',
    location: {
      region: 'Western',
      city: 'Bobo-Dioulasso',
      coordinates: {
        latitude: 11.1771,
        longitude: -4.2979,
      },
    },
    contactInfo: {
      phone: '+226 76 98 76 54',
      email: 'info@tractorsandmore.com',
    },
    rating: 4.5,
    reviewCount: 89,
    verified: true,
    memberSince: '2019-07-22',
    description: 'Specialized in agricultural machinery rental and maintenance services.',
    profileImage: 'https://example.com/profiles/tractors.jpg',
    specialties: ['Tractor Rental', 'Equipment Maintenance', 'Field Preparation'],
    taxId: 'TAX654321',
    businessRegistration: 'BR987654',
  },
  {
    id: 'seller-3',
    name: 'Organic Farms Cooperative',
    sellerType: 'cooperative',
    location: {
      region: 'Eastern',
      city: 'Fada N\'Gourma',
      coordinates: {
        latitude: 12.0616,
        longitude: 0.3590,
      },
    },
    contactInfo: {
      phone: '+226 71 45 67 89',
      email: 'organic@farmscoop.org',
    },
    rating: 4.9,
    reviewCount: 213,
    verified: true,
    memberSince: '2018-01-10',
    description: 'Farmer-owned cooperative specializing in certified organic seeds and natural fertilizers.',
    profileImage: 'https://example.com/profiles/organic-coop.jpg',
    specialties: ['Organic Seeds', 'Natural Fertilizers', 'Sustainable Farming'],
    taxId: 'TAX246810',
    businessRegistration: 'BR135790',
  },
  {
    id: 'seller-4',
    name: 'VetCare Services',
    sellerType: 'professional',
    location: {
      region: 'Northern',
      city: 'Ouahigouya',
      coordinates: {
        latitude: 13.5828,
        longitude: -2.4216,
      },
    },
    contactInfo: {
      phone: '+226 78 23 45 67',
      email: 'contact@vetcare.com',
      website: 'www.vetcare-services.com',
    },
    rating: 4.7,
    reviewCount: 124,
    verified: true,
    memberSince: '2019-11-05',
    description: 'Professional veterinary services and quality animal health products.',
    profileImage: 'https://example.com/profiles/vetcare.jpg',
    specialties: ['Animal Health', 'Vaccination', 'Livestock Consultation'],
    taxId: 'TAX369258',
    businessRegistration: 'BR147258',
  },
  {
    id: 'seller-5',
    name: 'Harvest Transport',
    sellerType: 'professional',
    location: {
      region: 'Central',
      city: 'Koudougou',
      coordinates: {
        latitude: 12.2526,
        longitude: -2.3686,
      },
    },
    contactInfo: {
      phone: '+226 79 87 65 43',
    },
    rating: 4.3,
    reviewCount: 67,
    verified: false,
    memberSince: '2021-02-18',
    description: 'Reliable transportation services for agricultural products from farm to market.',
    profileImage: 'https://example.com/profiles/harvest-transport.jpg',
    specialties: ['Crop Transportation', 'Cold Chain', 'Bulk Delivery'],
  },
  {
    id: 'seller-6',
    name: 'Amadou\'s Farm',
    sellerType: 'individual',
    location: {
      region: 'Central',
      city: 'Ziniaré',
      coordinates: {
        latitude: 12.5819,
        longitude: -1.2917,
      },
    },
    contactInfo: {
      phone: '+226 70 55 66 77',
    },
    rating: 4.6,
    reviewCount: 42,
    verified: true,
    memberSince: '2021-05-10',
    description: 'Small-scale farmer specializing in quality vegetables and grains.',
    profileImage: 'https://example.com/profiles/amadou-farm.jpg',
    specialties: ['Organic Vegetables', 'Maize', 'Millet'],
  },
  {
    id: 'seller-7',
    name: 'Fatima\'s Poultry',
    sellerType: 'individual',
    location: {
      region: 'Western',
      city: 'Banfora',
      coordinates: {
        latitude: 10.6376,
        longitude: -4.7526,
      },
    },
    contactInfo: {
      phone: '+226 76 11 22 33',
      email: 'fatima.poultry@gmail.com',
    },
    rating: 4.8,
    reviewCount: 56,
    verified: true,
    memberSince: '2020-08-15',
    description: 'Family-run poultry farm offering fresh eggs and quality chicken.',
    profileImage: 'https://example.com/profiles/fatima-poultry.jpg',
    specialties: ['Free-range Eggs', 'Broiler Chickens', 'Guinea Fowl'],
  }
];

// Sample marketplace listings
export const marketplaceListings: MarketplaceListing[] = [
  {
    id: 'product-1',
    title: 'Premium Maize Seeds - Drought Resistant',
    type: 'product',
    category: 'seeds',
    description: 'High-yield, drought-resistant maize seeds suitable for semi-arid regions. These certified seeds have been tested to provide up to 30% higher yields compared to traditional varieties even in challenging conditions.',
    price: {
      amount: 5000,
      currency: 'XOF',
      unit: 'per kg',
      negotiable: false,
    },
    images: [
      {
        id: 'img-p1-1',
        url: 'https://example.com/products/maize-seeds-1.jpg',
        isPrimary: true,
      },
      {
        id: 'img-p1-2',
        url: 'https://example.com/products/maize-seeds-2.jpg',
        isPrimary: false,
      }
    ],
    seller: sellerProfiles[0], // AgriTech Solutions
    location: {
      region: 'Central',
      city: 'Ouagadougou',
    },
    availability: {
      inStock: true,
      quantity: 500,
    },
    specifications: {
      'Germination Rate': '95%',
      'Maturity Period': '90 days',
      'Seed Treatment': 'Fungicide treated',
      'Package Size': '5kg, 10kg, 25kg',
    },
    certifications: ['Quality Certified', 'Non-GMO'],
    datePosted: '2023-04-15',
    lastUpdated: '2023-04-15',
    featured: true,
    tags: ['maize', 'seeds', 'drought-resistant', 'high-yield'],
  },
  {
    id: 'product-2',
    title: 'Organic Compost Fertilizer',
    type: 'product',
    category: 'fertilizers',
    description: 'Premium organic compost made from plant residues and animal manure. Enriches soil structure and provides essential nutrients for healthy plant growth. Ideal for organic farming.',
    price: {
      amount: 3500,
      currency: 'XOF',
      unit: 'per 50kg bag',
      negotiable: true,
    },
    images: [
      {
        id: 'img-p2-1',
        url: 'https://example.com/products/organic-fertilizer-1.jpg',
        isPrimary: true,
      }
    ],
    seller: sellerProfiles[2], // Organic Farms Cooperative
    location: {
      region: 'Eastern',
      city: 'Fada N\'Gourma',
    },
    availability: {
      inStock: true,
      quantity: 200,
    },
    specifications: {
      'NPK Ratio': '4-3-2',
      'Organic Matter': '65%',
      'pH Level': '6.8',
      'Application Rate': '2-3 tons/hectare',
    },
    certifications: ['Organic Certified', 'Eco-Friendly'],
    datePosted: '2023-03-22',
    lastUpdated: '2023-04-10',
    featured: false,
    tags: ['organic', 'fertilizer', 'compost', 'soil health'],
  },
  {
    id: 'product-3',
    title: 'Cattle Deworming Medicine',
    type: 'product',
    category: 'veterinary_products',
    description: 'Broad-spectrum deworming medication for cattle. Effective against internal parasites including roundworms, lungworms, and liver flukes. Improves animal health and productivity.',
    price: {
      amount: 12000,
      currency: 'XOF',
      unit: 'per bottle (1L)',
      negotiable: false,
    },
    images: [
      {
        id: 'img-p3-1',
        url: 'https://example.com/products/deworming-medicine-1.jpg',
        isPrimary: true,
      },
      {
        id: 'img-p3-2',
        url: 'https://example.com/products/deworming-medicine-2.jpg',
        isPrimary: false,
      }
    ],
    seller: sellerProfiles[3], // VetCare Services
    location: {
      region: 'Northern',
      city: 'Ouahigouya',
    },
    availability: {
      inStock: true,
      quantity: 45,
    },
    specifications: {
      'Active Ingredient': 'Albendazole 10%',
      'Dosage': '1ml per 10kg body weight',
      'Withdrawal Period': '14 days for meat, 3 days for milk',
      'Storage': 'Store in cool, dry place',
    },
    certifications: ['Veterinary Approved', 'Quality Certified'],
    datePosted: '2023-04-05',
    lastUpdated: '2023-04-05',
    featured: true,
    tags: ['veterinary', 'cattle', 'deworming', 'animal health'],
  },
  {
    id: 'service-1',
    title: 'Tractor Rental with Operator',
    type: 'service',
    category: 'equipment_rental',
    description: 'Professional tractor service with experienced operator for field preparation, plowing, and harrowing. Modern equipment suitable for various soil types and field conditions.',
    price: {
      amount: 25000,
      currency: 'XOF',
      unit: 'per hectare',
      negotiable: true,
    },
    images: [
      {
        id: 'img-s1-1',
        url: 'https://example.com/services/tractor-rental-1.jpg',
        isPrimary: true,
      },
      {
        id: 'img-s1-2',
        url: 'https://example.com/services/tractor-rental-2.jpg',
        isPrimary: false,
      }
    ],
    seller: sellerProfiles[1], // Tractors & More
    location: {
      region: 'Western',
      city: 'Bobo-Dioulasso',
    },
    availability: {
      availableFrom: '2023-05-01',
      availableTo: '2023-07-30',
    },
    specifications: {
      'Tractor Model': 'John Deere 5310',
      'Horsepower': 55,
      'Implements Available': 'Plow, Harrow, Ridger',
      'Minimum Area': '2 hectares',
    },
    datePosted: '2023-04-10',
    lastUpdated: '2023-04-12',
    featured: true,
    tags: ['tractor', 'rental', 'plowing', 'field preparation'],
  },
  {
    id: 'service-2',
    title: 'Crop Transportation Services',
    type: 'service',
    category: 'transportation',
    description: 'Reliable transportation service for agricultural products from farm to market or storage facilities. Vehicles equipped to handle various crop types while maintaining quality during transit.',
    price: {
      amount: 15000,
      currency: 'XOF',
      unit: 'per ton per 100km',
      negotiable: true,
    },
    images: [
      {
        id: 'img-s2-1',
        url: 'https://example.com/services/crop-transport-1.jpg',
        isPrimary: true,
      }
    ],
    seller: sellerProfiles[4], // Harvest Transport
    location: {
      region: 'Central',
      city: 'Koudougou',
    },
    availability: {
      availableFrom: '2023-04-01',
      availableTo: '2023-12-31',
    },
    specifications: {
      'Vehicle Types': 'Trucks (5-15 tons)',
      'Coverage Area': 'Nationwide',
      'Special Features': 'Tarpaulin covers, ventilated containers',
      'Booking Notice': '48 hours minimum',
    },
    datePosted: '2023-03-28',
    lastUpdated: '2023-03-28',
    featured: false,
    tags: ['transportation', 'logistics', 'harvest', 'market access'],
  },
  {
    id: 'service-3',
    title: 'Livestock Health Consultation',
    type: 'service',
    category: 'veterinary_services',
    description: 'Professional veterinary consultation services for livestock health management. Includes disease diagnosis, treatment recommendations, vaccination programs, and general animal health advice.',
    price: {
      amount: 20000,
      currency: 'XOF',
      unit: 'per visit',
      negotiable: false,
    },
    images: [
      {
        id: 'img-s3-1',
        url: 'https://example.com/services/vet-consultation-1.jpg',
        isPrimary: true,
      },
      {
        id: 'img-s3-2',
        url: 'https://example.com/services/vet-consultation-2.jpg',
        isPrimary: false,
      }
    ],
    seller: sellerProfiles[3], // VetCare Services
    location: {
      region: 'Northern',
      city: 'Ouahigouya',
    },
    availability: {
      availableFrom: '2023-04-01',
      availableTo: '2023-12-31',
    },
    specifications: {
      'Service Coverage': 'Cattle, Goats, Sheep, Poultry',
      'Consultation Duration': '1-3 hours',
      'Follow-up': 'Included for 7 days',
      'Emergency Service': 'Available (additional fee)',
    },
    certifications: ['Licensed Veterinarian', 'Animal Health Specialist'],
    datePosted: '2023-04-08',
    lastUpdated: '2023-04-08',
    featured: true,
    tags: ['veterinary', 'livestock', 'animal health', 'consultation'],
  },
  {
    id: 'farmer-product-1',
    title: 'Premium Quality Maize - 500kg',
    type: 'farmer_product',
    category: 'grains',
    description: 'Freshly harvested premium quality maize. Grown using organic farming methods without chemical pesticides. Ideal for both human consumption and animal feed. Available in bulk quantities.',
    price: {
      amount: 1200,
      currency: 'XOF',
      unit: 'per 50kg bag',
      negotiable: true,
      minOrderQuantity: 50,
      bulkDiscounts: [
        {quantity: 200, discountPercentage: 5},
        {quantity: 500, discountPercentage: 10}
      ]
    },
    images: [
      {
        id: 'img-fp1-1',
        url: 'https://example.com/products/maize-1.jpg',
        isPrimary: true,
      },
      {
        id: 'img-fp1-2',
        url: 'https://example.com/products/maize-2.jpg',
        isPrimary: false,
      }
    ],
    seller: sellerProfiles[5], // Amadou's Farm
    location: {
      region: 'Central',
      city: 'Ziniaré',
      coordinates: {
        latitude: 12.5819,
        longitude: -1.2917,
      }
    },
    availability: {
      inStock: true,
      quantity: 500,
      harvestDate: '2023-04-10',
      expiryDate: '2023-10-10'
    },
    delivery: {
      options: ['pickup_only', 'local_delivery'],
      deliveryRadius: 50,
      deliveryFee: 2000,
      estimatedDeliveryTime: '1-2 days'
    },
    specifications: {
      'Moisture Content': '12%',
      'Grain Size': 'Large',
      'Color': 'Yellow',
      'Storage Conditions': 'Cool, dry place'
    },
    certifications: ['Locally Grown'],
    datePosted: '2023-05-01',
    lastUpdated: '2023-05-01',
    featured: true,
    tags: ['maize', 'corn', 'grain', 'organic', 'bulk'],
    gradeOrQuality: 'Premium',
    productionMethod: 'Organic',
    seasonality: 'In season'
  },
  {
    id: 'farmer-product-2',
    title: 'Fresh Farm Eggs - Tray of 30',
    type: 'farmer_product',
    category: 'poultry',
    description: 'Fresh eggs from free-range chickens. Our hens are fed with natural grains and have access to open pasture. Eggs are collected daily and carefully packed for maximum freshness.',
    price: {
      amount: 3000,
      currency: 'XOF',
      unit: 'per tray (30 eggs)',
      negotiable: false,
      minOrderQuantity: 1,
      bulkDiscounts: [
        {quantity: 5, discountPercentage: 5},
        {quantity: 10, discountPercentage: 10}
      ]
    },
    images: [
      {
        id: 'img-fp2-1',
        url: 'https://example.com/products/eggs-1.jpg',
        isPrimary: true,
      },
      {
        id: 'img-fp2-2',
        url: 'https://example.com/products/eggs-2.jpg',
        isPrimary: false,
      }
    ],
    seller: sellerProfiles[6], // Fatima's Poultry
    location: {
      region: 'Western',
      city: 'Banfora',
      coordinates: {
        latitude: 10.6376,
        longitude: -4.7526,
      }
    },
    availability: {
      inStock: true,
      quantity: 50,
      harvestDate: '2023-05-08', // Collection date
      expiryDate: '2023-05-22'
    },
    delivery: {
      options: ['pickup_only', 'local_delivery'],
      deliveryRadius: 20,
      deliveryFee: 1000,
      freeDeliveryMinimum: 10000,
      estimatedDeliveryTime: 'Same day'
    },
    specifications: {
      'Egg Size': 'Large',
      'Shell Color': 'Brown',
      'Packaging': 'Cardboard trays',
      'Storage': 'Refrigerate after delivery'
    },
    datePosted: '2023-05-08',
    lastUpdated: '2023-05-08',
    featured: false,
    tags: ['eggs', 'poultry', 'free-range', 'fresh'],
    gradeOrQuality: 'Grade A',
    productionMethod: 'Free-range',
    seasonality: 'Year-round'
  },
  {
    id: 'farmer-product-3',
    title: 'Fresh Tomatoes - 20kg Box',
    type: 'farmer_product',
    category: 'vegetables',
    description: 'Freshly harvested ripe tomatoes. Grown using minimal pesticides and natural fertilizers. Perfect for sauces, salads, and cooking. Sweet flavor and firm texture.',
    price: {
      amount: 5000,
      currency: 'XOF',
      unit: 'per 20kg box',
      negotiable: true
    },
    images: [
      {
        id: 'img-fp3-1',
        url: 'https://example.com/products/tomatoes-1.jpg',
        isPrimary: true,
      },
      {
        id: 'img-fp3-2',
        url: 'https://example.com/products/tomatoes-2.jpg',
        isPrimary: false,
      }
    ],
    seller: sellerProfiles[5], // Amadou's Farm
    location: {
      region: 'Central',
      city: 'Ziniaré',
      coordinates: {
        latitude: 12.5819,
        longitude: -1.2917,
      }
    },
    availability: {
      inStock: true,
      quantity: 30,
      harvestDate: '2023-05-07',
      expiryDate: '2023-05-14'
    },
    delivery: {
      options: ['pickup_only', 'local_delivery', 'shipping'],
      deliveryRadius: 100,
      deliveryFee: 1500,
      estimatedDeliveryTime: '1 day'
    },
    datePosted: '2023-05-07',
    lastUpdated: '2023-05-07',
    featured: false,
    tags: ['tomatoes', 'vegetables', 'fresh', 'local'],
    gradeOrQuality: 'Standard',
    productionMethod: 'Low-pesticide',
    seasonality: 'In season'
  }
];

// Cart and Order interfaces
export interface CartItem {
  id: string;
  listingId: string;
  quantity: number;
  price: number;
  selectedOptions?: Record<string, any>;
  addedAt: string; // ISO date string
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  lastUpdated: string; // ISO date string
}

// Payment methods
export type PaymentMethod =
  | 'mobile_money'
  | 'bank_transfer'
  | 'credit_card'
  | 'cash_on_delivery'
  | 'escrow'
  | 'installment';

export interface PaymentDetails {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  transactionDate?: string; // ISO date string
  receiptUrl?: string;
  // Mobile money specific
  mobileMoneyProvider?: string; // e.g., "Orange Money", "MTN Mobile Money"
  mobileNumber?: string;
  // Bank transfer specific
  bankName?: string;
  accountNumber?: string; // Masked for security
  transferReference?: string;
  // Credit card specific
  cardType?: string; // e.g., "Visa", "Mastercard"
  cardLast4?: string;
  // Installment specific
  installmentPlan?: {
    totalMonths: number;
    monthlyAmount: number;
    interestRate: number;
    paidInstallments: number;
    nextPaymentDue: string; // ISO date string
    remainingAmount: number;
  };
  // Escrow specific
  escrowDetails?: {
    releaseCondition: string;
    inspectionPeriod: number; // In days
    releaseDate?: string; // ISO date string
    status: 'funds_held' | 'inspection_period' | 'released' | 'disputed' | 'refunded';
  };
}

export interface OrderItem {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedOptions?: Record<string, any>;
  // Additional fields
  sellerName: string;
  sellerId: string;
  productCategory: string;
  deliveryMethod: DeliveryOption;
  estimatedDeliveryDate?: string; // ISO date string
  trackingNumber?: string;
  trackingUrl?: string;
  warrantyPeriod?: string; // e.g., "1 year", "6 months"
  returnEligible: boolean;
  returnPeriod?: number; // In days
}

export interface Order {
  id: string;
  userId: string;
  sellerId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region: string;
    postalCode?: string;
    specialInstructions?: string;
  };
  deliveryMethod: DeliveryOption;
  deliveryFee: number;
  estimatedDeliveryDate?: string; // ISO date string
  actualDeliveryDate?: string; // ISO date string
  trackingNumber?: string;
  notes?: string;
}

// Sample cart data
export const sampleCart: Cart = {
  id: 'cart-1',
  userId: 'user-1',
  items: [
    {
      id: 'cart-item-1',
      listingId: 'product-1',
      quantity: 2,
      price: 5000,
      addedAt: '2023-05-10T14:30:00Z'
    },
    {
      id: 'cart-item-2',
      listingId: 'farmer-product-1',
      quantity: 5,
      price: 1200,
      addedAt: '2023-05-10T14:35:00Z'
    }
  ],
  lastUpdated: '2023-05-10T14:35:00Z'
};

// Sample orders data
export const sampleOrders: Order[] = [
  {
    id: 'order-1',
    userId: 'user-1',
    sellerId: 'seller-1',
    items: [
      {
        id: 'order-item-1',
        listingId: 'product-1',
        listingTitle: 'Premium Maize Seeds - Drought Resistant',
        listingImage: 'https://example.com/products/maize-seeds-1.jpg',
        quantity: 2,
        unitPrice: 5000,
        totalPrice: 10000
      }
    ],
    status: 'delivered',
    createdAt: '2023-04-20T10:30:00Z',
    updatedAt: '2023-04-25T15:45:00Z',
    totalAmount: 10000,
    paymentMethod: 'mobile_money',
    paymentStatus: 'paid',
    deliveryAddress: {
      fullName: 'John Doe',
      phoneNumber: '+226 70 12 34 56',
      addressLine1: '123 Farmer Street',
      city: 'Ouagadougou',
      region: 'Central'
    },
    deliveryMethod: 'local_delivery',
    deliveryFee: 1500,
    estimatedDeliveryDate: '2023-04-25T00:00:00Z',
    actualDeliveryDate: '2023-04-25T14:30:00Z',
    trackingNumber: 'TRK123456'
  },
  {
    id: 'order-2',
    userId: 'user-1',
    sellerId: 'seller-3',
    items: [
      {
        id: 'order-item-2',
        listingId: 'product-2',
        listingTitle: 'Organic Compost Fertilizer',
        listingImage: 'https://example.com/products/organic-fertilizer-1.jpg',
        quantity: 3,
        unitPrice: 3500,
        totalPrice: 10500
      }
    ],
    status: 'processing',
    createdAt: '2023-05-05T09:15:00Z',
    updatedAt: '2023-05-06T11:20:00Z',
    totalAmount: 10500,
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    deliveryAddress: {
      fullName: 'John Doe',
      phoneNumber: '+226 70 12 34 56',
      addressLine1: '123 Farmer Street',
      city: 'Ouagadougou',
      region: 'Central'
    },
    deliveryMethod: 'shipping',
    deliveryFee: 2000,
    estimatedDeliveryDate: '2023-05-12T00:00:00Z'
  }
];

// Sample market statistics
export const marketStatistics: MarketStatistics = {
  lastUpdated: new Date().toISOString(),
  topSellingProducts: [
    {
      productId: 'product-1',
      productName: 'Premium Maize Seeds - Drought Resistant',
      category: 'seeds',
      volumeSold: 2500,
      unit: 'kg'
    },
    {
      productId: 'farmer-product-1',
      productName: 'Premium Quality Maize - 500kg',
      category: 'grains',
      volumeSold: 15000,
      unit: 'kg'
    },
    {
      productId: 'product-2',
      productName: 'Organic Compost Fertilizer',
      category: 'fertilizers',
      volumeSold: 8000,
      unit: 'kg'
    }
  ],
  priceIndices: [
    {
      category: 'seeds',
      currentIndex: 105.2,
      previousIndex: 100.0,
      percentageChange: 5.2
    },
    {
      category: 'fertilizers',
      currentIndex: 98.5,
      previousIndex: 100.0,
      percentageChange: -1.5
    },
    {
      category: 'grains',
      currentIndex: 110.8,
      previousIndex: 100.0,
      percentageChange: 10.8
    }
  ],
  regionalActivity: [
    {
      region: 'Central',
      transactionVolume: 125000,
      activeListings: 245,
      popularCategories: ['seeds', 'fertilizers', 'tools_equipment']
    },
    {
      region: 'Western',
      transactionVolume: 98000,
      activeListings: 187,
      popularCategories: ['grains', 'vegetables', 'equipment_rental']
    },
    {
      region: 'Eastern',
      transactionVolume: 75000,
      activeListings: 156,
      popularCategories: ['fertilizers', 'pesticides', 'seeds']
    }
  ]
};

// Sample price trends
export const priceTrends: PriceTrend[] = [
  {
    productId: 'farmer-product-1',
    productName: 'Premium Quality Maize',
    category: 'grains',
    currentPrice: {
      amount: 1200,
      currency: 'XOF'
    },
    historicalPrices: [
      { date: '2023-01-01', price: 1000, currency: 'XOF' },
      { date: '2023-02-01', price: 1050, currency: 'XOF' },
      { date: '2023-03-01', price: 1100, currency: 'XOF' },
      { date: '2023-04-01', price: 1150, currency: 'XOF' },
      { date: '2023-05-01', price: 1200, currency: 'XOF' }
    ],
    forecastPrices: [
      { date: '2023-06-01', price: 1250, currency: 'XOF' },
      { date: '2023-07-01', price: 1300, currency: 'XOF' },
      { date: '2023-08-01', price: 1350, currency: 'XOF' }
    ],
    seasonalTrend: 'rising',
    comparedToLastMonth: 4.3,
    comparedToLastYear: 20.0,
    regionalPrices: [
      { region: 'Central', price: 1200, currency: 'XOF' },
      { region: 'Western', price: 1150, currency: 'XOF' },
      { region: 'Eastern', price: 1250, currency: 'XOF' },
      { region: 'Northern', price: 1300, currency: 'XOF' }
    ]
  },
  {
    productId: 'product-2',
    productName: 'Organic Compost Fertilizer',
    category: 'fertilizers',
    currentPrice: {
      amount: 3500,
      currency: 'XOF'
    },
    historicalPrices: [
      { date: '2023-01-01', price: 3800, currency: 'XOF' },
      { date: '2023-02-01', price: 3700, currency: 'XOF' },
      { date: '2023-03-01', price: 3600, currency: 'XOF' },
      { date: '2023-04-01', price: 3550, currency: 'XOF' },
      { date: '2023-05-01', price: 3500, currency: 'XOF' }
    ],
    forecastPrices: [
      { date: '2023-06-01', price: 3450, currency: 'XOF' },
      { date: '2023-07-01', price: 3400, currency: 'XOF' },
      { date: '2023-08-01', price: 3450, currency: 'XOF' }
    ],
    seasonalTrend: 'falling',
    comparedToLastMonth: -1.4,
    comparedToLastYear: -7.9,
    regionalPrices: [
      { region: 'Central', price: 3500, currency: 'XOF' },
      { region: 'Western', price: 3450, currency: 'XOF' },
      { region: 'Eastern', price: 3550, currency: 'XOF' },
      { region: 'Northern', price: 3600, currency: 'XOF' }
    ]
  }
];

// Sample group selling listings
export const groupSellingListings: GroupSelling[] = [
  {
    id: 'group-1',
    title: 'Bulk Maize Sale - Farmers Cooperative',
    description: 'High-quality maize from our cooperative of 25 small-scale farmers. Harvested this season and available in bulk quantities. Perfect for processors, wholesalers, or large buyers.',
    cooperativeId: 'coop-1',
    cooperativeName: 'Central Region Farmers Cooperative',
    memberCount: 25,
    productCategory: 'grains',
    totalQuantity: 50000,
    quantityUnit: 'kg',
    pricePerUnit: 1100,
    currency: 'XOF',
    minOrderQuantity: 1000,
    bulkDiscounts: [
      { quantity: 5000, discountPercentage: 5 },
      { quantity: 10000, discountPercentage: 10 },
      { quantity: 25000, discountPercentage: 15 }
    ],
    location: {
      region: 'Central',
      city: 'Ouagadougou',
      coordinates: {
        latitude: 12.3714,
        longitude: -1.5197
      }
    },
    deliveryOptions: ['pickup_only', 'local_delivery'],
    images: [
      {
        id: 'img-g1-1',
        url: 'https://example.com/products/maize-bulk-1.jpg',
        isPrimary: true
      },
      {
        id: 'img-g1-2',
        url: 'https://example.com/products/maize-bulk-2.jpg',
        isPrimary: false
      }
    ],
    qualityCertifications: ['Quality Certified', 'Cooperative Verified'],
    expiryDate: '2023-08-30',
    status: 'active',
    createdAt: '2023-05-15'
  },
  {
    id: 'group-2',
    title: 'Organic Vegetables Bundle - Women Farmers Association',
    description: 'Fresh organic vegetables grown by our women farmers association. Bundle includes tomatoes, onions, peppers, and leafy greens. Support local women farmers while getting quality produce.',
    cooperativeId: 'coop-2',
    cooperativeName: 'Women Farmers Association',
    memberCount: 18,
    productCategory: 'vegetables',
    totalQuantity: 2000,
    quantityUnit: 'bundle',
    pricePerUnit: 2500,
    currency: 'XOF',
    minOrderQuantity: 10,
    bulkDiscounts: [
      { quantity: 50, discountPercentage: 5 },
      { quantity: 100, discountPercentage: 10 }
    ],
    location: {
      region: 'Western',
      city: 'Bobo-Dioulasso',
      coordinates: {
        latitude: 11.1771,
        longitude: -4.2979
      }
    },
    deliveryOptions: ['local_delivery'],
    images: [
      {
        id: 'img-g2-1',
        url: 'https://example.com/products/vegetable-bundle-1.jpg',
        isPrimary: true
      },
      {
        id: 'img-g2-2',
        url: 'https://example.com/products/vegetable-bundle-2.jpg',
        isPrimary: false
      }
    ],
    qualityCertifications: ['Organic Certified', 'Women Cooperative Verified'],
    expiryDate: '2023-06-15',
    status: 'active',
    createdAt: '2023-05-20'
  }
];

// Categories with their display information
export const productCategories = [
  {
    id: 'seeds',
    name: 'Seeds & Planting Material',
    icon: 'leaf.fill',
    color: '#4CAF50',
    description: 'Quality seeds, seedlings, and planting materials'
  },
  {
    id: 'fertilizers',
    name: 'Fertilizers & Soil Amendments',
    icon: 'drop.fill',
    color: '#8D6E63',
    description: 'Organic and chemical fertilizers, soil conditioners'
  },
  {
    id: 'pesticides',
    name: 'Pesticides & Crop Protection',
    icon: 'shield.fill',
    color: '#F44336',
    description: 'Insecticides, fungicides, herbicides, and biological controls'
  },
  {
    id: 'animal_feed',
    name: 'Animal Feed & Supplements',
    icon: 'pawprint.fill',
    color: '#FF9800',
    description: 'Livestock feed, supplements, and nutritional products'
  },
  {
    id: 'veterinary_products',
    name: 'Veterinary Products',
    icon: 'cross.case.fill',
    color: '#2196F3',
    description: 'Medicines, vaccines, and health products for animals'
  },
  {
    id: 'tools_equipment',
    name: 'Tools & Equipment',
    icon: 'wrench.fill',
    color: '#607D8B',
    description: 'Farming tools, small equipment, and spare parts'
  },
  {
    id: 'irrigation',
    name: 'Irrigation & Water Management',
    icon: 'drop.triangle.fill',
    color: '#03A9F4',
    description: 'Irrigation systems, water pumps, and accessories'
  }
];

export const farmerProductCategories = [
  {
    id: 'grains',
    name: 'Grains & Cereals',
    icon: 'leaf.fill',
    color: '#FFD54F',
    description: 'Maize, rice, wheat, millet, sorghum, and other grains'
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    icon: 'carrot.fill',
    color: '#66BB6A',
    description: 'Fresh vegetables, tubers, and root crops'
  },
  {
    id: 'fruits',
    name: 'Fruits',
    icon: 'apple.logo',
    color: '#EF5350',
    description: 'Fresh fruits and berries'
  },
  {
    id: 'dairy',
    name: 'Dairy Products',
    icon: 'cup.and.saucer.fill',
    color: '#42A5F5',
    description: 'Milk, cheese, butter, and other dairy products'
  },
  {
    id: 'meat',
    name: 'Meat & Livestock',
    icon: 'hare.fill',
    color: '#8D6E63',
    description: 'Beef, goat, sheep, and other meat products'
  },
  {
    id: 'poultry',
    name: 'Poultry & Eggs',
    icon: 'bird.fill',
    color: '#FFA726',
    description: 'Chicken, guinea fowl, eggs, and other poultry products'
  },
  {
    id: 'other_farm_products',
    name: 'Other Farm Products',
    icon: 'basket.fill',
    color: '#78909C',
    description: 'Honey, nuts, herbs, spices, and other farm products'
  }
];

// Sample conversations and messages data
export const sampleConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['user-1', 'seller-1'],
    listingId: 'product-1',
    createdAt: '2023-05-08T14:30:00Z',
    updatedAt: '2023-05-10T09:15:00Z',
    isArchived: false
  },
  {
    id: 'conv-2',
    participants: ['user-1', 'seller-3'],
    listingId: 'product-2',
    createdAt: '2023-05-05T10:45:00Z',
    updatedAt: '2023-05-06T16:20:00Z',
    isArchived: false
  },
  {
    id: 'conv-3',
    participants: ['user-1', 'seller-2'],
    orderId: 'order-3',
    createdAt: '2023-04-28T08:30:00Z',
    updatedAt: '2023-05-02T11:10:00Z',
    isArchived: true
  }
];

export const sampleMessages: Message[] = [
  // Conversation 1 messages
  {
    id: 'msg-1-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    receiverId: 'seller-1',
    content: 'Hello, I\'m interested in your Premium Maize Seeds. Are they suitable for clay soil?',
    timestamp: '2023-05-08T14:30:00Z',
    isRead: true
  },
  {
    id: 'msg-1-2',
    conversationId: 'conv-1',
    senderId: 'seller-1',
    receiverId: 'user-1',
    content: 'Hello! Yes, our Premium Maize Seeds perform well in clay soil. They have been tested in various soil conditions with good results.',
    timestamp: '2023-05-08T15:45:00Z',
    isRead: true
  },
  {
    id: 'msg-1-3',
    conversationId: 'conv-1',
    senderId: 'user-1',
    receiverId: 'seller-1',
    content: 'Great! What\'s the minimum order quantity?',
    timestamp: '2023-05-09T10:20:00Z',
    isRead: true
  },
  {
    id: 'msg-1-4',
    conversationId: 'conv-1',
    senderId: 'seller-1',
    receiverId: 'user-1',
    content: 'The minimum order is 5kg. We also offer a discount for orders above 20kg.',
    timestamp: '2023-05-09T11:05:00Z',
    isRead: true
  },
  {
    id: 'msg-1-5',
    conversationId: 'conv-1',
    senderId: 'user-1',
    receiverId: 'seller-1',
    content: 'Perfect! I\'ll place an order for 10kg. Do you deliver to Ouagadougou?',
    timestamp: '2023-05-10T09:15:00Z',
    isRead: false
  },

  // Conversation 2 messages
  {
    id: 'msg-2-1',
    conversationId: 'conv-2',
    senderId: 'user-1',
    receiverId: 'seller-3',
    content: 'Hi, I\'m interested in your Organic Compost Fertilizer. Is it suitable for vegetable gardens?',
    timestamp: '2023-05-05T10:45:00Z',
    isRead: true
  },
  {
    id: 'msg-2-2',
    conversationId: 'conv-2',
    senderId: 'seller-3',
    receiverId: 'user-1',
    content: 'Hello! Yes, our organic compost is perfect for vegetable gardens. It\'s rich in nutrients and improves soil structure.',
    timestamp: '2023-05-05T14:30:00Z',
    isRead: true
  },
  {
    id: 'msg-2-3',
    conversationId: 'conv-2',
    senderId: 'user-1',
    receiverId: 'seller-3',
    content: 'Great! Can you offer a better price if I buy 5 bags?',
    timestamp: '2023-05-06T09:15:00Z',
    isRead: true
  },
  {
    id: 'msg-2-4',
    conversationId: 'conv-2',
    senderId: 'seller-3',
    receiverId: 'user-1',
    content: 'Yes, we can offer a 10% discount for 5 bags. That would be 15,750 XOF instead of 17,500 XOF.',
    timestamp: '2023-05-06T16:20:00Z',
    isRead: true
  },

  // Conversation 3 messages
  {
    id: 'msg-3-1',
    conversationId: 'conv-3',
    senderId: 'user-1',
    receiverId: 'seller-2',
    content: 'Hello, I have a question about my recent tractor rental order (#order-3). When will the tractor be available?',
    timestamp: '2023-04-28T08:30:00Z',
    isRead: true
  },
  {
    id: 'msg-3-2',
    conversationId: 'conv-3',
    senderId: 'seller-2',
    receiverId: 'user-1',
    content: 'Good morning! Your tractor rental is scheduled for May 1st at 8:00 AM. Our operator will arrive at your farm at that time.',
    timestamp: '2023-04-28T09:45:00Z',
    isRead: true
  },
  {
    id: 'msg-3-3',
    conversationId: 'conv-3',
    senderId: 'user-1',
    receiverId: 'seller-2',
    content: 'Thank you for the confirmation. Is there anything I need to prepare before the operator arrives?',
    timestamp: '2023-04-29T14:20:00Z',
    isRead: true
  },
  {
    id: 'msg-3-4',
    conversationId: 'conv-3',
    senderId: 'seller-2',
    receiverId: 'user-1',
    content: 'Please ensure that the field is clear of large rocks or debris. Also, it would be helpful if you could mark any areas that should be avoided.',
    timestamp: '2023-04-30T10:15:00Z',
    isRead: true
  },
  {
    id: 'msg-3-5',
    conversationId: 'conv-3',
    senderId: 'user-1',
    receiverId: 'seller-2',
    content: 'I\'ve cleared the field and marked the boundaries. Looking forward to tomorrow.',
    timestamp: '2023-04-30T16:40:00Z',
    isRead: true
  },
  {
    id: 'msg-3-6',
    conversationId: 'conv-3',
    senderId: 'seller-2',
    receiverId: 'user-1',
    content: 'The work has been completed. Thank you for your business! Please let us know if you have any feedback on our service.',
    timestamp: '2023-05-01T17:30:00Z',
    isRead: true
  },
  {
    id: 'msg-3-7',
    conversationId: 'conv-3',
    senderId: 'user-1',
    receiverId: 'seller-2',
    content: 'The work was excellent! Thank you for the professional service. I\'ll definitely use your services again.',
    timestamp: '2023-05-02T11:10:00Z',
    isRead: true
  }
];

// Sample reviews data
export const sampleReviews: Review[] = [
  {
    id: 'review-1',
    reviewerId: 'user-2',
    reviewerName: 'Marie Konaté',
    reviewerImage: 'https://example.com/profiles/marie.jpg',
    targetId: 'seller-1',
    targetType: 'seller',
    orderId: 'order-past-1',
    rating: 5,
    comment: 'Excellent service and high-quality products. The seeds I purchased had a great germination rate. Highly recommended!',
    timestamp: '2023-04-10T14:30:00Z',
    helpful: 12
  },
  {
    id: 'review-2',
    reviewerId: 'user-3',
    reviewerName: 'Ibrahim Diallo',
    targetId: 'seller-1',
    targetType: 'seller',
    orderId: 'order-past-2',
    rating: 4,
    comment: 'Good quality products and fast delivery. The customer service was responsive when I had questions.',
    timestamp: '2023-03-25T09:45:00Z',
    helpful: 8
  },
  {
    id: 'review-3',
    reviewerId: 'user-4',
    reviewerName: 'Aminata Touré',
    reviewerImage: 'https://example.com/profiles/aminata.jpg',
    targetId: 'product-1',
    targetType: 'listing',
    orderId: 'order-past-3',
    rating: 5,
    comment: 'These maize seeds performed exceptionally well in my fields. The drought resistance is impressive, and the yield was better than expected.',
    timestamp: '2023-04-05T16:20:00Z',
    helpful: 15,
    images: [
      'https://example.com/reviews/maize-field-1.jpg',
      'https://example.com/reviews/maize-field-2.jpg'
    ]
  },
  {
    id: 'review-4',
    reviewerId: 'user-5',
    reviewerName: 'Ousmane Bah',
    targetId: 'product-1',
    targetType: 'listing',
    orderId: 'order-past-4',
    rating: 4,
    comment: 'Good quality seeds with high germination rate. The plants are growing well despite the dry conditions in my area.',
    timestamp: '2023-03-30T11:15:00Z',
    helpful: 7
  },
  {
    id: 'review-5',
    reviewerId: 'user-6',
    reviewerName: 'Fatou Camara',
    reviewerImage: 'https://example.com/profiles/fatou.jpg',
    targetId: 'seller-3',
    targetType: 'seller',
    orderId: 'order-past-5',
    rating: 5,
    comment: 'The Organic Farms Cooperative provides excellent organic products. Their compost has significantly improved my soil quality.',
    timestamp: '2023-04-15T10:30:00Z',
    helpful: 10
  }
];

export const serviceCategories = [
  {
    id: 'equipment_rental',
    name: 'Equipment Rental',
    icon: 'tractor.fill',
    color: '#FFC107',
    description: 'Tractors, harvesters, and agricultural machinery rental'
  },
  {
    id: 'transportation',
    name: 'Transportation & Logistics',
    icon: 'truck.fill',
    color: '#3F51B5',
    description: 'Crop transportation, cold chain, and logistics services'
  },
  {
    id: 'consulting',
    name: 'Consulting & Advisory',
    icon: 'person.fill.questionmark',
    color: '#9C27B0',
    description: 'Agricultural consulting, farm management, and technical advice'
  },
  {
    id: 'labor',
    name: 'Farm Labor & Services',
    icon: 'person.2.fill',
    color: '#795548',
    description: 'Seasonal workers, harvesting teams, and specialized labor'
  },
  {
    id: 'processing',
    name: 'Processing & Value Addition',
    icon: 'gear.fill',
    color: '#FF5722',
    description: 'Crop processing, packaging, and value-added services'
  },
  {
    id: 'storage',
    name: 'Storage Facilities',
    icon: 'archivebox.fill',
    color: '#9E9E9E',
    description: 'Warehousing, cold storage, and inventory management'
  },
  {
    id: 'veterinary_services',
    name: 'Veterinary Services',
    icon: 'stethoscope',
    color: '#E91E63',
    description: 'Animal health services, vaccination, and livestock care'
  }
];
