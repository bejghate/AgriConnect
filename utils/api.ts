import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/Config';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';

// Créer une instance Axios avec une configuration de base
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 secondes
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    // Récupérer le token depuis le store
    const token = useAuthStore.getState().token;
    
    // Ajouter le token à l'en-tête d'autorisation si disponible
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    
    // Vérifier si l'application est en mode hors ligne
    const isOfflineMode = useAppStore.getState().settings.offlineMode;
    const isOnline = useAppStore.getState().isOnline;
    
    // Si l'application est en mode hors ligne ou n'est pas connectée à Internet,
    // annuler la requête et renvoyer une erreur
    if (isOfflineMode || !isOnline) {
      return Promise.reject(new Error('Vous êtes en mode hors ligne. Veuillez vous connecter à Internet pour effectuer cette action.'));
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Gérer les erreurs d'authentification (401)
    if (error.response && error.response.status === 401) {
      // Déconnecter l'utilisateur
      useAuthStore.getState().logout();
      
      // Rediriger vers la page de connexion (à implémenter selon votre navigation)
      // navigation.navigate('Login');
    }
    
    // Gérer les erreurs de serveur (500)
    if (error.response && error.response.status >= 500) {
      console.error('Erreur serveur:', error.response.data);
      // Vous pouvez ajouter une logique pour enregistrer les erreurs côté serveur
    }
    
    return Promise.reject(error);
  }
);

// Fonction pour effectuer une requête GET avec mise en cache
export const fetchWithCache = async (url: string, config: AxiosRequestConfig = {}, cacheTime = 3600000) => {
  const cacheKey = `api_cache_${url}`;
  
  try {
    // Vérifier si l'application est en mode hors ligne
    const isOfflineMode = useAppStore.getState().settings.offlineMode;
    const isOnline = useAppStore.getState().isOnline;
    
    // Si l'application est en ligne et n'est pas en mode hors ligne, essayer de récupérer les données fraîches
    if (isOnline && !isOfflineMode) {
      const response = await api.get(url, config);
      
      // Mettre en cache la réponse
      const cacheData = {
        data: response.data,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      return response.data;
    }
    
    // Si l'application est hors ligne ou en mode hors ligne, essayer de récupérer les données du cache
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      
      // Vérifier si les données en cache sont encore valides
      if (Date.now() - timestamp < cacheTime) {
        return data;
      }
    }
    
    // Si aucune donnée en cache n'est disponible ou si elles sont expirées,
    // et que l'application est hors ligne, renvoyer une erreur
    throw new Error('Données non disponibles en mode hors ligne.');
  } catch (error) {
    console.error('Fetch with cache error:', error);
    throw error;
  }
};

export default api;
