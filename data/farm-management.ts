// Types et données pour le module de Suivi et Gestion de l'Exploitation

// Types d'entrées du carnet de bord
export type LogEntryType = 
  // Santé des animaux
  | 'animal_health' 
  | 'vaccination'
  | 'disease'
  | 'birth'
  | 'death'
  // Cycles des cultures
  | 'planting'
  | 'fertilization'
  | 'irrigation'
  | 'pest_control'
  | 'harvest'
  // Finances
  | 'expense'
  | 'income'
  | 'investment'
  // Général
  | 'note'
  | 'weather'
  | 'maintenance';

// Catégories d'entrées
export type LogEntryCategory = 'animal' | 'crop' | 'finance' | 'general';

// Interface de base pour une entrée du carnet de bord
export interface LogEntry {
  id: string;
  type: LogEntryType;
  category: LogEntryCategory;
  title: string;
  description: string;
  date: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  tags: string[];
  images?: string[]; // URLs des images
  location?: {
    name: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    }
  };
  weather?: {
    temperature?: number;
    conditions?: string;
    humidity?: number;
  };
}

// Interface pour une entrée de santé animale
export interface AnimalHealthEntry extends LogEntry {
  category: 'animal';
  animalType: string; // ex: 'cattle', 'sheep', 'goat'
  animalId?: string; // Identifiant de l'animal si disponible
  animalGroup?: string; // Groupe d'animaux (ex: "Troupeau Nord")
  count?: number; // Nombre d'animaux concernés
  symptoms?: string[];
  treatment?: string;
  medicationUsed?: string[];
  dosage?: string;
  veterinarian?: string;
  followUpDate?: string; // ISO date string
}

// Interface pour une entrée de vaccination
export interface VaccinationEntry extends AnimalHealthEntry {
  type: 'vaccination';
  vaccineName: string;
  vaccineType: string;
  batchNumber?: string;
  expiryDate?: string; // ISO date string
  boosterRequired?: boolean;
  boosterDate?: string; // ISO date string
}

// Interface pour une entrée de maladie
export interface DiseaseEntry extends AnimalHealthEntry {
  type: 'disease';
  diseaseName: string;
  diagnosisDate: string; // ISO date string
  severity: 'low' | 'medium' | 'high';
  quarantined: boolean;
  recoveryDate?: string; // ISO date string
  outcome?: 'recovered' | 'ongoing' | 'death';
}

// Interface pour une entrée de naissance
export interface BirthEntry extends AnimalHealthEntry {
  type: 'birth';
  motherAnimalId?: string;
  numberOfOffspring: number;
  offspringGender?: ('male' | 'female')[];
  offspringIds?: string[];
  birthWeight?: number[];
  complications?: string;
}

// Interface pour une entrée de décès
export interface DeathEntry extends AnimalHealthEntry {
  type: 'death';
  cause?: string;
  postMortemPerformed?: boolean;
  postMortemResults?: string;
}

// Interface pour une entrée de culture
export interface CropEntry extends LogEntry {
  category: 'crop';
  cropType: string; // ex: 'maize', 'rice', 'cotton'
  fieldName: string;
  fieldSize?: number; // en hectares
  fieldId?: string;
  variety?: string;
  season?: string;
}

// Interface pour une entrée de plantation
export interface PlantingEntry extends CropEntry {
  type: 'planting';
  seedQuantity: number;
  seedUnit: string; // ex: 'kg', 'bags'
  seedSource: string;
  seedCost?: number;
  plantingMethod: string;
  rowSpacing?: number;
  plantSpacing?: number;
  expectedHarvestDate?: string; // ISO date string
}

// Interface pour une entrée de fertilisation
export interface FertilizationEntry extends CropEntry {
  type: 'fertilization';
  fertilizerType: string;
  fertilizerName: string;
  quantity: number;
  unit: string; // ex: 'kg', 'bags'
  applicationMethod: string;
  cost?: number;
}

// Interface pour une entrée d'irrigation
export interface IrrigationEntry extends CropEntry {
  type: 'irrigation';
  waterSource: string;
  quantity?: number;
  unit?: string; // ex: 'liters', 'hours'
  method: string;
  duration?: number; // en heures
}

// Interface pour une entrée de contrôle des ravageurs
export interface PestControlEntry extends CropEntry {
  type: 'pest_control';
  pestType: string;
  pestName: string;
  controlMethod: string;
  productUsed?: string;
  quantity?: number;
  unit?: string;
  cost?: number;
  effectiveness?: 'low' | 'medium' | 'high';
}

// Interface pour une entrée de récolte
export interface HarvestEntry extends CropEntry {
  type: 'harvest';
  yield: number;
  yieldUnit: string; // ex: 'kg', 'tons'
  quality: 'poor' | 'average' | 'good' | 'excellent';
  notes?: string;
  marketValue?: number;
  storage?: string;
}

// Interface pour une entrée financière
export interface FinanceEntry extends LogEntry {
  category: 'finance';
  amount: number;
  currency: string; // ex: 'XOF', 'USD'
  paymentMethod?: string;
  relatedEntryId?: string; // ID d'une autre entrée liée
  receipt?: string; // URL de l'image du reçu
}

// Interface pour une entrée de dépense
export interface ExpenseEntry extends FinanceEntry {
  type: 'expense';
  expenseCategory: string; // ex: 'seeds', 'fertilizer', 'labor', 'equipment'
  vendor?: string;
  invoiceNumber?: string;
}

// Interface pour une entrée de revenu
export interface IncomeEntry extends FinanceEntry {
  type: 'income';
  incomeCategory: string; // ex: 'crop_sale', 'animal_sale', 'animal_products'
  customer?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
}

// Interface pour une entrée d'investissement
export interface InvestmentEntry extends FinanceEntry {
  type: 'investment';
  investmentType: string; // ex: 'equipment', 'infrastructure', 'land'
  expectedLifespan?: number; // en années
  depreciationRate?: number; // en pourcentage
}

// Interface pour une entrée générale
export interface GeneralEntry extends LogEntry {
  category: 'general';
}

// Interface pour une entrée de note
export interface NoteEntry extends GeneralEntry {
  type: 'note';
  priority?: 'low' | 'medium' | 'high';
}

// Interface pour une entrée météo
export interface WeatherEntry extends GeneralEntry {
  type: 'weather';
  temperature: number;
  conditions: string;
  humidity?: number;
  rainfall?: number;
  windSpeed?: number;
  impact?: string;
}

// Interface pour une entrée de maintenance
export interface MaintenanceEntry extends GeneralEntry {
  type: 'maintenance';
  equipmentName?: string;
  maintenanceType: string; // ex: 'repair', 'service', 'inspection'
  cost?: number;
  nextMaintenanceDate?: string; // ISO date string
}

// Type union pour toutes les entrées
export type FarmLogEntry = 
  | AnimalHealthEntry
  | VaccinationEntry
  | DiseaseEntry
  | BirthEntry
  | DeathEntry
  | CropEntry
  | PlantingEntry
  | FertilizationEntry
  | IrrigationEntry
  | PestControlEntry
  | HarvestEntry
  | FinanceEntry
  | ExpenseEntry
  | IncomeEntry
  | InvestmentEntry
  | GeneralEntry
  | NoteEntry
  | WeatherEntry
  | MaintenanceEntry;

// Exemple de données pour le carnet de bord
export const sampleLogEntries: FarmLogEntry[] = [
  // Exemples d'entrées de santé animale
  {
    id: 'vac-001',
    type: 'vaccination',
    category: 'animal',
    title: 'Vaccination contre la fièvre aphteuse',
    description: 'Vaccination annuelle du troupeau de bovins contre la fièvre aphteuse',
    date: '2023-05-15T09:30:00Z',
    createdAt: '2023-05-15T09:45:00Z',
    updatedAt: '2023-05-15T09:45:00Z',
    tags: ['vaccination', 'bovins', 'préventif'],
    animalType: 'cattle',
    animalGroup: 'Troupeau principal',
    count: 45,
    vaccineName: 'Aftovax',
    vaccineType: 'Inactivé',
    batchNumber: 'AFT-2023-05-123',
    expiryDate: '2024-05-15T00:00:00Z',
    boosterRequired: true,
    boosterDate: '2024-05-15T00:00:00Z',
    location: {
      name: 'Enclos principal'
    }
  },
  {
    id: 'birth-001',
    type: 'birth',
    category: 'animal',
    title: 'Naissance de veaux',
    description: 'Trois veaux nés sans complications',
    date: '2023-06-10T05:15:00Z',
    createdAt: '2023-06-10T07:30:00Z',
    updatedAt: '2023-06-10T07:30:00Z',
    tags: ['naissance', 'bovins', 'reproduction'],
    animalType: 'cattle',
    motherAnimalId: 'COW-235',
    numberOfOffspring: 3,
    offspringGender: ['male', 'female', 'female'],
    offspringIds: ['CALF-001', 'CALF-002', 'CALF-003'],
    birthWeight: [28, 25, 26],
    location: {
      name: 'Étable de mise bas'
    }
  },
  
  // Exemples d'entrées de culture
  {
    id: 'plant-001',
    type: 'planting',
    category: 'crop',
    title: 'Semis de maïs',
    description: 'Semis de maïs variété ZM523 dans le champ Est',
    date: '2023-04-05T08:00:00Z',
    createdAt: '2023-04-05T16:30:00Z',
    updatedAt: '2023-04-05T16:30:00Z',
    tags: ['maïs', 'semis', 'saison des pluies'],
    cropType: 'maize',
    fieldName: 'Champ Est',
    fieldSize: 2.5,
    variety: 'ZM523',
    season: 'Saison des pluies 2023',
    seedQuantity: 25,
    seedUnit: 'kg',
    seedSource: 'Coopérative agricole locale',
    seedCost: 15000,
    plantingMethod: 'Semoir mécanique',
    rowSpacing: 75,
    plantSpacing: 25,
    expectedHarvestDate: '2023-07-20T00:00:00Z',
    location: {
      name: 'Champ Est',
      coordinates: {
        latitude: 12.3456,
        longitude: -1.2345
      }
    },
    weather: {
      temperature: 28,
      conditions: 'Ensoleillé',
      humidity: 65
    }
  },
  {
    id: 'harvest-001',
    type: 'harvest',
    category: 'crop',
    title: 'Récolte de maïs',
    description: 'Récolte du maïs dans le champ Est',
    date: '2023-07-25T07:00:00Z',
    createdAt: '2023-07-25T18:45:00Z',
    updatedAt: '2023-07-25T18:45:00Z',
    tags: ['maïs', 'récolte', 'saison des pluies'],
    cropType: 'maize',
    fieldName: 'Champ Est',
    fieldSize: 2.5,
    variety: 'ZM523',
    season: 'Saison des pluies 2023',
    yield: 5750,
    yieldUnit: 'kg',
    quality: 'good',
    notes: 'Rendement légèrement supérieur aux attentes malgré une période sèche en juin',
    marketValue: 1150000,
    storage: 'Grenier principal',
    location: {
      name: 'Champ Est',
      coordinates: {
        latitude: 12.3456,
        longitude: -1.2345
      }
    }
  },
  
  // Exemples d'entrées financières
  {
    id: 'exp-001',
    type: 'expense',
    category: 'finance',
    title: 'Achat d\'engrais',
    description: 'Achat d\'engrais NPK pour la saison',
    date: '2023-03-20T10:15:00Z',
    createdAt: '2023-03-20T10:30:00Z',
    updatedAt: '2023-03-20T10:30:00Z',
    tags: ['engrais', 'intrants', 'dépense'],
    amount: 75000,
    currency: 'XOF',
    paymentMethod: 'Espèces',
    expenseCategory: 'fertilizer',
    vendor: 'Agro-Intrants SARL',
    invoiceNumber: 'INV-2023-0342'
  },
  {
    id: 'inc-001',
    type: 'income',
    category: 'finance',
    title: 'Vente de lait',
    description: 'Vente hebdomadaire de lait à la coopérative',
    date: '2023-06-18T16:00:00Z',
    createdAt: '2023-06-18T16:45:00Z',
    updatedAt: '2023-06-18T16:45:00Z',
    tags: ['lait', 'vente', 'revenu'],
    amount: 35000,
    currency: 'XOF',
    paymentMethod: 'Mobile Money',
    incomeCategory: 'animal_products',
    customer: 'Coopérative laitière du village',
    quantity: 70,
    unit: 'litres',
    unitPrice: 500
  }
];
