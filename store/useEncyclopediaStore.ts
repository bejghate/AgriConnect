import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@/constants/Config';

// Définition des types
export interface EncyclopediaArticle {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  content: string;
  images: string[];
  tags: string[];
  lastUpdated: string;
  isFavorite: boolean;
  isDownloaded: boolean;
  viewCount: number;
}

export interface EncyclopediaCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: {
    id: string;
    name: string;
  }[];
}

interface EncyclopediaState {
  articles: EncyclopediaArticle[];
  categories: EncyclopediaCategory[];
  favorites: string[]; // IDs des articles favoris
  downloadedArticles: string[]; // IDs des articles téléchargés
  recentSearches: string[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchArticles: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  getArticleById: (id: string) => EncyclopediaArticle | undefined;
  getArticlesByCategory: (category: string, subcategory?: string) => EncyclopediaArticle[];
  searchArticles: (query: string) => EncyclopediaArticle[];
  toggleFavorite: (articleId: string) => void;
  toggleDownload: (articleId: string) => Promise<void>;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  clearError: () => void;
}

// Création du store avec persistance
export const useEncyclopediaStore = create<EncyclopediaState>()(
  persist(
    (set, get) => ({
      articles: [],
      categories: [],
      favorites: [],
      downloadedArticles: [],
      recentSearches: [],
      isLoading: false,
      error: null,
      
      // Récupérer les articles
      fetchArticles: async () => {
        set({ isLoading: true, error: null });
        try {
          // Dans une application réelle, cela ferait un appel API
          // Pour la démo, nous simulons une réponse
          // const response = await axios.get(`${API_URL}/encyclopedia/articles`);
          
          // Simulation d'une réponse d'API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Exemple d'articles
          const mockArticles: EncyclopediaArticle[] = [
            {
              id: '1',
              title: 'Culture du maïs',
              category: 'crops',
              subcategory: 'cereals',
              content: 'Le maïs est une céréale importante en Afrique de l\'Ouest...',
              images: ['https://example.com/maize1.jpg', 'https://example.com/maize2.jpg'],
              tags: ['maïs', 'céréales', 'culture'],
              lastUpdated: '2023-05-15T10:30:00Z',
              isFavorite: false,
              isDownloaded: false,
              viewCount: 245,
            },
            {
              id: '2',
              title: 'Élevage des bovins',
              category: 'livestock',
              subcategory: 'cattle',
              content: 'L\'élevage des bovins est une activité importante...',
              images: ['https://example.com/cattle1.jpg', 'https://example.com/cattle2.jpg'],
              tags: ['bovins', 'élevage', 'bétail'],
              lastUpdated: '2023-06-20T14:45:00Z',
              isFavorite: false,
              isDownloaded: false,
              viewCount: 189,
            },
            // Ajoutez d'autres articles selon vos besoins
          ];
          
          // Marquer les articles favoris et téléchargés
          const articlesWithState = mockArticles.map(article => ({
            ...article,
            isFavorite: get().favorites.includes(article.id),
            isDownloaded: get().downloadedArticles.includes(article.id),
          }));
          
          set({
            articles: articlesWithState,
            isLoading: false,
          });
        } catch (error) {
          console.error('Fetch articles error:', error);
          set({
            error: 'Échec du chargement des articles. Veuillez réessayer.',
            isLoading: false,
          });
        }
      },
      
      // Récupérer les catégories
      fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          // Dans une application réelle, cela ferait un appel API
          // Pour la démo, nous simulons une réponse
          // const response = await axios.get(`${API_URL}/encyclopedia/categories`);
          
          // Simulation d'une réponse d'API
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Exemple de catégories
          const mockCategories: EncyclopediaCategory[] = [
            {
              id: 'crops',
              name: 'Cultures',
              icon: 'leaf',
              subcategories: [
                { id: 'cereals', name: 'Céréales' },
                { id: 'vegetables', name: 'Légumes' },
                { id: 'fruits', name: 'Fruits' },
                { id: 'tubers', name: 'Tubercules' },
              ],
            },
            {
              id: 'livestock',
              name: 'Élevage',
              icon: 'cow',
              subcategories: [
                { id: 'cattle', name: 'Bovins' },
                { id: 'sheep', name: 'Ovins' },
                { id: 'goats', name: 'Caprins' },
                { id: 'poultry', name: 'Volailles' },
              ],
            },
            {
              id: 'soil',
              name: 'Sol',
              icon: 'ground',
              subcategories: [
                { id: 'fertility', name: 'Fertilité' },
                { id: 'conservation', name: 'Conservation' },
                { id: 'irrigation', name: 'Irrigation' },
              ],
            },
          ];
          
          set({
            categories: mockCategories,
            isLoading: false,
          });
        } catch (error) {
          console.error('Fetch categories error:', error);
          set({
            error: 'Échec du chargement des catégories. Veuillez réessayer.',
            isLoading: false,
          });
        }
      },
      
      // Obtenir un article par ID
      getArticleById: (id) => {
        return get().articles.find(article => article.id === id);
      },
      
      // Obtenir les articles par catégorie
      getArticlesByCategory: (category, subcategory) => {
        return get().articles.filter(article => {
          if (subcategory) {
            return article.category === category && article.subcategory === subcategory;
          }
          return article.category === category;
        });
      },
      
      // Rechercher des articles
      searchArticles: (query) => {
        const lowerQuery = query.toLowerCase();
        const results = get().articles.filter(article => {
          return (
            article.title.toLowerCase().includes(lowerQuery) ||
            article.content.toLowerCase().includes(lowerQuery) ||
            article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
          );
        });
        
        // Ajouter la requête aux recherches récentes
        if (query.trim() !== '') {
          get().addRecentSearch(query);
        }
        
        return results;
      },
      
      // Ajouter/retirer un article des favoris
      toggleFavorite: (articleId) => {
        const isFavorite = get().favorites.includes(articleId);
        
        if (isFavorite) {
          // Retirer des favoris
          set(state => ({
            favorites: state.favorites.filter(id => id !== articleId),
            articles: state.articles.map(article => 
              article.id === articleId 
                ? { ...article, isFavorite: false } 
                : article
            ),
          }));
        } else {
          // Ajouter aux favoris
          set(state => ({
            favorites: [...state.favorites, articleId],
            articles: state.articles.map(article => 
              article.id === articleId 
                ? { ...article, isFavorite: true } 
                : article
            ),
          }));
        }
      },
      
      // Télécharger/supprimer un article
      toggleDownload: async (articleId) => {
        const isDownloaded = get().downloadedArticles.includes(articleId);
        
        if (isDownloaded) {
          // Supprimer le téléchargement
          set(state => ({
            downloadedArticles: state.downloadedArticles.filter(id => id !== articleId),
            articles: state.articles.map(article => 
              article.id === articleId 
                ? { ...article, isDownloaded: false } 
                : article
            ),
          }));
        } else {
          // Télécharger l'article
          // Dans une application réelle, cela téléchargerait le contenu complet
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => ({
            downloadedArticles: [...state.downloadedArticles, articleId],
            articles: state.articles.map(article => 
              article.id === articleId 
                ? { ...article, isDownloaded: true } 
                : article
            ),
          }));
        }
      },
      
      // Ajouter une recherche récente
      addRecentSearch: (query) => {
        set(state => {
          // Limiter à 10 recherches récentes
          const newSearches = [
            query,
            ...state.recentSearches.filter(q => q !== query),
          ].slice(0, 10);
          
          return { recentSearches: newSearches };
        });
      },
      
      // Effacer les recherches récentes
      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },
      
      // Effacer les erreurs
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'encyclopedia-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        downloadedArticles: state.downloadedArticles,
        recentSearches: state.recentSearches,
      }),
    }
  )
);
