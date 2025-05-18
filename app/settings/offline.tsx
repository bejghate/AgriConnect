import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Button, Divider, ProgressBar } from 'react-native-paper';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { COLORS } from '@/constants/Theme';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import CacheService from '@/services/CacheService';

// Convert bytes to human-readable format
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function OfflineSettingsScreen() {
  const { 
    isOnline, 
    syncStatus, 
    isSyncing, 
    lastSyncTime, 
    syncData 
  } = useOffline();
  
  const [isLoading, setIsLoading] = useState(true);
  const [cacheStats, setCacheStats] = useState({
    totalSize: 0,
    entryCount: 0,
    oldestEntry: 0,
    newestEntry: 0,
  });
  
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [wifiOnlyEnabled, setWifiOnlyEnabled] = useState(true);
  const [offlineArticles, setOfflineArticles] = useState({
    encyclopedia: true,
    marketplace: false,
    weather: true,
    consultations: false,
  });
  
  // Load cache statistics
  useEffect(() => {
    const loadCacheStats = async () => {
      setIsLoading(true);
      try {
        const stats = await CacheService.getCacheStats();
        setCacheStats(stats);
      } catch (error) {
        console.error('Error loading cache statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCacheStats();
  }, []);
  
  // Handle sync button press
  const handleSyncPress = () => {
    if (isOnline && !isSyncing) {
      syncData();
    } else if (!isOnline) {
      Alert.alert(
        'Hors ligne',
        'Vous êtes actuellement hors ligne. Veuillez vous connecter à Internet pour synchroniser vos données.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Handle clear cache button press
  const handleClearCache = () => {
    Alert.alert(
      'Vider le cache',
      'Êtes-vous sûr de vouloir vider le cache ? Toutes les données mises en cache seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Vider', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await CacheService.clearCache();
              const stats = await CacheService.getCacheStats();
              setCacheStats(stats);
              Alert.alert('Succès', 'Le cache a été vidé avec succès.');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors du vidage du cache.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Handle toggle offline article category
  const handleToggleOfflineArticle = (category: keyof typeof offlineArticles) => {
    setOfflineArticles(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
        <ThemedText style={styles.loadingText}>Chargement des paramètres hors ligne...</ThemedText>
      </View>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <SettingsHeader title="Paramètres hors ligne" />
      
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Statut de synchronisation
          </ThemedText>
          
          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <IconSymbol 
                name={isOnline ? 'wifi' : 'wifi.slash'} 
                size={20} 
                color={isOnline ? COLORS.success : COLORS.error} 
              />
              <ThemedText style={styles.statusText}>
                {isOnline ? 'Connecté' : 'Hors ligne'}
              </ThemedText>
            </View>
            
            <View style={styles.statusRow}>
              <IconSymbol 
                name={
                  syncStatus.syncStatus === 'success' ? 'checkmark.circle.fill' :
                  syncStatus.syncStatus === 'failed' ? 'exclamationmark.triangle.fill' :
                  syncStatus.syncStatus === 'in-progress' ? 'arrow.clockwise' :
                  'questionmark.circle.fill'
                } 
                size={20} 
                color={
                  syncStatus.syncStatus === 'success' ? COLORS.success :
                  syncStatus.syncStatus === 'failed' ? COLORS.error :
                  COLORS.primary.main
                } 
              />
              <ThemedText style={styles.statusText}>
                {syncStatus.syncStatus === 'success' ? 'Synchronisé' :
                 syncStatus.syncStatus === 'failed' ? 'Échec de synchronisation' :
                 syncStatus.syncStatus === 'in-progress' ? 'Synchronisation en cours...' :
                 'Non synchronisé'}
              </ThemedText>
            </View>
            
            {lastSyncTime > 0 && (
              <View style={styles.statusRow}>
                <IconSymbol name="clock.fill" size={20} color={COLORS.text.secondary} />
                <ThemedText style={styles.statusText}>
                  Dernière synchronisation: {formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true, locale: fr })}
                </ThemedText>
              </View>
            )}
          </View>
          
          <Button
            mode="contained"
            onPress={handleSyncPress}
            style={styles.syncButton}
            disabled={isSyncing || !isOnline}
            loading={isSyncing}
          >
            Synchroniser maintenant
          </Button>
        </ThemedView>
        
        <Divider style={styles.divider} />
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Paramètres de synchronisation
          </ThemedText>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingLabel}>Synchronisation automatique</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Synchroniser automatiquement les données lorsque l'application est ouverte
              </ThemedText>
            </View>
            <Switch
              value={autoSyncEnabled}
              onValueChange={setAutoSyncEnabled}
              trackColor={{ false: '#E0E0E0', true: '#90CAF9' }}
              thumbColor={autoSyncEnabled ? COLORS.primary.main : '#F5F5F5'}
              ios_backgroundColor="#E0E0E0"
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingLabel}>Wi-Fi uniquement</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Synchroniser uniquement lorsque connecté au Wi-Fi
              </ThemedText>
            </View>
            <Switch
              value={wifiOnlyEnabled}
              onValueChange={setWifiOnlyEnabled}
              trackColor={{ false: '#E0E0E0', true: '#90CAF9' }}
              thumbColor={wifiOnlyEnabled ? COLORS.primary.main : '#F5F5F5'}
              ios_backgroundColor="#E0E0E0"
            />
          </View>
        </ThemedView>
        
        <Divider style={styles.divider} />
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Articles disponibles hors ligne
          </ThemedText>
          
          <ThemedText style={styles.settingDescription}>
            Sélectionnez les catégories d'articles à rendre disponibles hors ligne
          </ThemedText>
          
          <TouchableOpacity 
            style={styles.categoryRow}
            onPress={() => handleToggleOfflineArticle('encyclopedia')}
          >
            <View style={styles.categoryInfo}>
              <IconSymbol name="book.fill" size={20} color={COLORS.primary.main} />
              <ThemedText style={styles.categoryLabel}>Encyclopédie agricole</ThemedText>
            </View>
            <Switch
              value={offlineArticles.encyclopedia}
              onValueChange={() => handleToggleOfflineArticle('encyclopedia')}
              trackColor={{ false: '#E0E0E0', true: '#90CAF9' }}
              thumbColor={offlineArticles.encyclopedia ? COLORS.primary.main : '#F5F5F5'}
              ios_backgroundColor="#E0E0E0"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.categoryRow}
            onPress={() => handleToggleOfflineArticle('marketplace')}
          >
            <View style={styles.categoryInfo}>
              <IconSymbol name="cart.fill" size={20} color="#9C27B0" />
              <ThemedText style={styles.categoryLabel}>Marketplace</ThemedText>
            </View>
            <Switch
              value={offlineArticles.marketplace}
              onValueChange={() => handleToggleOfflineArticle('marketplace')}
              trackColor={{ false: '#E0E0E0', true: '#90CAF9' }}
              thumbColor={offlineArticles.marketplace ? COLORS.primary.main : '#F5F5F5'}
              ios_backgroundColor="#E0E0E0"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.categoryRow}
            onPress={() => handleToggleOfflineArticle('weather')}
          >
            <View style={styles.categoryInfo}>
              <IconSymbol name="cloud.sun.fill" size={20} color="#FF9800" />
              <ThemedText style={styles.categoryLabel}>Météo</ThemedText>
            </View>
            <Switch
              value={offlineArticles.weather}
              onValueChange={() => handleToggleOfflineArticle('weather')}
              trackColor={{ false: '#E0E0E0', true: '#90CAF9' }}
              thumbColor={offlineArticles.weather ? COLORS.primary.main : '#F5F5F5'}
              ios_backgroundColor="#E0E0E0"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.categoryRow}
            onPress={() => handleToggleOfflineArticle('consultations')}
          >
            <View style={styles.categoryInfo}>
              <IconSymbol name="person.fill.badge.plus" size={20} color="#2196F3" />
              <ThemedText style={styles.categoryLabel}>Consultations</ThemedText>
            </View>
            <Switch
              value={offlineArticles.consultations}
              onValueChange={() => handleToggleOfflineArticle('consultations')}
              trackColor={{ false: '#E0E0E0', true: '#90CAF9' }}
              thumbColor={offlineArticles.consultations ? COLORS.primary.main : '#F5F5F5'}
              ios_backgroundColor="#E0E0E0"
            />
          </TouchableOpacity>
        </ThemedView>
        
        <Divider style={styles.divider} />
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Stockage
          </ThemedText>
          
          <View style={styles.storageContainer}>
            <View style={styles.storageInfo}>
              <ThemedText style={styles.storageText}>
                Espace utilisé: {formatBytes(cacheStats.totalSize)}
              </ThemedText>
              <ThemedText style={styles.storageText}>
                Nombre d'éléments: {cacheStats.entryCount}
              </ThemedText>
              {cacheStats.newestEntry > 0 && (
                <ThemedText style={styles.storageText}>
                  Dernier élément mis en cache: {formatDistanceToNow(new Date(cacheStats.newestEntry), { addSuffix: true, locale: fr })}
                </ThemedText>
              )}
            </View>
            
            <ProgressBar
              progress={cacheStats.totalSize / (50 * 1024 * 1024)} // 50 MB limit
              color={COLORS.primary.main}
              style={styles.storageBar}
            />
            
            <Button
              mode="outlined"
              onPress={handleClearCache}
              style={styles.clearButton}
              disabled={isLoading || cacheStats.totalSize === 0}
            >
              Vider le cache
            </Button>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  divider: {
    height: 8,
    backgroundColor: '#F5F5F5',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
  },
  syncButton: {
    backgroundColor: COLORS.primary.main,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryLabel: {
    marginLeft: 12,
    fontSize: 16,
  },
  storageContainer: {
    marginTop: 8,
  },
  storageInfo: {
    marginBottom: 16,
  },
  storageText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  storageBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  clearButton: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
});
