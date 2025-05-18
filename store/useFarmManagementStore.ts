import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@/constants/Config';
import { 
  FarmLogEntry, 
  LogEntryType, 
  LogEntryCategory,
  sampleLogEntries 
} from '@/data/farm-management';

// Définition des types
export interface FarmStatistics {
  totalEntries: number;
  entriesByCategory: Record<LogEntryCategory, number>;
  entriesByType: Record<LogEntryType, number>;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
  totalHarvest: Record<string, { amount: number, unit: string }>;
  averageYield: Record<string, { amount: number, unit: string }>;
  animalCount: Record<string, number>;
  birthRate: Record<string, number>;
  mortalityRate: Record<string, number>;
}

export interface LogEntryFilters {
  startDate?: string;
  endDate?: string;
  types?: LogEntryType[];
  categories?: LogEntryCategory[];
  tags?: string[];
  searchQuery?: string;
}

interface FarmManagementState {
  logEntries: FarmLogEntry[];
  filteredEntries: FarmLogEntry[];
  filters: LogEntryFilters;
  statistics: FarmStatistics;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLogEntries: () => Promise<void>;
  addLogEntry: (entry: Omit<FarmLogEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FarmLogEntry>;
  updateLogEntry: (id: string, updates: Partial<FarmLogEntry>) => Promise<FarmLogEntry | null>;
  deleteLogEntry: (id: string) => Promise<boolean>;
  setFilters: (filters: LogEntryFilters) => void;
  clearFilters: () => void;
  calculateStatistics: (entries?: FarmLogEntry[]) => FarmStatistics;
  exportToCsv: () => Promise<string | null>;
  exportToPdf: () => Promise<string | null>;
  clearError: () => void;
}

// Statistiques par défaut
const defaultStatistics: FarmStatistics = {
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
};

// Création du store avec persistance
export const useFarmManagementStore = create<FarmManagementState>()(
  persist(
    (set, get) => ({
      logEntries: [],
      filteredEntries: [],
      filters: {},
      statistics: defaultStatistics,
      isLoading: false,
      error: null,
      
      // Récupérer les entrées du carnet de bord
      fetchLogEntries: async () => {
        set({ isLoading: true, error: null });
        try {
          // Dans une application réelle, cela ferait un appel API
          // Pour la démo, nous utilisons les exemples
          // const response = await axios.get(`${API_URL}/farm-management/log-entries`);
          
          // Simulation d'une réponse d'API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({
            logEntries: sampleLogEntries,
            filteredEntries: sampleLogEntries,
            isLoading: false,
          });
          
          // Calculer les statistiques
          const stats = get().calculateStatistics(sampleLogEntries);
          set({ statistics: stats });
        } catch (error) {
          console.error('Fetch log entries error:', error);
          set({
            error: 'Échec du chargement des entrées du carnet de bord. Veuillez réessayer.',
            isLoading: false,
          });
        }
      },
      
      // Ajouter une nouvelle entrée
      addLogEntry: async (entry) => {
        set({ isLoading: true, error: null });
        try {
          // Dans une application réelle, cela ferait un appel API
          // Pour la démo, nous simulons une réponse
          // const response = await axios.post(`${API_URL}/farm-management/log-entries`, entry);
          
          // Simulation d'une réponse d'API
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const now = new Date().toISOString();
          const newEntry: FarmLogEntry = {
            ...entry,
            id: `entry-${Date.now()}`,
            createdAt: now,
            updatedAt: now
          };
          
          set(state => {
            const updatedEntries = [newEntry, ...state.logEntries];
            const updatedFilteredEntries = get().applyFilters(updatedEntries);
            const updatedStats = get().calculateStatistics(updatedEntries);
            
            return {
              logEntries: updatedEntries,
              filteredEntries: updatedFilteredEntries,
              statistics: updatedStats,
              isLoading: false,
            };
          });
          
          return newEntry;
        } catch (error) {
          console.error('Add log entry error:', error);
          set({
            error: 'Échec de l\'ajout de l\'entrée. Veuillez réessayer.',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Mettre à jour une entrée existante
      updateLogEntry: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          // Dans une application réelle, cela ferait un appel API
          // Pour la démo, nous simulons une réponse
          // const response = await axios.put(`${API_URL}/farm-management/log-entries/${id}`, updates);
          
          // Simulation d'une réponse d'API
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const entryIndex = get().logEntries.findIndex(entry => entry.id === id);
          
          if (entryIndex === -1) {
            set({ isLoading: false });
            return null;
          }
          
          const updatedEntry: FarmLogEntry = {
            ...get().logEntries[entryIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          
          set(state => {
            const updatedEntries = [...state.logEntries];
            updatedEntries[entryIndex] = updatedEntry;
            
            const updatedFilteredEntries = get().applyFilters(updatedEntries);
            const updatedStats = get().calculateStatistics(updatedEntries);
            
            return {
              logEntries: updatedEntries,
              filteredEntries: updatedFilteredEntries,
              statistics: updatedStats,
              isLoading: false,
            };
          });
          
          return updatedEntry;
        } catch (error) {
          console.error('Update log entry error:', error);
          set({
            error: 'Échec de la mise à jour de l\'entrée. Veuillez réessayer.',
            isLoading: false,
          });
          throw error;
        }
      },
      
      // Supprimer une entrée
      deleteLogEntry: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // Dans une application réelle, cela ferait un appel API
          // Pour la démo, nous simulons une réponse
          // const response = await axios.delete(`${API_URL}/farm-management/log-entries/${id}`);
          
          // Simulation d'une réponse d'API
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => {
            const updatedEntries = state.logEntries.filter(entry => entry.id !== id);
            
            if (updatedEntries.length === state.logEntries.length) {
              set({ isLoading: false });
              return { isLoading: false };
            }
            
            const updatedFilteredEntries = get().applyFilters(updatedEntries);
            const updatedStats = get().calculateStatistics(updatedEntries);
            
            return {
              logEntries: updatedEntries,
              filteredEntries: updatedFilteredEntries,
              statistics: updatedStats,
              isLoading: false,
            };
          });
          
          return true;
        } catch (error) {
          console.error('Delete log entry error:', error);
          set({
            error: 'Échec de la suppression de l\'entrée. Veuillez réessayer.',
            isLoading: false,
          });
          return false;
        }
      },
      
      // Appliquer les filtres aux entrées
      applyFilters: (entries: FarmLogEntry[]) => {
        const filters = get().filters;
        
        if (!filters || Object.keys(filters).length === 0) {
          return entries;
        }
        
        return entries.filter(entry => {
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
      },
      
      // Définir les filtres
      setFilters: (filters) => {
        set(state => {
          const updatedFilteredEntries = get().applyFilters(state.logEntries);
          return {
            filters,
            filteredEntries: updatedFilteredEntries,
          };
        });
      },
      
      // Effacer les filtres
      clearFilters: () => {
        set(state => ({
          filters: {},
          filteredEntries: state.logEntries,
        }));
      },
      
      // Calculer les statistiques
      calculateStatistics: (entries = get().logEntries) => {
        // Initialiser les statistiques
        const stats: FarmStatistics = { ...defaultStatistics };
        
        stats.totalEntries = entries.length;
        
        // Calculer les statistiques à partir des entrées
        entries.forEach(entry => {
          // Compter par catégorie et type
          stats.entriesByCategory[entry.category]++;
          stats.entriesByType[entry.type]++;
          
          // Statistiques financières
          if (entry.type === 'income' && 'amount' in entry) {
            stats.totalIncome += entry.amount;
            
            if ('incomeCategory' in entry) {
              const category = entry.incomeCategory;
              stats.incomeByCategory[category] = (stats.incomeByCategory[category] || 0) + entry.amount;
            }
          }
          
          if (entry.type === 'expense' && 'amount' in entry) {
            stats.totalExpenses += entry.amount;
            
            if ('expenseCategory' in entry) {
              const category = entry.expenseCategory;
              stats.expensesByCategory[category] = (stats.expensesByCategory[category] || 0) + entry.amount;
            }
          }
          
          // Statistiques des récoltes
          if (entry.type === 'harvest' && 'cropType' in entry && 'yield' in entry) {
            const cropType = entry.cropType;
            
            if (!stats.totalHarvest[cropType]) {
              stats.totalHarvest[cropType] = { amount: 0, unit: entry.yieldUnit };
            }
            
            stats.totalHarvest[cropType].amount += entry.yield;
          }
          
          // Statistiques des animaux
          if (entry.type === 'birth' && 'animalType' in entry && 'numberOfOffspring' in entry) {
            stats.animalCount[entry.animalType] = (stats.animalCount[entry.animalType] || 0) + entry.numberOfOffspring;
          }
          
          if (entry.type === 'death' && 'animalType' in entry) {
            stats.animalCount[entry.animalType] = (stats.animalCount[entry.animalType] || 0) - 1;
          }
        });
        
        // Calculer le profit net
        stats.netProfit = stats.totalIncome - stats.totalExpenses;
        
        return stats;
      },
      
      // Exporter au format CSV
      exportToCsv: async () => {
        set({ isLoading: true, error: null });
        try {
          // Dans une application réelle, cela ferait un appel API ou générerait un fichier CSV
          // Pour la démo, nous simulons une réponse
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          set({ isLoading: false });
          return 'path/to/exported/file.csv';
        } catch (error) {
          console.error('Export to CSV error:', error);
          set({
            error: 'Échec de l\'exportation au format CSV. Veuillez réessayer.',
            isLoading: false,
          });
          return null;
        }
      },
      
      // Exporter au format PDF
      exportToPdf: async () => {
        set({ isLoading: true, error: null });
        try {
          // Dans une application réelle, cela ferait un appel API ou générerait un fichier PDF
          // Pour la démo, nous simulons une réponse
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          set({ isLoading: false });
          return 'path/to/exported/file.pdf';
        } catch (error) {
          console.error('Export to PDF error:', error);
          set({
            error: 'Échec de l\'exportation au format PDF. Veuillez réessayer.',
            isLoading: false,
          });
          return null;
        }
      },
      
      // Effacer les erreurs
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'farm-management-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        logEntries: state.logEntries,
        filters: state.filters,
      }),
    }
  )
);
