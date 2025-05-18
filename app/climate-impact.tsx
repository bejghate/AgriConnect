import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUser } from '@/context/UserContext';

// Screen width for charts
const screenWidth = Dimensions.get('window').width - 32; // Accounting for padding

// Mock data for climate impact
const climateData = {
  temperature: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [25, 26, 27, 28, 29, 30],
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: [22, 23, 24, 25, 26, 27],
        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
        strokeWidth: 2,
        withDots: false,
      },
    ],
    legend: ['Current Year', '10-Year Average'],
  },
  rainfall: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [50, 45, 60, 70, 40, 30],
        color: (opacity = 1) => `rgba(0, 128, 255, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: [60, 55, 65, 75, 60, 50],
        color: (opacity = 1) => `rgba(128, 128, 128, ${opacity})`,
        strokeWidth: 2,
        withDots: false,
      },
    ],
    legend: ['Current Year', '10-Year Average'],
  },
};

// Mock data for climate advisories
const climateAdvisories = [
  {
    id: '1',
    title: 'Drought Risk Alert',
    description: 'Rainfall is 30% below average for this time of year. Consider water conservation measures.',
    severity: 'high',
    icon: 'drop.degreesign',
  },
  {
    id: '2',
    title: 'Heat Wave Warning',
    description: 'Temperatures expected to be 5°C above normal for the next 7 days. Protect sensitive crops.',
    severity: 'high',
    icon: 'thermometer.sun.fill',
  },
  {
    id: '3',
    title: 'Seasonal Shift Notice',
    description: 'Growing season is starting 2 weeks earlier than 10 years ago. Adjust planting schedules.',
    severity: 'medium',
    icon: 'calendar.badge.clock',
  },
];

// Mock data for adaptation strategies
const adaptationStrategies = [
  {
    id: '1',
    title: 'Drought-Resistant Crops',
    description: 'Switch to crop varieties that require less water and can withstand dry conditions.',
    icon: 'leaf.fill',
    color: '#4CAF50',
  },
  {
    id: '2',
    title: 'Water Management',
    description: 'Implement drip irrigation and water harvesting techniques to maximize water efficiency.',
    icon: 'drop.fill',
    color: '#2196F3',
  },
  {
    id: '3',
    title: 'Shade Structures',
    description: 'Use shade cloth or natural shade to protect sensitive crops during extreme heat.',
    icon: 'sun.max.trianglebadge.exclamationmark.fill',
    color: '#FF9800',
  },
  {
    id: '4',
    title: 'Soil Conservation',
    description: 'Use cover crops and no-till farming to improve soil health and water retention.',
    icon: 'square.3.layers.3d.down.right',
    color: '#795548',
  },
];

// Chart configuration
const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
  },
};

// Advisory card component
const AdvisoryCard = ({ advisory }) => (
  <ThemedView style={[styles.advisoryCard, getSeverityStyle(advisory.severity)]}>
    <ThemedView style={styles.advisoryIconContainer}>
      <IconSymbol size={24} name={advisory.icon} color="white" />
    </ThemedView>
    <ThemedView style={styles.advisoryContent}>
      <ThemedText type="defaultSemiBold">{advisory.title}</ThemedText>
      <ThemedText style={styles.advisoryDescription}>{advisory.description}</ThemedText>
    </ThemedView>
  </ThemedView>
);

// Strategy card component
const StrategyCard = ({ strategy }) => (
  <TouchableOpacity style={styles.strategyCard}>
    <ThemedView style={[styles.strategyIcon, { backgroundColor: strategy.color }]}>
      <IconSymbol size={24} name={strategy.icon} color="white" />
    </ThemedView>
    <ThemedText type="defaultSemiBold" style={styles.strategyTitle}>{strategy.title}</ThemedText>
    <ThemedText style={styles.strategyDescription} numberOfLines={3}>{strategy.description}</ThemedText>
  </TouchableOpacity>
);

// Get severity style
const getSeverityStyle = (severity) => {
  switch (severity) {
    case 'high':
      return styles.highSeverity;
    case 'medium':
      return styles.mediumSeverity;
    case 'low':
      return styles.lowSeverity;
    default:
      return {};
  }
};

export default function ClimateImpactScreen() {
  const router = useRouter();
  const { primaryUserType } = useUser();
  const [activeChart, setActiveChart] = useState<'temperature' | 'rainfall'>('temperature');
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8F5E9', dark: '#1B5E20' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#0a7ea4"
          name="cloud.sun.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Climate Impact</ThemedText>
      </ThemedView>
      
      <ThemedText style={styles.introText}>
        Monitor climate changes affecting your region and get adaptation strategies to mitigate their impact on your agricultural activities.
      </ThemedText>
      
      <ThemedText type="subtitle" style={styles.sectionTitle}>Climate Trends</ThemedText>
      
      <ThemedView style={styles.chartTabsContainer}>
        <TouchableOpacity 
          style={[styles.chartTab, activeChart === 'temperature' && styles.activeChartTab]}
          onPress={() => setActiveChart('temperature')}
        >
          <IconSymbol 
            name="thermometer" 
            size={16} 
            color={activeChart === 'temperature' ? 'white' : '#0a7ea4'} 
          />
          <ThemedText style={[
            styles.chartTabText, 
            activeChart === 'temperature' && styles.activeChartTabText
          ]}>
            Temperature
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.chartTab, activeChart === 'rainfall' && styles.activeChartTab]}
          onPress={() => setActiveChart('rainfall')}
        >
          <IconSymbol 
            name="drop.fill" 
            size={16} 
            color={activeChart === 'rainfall' ? 'white' : '#0a7ea4'} 
          />
          <ThemedText style={[
            styles.chartTabText, 
            activeChart === 'rainfall' && styles.activeChartTabText
          ]}>
            Rainfall
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedView style={styles.chartContainer}>
        <LineChart
          data={climateData[activeChart]}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          fromZero={activeChart === 'rainfall'}
          yAxisSuffix={activeChart === 'temperature' ? '°C' : 'mm'}
          yAxisInterval={1}
          verticalLabelRotation={0}
          withInnerLines={false}
          withOuterLines={true}
          withShadow={false}
          withDots={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          hidePointsAtIndex={[]}
          formatYLabel={(value) => `${value}`}
          formatXLabel={(value) => value}
          segments={5}
          legend={climateData[activeChart].legend}
        />
      </ThemedView>
      
      <ThemedText style={styles.chartCaption}>
        {activeChart === 'temperature' 
          ? 'Average monthly temperatures compared to 10-year historical average.' 
          : 'Monthly rainfall compared to 10-year historical average.'}
      </ThemedText>
      
      <ThemedText type="subtitle" style={styles.sectionTitle}>Climate Advisories</ThemedText>
      
      {climateAdvisories.map(advisory => (
        <AdvisoryCard key={advisory.id} advisory={advisory} />
      ))}
      
      <ThemedText type="subtitle" style={styles.sectionTitle}>Adaptation Strategies</ThemedText>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strategiesContainer}
      >
        {adaptationStrategies.map(strategy => (
          <StrategyCard key={strategy.id} strategy={strategy} />
        ))}
      </ScrollView>
      
      <Collapsible title="Long-term Climate Projections">
        <ThemedText>
          Climate models predict a 1.5-2°C increase in average temperatures and a 15% decrease in rainfall 
          for your region over the next 30 years. These changes will likely affect growing seasons, 
          water availability, and pest populations.
        </ThemedText>
        <TouchableOpacity style={styles.detailsButton}>
          <ThemedText style={styles.detailsButtonText}>View Detailed Projections</ThemedText>
        </TouchableOpacity>
      </Collapsible>
      
      <TouchableOpacity style={styles.customizeButton}>
        <IconSymbol name="gearshape.fill" size={20} color="white" style={styles.customizeButtonIcon} />
        <ThemedText style={styles.customizeButtonText}>Customize Climate Alerts</ThemedText>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -50,
    right: 20,
    position: 'absolute',
    opacity: 0.8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  introText: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  chartTabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chartTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeChartTab: {
    backgroundColor: '#0a7ea4',
  },
  chartTabText: {
    marginLeft: 8,
    color: '#0a7ea4',
  },
  activeChartTabText: {
    color: 'white',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 16,
  },
  chartCaption: {
    textAlign: 'center',
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
  },
  advisoryCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  highSeverity: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  mediumSeverity: {
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  lowSeverity: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  advisoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  advisoryContent: {
    flex: 1,
  },
  advisoryDescription: {
    marginTop: 4,
    fontSize: 14,
  },
  strategiesContainer: {
    paddingBottom: 16,
  },
  strategyCard: {
    width: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },
  strategyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  strategyTitle: {
    marginBottom: 8,
  },
  strategyDescription: {
    fontSize: 14,
    color: '#757575',
  },
  detailsButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  detailsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  customizeButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  customizeButtonIcon: {
    marginRight: 8,
  },
  customizeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
