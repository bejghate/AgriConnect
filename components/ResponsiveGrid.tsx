import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import useResponsive from '@/hooks/useResponsive';
import { SCREEN_SIZES } from '@/constants/Layout';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    small?: number;
    medium?: number;
    large?: number;
    tablet?: number;
  };
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Composant de grille responsive qui ajuste le nombre de colonnes en fonction de la taille de l'écran
 * 
 * Exemple d'utilisation:
 * <ResponsiveGrid
 *   columns={{
 *     small: 1,
 *     medium: 2,
 *     large: 3,
 *     tablet: 4
 *   }}
 *   spacing={16}
 * >
 *   {items.map(item => (
 *     <ItemComponent key={item.id} item={item} />
 *   ))}
 * </ResponsiveGrid>
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = {
    small: 1,
    medium: 2,
    large: 3,
    tablet: 4,
  },
  spacing = 16,
  style,
}) => {
  const { screenSize } = useResponsive();
  
  // Déterminer le nombre de colonnes en fonction de la taille de l'écran
  let numColumns = columns.medium || 2; // Valeur par défaut
  
  switch (screenSize) {
    case SCREEN_SIZES.SMALL:
      numColumns = columns.small || 1;
      break;
    case SCREEN_SIZES.MEDIUM:
      numColumns = columns.medium || 2;
      break;
    case SCREEN_SIZES.LARGE:
      numColumns = columns.large || 3;
      break;
    case SCREEN_SIZES.TABLET:
      numColumns = columns.tablet || 4;
      break;
  }
  
  // Convertir les enfants en tableau
  const childrenArray = React.Children.toArray(children);
  
  // Créer les rangées
  const rows = [];
  for (let i = 0; i < childrenArray.length; i += numColumns) {
    const rowItems = childrenArray.slice(i, i + numColumns);
    rows.push(rowItems);
  }
  
  return (
    <View style={[styles.container, style]}>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={[styles.row, { marginBottom: spacing }]}>
          {row.map((item, itemIndex) => (
            <View
              key={`item-${rowIndex}-${itemIndex}`}
              style={[
                styles.item,
                {
                  width: `${100 / numColumns}%`,
                  paddingHorizontal: spacing / 2,
                },
              ]}
            >
              {item}
            </View>
          ))}
          
          {/* Ajouter des éléments vides pour compléter la dernière rangée si nécessaire */}
          {row.length < numColumns &&
            Array(numColumns - row.length)
              .fill(null)
              .map((_, index) => (
                <View
                  key={`empty-${rowIndex}-${index}`}
                  style={[
                    styles.item,
                    {
                      width: `${100 / numColumns}%`,
                      paddingHorizontal: spacing / 2,
                    },
                  ]}
                />
              ))}
        </View>
      ))}
    </View>
  );
};

interface ResponsiveColumnProps {
  children: React.ReactNode;
  size?: {
    small?: number;
    medium?: number;
    large?: number;
    tablet?: number;
  };
  style?: StyleProp<ViewStyle>;
}

/**
 * Composant de colonne responsive qui ajuste sa largeur en fonction de la taille de l'écran
 * 
 * Exemple d'utilisation:
 * <View style={{ flexDirection: 'row' }}>
 *   <ResponsiveColumn
 *     size={{
 *       small: 12,
 *       medium: 6,
 *       large: 4,
 *       tablet: 3
 *     }}
 *   >
 *     <Content />
 *   </ResponsiveColumn>
 * </View>
 */
export const ResponsiveColumn: React.FC<ResponsiveColumnProps> = ({
  children,
  size = {
    small: 12,
    medium: 6,
    large: 4,
    tablet: 3,
  },
  style,
}) => {
  const { screenSize } = useResponsive();
  
  // Déterminer la taille de la colonne en fonction de la taille de l'écran (sur 12 colonnes)
  let columnSize = size.medium || 6; // Valeur par défaut
  
  switch (screenSize) {
    case SCREEN_SIZES.SMALL:
      columnSize = size.small || 12;
      break;
    case SCREEN_SIZES.MEDIUM:
      columnSize = size.medium || 6;
      break;
    case SCREEN_SIZES.LARGE:
      columnSize = size.large || 4;
      break;
    case SCREEN_SIZES.TABLET:
      columnSize = size.tablet || 3;
      break;
  }
  
  // Calculer la largeur en pourcentage (sur une base de 12 colonnes)
  const width = `${(columnSize / 12) * 100}%`;
  
  return (
    <View style={[{ width }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    marginBottom: 0,
  },
});

export default ResponsiveGrid;
