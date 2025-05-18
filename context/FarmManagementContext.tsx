import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useOffline } from './OfflineContext';
import { useUser } from './UserContext';
import { STORAGE_KEYS } from '@/utils/storage';
import { 
  FarmLogEntry, 
  LogEntryType, 
  LogEntryCategory,
  sampleLogEntries 
} from '@/data/farm-management';

// Interface pour les statistiques
export interface FarmStatistics {
  // Statistiques générales
  totalEntries: number;
  entriesByCategory: Record<LogEntryCategory, number>;
  entriesByType: Record<LogEntryType, number>;
  
  // Statistiques financières
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
  
  // Statistiques des cultures
  totalHarvest: Record<string, { amount: number, unit: string }>;
  averageYield: Record<string, { amount: number, unit: string }>;
  
  // Statistiques du bétail
  animalCount: Record<string, number>;
  birthRate: Record<string, number>;
  mortalityRate: Record<string, number>;
}

// Interface pour les filtres
export interface LogEntryFilters {
  startDate?: string;
  endDate?: string;
  types?: LogEntryType[];
  categories?: LogEntryCategory[];
  tags?: string[];
  searchQuery?: string;
}

// Interface pour le contexte
interface FarmManagementContextType {
  // Données
  logEntries: FarmLogEntry[];
  isLoading: boolean;
  
  // Gestion des entrées
  addLogEntry: (entry: Omit<FarmLogEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FarmLogEntry>;
  updateLogEntry: (id: string, updates: Partial<FarmLogEntry>) => Promise<FarmLogEntry | null>;
  deleteLogEntry: (id: string) => Promise<boolean>;
  
  // Filtrage et recherche
  filteredEntries: FarmLogEntry[];
  filters: LogEntryFilters;
  setFilters: (filters: LogEntryFilters) => void;
  clearFilters: () => void;
  
  // Statistiques
  statistics: FarmStatistics;
  calculateStatistics: (entries?: FarmLogEntry[]) => FarmStatistics;
  
  // Exportation
  exportToCsv: () => Promise<string | null>;
  exportToPdf: () => Promise<string | null>;
  
  // Synchronisation
  refreshLogEntries: () => Promise<void>;
}

// Création du contexte avec des valeurs par défaut
const FarmManagementContext = createContext<FarmManagementContextType>({
  logEntries: [],
  isLoading: false,
  
  addLogEntry: async () => ({ id: '', type: 'note', category: 'general', title: '', description: '', date: '', createdAt: '', updatedAt: '', tags: [] }),
  updateLogEntry: async () => null,
  deleteLogEntry: async () => false,
  
  filteredEntries: [],
  filters: {},
  setFilters: () => {},
  clearFilters: () => {},
  
  statistics: {
    totalEntries: 0,
    entriesByCategory: { animal: 0, crop: 0, finance: 0, general: 0 },
    entriesByType: {
      animal_health: 0, vaccination: 0, disease: 0, birth: 0, death: 0,
      planting: 0, fertilization: 0, irrigation: 0, pest_control: 0, harvest: 0,
      expense: 0, income: 0, investment: 0,
      note: 0, weather: 0, maintenance: 0
    },
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    incomeByCategory: {},
    expensesByCategory: {},
    totalHarvest: {},
    averageYield: {},
    animalCount: {},
    birthRate: {},
    mortalityRate: {}
  },
  calculateStatistics: () => ({
    totalEntries: 0,
    entriesByCategory: { animal: 0, crop: 0, finance: 0, general: 0 },
    entriesByType: {
      animal_health: 0, vaccination: 0, disease: 0, birth: 0, death: 0,
      planting: 0, fertilization: 0, irrigation: 0, pest_control: 0, harvest: 0,
      expense: 0, income: 0, investment: 0,
      note: 0, weather: 0, maintenance: 0
    },
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    incomeByCategory: {},
    expensesByCategory: {},
    totalHarvest: {},
    averageYield: {},
    animalCount: {},
    birthRate: {},
    mortalityRate: {}
  }),
  
  exportToCsv: async () => null,
  exportToPdf: async () => null,
  
  refreshLogEntries: async () => {}
});

// Hook personnalisé pour utiliser le contexte
export const useFarmManagement = () => useContext(FarmManagementContext);

// Fournisseur du contexte
export const FarmManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOnline } = useOffline();
  const { primaryUserType } = useUser();
  
  const [logEntries, setLogEntries] = useState<FarmLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<LogEntryFilters>({});
  const [statistics, setStatistics] = useState<FarmStatistics>({
    totalEntries: 0,
    entriesByCategory: { animal: 0, crop: 0, finance: 0, general: 0 },
    entriesByType: {
      animal_health: 0, vaccination: 0, disease: 0, birth: 0, death: 0,
      planting: 0, fertilization: 0, irrigation: 0, pest_control: 0, harvest: 0,
      expense: 0, income: 0, investment: 0,
      note: 0, weather: 0, maintenance: 0
    },
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    incomeByCategory: {},
    expensesByCategory: {},
    totalHarvest: {},
    averageYield: {},
    animalCount: {},
    birthRate: {},
    mortalityRate: {}
  });
  
  // Charger les entrées depuis le stockage local au démarrage
  useEffect(() => {
    loadLogEntries();
  }, []);
  
  // Recalculer les statistiques lorsque les entrées changent
  useEffect(() => {
    const stats = calculateStatistics(logEntries);
    setStatistics(stats);
  }, [logEntries]);
  
  // Charger les entrées depuis le stockage local
  const loadLogEntries = async () => {
    setIsLoading(true);
    try {
      const storedEntries = await AsyncStorage.getItem(STORAGE_KEYS.FARM_LOG_ENTRIES);
      
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries) as FarmLogEntry[];
        setLogEntries(parsedEntries);
      } else {
        // Utiliser les exemples pour la démo
        setLogEntries(sampleLogEntries);
        await AsyncStorage.setItem(STORAGE_KEYS.FARM_LOG_ENTRIES, JSON.stringify(sampleLogEntries));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des entrées du carnet de bord:', error);
      Alert.alert('Erreur', 'Impossible de charger les données du carnet de bord.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sauvegarder les entrées dans le stockage local
  const saveLogEntries = async (entries: FarmLogEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FARM_LOG_ENTRIES, JSON.stringify(entries));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des entrées du carnet de bord:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les données du carnet de bord.');
    }
  };
  
  // Ajouter une nouvelle entrée
  const addLogEntry = async (entry: Omit<FarmLogEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newEntry: FarmLogEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    
    const updatedEntries = [newEntry, ...logEntries];
    setLogEntries(updatedEntries);
    await saveLogEntries(updatedEntries);
    
    return newEntry;
  };
  
  // Mettre à jour une entrée existante
  const updateLogEntry = async (id: string, updates: Partial<FarmLogEntry>) => {
    const entryIndex = logEntries.findIndex(entry => entry.id === id);
    
    if (entryIndex === -1) {
      return null;
    }
    
    const updatedEntry: FarmLogEntry = {
      ...logEntries[entryIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const updatedEntries = [...logEntries];
    updatedEntries[entryIndex] = updatedEntry;
    
    setLogEntries(updatedEntries);
    await saveLogEntries(updatedEntries);
    
    return updatedEntry;
  };
  
  // Supprimer une entrée
  const deleteLogEntry = async (id: string) => {
    const updatedEntries = logEntries.filter(entry => entry.id !== id);
    
    if (updatedEntries.length === logEntries.length) {
      return false;
    }
    
    setLogEntries(updatedEntries);
    await saveLogEntries(updatedEntries);
    
    return true;
  };
  
  // Filtrer les entrées selon les critères
  const getFilteredEntries = (): FarmLogEntry[] => {
    if (!filters || Object.keys(filters).length === 0) {
      return logEntries;
    }
    
    return logEntries.filter(entry => {
      // Filtre par date
      if (filters.startDate && new Date(entry.date) < new Date(filters.startDate)) {
        return false;
      }
      
      if (filters.endDate && new Date(entry.date) > new Date(filters.endDate)) {
        return false;
      }
      
      // Filtre par type
      if (filters.types && filters.types.length > 0 && !filters.types.includes(entry.type)) {
        return false;
      }
      
      // Filtre par catégorie
      if (filters.categories && filters.categories.length > 0 && !filters.categories.includes(entry.category)) {
        return false;
      }
      
      // Filtre par tags
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = entry.tags.some(tag => filters.tags!.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }
      
      // Filtre par recherche
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = entry.title.toLowerCase().includes(query);
        const matchesDescription = entry.description.toLowerCase().includes(query);
        const matchesTags = entry.tags.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesTitle && !matchesDescription && !matchesTags) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  // Réinitialiser les filtres
  const clearFilters = () => {
    setFilters({});
  };
  
  // Calculer les statistiques
  const calculateStatistics = (entries: FarmLogEntry[] = logEntries): FarmStatistics => {
    // Initialiser les statistiques
    const stats: FarmStatistics = {
      totalEntries: entries.length,
      entriesByCategory: { animal: 0, crop: 0, finance: 0, general: 0 },
      entriesByType: {
        animal_health: 0, vaccination: 0, disease: 0, birth: 0, death: 0,
        planting: 0, fertilization: 0, irrigation: 0, pest_control: 0, harvest: 0,
        expense: 0, income: 0, investment: 0,
        note: 0, weather: 0, maintenance: 0
      },
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      incomeByCategory: {},
      expensesByCategory: {},
      totalHarvest: {},
      averageYield: {},
      animalCount: {},
      birthRate: {},
      mortalityRate: {}
    };
    
    // Calculer les statistiques à partir des entrées
    entries.forEach(entry => {
      // Compter par catégorie et type
      stats.entriesByCategory[entry.category]++;
      stats.entriesByType[entry.type]++;
      
      // Statistiques financières
      if (entry.type === 'income') {
        stats.totalIncome += entry.amount;
        
        const category = entry.incomeCategory;
        stats.incomeByCategory[category] = (stats.incomeByCategory[category] || 0) + entry.amount;
      }
      
      if (entry.type === 'expense') {
        stats.totalExpenses += entry.amount;
        
        const category = entry.expenseCategory;
        stats.expensesByCategory[category] = (stats.expensesByCategory[category] || 0) + entry.amount;
      }
      
      // Statistiques des récoltes
      if (entry.type === 'harvest') {
        const cropType = entry.cropType;
        
        if (!stats.totalHarvest[cropType]) {
          stats.totalHarvest[cropType] = { amount: 0, unit: entry.yieldUnit };
        }
        
        stats.totalHarvest[cropType].amount += entry.yield;
      }
      
      // Statistiques des animaux
      if (entry.type === 'birth' && entry.animalType) {
        stats.animalCount[entry.animalType] = (stats.animalCount[entry.animalType] || 0) + entry.numberOfOffspring;
      }
      
      if (entry.type === 'death' && entry.animalType) {
        stats.animalCount[entry.animalType] = (stats.animalCount[entry.animalType] || 0) - 1;
      }
    });
    
    // Calculer le profit net
    stats.netProfit = stats.totalIncome - stats.totalExpenses;
    
    return stats;
  };
  
  // Exporter au format CSV
  const exportToCsv = async (): Promise<string | null> => {
    try {
      // Logique d'exportation CSV à implémenter
      Alert.alert('Exportation CSV', 'Fonctionnalité à implémenter');
      return null;
    } catch (error) {
      console.error('Erreur lors de l\'exportation CSV:', error);
      Alert.alert('Erreur', 'Impossible d\'exporter les données au format CSV.');
      return null;
    }
  };
  
  // Exporter au format PDF
  const exportToPdf = async (): Promise<string | null> => {
    try {
      // Logique d'exportation PDF à implémenter
      Alert.alert('Exportation PDF', 'Fonctionnalité à implémenter');
      return null;
    } catch (error) {
      console.error('Erreur lors de l\'exportation PDF:', error);
      Alert.alert('Erreur', 'Impossible d\'exporter les données au format PDF.');
      return null;
    }
  };
  
  // Rafraîchir les entrées (simuler une synchronisation avec le serveur)
  const refreshLogEntries = async () => {
    if (!isOnline) {
      Alert.alert('Mode hors ligne', 'Impossible de synchroniser les données en mode hors ligne.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simuler une requête réseau
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dans une application réelle, on ferait une requête API ici
      // Pour la démo, on utilise simplement les données locales
      
      Alert.alert('Synchronisation réussie', 'Les données ont été synchronisées avec succès.');
    } catch (error) {
      console.error('Erreur lors de la synchronisation des données:', error);
      Alert.alert('Erreur', 'Impossible de synchroniser les données. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <FarmManagementContext.Provider
      value={{
        logEntries,
        isLoading,
        
        addLogEntry,
        updateLogEntry,
        deleteLogEntry,
        
        filteredEntries: getFilteredEntries(),
        filters,
        setFilters,
        clearFilters,
        
        statistics,
        calculateStatistics,
        
        exportToCsv,
        exportToPdf,
        
        refreshLogEntries
      }}
    >
      {children}
    </FarmManagementContext.Provider>
  );
};
