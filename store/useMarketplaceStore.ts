import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@/constants/Config';

// Définition des types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory: string;
  images: string[];
  seller: {
    id: string;
    name: string;
    rating: number;
    location: string;
    contactInfo: string;
  };
  quantity: number;
  unit: string;
  location: {
    region: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: string;
  expiresAt: string;
  rating: number;
  reviewCount: number;
  isFavorite: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  provider: {
    id: string;
    name: string;
    rating: number;
    location: string;
    contactInfo: string;
  };
  availability: string[];
  location: {
    region: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: string;
  rating: number;
  reviewCount: number;
  isFavorite: boolean;
}

export interface CartItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  price: number;
  currency: string;
  quantity: number;
  sellerId: string;
  sellerName: string;
  image: string;
}

interface MarketplaceState {
  products: Product[];
  services: Service[];
  cart: CartItem[];
  favorites: { id: string; type: 'product' | 'service' }[];
  recentlyViewed: { id: string; type: 'product' | 'service' }[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: () => Promise<void>;
  fetchServices: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getServiceById: (id: string) => Service | undefined;
  searchMarketplace: (query: string, filters?: any) => { products: Product[]; services: Service[] };
  toggleFavorite: (id: string, type: 'product' | 'service') => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  addToRecentlyViewed: (id: string, type: 'product' | 'service') => void;
  clearError: () => void;
}

// Création du store avec persistance
export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      products: [],
      services: [],
      cart: [],
      favorites: [],
      recentlyViewed: [],
      isLoading: false,
      error: null,
      
      // Récupérer les produits
      fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          // Dans une application réelle, cela ferait un appel API
          // Pour la démo, nous simulons une réponse
          // const response = await axios.get(`${API_URL}/marketplace/products`);
          
          // Simulation d'une réponse d'API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Exemple de produits
          const mockProducts: Product[] = [
            {
              id: '1',
              name: 'Semences de maïs améliorées',
              description: 'Semences de maïs à haut rendement, résistantes à la sécheresse.',
              price: 5000,
              currency: 'XOF',
              category: 'seeds',
              subcategory: 'cereals',
              images: ['https://example.com/maize-seeds1.jpg', 'https://example.com/maize-seeds2.jpg'],
              seller: {
                id: 's1',
                name: 'Coopérative Agricole du Centre',
                rating: 4.7,
                location: 'Ouagadougou',
                contactInfo: '+226 70 12 34 56',
              },
              quantity: 50,
              unit: 'kg',
              location: {
                region: 'Centre',
                coordinates: {
                  latitude: 12.3456,
                  longitude: -1.2345,
                },
              },
              createdAt: '2023-05-10T08:30:00Z',
              expiresAt: '2023-08-10T08:30:00Z',
              rating: 4.5,
              reviewCount: 28,
              isFavorite: false,
            },
            {
              id: '2',
              name: 'Engrais NPK 15-15-15',
              description: 'Engrais complet pour toutes cultures. Améliore la croissance et le rendement.',
              price: 12000,
              currency: 'XOF',
              category: 'fertilizers',
              subcategory: 'chemical',
              images: ['https://example.com/fertilizer1.jpg', 'https://example.com/fertilizer2.jpg'],
              seller: {
                id: 's2',
                name: 'Agro-Intrants SARL',
                rating: 4.2,
                location: 'Bobo-Dioulasso',
                contactInfo: '+226 76 98 76 54',
              },
              quantity: 100,
              unit: 'sac de 50kg',
              location: {
                region: 'Hauts-Bassins',
                coordinates: {
                  latitude: 11.1771,
                  longitude: -4.2979,
                },
              },
              createdAt: '2023-06-05T10:15:00Z',
              expiresAt: '2023-12-05T10:15:00Z',
              rating: 4.0,
              reviewCount: 15,
              isFavorite: false,
            },
          ];
          
          // Marquer les produits favoris
          const productsWithState = mockProducts.map(product => ({
            ...product,
            isFavorite: get().favorites.some(f => f.id === product.id && f.type === 'product'),
          }));
          
          set({
            products: productsWithState,
            isLoading: false,
          });
        } catch (error) {
          console.error('Fetch products error:', error);
          set({
            error: 'Échec du chargement des produits. Veuillez réessayer.',
            isLoading: false,
          });
        }
      },
      
      // Récupérer les services
      fetchServices: async () => {
        set({ isLoading: true, error: null });
        try {
          // Dans une application réelle, cela ferait un appel API
          // Pour la démo, nous simulons une réponse
          // const response = await axios.get(`${API_URL}/marketplace/services`);
          
          // Simulation d'une réponse d'API
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Exemple de services
          const mockServices: Service[] = [
            {
              id: '1',
              name: 'Location de tracteur',
              description: 'Location de tracteur avec chauffeur pour labour, hersage et autres travaux agricoles.',
              price: 25000,
              currency: 'XOF',
              category: 'equipment_rental',
              images: ['https://example.com/tractor1.jpg', 'https://example.com/tractor2.jpg'],
              provider: {
                id: 'p1',
                name: 'Services Agricoles Plus',
                rating: 4.8,
                location: 'Ouagadougou',
                contactInfo: '+226 70 87 65 43',
              },
              availability: ['Lundi-Samedi, 7h-18h'],
              location: {
                region: 'Centre',
                coordinates: {
                  latitude: 12.3789,
                  longitude: -1.2456,
                },
              },
              createdAt: '2023-04-15T09:45:00Z',
              rating: 4.6,
              reviewCount: 32,
              isFavorite: false,
            },
            {
              id: '2',
              name: 'Transport de produits agricoles',
              description: 'Service de transport de produits agricoles du champ au marché ou à l\'entrepôt.',
              price: 15000,
              currency: 'XOF',
              category: 'transport',
              images: ['https://example.com/transport1.jpg', 'https://example.com/transport2.jpg'],
              provider: {
                id: 'p2',
                name: 'Trans-Agri',
                rating: 4.3,
                location: 'Koudougou',
                contactInfo: '+226 75 43 21 09',
              },
              availability: ['Tous les jours, 6h-20h'],
              location: {
                region: 'Centre-Ouest',
                coordinates: {
                  latitude: 12.2503,
                  longitude: -2.3695,
                },
              },
              createdAt: '2023-05-20T14:30:00Z',
              rating: 4.2,
              reviewCount: 18,
              isFavorite: false,
            },
          ];
          
          // Marquer les services favoris
          const servicesWithState = mockServices.map(service => ({
            ...service,
            isFavorite: get().favorites.some(f => f.id === service.id && f.type === 'service'),
          }));
          
          set({
            services: servicesWithState,
            isLoading: false,
          });
        } catch (error) {
          console.error('Fetch services error:', error);
          set({
            error: 'Échec du chargement des services. Veuillez réessayer.',
            isLoading: false,
          });
        }
      },
      
      // Obtenir un produit par ID
      getProductById: (id) => {
        return get().products.find(product => product.id === id);
      },
      
      // Obtenir un service par ID
      getServiceById: (id) => {
        return get().services.find(service => service.id === id);
      },
      
      // Rechercher dans le marketplace
      searchMarketplace: (query, filters = {}) => {
        const lowerQuery = query.toLowerCase();
        
        const filteredProducts = get().products.filter(product => {
          // Filtrer par requête de recherche
          const matchesQuery = 
            product.name.toLowerCase().includes(lowerQuery) ||
            product.description.toLowerCase().includes(lowerQuery) ||
            product.category.toLowerCase().includes(lowerQuery) ||
            product.subcategory.toLowerCase().includes(lowerQuery);
          
          // Appliquer des filtres supplémentaires si nécessaire
          // Exemple: filtrer par catégorie, prix, région, etc.
          
          return matchesQuery;
        });
        
        const filteredServices = get().services.filter(service => {
          // Filtrer par requête de recherche
          const matchesQuery = 
            service.name.toLowerCase().includes(lowerQuery) ||
            service.description.toLowerCase().includes(lowerQuery) ||
            service.category.toLowerCase().includes(lowerQuery);
          
          // Appliquer des filtres supplémentaires si nécessaire
          
          return matchesQuery;
        });
        
        return { products: filteredProducts, services: filteredServices };
      },
      
      // Ajouter/retirer un élément des favoris
      toggleFavorite: (id, type) => {
        const isFavorite = get().favorites.some(f => f.id === id && f.type === type);
        
        if (isFavorite) {
          // Retirer des favoris
          set(state => ({
            favorites: state.favorites.filter(f => !(f.id === id && f.type === type)),
            products: type === 'product' 
              ? state.products.map(p => p.id === id ? { ...p, isFavorite: false } : p)
              : state.products,
            services: type === 'service'
              ? state.services.map(s => s.id === id ? { ...s, isFavorite: false } : s)
              : state.services,
          }));
        } else {
          // Ajouter aux favoris
          set(state => ({
            favorites: [...state.favorites, { id, type }],
            products: type === 'product'
              ? state.products.map(p => p.id === id ? { ...p, isFavorite: true } : p)
              : state.products,
            services: type === 'service'
              ? state.services.map(s => s.id === id ? { ...s, isFavorite: true } : s)
              : state.services,
          }));
        }
      },
      
      // Ajouter au panier
      addToCart: (item) => {
        set(state => {
          // Vérifier si l'élément est déjà dans le panier
          const existingItemIndex = state.cart.findIndex(
            cartItem => cartItem.type === item.type && cartItem.name === item.name && cartItem.sellerId === item.sellerId
          );
          
          if (existingItemIndex !== -1) {
            // Mettre à jour la quantité si l'élément existe déjà
            const updatedCart = [...state.cart];
            updatedCart[existingItemIndex].quantity += item.quantity;
            return { cart: updatedCart };
          } else {
            // Ajouter un nouvel élément
            return {
              cart: [...state.cart, { ...item, id: `cart-${Date.now()}` }],
            };
          }
        });
      },
      
      // Retirer du panier
      removeFromCart: (itemId) => {
        set(state => ({
          cart: state.cart.filter(item => item.id !== itemId),
        }));
      },
      
      // Mettre à jour la quantité d'un élément du panier
      updateCartItemQuantity: (itemId, quantity) => {
        set(state => ({
          cart: state.cart.map(item => 
            item.id === itemId 
              ? { ...item, quantity: Math.max(1, quantity) } 
              : item
          ),
        }));
      },
      
      // Vider le panier
      clearCart: () => {
        set({ cart: [] });
      },
      
      // Ajouter aux éléments récemment consultés
      addToRecentlyViewed: (id, type) => {
        set(state => {
          // Retirer l'élément s'il existe déjà
          const filteredItems = state.recentlyViewed.filter(
            item => !(item.id === id && item.type === type)
          );
          
          // Ajouter l'élément au début et limiter à 10 éléments
          return {
            recentlyViewed: [{ id, type }, ...filteredItems].slice(0, 10),
          };
        });
      },
      
      // Effacer les erreurs
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'marketplace-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cart: state.cart,
        favorites: state.favorites,
        recentlyViewed: state.recentlyViewed,
      }),
    }
  )
);
