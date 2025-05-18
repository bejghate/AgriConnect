import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { Chip } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import {
  marketStatistics,
  priceTrends,
  PriceTrend,
  productCategories,
  serviceCategories
} from '@/data/marketplace';

// Price trend chart component
const PriceTrendChart = ({ priceTrend, timeRange = '6m' }) => {
  // Filter historical prices based on time range
  const getFilteredPrices = () => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (timeRange) {
      case '1m':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setMonth(now.getMonth() - 6);
    }

    const filteredPrices = priceTrend.historicalPrices.filter(
      price => new Date(price.date) >= cutoffDate
    );

    // Add forecast prices if they exist and we're looking at a longer timeframe
    if (priceTrend.forecastPrices && (timeRange === '6m' || timeRange === '1y')) {
      return [...filteredPrices, ...priceTrend.forecastPrices];
    }

    return filteredPrices;
  };

  const filteredPrices = getFilteredPrices();

  // Prepare data for the chart
  const chartData = {
    labels: filteredPrices.map(price => {
      const date = new Date(price.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: filteredPrices.map(price => price.price),
        color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: [`${priceTrend.productName} Price (${priceTrend.currentPrice.currency})`]
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#0a7ea4'
    }
  };

  const screenWidth = Dimensions.get('window').width - 32; // Accounting for padding

  return (
    <ThemedView style={styles.chartContainer}>
      <LineChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </ThemedView>
  );
};

// Regional price comparison component
const RegionalPriceComparison = ({ priceTrend }) => {
  if (!priceTrend.regionalPrices || priceTrend.regionalPrices.length === 0) {
    return null;
  }

  // Sort by price (lowest to highest)
  const sortedPrices = [...priceTrend.regionalPrices].sort((a, b) => a.price - b.price);

  return (
    <ThemedView style={styles.regionalPricesContainer}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>Regional Price Comparison</ThemedText>

      {sortedPrices.map((regionalPrice, index) => (
        <ThemedView key={index} style={styles.regionalPriceItem}>
          <ThemedText style={styles.regionName}>{regionalPrice.region}</ThemedText>
          <ThemedText style={styles.regionPrice}>
            {regionalPrice.price.toLocaleString()} {regionalPrice.currency}
          </ThemedText>

          {index === 0 && (
            <ThemedView style={[styles.priceBadge, styles.lowestPriceBadge]}>
              <ThemedText style={styles.priceBadgeText}>Lowest</ThemedText>
            </ThemedView>
          )}

          {index === sortedPrices.length - 1 && index !== 0 && (
            <ThemedView style={[styles.priceBadge, styles.highestPriceBadge]}>
              <ThemedText style={styles.priceBadgeText}>Highest</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      ))}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    padding: 8,
    paddingHorizontal: 16,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
  },
  scrollContent: {
    padding: 16,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  lastUpdatedText: {
    marginLeft: 8,
    color: '#757575',
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  priceTrendContainer: {
    marginTop: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  priceTrendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productName: {
    fontSize: 16,
    flex: 1,
  },
  currentPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 18,
    color: '#0a7ea4',
  },
  priceChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  priceIncreaseBadge: {
    backgroundColor: '#4CAF50',
  },
  priceDecreaseBadge: {
    backgroundColor: '#F44336',
  },
  priceChangeText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  selectedTimeRangeButton: {
    backgroundColor: '#0a7ea4',
  },
  timeRangeText: {
    fontSize: 12,
    color: '#757575',
  },
  selectedTimeRangeText: {
    color: 'white',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  regionalPricesContainer: {
    marginTop: 16,
  },
  regionalPriceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  regionName: {
    flex: 1,
  },
  regionPrice: {
    fontWeight: '500',
    marginRight: 8,
  },
  priceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lowestPriceBadge: {
    backgroundColor: '#4CAF50',
  },
  highestPriceBadge: {
    backgroundColor: '#F44336',
  },
  priceBadgeText: {
    color: 'white',
    fontSize: 10,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  topProductRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
  },
  topProductInfo: {
    flex: 1,
  },
  topProductName: {
    marginBottom: 4,
  },
  topProductCategory: {
    fontSize: 12,
    color: '#757575',
  },
  topProductVolume: {
    fontWeight: '500',
  },
  priceIndexItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  priceIndexCategory: {
    flex: 1,
  },
  priceIndexValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceIndexCurrent: {
    fontWeight: '500',
    marginRight: 8,
  },
  priceIndexChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indexNote: {
    marginTop: 8,
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
  },
});

export default function MarketStatisticsScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceTrend, setSelectedPriceTrend] = useState<PriceTrend | null>(null);
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('6m');

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setTimeout(() => {
        // Set default selected price trend to the first one
        if (priceTrends.length > 0) {
          setSelectedPriceTrend(priceTrends[0]);
        }

        setIsLoading(false);
      }, 1000);
    };

    loadData();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);

    // Find a price trend for this category
    const matchingTrend = priceTrends.find(trend => trend.category === categoryId);
    if (matchingTrend) {
      setSelectedPriceTrend(matchingTrend);
    }
  };

  const handlePriceTrendSelect = (trend: PriceTrend) => {
    setSelectedPriceTrend(trend);
    setSelectedCategory(trend.category);
  };

  const handleTimeRangeSelect = (range: '1m' | '3m' | '6m' | '1y') => {
    setTimeRange(range);
  };

  const navigateBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading market statistics...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={24} color="#0a7ea4" />
        </TouchableOpacity>
        <ThemedText type="title">Market Statistics</ThemedText>
      </ThemedView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Market statistics may not be up-to-date.
          </ThemedText>
        </ThemedView>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.lastUpdatedContainer}>
          <IconSymbol name="clock" size={14} color="#757575" />
          <ThemedText style={styles.lastUpdatedText}>
            Last updated: {new Date(marketStatistics.lastUpdated).toLocaleString()}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Price Trends</ThemedText>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {productCategories.map(category => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => handleCategorySelect(category.id)}
                style={styles.categoryChip}
                selectedColor="#0a7ea4"
              >
                {category.name}
              </Chip>
            ))}
          </ScrollView>

          {selectedPriceTrend && (
            <ThemedView style={styles.priceTrendContainer}>
              <ThemedView style={styles.priceTrendHeader}>
                <ThemedText type="defaultSemiBold" style={styles.productName}>
                  {selectedPriceTrend.productName}
                </ThemedText>

                <ThemedView style={styles.currentPriceContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.currentPrice}>
                    {selectedPriceTrend.currentPrice.amount.toLocaleString()} {selectedPriceTrend.currentPrice.currency}
                  </ThemedText>

                  {selectedPriceTrend.comparedToLastMonth !== undefined && (
                    <ThemedView style={[
                      styles.priceChangeBadge,
                      selectedPriceTrend.comparedToLastMonth >= 0 ? styles.priceIncreaseBadge : styles.priceDecreaseBadge
                    ]}>
                      <IconSymbol
                        name={selectedPriceTrend.comparedToLastMonth >= 0 ? "arrow.up" : "arrow.down"}
                        size={12}
                        color="white"
                      />
                      <ThemedText style={styles.priceChangeText}>
                        {Math.abs(selectedPriceTrend.comparedToLastMonth).toFixed(1)}%
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.timeRangeContainer}>
                {['1m', '3m', '6m', '1y'].map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.timeRangeButton,
                      timeRange === range && styles.selectedTimeRangeButton
                    ]}
                    onPress={() => handleTimeRangeSelect(range as '1m' | '3m' | '6m' | '1y')}
                  >
                    <ThemedText style={[
                      styles.timeRangeText,
                      timeRange === range && styles.selectedTimeRangeText
                    ]}>
                      {range}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>

              <PriceTrendChart priceTrend={selectedPriceTrend} timeRange={timeRange} />

              <RegionalPriceComparison priceTrend={selectedPriceTrend} />
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Top Selling Products</ThemedText>

          {marketStatistics.topSellingProducts.map((product, index) => (
            <ThemedView key={index} style={styles.topProductItem}>
              <ThemedView style={styles.topProductRank}>
                <ThemedText style={styles.rankText}>{index + 1}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.topProductInfo}>
                <ThemedText type="defaultSemiBold" style={styles.topProductName}>
                  {product.productName}
                </ThemedText>
                <ThemedText style={styles.topProductCategory}>
                  {productCategories.find(cat => cat.id === product.category)?.name || product.category}
                </ThemedText>
              </ThemedView>

              <ThemedText style={styles.topProductVolume}>
                {product.volumeSold.toLocaleString()} {product.unit}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Price Indices</ThemedText>

          {marketStatistics.priceIndices.map((index, i) => (
            <ThemedView key={i} style={styles.priceIndexItem}>
              <ThemedText style={styles.priceIndexCategory}>
                {productCategories.find(cat => cat.id === index.category)?.name || index.category}
              </ThemedText>

              <ThemedView style={styles.priceIndexValues}>
                <ThemedText style={styles.priceIndexCurrent}>
                  {index.currentIndex.toFixed(1)}
                </ThemedText>

                <ThemedView style={[
                  styles.priceIndexChangeBadge,
                  index.percentageChange >= 0 ? styles.priceIncreaseBadge : styles.priceDecreaseBadge
                ]}>
                  <IconSymbol
                    name={index.percentageChange >= 0 ? "arrow.up" : "arrow.down"}
                    size={12}
                    color="white"
                  />
                  <ThemedText style={styles.priceChangeText}>
                    {Math.abs(index.percentageChange).toFixed(1)}%
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          ))}

          <ThemedText style={styles.indexNote}>
            Note: Price indices are based on a baseline of 100 from the previous year.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}
