import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFarmManagement } from '@/context/FarmManagementContext';
import { useOffline } from '@/context/OfflineContext';

// Largeur de l'écran pour les graphiques
const screenWidth = Dimensions.get('window').width - 32; // Tenir compte du padding

// Configuration des graphiques
const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726',
  },
};

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

export default function FarmStatisticsScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  const { statistics, isLoading } = useFarmManagement();
  
  const [activeTab, setActiveTab] = useState<'general' | 'finance' | 'crops' | 'animals'>('general');
  
  // Naviguer vers l'écran précédent
  const navigateBack = () => {
    router.back();
  };
  
  // Préparer les données pour les graphiques
  const prepareChartData = () => {
    // Données pour le graphique des catégories
    const categoryData = {
      labels: ['Animaux', 'Cultures', 'Finances', 'Général'],
      datasets: [
        {
          data: [
            statistics.entriesByCategory.animal,
            statistics.entriesByCategory.crop,
            statistics.entriesByCategory.finance,
            statistics.entriesByCategory.general,
          ],
          colors: [
            (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
            (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
          ],
        },
      ],
    };
    
    // Données pour le graphique des finances
    const financeData = {
      labels: ['Revenus', 'Dépenses', 'Profit Net'],
      datasets: [
        {
          data: [
            statistics.totalIncome,
            statistics.totalExpenses,
            Math.abs(statistics.netProfit),
          ],
          colors: [
            (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
            (opacity = 1) => statistics.netProfit >= 0 
              ? `rgba(76, 175, 80, ${opacity})`
              : `rgba(244, 67, 54, ${opacity})`,
          ],
        },
      ],
    };
    
    // Données pour le graphique des revenus par catégorie
    const incomeCategories = Object.keys(statistics.incomeByCategory);
    const incomeData = {
      labels: incomeCategories.map(cat => cat.substring(0, 10)),
      datasets: [
        {
          data: incomeCategories.map(cat => statistics.incomeByCategory[cat]),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        },
      ],
    };
    
    // Données pour le graphique des dépenses par catégorie
    const expenseCategories = Object.keys(statistics.expensesByCategory);
    const expenseData = {
      labels: expenseCategories.map(cat => cat.substring(0, 10)),
      datasets: [
        {
          data: expenseCategories.map(cat => statistics.expensesByCategory[cat]),
          color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
        },
      ],
    };
    
    return {
      categoryData,
      financeData,
      incomeData,
      expenseData,
    };
  };
  
  // Afficher l'écran de chargement
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Chargement des statistiques...</ThemedText>
      </ThemedView>
    );
  }
  
  const chartData = prepareChartData();
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Retour</ThemedText>
        </TouchableOpacity>
        
        <ThemedText type="subtitle" style={styles.headerTitle}>Statistiques</ThemedText>
        
        <ThemedView style={{ width: 60 }} />
      </ThemedView>
      
      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
          </ThemedText>
        </ThemedView>
      )}
      
      <ThemedView style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'general' && styles.activeTabButton]}
          onPress={() => setActiveTab('general')}
        >
          <ThemedText 
            style={[styles.tabButtonText, activeTab === 'general' && styles.activeTabButtonText]}
          >
            Général
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'finance' && styles.activeTabButton]}
          onPress={() => setActiveTab('finance')}
        >
          <ThemedText 
            style={[styles.tabButtonText, activeTab === 'finance' && styles.activeTabButtonText]}
          >
            Finances
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'crops' && styles.activeTabButton]}
          onPress={() => setActiveTab('crops')}
        >
          <ThemedText 
            style={[styles.tabButtonText, activeTab === 'crops' && styles.activeTabButtonText]}
          >
            Cultures
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'animals' && styles.activeTabButton]}
          onPress={() => setActiveTab('animals')}
        >
          <ThemedText 
            style={[styles.tabButtonText, activeTab === 'animals' && styles.activeTabButtonText]}
          >
            Animaux
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'general' && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Aperçu Général</ThemedText>
            
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
                title="Animaux"
                value={statistics.entriesByCategory.animal.toString()}
                icon="pawprint.fill"
                color="#FF9800"
              />
              <StatCard
                title="Cultures"
                value={statistics.entriesByCategory.crop.toString()}
                icon="leaf.fill"
                color="#4CAF50"
              />
              <StatCard
                title="Finances"
                value={statistics.entriesByCategory.finance.toString()}
                icon="dollarsign.circle.fill"
                color="#2196F3"
              />
            </ScrollView>
            
            <ThemedText style={styles.chartTitle}>Répartition des Entrées par Catégorie</ThemedText>
            
            <ThemedView style={styles.chartContainer}>
              <PieChart
                data={[
                  {
                    name: 'Animaux',
                    population: statistics.entriesByCategory.animal,
                    color: '#FF9800',
                    legendFontColor: '#7F7F7F',
                    legendFontSize: 12,
                  },
                  {
                    name: 'Cultures',
                    population: statistics.entriesByCategory.crop,
                    color: '#4CAF50',
                    legendFontColor: '#7F7F7F',
                    legendFontSize: 12,
                  },
                  {
                    name: 'Finances',
                    population: statistics.entriesByCategory.finance,
                    color: '#2196F3',
                    legendFontColor: '#7F7F7F',
                    legendFontSize: 12,
                  },
                  {
                    name: 'Général',
                    population: statistics.entriesByCategory.general,
                    color: '#9C27B0',
                    legendFontColor: '#7F7F7F',
                    legendFontSize: 12,
                  },
                ]}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </ThemedView>
          </>
        )}
        
        {activeTab === 'finance' && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Finances</ThemedText>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsContainer}
            >
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
            
            <ThemedText style={styles.chartTitle}>Aperçu Financier</ThemedText>
            
            <ThemedView style={styles.chartContainer}>
              <BarChart
                data={{
                  labels: ['Revenus', 'Dépenses', 'Profit Net'],
                  datasets: [
                    {
                      data: [
                        statistics.totalIncome,
                        statistics.totalExpenses,
                        Math.abs(statistics.netProfit),
                      ],
                      colors: [
                        (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                        (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
                        (opacity = 1) => statistics.netProfit >= 0 
                          ? `rgba(76, 175, 80, ${opacity})`
                          : `rgba(244, 67, 54, ${opacity})`,
                      ],
                    },
                  ],
                }}
                width={screenWidth}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1, index) => {
                    const colors = [
                      `rgba(76, 175, 80, ${opacity})`,
                      `rgba(244, 67, 54, ${opacity})`,
                      statistics.netProfit >= 0 
                        ? `rgba(76, 175, 80, ${opacity})`
                        : `rgba(244, 67, 54, ${opacity})`,
                    ];
                    return colors[index] || colors[0];
                  },
                }}
                verticalLabelRotation={0}
                showValuesOnTopOfBars
                fromZero
                style={styles.chart}
              />
            </ThemedView>
            
            <Collapsible title="Revenus par Catégorie">
              {Object.keys(statistics.incomeByCategory).length > 0 ? (
                <ThemedView style={styles.chartContainer}>
                  <BarChart
                    data={{
                      labels: Object.keys(statistics.incomeByCategory).map(cat => 
                        cat.length > 10 ? cat.substring(0, 10) + '...' : cat
                      ),
                      datasets: [
                        {
                          data: Object.values(statistics.incomeByCategory),
                        },
                      ],
                    }}
                    width={screenWidth}
                    height={220}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    }}
                    verticalLabelRotation={30}
                    showValuesOnTopOfBars
                    fromZero
                    style={styles.chart}
                  />
                </ThemedView>
              ) : (
                <ThemedText style={styles.noDataText}>
                  Aucune donnée de revenus par catégorie disponible.
                </ThemedText>
              )}
            </Collapsible>
            
            <Collapsible title="Dépenses par Catégorie">
              {Object.keys(statistics.expensesByCategory).length > 0 ? (
                <ThemedView style={styles.chartContainer}>
                  <BarChart
                    data={{
                      labels: Object.keys(statistics.expensesByCategory).map(cat => 
                        cat.length > 10 ? cat.substring(0, 10) + '...' : cat
                      ),
                      datasets: [
                        {
                          data: Object.values(statistics.expensesByCategory),
                        },
                      ],
                    }}
                    width={screenWidth}
                    height={220}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
                    }}
                    verticalLabelRotation={30}
                    showValuesOnTopOfBars
                    fromZero
                    style={styles.chart}
                  />
                </ThemedView>
              ) : (
                <ThemedText style={styles.noDataText}>
                  Aucune donnée de dépenses par catégorie disponible.
                </ThemedText>
              )}
            </Collapsible>
          </>
        )}
        
        {activeTab === 'crops' && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Cultures</ThemedText>
            
            <ThemedText style={styles.chartTitle}>Récoltes par Type de Culture</ThemedText>
            
            {Object.keys(statistics.totalHarvest).length > 0 ? (
              <ThemedView style={styles.chartContainer}>
                <BarChart
                  data={{
                    labels: Object.keys(statistics.totalHarvest).map(crop => 
                      crop.length > 10 ? crop.substring(0, 10) + '...' : crop
                    ),
                    datasets: [
                      {
                        data: Object.values(statistics.totalHarvest).map(data => data.amount),
                      },
                    ],
                  }}
                  width={screenWidth}
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  }}
                  verticalLabelRotation={30}
                  showValuesOnTopOfBars
                  fromZero
                  style={styles.chart}
                />
              </ThemedView>
            ) : (
              <ThemedView style={styles.noDataContainer}>
                <IconSymbol name="leaf" size={48} color="#757575" />
                <ThemedText style={styles.noDataText}>
                  Aucune donnée de récolte disponible.
                </ThemedText>
                <ThemedText style={styles.noDataSubtext}>
                  Commencez à enregistrer vos récoltes pour voir les statistiques.
                </ThemedText>
              </ThemedView>
            )}
          </>
        )}
        
        {activeTab === 'animals' && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Animaux</ThemedText>
            
            <ThemedText style={styles.chartTitle}>Nombre d'Animaux par Type</ThemedText>
            
            {Object.keys(statistics.animalCount).length > 0 ? (
              <ThemedView style={styles.chartContainer}>
                <PieChart
                  data={Object.keys(statistics.animalCount).map((animalType, index) => ({
                    name: animalType,
                    population: statistics.animalCount[animalType],
                    color: [
                      '#FF9800', '#4CAF50', '#2196F3', '#9C27B0', 
                      '#F44336', '#009688', '#795548', '#607D8B'
                    ][index % 8],
                    legendFontColor: '#7F7F7F',
                    legendFontSize: 12,
                  }))}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </ThemedView>
            ) : (
              <ThemedView style={styles.noDataContainer}>
                <IconSymbol name="pawprint" size={48} color="#757575" />
                <ThemedText style={styles.noDataText}>
                  Aucune donnée d'animaux disponible.
                </ThemedText>
                <ThemedText style={styles.noDataSubtext}>
                  Commencez à enregistrer vos animaux pour voir les statistiques.
                </ThemedText>
              </ThemedView>
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 4,
    color: '#0a7ea4',
  },
  headerTitle: {
    textAlign: 'center',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#0a7ea4',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#757575',
  },
  activeTabButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
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
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  chartContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  noDataContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  noDataText: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
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
});
