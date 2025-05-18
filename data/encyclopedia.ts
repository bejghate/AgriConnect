// Data models for the Agricultural Encyclopedia

// Main category interface
export interface EncyclopediaCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  subcategories: EncyclopediaSubcategory[];
}

// Subcategory interface
export interface EncyclopediaSubcategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  parentId: string;
  items: EncyclopediaItem[];
}

// Encyclopedia item interface (disease, problem, or general information)
export interface EncyclopediaItem {
  id: string;
  title: string;
  type: 'disease' | 'pest' | 'technique' | 'general' | 'animal_breed' | 'plant_variety';
  shortDescription: string;
  fullDescription: string;
  subcategoryId: string;
  images: EncyclopediaImage[];
  videos?: EncyclopediaVideo[];
  symptoms?: string[];
  causes?: string[];
  riskFactors?: string[];
  diagnosis?: string;
  treatments?: EncyclopediaTreatment[];
  preventionMeasures?: string[];
  tags: string[];
  // For animal breeds
  animalBreedInfo?: AnimalBreedInfo;
  // For plant varieties
  plantVarietyInfo?: PlantVarietyInfo;
  // For favorites and offline access
  isFavorite?: boolean;
  lastViewed?: number; // timestamp
}

// Animal breed information
export interface AnimalBreedInfo {
  origin: string;
  characteristics: string[];
  productionType: 'meat' | 'milk' | 'dual' | 'eggs' | 'wool' | 'other';
  productionStats: {
    name: string;
    value: string;
    unit: string;
  }[];
  diseaseResistance: {
    diseaseName: string;
    resistanceLevel: 'low' | 'medium' | 'high';
  }[];
  climateAdaptation: {
    climateType: string;
    adaptationLevel: 'low' | 'medium' | 'high';
  }[];
  breedingInfo: string;
  nutritionRequirements: string;
  housingRequirements: string;
}

// Plant variety information
export interface PlantVarietyInfo {
  origin: string;
  characteristics: string[];
  growthCycle: {
    stage: string;
    durationDays: number;
    description: string;
  }[];
  plantingInfo: {
    sowingPeriod: string;
    harvestPeriod: string;
    sowingDepth: string;
    plantSpacing: string;
    rowSpacing: string;
  };
  waterRequirements: 'low' | 'medium' | 'high';
  wateringSchedule: string;
  soilRequirements: {
    soilType: string[];
    pHRange: {
      min: number;
      max: number;
    };
    drainageLevel: 'poor' | 'moderate' | 'good';
  };
  fertilizerRecommendations: {
    type: string;
    applicationRate: string;
    frequency: string;
    timing: string;
  }[];
  pestManagement: {
    commonPests: string[];
    preventionMethods: string[];
    treatments: string[];
  };
  diseaseManagement: {
    commonDiseases: string[];
    preventionMethods: string[];
    treatments: string[];
  };
  expectedYield: {
    minYield: number;
    maxYield: number;
    unit: string;
    conditions: string;
  };
  storageRequirements: string;
}

// Image interface
export interface EncyclopediaImage {
  id: string;
  url: string;
  caption: string;
  isHighResolution: boolean;
}

// Video interface
export interface EncyclopediaVideo {
  id: string;
  url: string;
  title: string;
  duration: number; // in seconds
  thumbnail: string;
}

// Treatment interface
export interface EncyclopediaTreatment {
  id: string;
  name: string;
  type: 'chemical' | 'biological' | 'mechanical' | 'cultural';
  description: string;
  dosage?: string;
  applicationMethod?: string;
  frequency?: string;
  precautions?: string[];
  effectiveness: 'low' | 'medium' | 'high';
  environmentalImpact: 'low' | 'medium' | 'high';
  cost: 'low' | 'medium' | 'high';
}

// Mock data for the main categories
export const encyclopediaCategories: EncyclopediaCategory[] = [
  {
    id: 'livestock',
    title: 'Livestock',
    icon: 'hare.fill',
    description: 'Information about livestock management, breeding, health care, and disease prevention.',
    subcategories: [
      {
        id: 'cattle',
        title: 'Cattle',
        description: 'Information about cattle breeding, management, and health issues.',
        icon: 'pawprint.fill',
        parentId: 'livestock',
        items: []
      },
      {
        id: 'sheep',
        title: 'Sheep & Goats',
        description: 'Information about sheep and goat breeding, management, and health issues.',
        icon: 'pawprint.fill',
        parentId: 'livestock',
        items: []
      },
      {
        id: 'poultry',
        title: 'Poultry',
        description: 'Information about poultry breeding, management, and health issues.',
        icon: 'bird.fill',
        parentId: 'livestock',
        items: []
      }
    ]
  },
  {
    id: 'crops',
    title: 'Crops',
    icon: 'leaf.fill',
    description: 'Information about various crops, planting techniques, disease management, and harvesting methods.',
    subcategories: [
      {
        id: 'cereals',
        title: 'Cereals',
        description: 'Information about cereal crops like wheat, rice, maize, etc.',
        icon: 'leaf.fill',
        parentId: 'crops',
        items: []
      },
      {
        id: 'legumes',
        title: 'Legumes',
        description: 'Information about leguminous crops like beans, peas, lentils, etc.',
        icon: 'leaf.fill',
        parentId: 'crops',
        items: []
      },
      {
        id: 'fruits',
        title: 'Fruits',
        description: 'Information about fruit crops and orchards.',
        icon: 'leaf.fill',
        parentId: 'crops',
        items: []
      },
      {
        id: 'vegetables',
        title: 'Vegetables',
        description: 'Information about vegetable crops and market gardening.',
        icon: 'leaf.fill',
        parentId: 'crops',
        items: []
      }
    ]
  },
  {
    id: 'soil',
    title: 'Soil Management',
    icon: 'square.3.layers.3d.down.right',
    description: 'Information about soil health, fertility management, conservation, and improvement techniques.',
    subcategories: [
      {
        id: 'fertility',
        title: 'Soil Fertility',
        description: 'Information about maintaining and improving soil fertility.',
        icon: 'square.3.layers.3d.down.right',
        parentId: 'soil',
        items: []
      },
      {
        id: 'conservation',
        title: 'Soil Conservation',
        description: 'Information about preventing soil erosion and degradation.',
        icon: 'square.3.layers.3d.down.right',
        parentId: 'soil',
        items: []
      },
      {
        id: 'analysis',
        title: 'Soil Analysis',
        description: 'Information about soil testing and interpretation of results.',
        icon: 'square.3.layers.3d.down.right',
        parentId: 'soil',
        items: []
      }
    ]
  }
];

// Sample detailed items for cattle diseases
export const cattleDiseases: EncyclopediaItem[] = [
  {
    id: 'cattle-disease-1',
    title: 'Foot and Mouth Disease',
    type: 'disease',
    shortDescription: 'A highly contagious viral disease affecting cloven-hoofed animals.',
    fullDescription: 'Foot and mouth disease (FMD) is a highly contagious viral disease that affects cloven-hoofed animals such as cattle, sheep, goats, and pigs. It is characterized by fever and blister-like sores on the tongue, lips, mouth, teats, and hooves. While it is rarely fatal in adult animals, it can cause serious production losses and is a major constraint to international trade in livestock and animal products.',
    subcategoryId: 'cattle',
    images: [
      {
        id: 'fmd-image-1',
        url: 'https://example.com/images/fmd-1.jpg',
        caption: 'Blisters on the tongue of an infected cow',
        isHighResolution: true
      },
      {
        id: 'fmd-image-2',
        url: 'https://example.com/images/fmd-2.jpg',
        caption: 'Lesions on the hoof of an infected cow',
        isHighResolution: true
      }
    ],
    videos: [
      {
        id: 'fmd-video-1',
        url: 'https://example.com/videos/fmd-diagnosis.mp4',
        title: 'How to diagnose Foot and Mouth Disease',
        duration: 180,
        thumbnail: 'https://example.com/thumbnails/fmd-diagnosis.jpg'
      }
    ],
    symptoms: [
      'High fever (up to 106°F)',
      'Excessive salivation and drooling',
      'Smacking lips, grinding teeth due to painful tongue and mouth blisters',
      'Blisters on the tongue, dental pad, gums, soft palate, nostrils, and/or between the toes',
      'Reduced milk production in dairy cows',
      'Lameness and reluctance to move due to foot pain',
      'Weight loss due to painful eating'
    ],
    causes: [
      'Foot and mouth disease virus (FMDV), a picornavirus',
      'Seven serotypes: O, A, C, SAT1, SAT2, SAT3, and Asia1',
      'Spreads through direct contact with infected animals',
      'Can be airborne over short distances',
      'Contaminated feed, water, equipment, or clothing'
    ],
    riskFactors: [
      'Introduction of new animals without quarantine',
      'Contact with infected wild animals',
      'Feeding uncooked food waste containing infected meat or animal products',
      'Movement of animals, people, or vehicles between farms without proper biosecurity',
      'Areas with high animal density'
    ],
    diagnosis: 'Diagnosis is based on clinical signs and laboratory tests. Samples of fluid from blisters, blood, or tissue can be tested for the presence of the virus or antibodies. Polymerase chain reaction (PCR) tests and enzyme-linked immunosorbent assays (ELISA) are commonly used.',
    treatments: [
      {
        id: 'fmd-treatment-1',
        name: 'Supportive care',
        type: 'cultural',
        description: 'There is no specific treatment for FMD. Treatment is supportive and aims to prevent secondary infections and provide comfort.',
        applicationMethod: 'Provide soft food, clean water, and comfortable bedding. Clean affected areas with mild antiseptics.',
        frequency: 'Daily until recovery',
        precautions: [
          'Isolate infected animals',
          'Use proper protective equipment when handling infected animals',
          'Disinfect all equipment after use'
        ],
        effectiveness: 'medium',
        environmentalImpact: 'low',
        cost: 'medium'
      }
    ],
    preventionMeasures: [
      'Vaccination in endemic areas',
      'Strict biosecurity measures',
      'Quarantine of new animals',
      'Proper disposal of infected carcasses',
      'Movement restrictions during outbreaks',
      'Avoid feeding uncooked food waste to animals'
    ],
    tags: ['cattle', 'disease', 'viral', 'contagious', 'FMD']
  },
  {
    id: 'cattle-disease-2',
    title: 'Bovine Respiratory Disease',
    type: 'disease',
    shortDescription: 'A complex of respiratory diseases affecting cattle, particularly in feedlots.',
    fullDescription: 'Bovine Respiratory Disease (BRD), also known as shipping fever or pneumonia, is one of the most common and costly diseases affecting cattle, particularly in feedlots. It is a complex condition involving multiple pathogens, environmental factors, and stress. BRD typically affects the upper and lower respiratory tracts and can lead to pneumonia.',
    subcategoryId: 'cattle',
    images: [
      {
        id: 'brd-image-1',
        url: 'https://example.com/images/brd-1.jpg',
        caption: 'Cattle showing signs of respiratory distress',
        isHighResolution: true
      }
    ],
    symptoms: [
      'Depression and lethargy',
      'Reduced feed intake',
      'Fever (above 104°F)',
      'Increased respiratory rate',
      'Coughing',
      'Nasal and eye discharge',
      'Difficulty breathing',
      'Drooping ears',
      'Separation from the herd'
    ],
    causes: [
      'Viral agents: Bovine herpesvirus-1 (IBR), Bovine viral diarrhea virus (BVDV), Bovine respiratory syncytial virus (BRSV), Parainfluenza-3 virus (PI3)',
      'Bacterial agents: Mannheimia haemolytica, Pasteurella multocida, Histophilus somni, Mycoplasma bovis',
      'Stress factors that compromise the immune system'
    ],
    riskFactors: [
      'Transportation stress',
      'Commingling of cattle from different sources',
      'Abrupt dietary changes',
      'Poor ventilation',
      'Extreme weather conditions',
      'Overcrowding',
      'Young age',
      'Previous illness'
    ],
    diagnosis: 'Diagnosis is based on clinical signs, history, and physical examination. Laboratory tests such as nasal swabs, blood tests, and lung fluid samples can help identify the specific pathogens involved. Post-mortem examination of lung tissue is also valuable for diagnosis.',
    treatments: [
      {
        id: 'brd-treatment-1',
        name: 'Antibiotic therapy',
        type: 'chemical',
        description: 'Antibiotics are used to treat bacterial infections associated with BRD.',
        dosage: 'Varies by product; follow veterinarian prescription',
        applicationMethod: 'Injectable, typically intramuscular or subcutaneous',
        frequency: 'Single dose or multiple doses depending on the product',
        precautions: [
          'Use only under veterinary supervision',
          'Observe withdrawal periods before slaughter or milk use',
          'Store medications properly'
        ],
        effectiveness: 'high',
        environmentalImpact: 'medium',
        cost: 'medium'
      },
      {
        id: 'brd-treatment-2',
        name: 'Anti-inflammatory drugs',
        type: 'chemical',
        description: 'Non-steroidal anti-inflammatory drugs (NSAIDs) to reduce fever and inflammation',
        dosage: 'Varies by product; follow veterinarian prescription',
        applicationMethod: 'Injectable',
        frequency: 'As needed to control fever and inflammation',
        precautions: [
          'Use only under veterinary supervision',
          'Observe withdrawal periods',
          'Do not use in dehydrated animals'
        ],
        effectiveness: 'medium',
        environmentalImpact: 'low',
        cost: 'medium'
      }
    ],
    preventionMeasures: [
      'Vaccination against viral and bacterial pathogens',
      'Preconditioning calves before transportation',
      'Minimizing stress during handling and transportation',
      'Providing adequate nutrition',
      'Ensuring proper ventilation in housing',
      'Implementing biosecurity measures',
      'Early detection and treatment of sick animals'
    ],
    tags: ['cattle', 'disease', 'respiratory', 'pneumonia', 'BRD']
  }
];

// Sample detailed items for crop diseases
export const cropDiseases: EncyclopediaItem[] = [
  {
    id: 'crop-disease-1',
    title: 'Wheat Rust',
    type: 'disease',
    shortDescription: 'A fungal disease affecting wheat and other cereal crops.',
    fullDescription: 'Wheat rust is a fungal disease that affects wheat and other cereal crops. There are three types of wheat rust: stem rust (Puccinia graminis), leaf rust (Puccinia triticina), and stripe rust (Puccinia striiformis). These diseases can cause significant yield losses if not properly managed.',
    subcategoryId: 'cereals',
    images: [
      {
        id: 'wheat-rust-image-1',
        url: 'https://example.com/images/wheat-rust-1.jpg',
        caption: 'Stem rust on wheat',
        isHighResolution: true
      },
      {
        id: 'wheat-rust-image-2',
        url: 'https://example.com/images/wheat-rust-2.jpg',
        caption: 'Leaf rust on wheat',
        isHighResolution: true
      }
    ],
    symptoms: [
      'Stem rust: Reddish-brown, elongated pustules on stems and leaves',
      'Leaf rust: Small, round, orange-brown pustules mainly on leaves',
      'Stripe rust: Yellow-orange pustules arranged in stripes on leaves',
      'Reduced photosynthesis',
      'Reduced grain filling',
      'Lodging in severe stem rust infections'
    ],
    causes: [
      'Stem rust: Puccinia graminis f. sp. tritici',
      'Leaf rust: Puccinia triticina',
      'Stripe rust: Puccinia striiformis f. sp. tritici',
      'Spores spread by wind over long distances',
      'Favorable conditions: high humidity, moderate temperatures'
    ],
    riskFactors: [
      'Susceptible wheat varieties',
      'Monoculture of wheat',
      'Presence of volunteer wheat plants',
      'Mild winters that allow pathogen survival',
      'Early planting in fall (for winter wheat)',
      'Excessive nitrogen fertilization'
    ],
    diagnosis: 'Diagnosis is based on visual symptoms and microscopic examination of spores. Laboratory tests can confirm the specific rust species and race.',
    treatments: [
      {
        id: 'wheat-rust-treatment-1',
        name: 'Fungicide application',
        type: 'chemical',
        description: 'Triazole and strobilurin fungicides can be effective against wheat rust.',
        dosage: '0.5-1 liter per hectare, depending on the product',
        applicationMethod: 'Foliar spray with ground equipment or aerial application',
        frequency: 'Apply at first sign of disease and repeat as needed according to label instructions',
        precautions: [
          'Follow label instructions for timing and application rates',
          'Observe pre-harvest intervals',
          'Rotate fungicide classes to prevent resistance',
          'Wear appropriate protective equipment'
        ],
        effectiveness: 'high',
        environmentalImpact: 'medium',
        cost: 'high'
      }
    ],
    preventionMeasures: [
      'Plant resistant varieties',
      'Crop rotation with non-host crops',
      'Eliminate volunteer wheat plants',
      'Adjust planting dates to avoid peak rust periods',
      'Balanced fertilization',
      'Monitor fields regularly for early detection',
      'Regional rust forecasting systems'
    ],
    tags: ['wheat', 'disease', 'fungal', 'rust', 'cereals']
  },
  {
    id: 'tomato-disease-1',
    title: 'Late Blight (Phytophthora infestans)',
    type: 'disease',
    shortDescription: 'A destructive fungal-like disease affecting tomatoes and potatoes, causing rapid plant death in favorable conditions.',
    fullDescription: 'Late blight is a devastating disease caused by the oomycete pathogen Phytophthora infestans. It affects tomatoes, potatoes, and other members of the Solanaceae family. This disease was responsible for the Irish Potato Famine in the 1840s and remains one of the most serious threats to tomato and potato production worldwide. Late blight can spread rapidly in cool, wet conditions and can destroy entire fields within days if not properly managed.',
    subcategoryId: 'vegetables',
    images: [
      {
        id: 'late-blight-image-1',
        url: 'https://example.com/images/late-blight-1.jpg',
        caption: 'Brown lesions with water-soaked appearance on tomato leaves',
        isHighResolution: true
      },
      {
        id: 'late-blight-image-2',
        url: 'https://example.com/images/late-blight-2.jpg',
        caption: 'White fuzzy growth on the underside of infected leaves',
        isHighResolution: true
      },
      {
        id: 'late-blight-image-3',
        url: 'https://example.com/images/late-blight-3.jpg',
        caption: 'Dark lesions on tomato stems',
        isHighResolution: true
      },
      {
        id: 'late-blight-image-4',
        url: 'https://example.com/images/late-blight-4.jpg',
        caption: 'Infected tomato fruit with brown, firm lesions',
        isHighResolution: true
      }
    ],
    symptoms: [
      'Pale green to brown spots on leaves, often beginning at leaf tips or edges',
      'Water-soaked appearance of leaf lesions',
      'White, fuzzy growth on the undersides of leaves in humid conditions',
      'Dark brown to black lesions on stems',
      'Firm, brown, irregular patches on green fruit',
      'Rapid wilting and death of foliage',
      'Distinctive foul odor from severely infected plants'
    ],
    causes: [
      'Infection by the oomycete Phytophthora infestans',
      'Spread by wind-blown spores that can travel long distances',
      'Splashing water that moves spores from soil to plants',
      'Movement of infected plant material',
      'Survival in potato tubers and volunteer plants'
    ],
    riskFactors: [
      'Cool temperatures (60-70°F, 15-21°C)',
      'High humidity or wet conditions with leaf wetness lasting more than 10-12 hours',
      'Poor air circulation around plants',
      'Overhead irrigation that keeps foliage wet',
      'Dense plantings that create humid microclimates',
      'Presence of infected plants in the vicinity',
      'Susceptible varieties without genetic resistance'
    ],
    diagnosis: 'Late blight can be diagnosed by the characteristic water-soaked lesions on leaves, white fuzzy growth on the undersides of leaves in humid conditions, and the rapid progression of symptoms. Laboratory testing can confirm the presence of Phytophthora infestans through microscopic examination or molecular techniques.',
    treatments: [
      {
        id: 'late-blight-treatment-1',
        name: 'Copper-based fungicides',
        type: 'chemical',
        description: 'Copper fungicides can help protect uninfected tissue from becoming infected.',
        dosage: 'Follow label instructions, typically 1-2 tablespoons per gallon of water for home gardens',
        applicationMethod: 'Thorough coverage of all plant surfaces, especially undersides of leaves',
        frequency: 'Apply every 5-7 days during favorable conditions',
        precautions: [
          'Apply before disease appears or at first sign of disease',
          'Do not apply in hot, sunny conditions to avoid leaf burn',
          'Observe pre-harvest intervals',
          'Wear appropriate protective equipment'
        ],
        effectiveness: 'medium',
        environmentalImpact: 'medium',
        cost: 'low'
      },
      {
        id: 'late-blight-treatment-2',
        name: 'Chlorothalonil fungicides',
        type: 'chemical',
        description: 'Broad-spectrum protectant fungicide effective against late blight.',
        dosage: 'Follow label instructions, typically 2 teaspoons per gallon for home gardens',
        applicationMethod: 'Thorough coverage of all plant surfaces',
        frequency: 'Apply every 7-10 days during favorable conditions',
        precautions: [
          'Apply before disease appears for best results',
          'Do not apply within 7 days of harvest',
          'Rotate with other fungicides to prevent resistance',
          'Wear appropriate protective equipment'
        ],
        effectiveness: 'high',
        environmentalImpact: 'medium',
        cost: 'medium'
      },
      {
        id: 'late-blight-treatment-3',
        name: 'Remove and destroy infected plants',
        type: 'cultural',
        description: 'Removing infected plants can help prevent the spread of the disease to healthy plants.',
        applicationMethod: 'Carefully remove infected plants, place in plastic bags, and dispose of them',
        frequency: 'As soon as infection is detected',
        precautions: [
          'Do not compost infected plant material',
          'Clean tools and hands after handling infected plants',
          'Work with infected plants when foliage is dry'
        ],
        effectiveness: 'medium',
        environmentalImpact: 'low',
        cost: 'low'
      }
    ],
    preventionMeasures: [
      'Plant resistant varieties when available',
      'Provide good air circulation by proper spacing and pruning',
      'Use drip irrigation or soaker hoses instead of overhead watering',
      'Water in the morning so foliage dries quickly',
      'Apply preventative fungicides before disease appears in high-risk conditions',
      'Practice crop rotation, avoiding tomatoes, potatoes, and related crops in the same area for 3-4 years',
      'Remove and destroy all plant debris at the end of the season',
      'Monitor plants regularly for early signs of disease',
      'Avoid working with plants when they are wet',
      'Use disease-free transplants and seed potatoes'
    ],
    tags: ['tomato', 'disease', 'fungal', 'blight', 'vegetables', 'potato']
  }
];

// Sample data for animal breeds
export const animalBreeds: EncyclopediaItem[] = [
  {
    id: 'cattle-breed-1',
    title: 'Holstein-Friesian',
    type: 'animal_breed',
    shortDescription: 'The world\'s highest-producing dairy cow, known for its distinctive black and white markings.',
    fullDescription: 'The Holstein-Friesian is a breed of dairy cattle originating from the Dutch provinces of North Holland and Friesland, and Schleswig-Holstein in Northern Germany. They are known for their high milk production and distinctive black and white markings. Holstein-Friesians are the most widespread cattle breed in the world.',
    subcategoryId: 'cattle',
    images: [
      {
        id: 'holstein-image-1',
        url: 'https://example.com/images/holstein-1.jpg',
        caption: 'Holstein-Friesian cow',
        isHighResolution: true
      },
      {
        id: 'holstein-image-2',
        url: 'https://example.com/images/holstein-2.jpg',
        caption: 'Holstein-Friesian herd',
        isHighResolution: true
      }
    ],
    tags: ['cattle', 'dairy', 'breed', 'milk production'],
    animalBreedInfo: {
      origin: 'Netherlands and Germany',
      characteristics: [
        'Black and white coat pattern',
        'Large frame',
        'Angular body shape',
        'Adult females weigh approximately 680 kg',
        'Adult males weigh approximately 1,000 kg',
        'Docile temperament'
      ],
      productionType: 'milk',
      productionStats: [
        {
          name: 'Milk yield',
          value: '7,500-9,000',
          unit: 'liters/lactation'
        },
        {
          name: 'Fat content',
          value: '3.6-3.8',
          unit: '%'
        },
        {
          name: 'Protein content',
          value: '3.2-3.3',
          unit: '%'
        },
        {
          name: 'Lactation period',
          value: '305',
          unit: 'days'
        }
      ],
      diseaseResistance: [
        {
          diseaseName: 'Mastitis',
          resistanceLevel: 'low'
        },
        {
          diseaseName: 'Lameness',
          resistanceLevel: 'medium'
        },
        {
          diseaseName: 'Metabolic disorders',
          resistanceLevel: 'low'
        }
      ],
      climateAdaptation: [
        {
          climateType: 'Temperate',
          adaptationLevel: 'high'
        },
        {
          climateType: 'Tropical',
          adaptationLevel: 'low'
        },
        {
          climateType: 'Arid',
          adaptationLevel: 'low'
        }
      ],
      breedingInfo: 'Holstein-Friesians reach sexual maturity at 9-12 months of age. The gestation period is approximately 280 days. Calving interval should ideally be 12-13 months for optimal production. Artificial insemination is widely used for breeding.',
      nutritionRequirements: 'High-quality forage and concentrated feed are required to support high milk production. Daily dry matter intake ranges from 3.5% to 4% of body weight. Balanced ration should include adequate protein, energy, minerals, and vitamins.',
      housingRequirements: 'Free-stall barns with comfortable bedding are ideal. Adequate ventilation is essential to prevent heat stress. Minimum space requirement is 9-10 m² per cow. Access to clean water and feed should be available at all times.'
    }
  },
  {
    id: 'cattle-breed-2',
    title: 'Angus',
    type: 'animal_breed',
    shortDescription: 'A beef cattle breed known for its high-quality marbled meat and natural polling.',
    fullDescription: 'The Angus breed (Aberdeen Angus in most countries) is a naturally polled beef cattle breed that originated in Scotland. They are known for their high-quality marbled meat, maternal abilities, and adaptability to various environments. Angus cattle are predominantly black, though there is also a red variant.',
    subcategoryId: 'cattle',
    images: [
      {
        id: 'angus-image-1',
        url: 'https://example.com/images/angus-1.jpg',
        caption: 'Black Angus bull',
        isHighResolution: true
      }
    ],
    tags: ['cattle', 'beef', 'breed', 'meat quality'],
    animalBreedInfo: {
      origin: 'Scotland',
      characteristics: [
        'Naturally polled (hornless)',
        'Black coat (Red Angus is a variant)',
        'Medium frame',
        'Compact body',
        'Adult females weigh approximately 550-700 kg',
        'Adult males weigh approximately 850-1,000 kg',
        'Moderate to good temperament'
      ],
      productionType: 'meat',
      productionStats: [
        {
          name: 'Daily weight gain',
          value: '1.3-1.8',
          unit: 'kg/day'
        },
        {
          name: 'Dressing percentage',
          value: '60-62',
          unit: '%'
        },
        {
          name: 'Marbling score',
          value: 'High',
          unit: ''
        },
        {
          name: 'Age at slaughter',
          value: '15-20',
          unit: 'months'
        }
      ],
      diseaseResistance: [
        {
          diseaseName: 'Pink eye',
          resistanceLevel: 'medium'
        },
        {
          diseaseName: 'Respiratory diseases',
          resistanceLevel: 'medium'
        },
        {
          diseaseName: 'Parasites',
          resistanceLevel: 'medium'
        }
      ],
      climateAdaptation: [
        {
          climateType: 'Temperate',
          adaptationLevel: 'high'
        },
        {
          climateType: 'Continental',
          adaptationLevel: 'high'
        },
        {
          climateType: 'Tropical',
          adaptationLevel: 'medium'
        }
      ],
      breedingInfo: 'Angus cattle reach sexual maturity early, with heifers often bred at 14-15 months of age. The gestation period is approximately 283 days. They have good calving ease and strong maternal instincts. Bulls can service 25-30 cows in a natural breeding program.',
      nutritionRequirements: 'Angus cattle perform well on pasture-based systems. They have good feed conversion efficiency. During finishing, a high-energy diet promotes marbling. Mineral supplementation should be adjusted based on local deficiencies.',
      housingRequirements: 'Angus cattle are adaptable to various housing systems. They perform well in pasture-based operations with minimal shelter requirements. In feedlot settings, provide 15-20 m² per animal with adequate shade and windbreaks.'
    }
  }
];

// Sample data for plant varieties
export const plantVarieties: EncyclopediaItem[] = [
  {
    id: 'wheat-variety-1',
    title: 'Hard Red Winter Wheat',
    type: 'plant_variety',
    shortDescription: 'A high-protein wheat variety planted in autumn and harvested in early summer.',
    fullDescription: 'Hard Red Winter Wheat is a high-protein wheat variety that is planted in autumn and harvested in early summer in temperate regions. It is primarily used for bread flour due to its high gluten content. This variety is winter hardy and can withstand cold temperatures during the dormant period.',
    subcategoryId: 'cereals',
    images: [
      {
        id: 'hrww-image-1',
        url: 'https://example.com/images/hard-red-winter-wheat-1.jpg',
        caption: 'Hard Red Winter Wheat field',
        isHighResolution: true
      },
      {
        id: 'hrww-image-2',
        url: 'https://example.com/images/hard-red-winter-wheat-2.jpg',
        caption: 'Hard Red Winter Wheat grains',
        isHighResolution: true
      }
    ],
    tags: ['wheat', 'cereal', 'grain', 'winter crop'],
    plantVarietyInfo: {
      origin: 'United States',
      characteristics: [
        'Red kernel color',
        'Hard endosperm texture',
        'High protein content (12-15%)',
        'Winter growth habit',
        'Medium to tall plant height',
        'Awned heads (with bristles)'
      ],
      growthCycle: [
        {
          stage: 'Germination and emergence',
          durationDays: 7,
          description: 'Seeds germinate and seedlings emerge from the soil.'
        },
        {
          stage: 'Tillering',
          durationDays: 21,
          description: 'Multiple stems develop from the crown of the plant.'
        },
        {
          stage: 'Winter dormancy',
          durationDays: 90,
          description: 'Growth slows or stops during cold winter months.'
        },
        {
          stage: 'Stem elongation',
          durationDays: 30,
          description: 'Rapid vertical growth occurs as temperatures warm in spring.'
        },
        {
          stage: 'Heading and flowering',
          durationDays: 10,
          description: 'Heads emerge and flowering occurs.'
        },
        {
          stage: 'Grain filling',
          durationDays: 30,
          description: 'Kernels develop and fill with starch and protein.'
        },
        {
          stage: 'Ripening',
          durationDays: 15,
          description: 'Grain matures and dries down for harvest.'
        }
      ],
      plantingInfo: {
        sowingPeriod: 'September to October (Northern Hemisphere)',
        harvestPeriod: 'June to July (Northern Hemisphere)',
        sowingDepth: '2.5-5 cm',
        plantSpacing: 'Row spacing of 15-20 cm',
        rowSpacing: '15-20 cm'
      },
      waterRequirements: 'medium',
      wateringSchedule: 'Requires 450-650 mm of water throughout the growing season. Critical periods for water are at tillering, stem elongation, and grain filling stages.',
      soilRequirements: {
        soilType: ['Loam', 'Clay loam', 'Silt loam'],
        pHRange: {
          min: 6.0,
          max: 7.5
        },
        drainageLevel: 'good'
      },
      fertilizerRecommendations: [
        {
          type: 'Nitrogen (N)',
          applicationRate: '80-120 kg/ha',
          frequency: 'Split application',
          timing: '30% at planting, 70% at spring green-up'
        },
        {
          type: 'Phosphorus (P2O5)',
          applicationRate: '40-60 kg/ha',
          frequency: 'Once',
          timing: 'At planting'
        },
        {
          type: 'Potassium (K2O)',
          applicationRate: '30-50 kg/ha',
          frequency: 'Once',
          timing: 'At planting'
        }
      ],
      pestManagement: {
        commonPests: ['Aphids', 'Hessian fly', 'Wheat stem sawfly', 'Cereal leaf beetle'],
        preventionMethods: [
          'Crop rotation',
          'Delayed planting to avoid pest cycles',
          'Use of resistant varieties',
          'Field monitoring'
        ],
        treatments: [
          'Insecticides when thresholds are reached',
          'Biological control agents',
          'Integrated pest management approaches'
        ]
      },
      diseaseManagement: {
        commonDiseases: ['Leaf rust', 'Stripe rust', 'Powdery mildew', 'Fusarium head blight'],
        preventionMethods: [
          'Use of resistant varieties',
          'Crop rotation',
          'Proper residue management',
          'Balanced nutrition'
        ],
        treatments: [
          'Fungicide applications at flag leaf and heading stages',
          'Seed treatments',
          'Cultural practices to reduce humidity in the canopy'
        ]
      },
      expectedYield: {
        minYield: 3.0,
        maxYield: 6.0,
        unit: 'tons/ha',
        conditions: 'Under optimal growing conditions with adequate moisture and fertility'
      },
      storageRequirements: 'Store at moisture content below 13%. Maintain cool, dry conditions. Monitor for insect infestations and mold development. Aeration may be necessary to maintain grain quality.'
    }
  },
  {
    id: 'maize-variety-1',
    title: 'Tropical Hybrid Maize',
    type: 'plant_variety',
    shortDescription: 'A high-yielding maize variety adapted to tropical and subtropical regions.',
    fullDescription: 'Tropical Hybrid Maize is specifically bred for high yields in tropical and subtropical environments. These hybrids combine disease resistance, heat tolerance, and drought tolerance with high yield potential. They are widely grown in developing countries and play a crucial role in food security.',
    subcategoryId: 'cereals',
    images: [
      {
        id: 'thm-image-1',
        url: 'https://example.com/images/tropical-hybrid-maize-1.jpg',
        caption: 'Tropical Hybrid Maize field',
        isHighResolution: true
      }
    ],
    tags: ['maize', 'corn', 'cereal', 'tropical'],
    plantVarietyInfo: {
      origin: 'International breeding programs',
      characteristics: [
        'Yellow or white kernel color',
        'Medium to tall plant height (180-220 cm)',
        'Single stem with multiple ears',
        'Tropical adaptation',
        'Disease resistance',
        'Heat tolerance'
      ],
      growthCycle: [
        {
          stage: 'Germination and emergence',
          durationDays: 7,
          description: 'Seeds germinate and seedlings emerge from the soil.'
        },
        {
          stage: 'Vegetative growth',
          durationDays: 50,
          description: 'Leaf development and stem elongation occur.'
        },
        {
          stage: 'Tasseling and silking',
          durationDays: 10,
          description: 'Male flowers (tassels) emerge and female flowers (silks) appear.'
        },
        {
          stage: 'Pollination and fertilization',
          durationDays: 7,
          description: 'Pollen is shed and silks are fertilized.'
        },
        {
          stage: 'Grain filling',
          durationDays: 35,
          description: 'Kernels develop and accumulate starch.'
        },
        {
          stage: 'Maturation and drying',
          durationDays: 15,
          description: 'Grain matures and moisture content decreases.'
        }
      ],
      plantingInfo: {
        sowingPeriod: 'Beginning of rainy season',
        harvestPeriod: '110-120 days after planting',
        sowingDepth: '3-5 cm',
        plantSpacing: '25-30 cm between plants',
        rowSpacing: '75-80 cm between rows'
      },
      waterRequirements: 'high',
      wateringSchedule: 'Requires 500-800 mm of water throughout the growing season. Critical periods for water are at tasseling, silking, and early grain filling stages.',
      soilRequirements: {
        soilType: ['Loam', 'Sandy loam', 'Clay loam'],
        pHRange: {
          min: 5.5,
          max: 7.5
        },
        drainageLevel: 'good'
      },
      fertilizerRecommendations: [
        {
          type: 'Nitrogen (N)',
          applicationRate: '120-180 kg/ha',
          frequency: 'Split application',
          timing: '30% at planting, 70% at knee-high stage'
        },
        {
          type: 'Phosphorus (P2O5)',
          applicationRate: '60-80 kg/ha',
          frequency: 'Once',
          timing: 'At planting'
        },
        {
          type: 'Potassium (K2O)',
          applicationRate: '60-100 kg/ha',
          frequency: 'Once',
          timing: 'At planting'
        }
      ],
      pestManagement: {
        commonPests: ['Fall armyworm', 'Stem borers', 'Rootworms', 'Earworms'],
        preventionMethods: [
          'Crop rotation',
          'Early planting',
          'Use of resistant varieties',
          'Field monitoring'
        ],
        treatments: [
          'Insecticides when thresholds are reached',
          'Biological control agents',
          'Bt maize varieties where approved'
        ]
      },
      diseaseManagement: {
        commonDiseases: ['Maize streak virus', 'Gray leaf spot', 'Northern corn leaf blight', 'Ear rots'],
        preventionMethods: [
          'Use of resistant varieties',
          'Crop rotation',
          'Proper residue management',
          'Balanced nutrition'
        ],
        treatments: [
          'Fungicide applications',
          'Seed treatments',
          'Cultural practices to reduce disease pressure'
        ]
      },
      expectedYield: {
        minYield: 4.0,
        maxYield: 8.0,
        unit: 'tons/ha',
        conditions: 'Under optimal growing conditions with adequate moisture and fertility'
      },
      storageRequirements: 'Store at moisture content below 13%. Use clean, dry storage facilities. Protect from insects and rodents. In tropical regions, special attention to humidity control is necessary to prevent mold and aflatoxin development.'
    }
  }
];

// Initialize the subcategory items
encyclopediaCategories.forEach(category => {
  category.subcategories.forEach(subcategory => {
    if (subcategory.id === 'cattle') {
      subcategory.items = [...cattleDiseases, ...animalBreeds];
    } else if (subcategory.id === 'cereals') {
      subcategory.items = [...cropDiseases, ...plantVarieties];
    }
  });
});
