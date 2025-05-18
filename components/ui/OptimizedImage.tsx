import React, { useState, useEffect } from 'react';
import {
  Image,
  ImageProps,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  ImageURISource,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { COLORS } from '@/constants/Theme';

// Dossier de cache pour les images
const IMAGE_CACHE_FOLDER = `${FileSystem.cacheDirectory}images/`;

// Durée de validité du cache en millisecondes (7 jours)
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: ImageURISource;
  cacheEnabled?: boolean;
  placeholderColor?: string;
  showLoadingIndicator?: boolean;
  fallbackSource?: ImageURISource;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  priority?: 'low' | 'normal' | 'high';
  accessibilityLabel?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  cacheEnabled = true,
  placeholderColor,
  showLoadingIndicator = true,
  fallbackSource,
  style,
  resizeMode = 'cover',
  priority = 'normal',
  accessibilityLabel,
  ...props
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(null);
  
  // Créer un hash du chemin de l'image pour le nom du fichier en cache
  const getImageHash = async (uri: string): Promise<string> => {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      uri
    );
    return hash;
  };
  
  // Vérifier si le dossier de cache existe, sinon le créer
  const ensureCacheDirectory = async (): Promise<void> => {
    const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_FOLDER);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMAGE_CACHE_FOLDER, { intermediates: true });
    }
  };
  
  // Charger l'image depuis le cache ou la télécharger
  const loadImage = async (uri: string): Promise<void> => {
    try {
      // Si le cache n'est pas activé, utiliser directement l'URI
      if (!cacheEnabled || !uri || uri.startsWith('data:') || uri.startsWith('file:')) {
        setImagePath(uri);
        return;
      }
      
      // Créer le dossier de cache si nécessaire
      await ensureCacheDirectory();
      
      // Générer le hash pour le nom du fichier
      const hash = await getImageHash(uri);
      const cacheFilePath = `${IMAGE_CACHE_FOLDER}${hash}`;
      
      // Vérifier si l'image est déjà en cache
      const cacheFileInfo = await FileSystem.getInfoAsync(cacheFilePath);
      
      if (cacheFileInfo.exists) {
        // Vérifier si le cache a expiré
        const now = new Date().getTime();
        const fileModifiedTime = cacheFileInfo.modificationTime ? cacheFileInfo.modificationTime * 1000 : 0;
        
        if (now - fileModifiedTime < CACHE_EXPIRY) {
          // Utiliser l'image en cache
          setImagePath(`file://${cacheFilePath}`);
          return;
        }
      }
      
      // Télécharger l'image
      const downloadResult = await FileSystem.downloadAsync(uri, cacheFilePath);
      
      if (downloadResult.status === 200) {
        setImagePath(`file://${cacheFilePath}`);
      } else {
        throw new Error(`Failed to download image: ${downloadResult.status}`);
      }
    } catch (err) {
      console.error('Error loading image:', err);
      setError(true);
      
      // Utiliser l'URI originale en cas d'erreur
      setImagePath(uri);
    }
  };
  
  // Charger l'image au montage du composant
  useEffect(() => {
    if (source && source.uri) {
      setLoading(true);
      setError(false);
      loadImage(source.uri)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setError(true);
    }
  }, [source]);
  
  // Définir la priorité de chargement de l'image
  const loadingPriority = {
    low: 'low',
    normal: 'normal',
    high: 'high',
  }[priority];
  
  // Rendu du composant
  return (
    <View style={[styles.container, style]}>
      {/* Placeholder pendant le chargement */}
      {loading && (
        <ThemedView
          style={[
            styles.placeholder,
            {
              backgroundColor: placeholderColor || (theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
            },
          ]}
        >
          {showLoadingIndicator && (
            <ActivityIndicator
              size="small"
              color={COLORS.primary.main}
            />
          )}
        </ThemedView>
      )}
      
      {/* Image */}
      {imagePath && !error && (
        <Image
          source={{ uri: imagePath }}
          style={[styles.image, { opacity: loading ? 0 : 1 }]}
          onLoad={() => setLoading(false)}
          onError={() => setError(true)}
          resizeMode={resizeMode}
          fadeDuration={Platform.OS === 'android' ? 300 : 0}
          progressiveRenderingEnabled={true}
          accessibilityLabel={accessibilityLabel}
          accessible={!!accessibilityLabel}
          {...(Platform.OS === 'web' ? { loading: loadingPriority } : {})}
          {...props}
        />
      )}
      
      {/* Image de secours en cas d'erreur */}
      {error && fallbackSource && (
        <Image
          source={fallbackSource}
          style={styles.image}
          resizeMode={resizeMode}
          accessibilityLabel={accessibilityLabel}
          accessible={!!accessibilityLabel}
          {...props}
        />
      )}
      
      {/* Icône d'erreur si pas d'image de secours */}
      {error && !fallbackSource && (
        <ThemedView style={styles.errorContainer}>
          <IconSymbol
            name="photo"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </ThemedView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default OptimizedImage;
