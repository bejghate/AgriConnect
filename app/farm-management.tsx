import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFarmManagement } from '@/context/FarmManagementContext';
import { useOffline } from '@/context/OfflineContext';
import { useUser } from '@/context/UserContext';
import { LogEntryCategory } from '@/data/farm-management';

// Composant pour les cartes de fonctionnalités
const FeatureCard = ({ title, description, icon, color, onPress }) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress}>
    <ThemedView style={[styles.featureIcon, { backgroundColor: color }]}>
      <IconSymbol name={icon} size={24} color="white" />
    </ThemedView>
    <ThemedText type="defaultSemiBold" style={styles.featureTitle}>{title}</ThemedText>
    <ThemedText style={styles.featureDescription}>{description}</ThemedText>
  </TouchableOpacity>
);

// Composant pour les statistiques
const StatCard = ({ title, value, unit, icon, color }) => (
  <ThemedView style={styles.statCard}>
    <ThemedView style={[styles.statIcon, { backgroundColor: color }]}>
      <IconSymbol name={icon} size={20} color="white" />
    </ThemedView>
    <ThemedText style={styles.statValue}>{value}{unit ? ` ${unit}` : ''}</ThemedText>
    <ThemedText style={styles.statTitle}>{title}</ThemedText>
  </ThemedView>
);

// Composant pour les entrées récentes
const RecentEntryCard = ({ entry, onPress }) => {
  // Obtenir l'icône en fonction du type d'entrée
  const getEntryIcon = (type: string): string => {
    switch (type) {
      case 'vaccination':
        return 'syringe';
      case 'birth':
        return 'heart.fill';
      case 'planting':
        return 'leaf.fill';
      case 'harvest':
        return 'cart.fill';
      case 'expense':
        return 'arrow.down.circle.fill';
      case 'income':
        return 'arrow.up.circle.fill';
      default:
        return 'doc.text.fill';
    }
  };

  // Obtenir la couleur en fonction de la catégorie
  const getCategoryColor = (category: LogEntryCategory): string => {
    switch (category) {
      case 'animal':
        return '#FF9800';
      case 'crop':
        return '#4CAF50';
      case 'finance':
        return '#2196F3';
      case 'general':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  // Formater la date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <TouchableOpacity style={styles.entryCard} onPress={() => onPress(entry)}>
      <ThemedView style={[styles.entryIcon, { backgroundColor: getCategoryColor(entry.category) }]}>
        <IconSymbol name={getEntryIcon(entry.type)} size={20} color="white" />
      </ThemedView>
      <ThemedView style={styles.entryContent}>
        <ThemedText type="defaultSemiBold" style={styles.entryTitle}>{entry.title}</ThemedText>
        <ThemedText style={styles.entryDescription} numberOfLines={1}>{entry.description}</ThemedText>
        <ThemedText style={styles.entryDate}>{formatDate(entry.date)}</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
};

export default function FarmManagementScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  const { primaryUserType } = useUser();
  const {
    logEntries,
    isLoading,
    statistics,
    refreshLogEntries
  } = useFarmManagement();

  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Gérer le rafraîchissement des données
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLogEntries();
    setRefreshing(false);
  };

  // Naviguer vers le carnet de bord
  const navigateToLogbook = () => {
    router.push('/farm-logbook');
  };

  // Naviguer vers les statistiques
  const navigateToStatistics = () => {
    router.push('/farm-statistics');
  };

  // Naviguer vers l'exportation des données
  const navigateToExport = () => {
    router.push('/farm-export');
  };

  // Gérer l'appui sur une entrée récente
  const handleEntryPress = (entry) => {
    router.push(`/farm-logbook?id=${entry.id}`);
  };

  // Ajouter une nouvelle entrée
  const handleAddEntry = () => {
    router.push('/farm-logbook?action=add');
  };

  // Afficher l'écran de chargement
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Chargement des données...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#C8E6C9', dark: '#1B5E20' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#0a7ea4"
          name="chart.bar.doc.horizontal.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Gestion de l'Exploitation</ThemedText>
      </ThemedView>

      <ThemedText style={styles.introText}>
        Suivez et gérez efficacement votre exploitation agricole avec des outils de suivi, d'analyse et de reporting.
      </ThemedText>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
          </ThemedText>
        </ThemedView>
      )}

      <ThemedText type="subtitle" style={styles.sectionTitle}>Fonctionnalités</ThemedText>

      <ThemedView style={styles.featuresGrid}>
        <FeatureCard
          title="Carnet de Bord"
          description="Enregistrez et consultez les activités de votre exploitation"
          icon="doc.text.fill"
          color="#4CAF50"
          onPress={navigateToLogbook}
        />
        <FeatureCard
          title="Statistiques"
          description="Analysez les performances de votre exploitation"
          icon="chart.bar.fill"
          color="#2196F3"
          onPress={navigateToStatistics}
        />
        <FeatureCard
          title="Exporter"
          description="Exportez vos données en CSV ou PDF"
          icon="square.and.arrow.up"
          color="#9C27B0"
          onPress={navigateToExport}
        />
        <FeatureCard
          title="Synchroniser"
          description="Synchronisez vos données avec le serveur"
          icon="arrow.triangle.2.circlepath"
          color="#FF9800"
          onPress={handleRefresh}
        />
      </ThemedView>

      <ThemedText type="subtitle" style={styles.sectionTitle}>Aperçu</ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        <StatCard
          title="Entrées"
          value={statistics.totalEntries.toString()}
          icon="doc.text.fill"
          color="#0a7ea4"
        />
        <StatCard
          title="Revenus"
          value={statistics.totalIncome.toLocaleString()}
          unit="XOF"
          icon="arrow.up.circle.fill"
          color="#4CAF50"
        />
        <StatCard
          title="Dépenses"
          value={statistics.totalExpenses.toLocaleString()}
          unit="XOF"
          icon="arrow.down.circle.fill"
          color="#F44336"
        />
        <StatCard
          title="Profit Net"
          value={statistics.netProfit.toLocaleString()}
          unit="XOF"
          icon="dollarsign.circle.fill"
          color={statistics.netProfit >= 0 ? "#4CAF50" : "#F44336"}
        />
      </ScrollView>

      <ThemedText type="subtitle" style={styles.sectionTitle}>Entrées Récentes</ThemedText>

      {logEntries.length > 0 ? (
        <ThemedView style={styles.entriesContainer}>
          {logEntries.slice(0, 5).map((entry) => (
            <RecentEntryCard
              key={entry.id}
              entry={entry}
              onPress={handleEntryPress}
            />
          ))}
        </ThemedView>
      ) : (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="doc.text" size={48} color="#757575" />
          <ThemedText style={styles.emptyText}>
            Aucune entrée dans le carnet de bord
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Commencez à enregistrer vos activités agricoles
          </ThemedText>
        </ThemedView>
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddEntry}>
        <IconSymbol name="plus" size={24} color="white" />
        <ThemedText style={styles.addButtonText}>Ajouter une Entrée</ThemedText>
      </TouchableOpacity>

      <ThemedView style={styles.exampleContainer}>
        <ThemedText type="subtitle" style={styles.exampleTitle}>Exemple d'Utilisation</ThemedText>
        <TouchableOpacity
          style={styles.exampleCard}
          onPress={() => router.push('/farm-birth-example')}
        >
          <ThemedView style={styles.exampleCardContent}>
            <IconSymbol name="heart.fill" size={24} color="#FF9800" />
            <ThemedView style={styles.exampleCardTextContent}>
              <ThemedText type="defaultSemiBold" style={styles.exampleCardTitle}>
                Enregistrer une Naissance
              </ThemedText>
              <ThemedText style={styles.exampleCardDescription}>
                Découvrez comment un éleveur peut enregistrer une naissance dans son troupeau et suivre les informations importantes
              </ThemedText>
            </ThemedView>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
    opacity: 0.7,
  },
  titleContainer: {
    marginBottom: 16,
  },
  introText: {
    marginBottom: 24,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#757575',
  },
  statsContainer: {
    paddingBottom: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    width: 120,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#757575',
  },
  entriesContainer: {
    marginBottom: 24,
    gap: 12,
  },
  entryCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
  },
  entryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entryContent: {
    flex: 1,
  },
  entryTitle: {
    marginBottom: 4,
  },
  entryDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 12,
    color: '#757575',
  },
  emptyContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  exampleContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  exampleTitle: {
    marginBottom: 16,
  },
  exampleCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    overflow: 'hidden',
  },
  exampleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exampleCardTextContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  exampleCardTitle: {
    marginBottom: 4,
  },
  exampleCardDescription: {
    fontSize: 14,
    color: '#757575',
  },
});
