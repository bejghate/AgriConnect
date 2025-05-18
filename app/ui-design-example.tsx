import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Divider, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AppHeader } from '@/components/navigation/AppHeader';
import { NatureCard } from '@/components/ui/NatureCard';
import { NatureButton } from '@/components/ui/NatureButton';
import { NatureList, ListItem } from '@/components/ui/NatureList';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useResponsive } from '@/hooks/useResponsive';
import { COLORS } from '@/constants/Theme';

// Données d'exemple pour les cartes
const EXAMPLE_CARDS = [
  {
    id: '1',
    title: 'Cultures',
    subtitle: 'Gestion des cultures',
    description: 'Suivez vos cultures et optimisez votre rendement',
    image: require('@/assets/images/crops.jpg'),
    icon: 'leaf',
    category: 'crops',
  },
  {
    id: '2',
    title: 'Élevage',
    subtitle: 'Gestion du bétail',
    description: 'Suivez la santé et la productivité de votre bétail',
    image: require('@/assets/images/livestock.jpg'),
    icon: 'pawprint',
    category: 'livestock',
  },
  {
    id: '3',
    title: 'Sol',
    subtitle: 'Analyse du sol',
    description: 'Surveillez la qualité et la fertilité de votre sol',
    image: require('@/assets/images/soil.jpg'),
    icon: 'drop',
    category: 'soil',
  },
  {
    id: '4',
    title: 'Météo',
    subtitle: 'Prévisions météorologiques',
    description: 'Restez informé des conditions météorologiques à venir',
    image: require('@/assets/images/weather.jpg'),
    icon: 'cloud',
    category: 'weather',
  },
];

// Données d'exemple pour la liste
const EXAMPLE_LIST_ITEMS: ListItem[] = [
  {
    id: '1',
    title: 'Blé',
    subtitle: 'Triticum',
    description: 'Céréale cultivée dans le monde entier, utilisée principalement pour la farine',
    icon: 'leaf',
    category: 'crops',
  },
  {
    id: '2',
    title: 'Maïs',
    subtitle: 'Zea mays',
    description: 'Céréale à haut rendement utilisée pour l\'alimentation humaine et animale',
    icon: 'leaf',
    category: 'crops',
  },
  {
    id: '3',
    title: 'Vaches',
    subtitle: 'Bos taurus',
    description: 'Élevées pour la production de lait et de viande',
    icon: 'pawprint',
    category: 'livestock',
    badge: 12,
  },
  {
    id: '4',
    title: 'Moutons',
    subtitle: 'Ovis aries',
    description: 'Élevés pour la laine, le lait et la viande',
    icon: 'pawprint',
    category: 'livestock',
    badge: 'Nouveau',
    badgeColor: COLORS.state.success,
  },
  {
    id: '5',
    title: 'Analyse du pH',
    subtitle: 'Acidité du sol',
    description: 'Mesure de l\'acidité ou de l\'alcalinité du sol',
    icon: 'eyedropper',
    category: 'soil',
  },
];

// Palette de couleurs pour l'exemple
const COLOR_PALETTE = [
  { name: 'Primaire', colors: [COLORS.primary.light, COLORS.primary.main, COLORS.primary.dark] },
  { name: 'Secondaire', colors: [COLORS.secondary.light, COLORS.secondary.main, COLORS.secondary.dark] },
  { name: 'Accent', colors: [COLORS.accent.light, COLORS.accent.main, COLORS.accent.dark] },
  { name: 'Printemps', colors: [COLORS.seasons.spring.light, COLORS.seasons.spring.main, COLORS.seasons.spring.dark] },
  { name: 'Été', colors: [COLORS.seasons.summer.light, COLORS.seasons.summer.main, COLORS.seasons.summer.dark] },
  { name: 'Automne', colors: [COLORS.seasons.autumn.light, COLORS.seasons.autumn.main, COLORS.seasons.autumn.dark] },
  { name: 'Hiver', colors: [COLORS.seasons.winter.light, COLORS.seasons.winter.main, COLORS.seasons.winter.dark] },
];

export default function UIDesignExampleScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { isTablet, screenSize } = useResponsive();
  const [selectedTab, setSelectedTab] = useState<string>('cards');
  
  // Gérer l'appui sur une carte
  const handleCardPress = (card: any) => {
    console.log('Card pressed:', card.title);
  };
  
  // Gérer l'appui sur un élément de liste
  const handleListItemPress = (item: ListItem) => {
    console.log('List item pressed:', item.title);
  };
  
  // Rendu des exemples de cartes
  const renderCardExamples = () => (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Cartes
      </ThemedText>
      
      <ThemedText style={styles.sectionDescription}>
        Différentes variantes de cartes inspirées de la nature
      </ThemedText>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
      >
        {EXAMPLE_CARDS.map((card, index) => (
          <NatureCard
            key={card.id}
            title={card.title}
            subtitle={card.subtitle}
            description={card.description}
            image={card.image}
            icon={card.icon}
            iconColor={COLORS.categories[card.category as keyof typeof COLORS.categories]}
            variant="default"
            size="medium"
            shape="rounded"
            onPress={() => handleCardPress(card)}
            style={{ width: isTablet ? width / 3 - 24 : width - 48 }}
          />
        ))}
      </ScrollView>
      
      <View style={styles.cardVariantsContainer}>
        <NatureCard
          title="Carte avec contour"
          subtitle="Variante outlined"
          icon="leaf"
          variant="outlined"
          size="small"
          onPress={() => {}}
          style={{ flex: 1, margin: 4 }}
        />
        
        <NatureCard
          title="Carte remplie"
          subtitle="Variante filled"
          icon="drop"
          variant="filled"
          size="small"
          onPress={() => {}}
          style={{ flex: 1, margin: 4 }}
        />
        
        <NatureCard
          title="Carte dégradée"
          subtitle="Variante gradient"
          icon="sun.max"
          variant="gradient"
          size="small"
          gradientColors={COLORS.gradients.forest}
          onPress={() => {}}
          style={{ flex: 1, margin: 4 }}
        />
      </View>
    </View>
  );
  
  // Rendu des exemples de boutons
  const renderButtonExamples = () => (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Boutons
      </ThemedText>
      
      <ThemedText style={styles.sectionDescription}>
        Différentes variantes de boutons inspirés de la nature
      </ThemedText>
      
      <View style={styles.buttonRow}>
        <NatureButton
          label="Bouton principal"
          icon="leaf"
          variant="filled"
          color="primary"
          onPress={() => {}}
          style={styles.button}
        />
        
        <NatureButton
          label="Bouton secondaire"
          icon="drop"
          variant="outlined"
          color="secondary"
          onPress={() => {}}
          style={styles.button}
        />
      </View>
      
      <View style={styles.buttonRow}>
        <NatureButton
          label="Bouton texte"
          icon="sun.max"
          variant="text"
          color="accent"
          onPress={() => {}}
          style={styles.button}
        />
        
        <NatureButton
          label="Bouton dégradé"
          icon="cloud"
          variant="gradient"
          gradientColors={COLORS.gradients.sunrise}
          onPress={() => {}}
          style={styles.button}
        />
      </View>
      
      <View style={styles.buttonRow}>
        <NatureButton
          icon="plus"
          variant="icon"
          color="success"
          onPress={() => {}}
          style={styles.iconButton}
        />
        
        <NatureButton
          icon="heart"
          variant="icon"
          color="error"
          onPress={() => {}}
          style={styles.iconButton}
        />
        
        <NatureButton
          icon="star"
          variant="icon"
          color="warning"
          onPress={() => {}}
          style={styles.iconButton}
        />
        
        <NatureButton
          icon="bookmark"
          variant="icon"
          color="info"
          onPress={() => {}}
          style={styles.iconButton}
        />
      </View>
    </View>
  );
  
  // Rendu des exemples de listes
  const renderListExamples = () => (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Listes
      </ThemedText>
      
      <ThemedText style={styles.sectionDescription}>
        Différentes variantes d'éléments de liste inspirés de la nature
      </ThemedText>
      
      <View style={styles.listContainer}>
        <NatureList
          data={EXAMPLE_LIST_ITEMS}
          variant="default"
          onItemPress={handleListItemPress}
          showDividers={true}
          style={styles.list}
        />
      </View>
    </View>
  );
  
  // Rendu de la palette de couleurs
  const renderColorPalette = () => (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Palette de couleurs
      </ThemedText>
      
      <ThemedText style={styles.sectionDescription}>
        Palette de couleurs inspirée de la nature
      </ThemedText>
      
      <View style={styles.colorPaletteContainer}>
        {COLOR_PALETTE.map((palette, index) => (
          <View key={index} style={styles.colorPaletteRow}>
            <ThemedText style={styles.colorPaletteName}>{palette.name}</ThemedText>
            <View style={styles.colorSwatchContainer}>
              {palette.colors.map((color, colorIndex) => (
                <View
                  key={colorIndex}
                  style={[styles.colorSwatch, { backgroundColor: color }]}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
  
  // Rendu des exemples d'icônes
  const renderIconExamples = () => (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Icônes
      </ThemedText>
      
      <ThemedText style={styles.sectionDescription}>
        Icônes inspirées de la nature
      </ThemedText>
      
      <View style={styles.iconsContainer}>
        {[
          'leaf', 'drop', 'sun.max', 'cloud', 'wind', 'thermometer',
          'pawprint', 'scissors', 'eyedropper', 'tag', 'cart', 'map',
        ].map((iconName, index) => (
          <View key={index} style={styles.iconItem}>
            <IconSymbol
              name={iconName as any}
              size={32}
              color={theme.colors.primary}
            />
            <ThemedText style={styles.iconName}>{iconName}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
  
  return (
    <ThemedView style={styles.container}>
      <AppHeader
        title="Design UI"
        subtitle="Inspiré de la nature"
        showBack
        onMenuPress={() => router.back()}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={COLORS.gradients.forest}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ThemedText style={styles.headerTitle}>
            Design inspiré de la nature
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Une interface utilisateur moderne et responsive
          </ThemedText>
        </LinearGradient>
        
        {renderCardExamples()}
        <Divider style={styles.divider} />
        {renderButtonExamples()}
        <Divider style={styles.divider} />
        {renderListExamples()}
        <Divider style={styles.divider} />
        {renderColorPalette()}
        <Divider style={styles.divider} />
        {renderIconExamples()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionDescription: {
    marginBottom: 16,
    opacity: 0.7,
  },
  cardsContainer: {
    paddingBottom: 16,
  },
  cardVariantsContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  iconButton: {
    marginHorizontal: 4,
  },
  listContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  list: {
    maxHeight: 300,
  },
  colorPaletteContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  colorPaletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorPaletteName: {
    width: 100,
    fontWeight: '600',
  },
  colorSwatchContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  colorSwatch: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 4,
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  iconItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    marginHorizontal: 16,
  },
});
