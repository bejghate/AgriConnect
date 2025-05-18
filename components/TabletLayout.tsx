import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import useResponsive from '@/hooks/useResponsive';

interface TabletLayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  sidebarWidth?: number | string;
  sidebarPosition?: 'left' | 'right';
  showSidebar?: boolean;
  mainStyle?: StyleProp<ViewStyle>;
  sidebarStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Composant de mise en page pour tablettes qui affiche une barre latérale et un contenu principal
 * 
 * Exemple d'utilisation:
 * <TabletLayout
 *   sidebarContent={<SidebarMenu />}
 *   sidebarWidth={300}
 *   sidebarPosition="left"
 * >
 *   <MainContent />
 * </TabletLayout>
 */
export const TabletLayout: React.FC<TabletLayoutProps> = ({
  children,
  sidebarContent,
  sidebarWidth = 300,
  sidebarPosition = 'left',
  showSidebar = true,
  mainStyle,
  sidebarStyle,
  containerStyle,
}) => {
  const { isTablet } = useResponsive();

  // Si ce n'est pas une tablette ou si la barre latérale ne doit pas être affichée,
  // afficher uniquement le contenu principal
  if (!isTablet || !showSidebar || !sidebarContent) {
    return <View style={[styles.container, containerStyle]}>{children}</View>;
  }

  return (
    <View
      style={[
        styles.container,
        styles.tabletContainer,
        sidebarPosition === 'right' && styles.reverseContainer,
        containerStyle,
      ]}
    >
      <View
        style={[
          styles.sidebar,
          { width: sidebarWidth },
          sidebarStyle,
        ]}
      >
        {sidebarContent}
      </View>
      <View style={[styles.main, mainStyle]}>{children}</View>
    </View>
  );
};

interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
  ratio?: number;
  dividerColor?: string;
  dividerWidth?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Composant de vue divisée pour tablettes qui affiche deux contenus côte à côte
 * 
 * Exemple d'utilisation:
 * <SplitView
 *   left={<LeftContent />}
 *   right={<RightContent />}
 *   ratio={0.4}
 *   dividerColor="#e0e0e0"
 *   dividerWidth={1}
 * />
 */
export const SplitView: React.FC<SplitViewProps> = ({
  left,
  right,
  ratio = 0.5,
  dividerColor = '#e0e0e0',
  dividerWidth = 1,
  style,
}) => {
  const { isTablet, isLandscape } = useResponsive();

  // Si ce n'est pas une tablette ou si l'orientation est portrait,
  // afficher les contenus l'un au-dessus de l'autre
  if (!isTablet || !isLandscape) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.splitVerticalTop}>{left}</View>
        <View style={[styles.divider, { height: dividerWidth, backgroundColor: dividerColor }]} />
        <View style={styles.splitVerticalBottom}>{right}</View>
      </View>
    );
  }

  // Sinon, afficher les contenus côte à côte
  return (
    <View style={[styles.container, styles.splitContainer, style]}>
      <View style={[styles.splitLeft, { flex: ratio }]}>{left}</View>
      <View style={[styles.divider, { width: dividerWidth, backgroundColor: dividerColor }]} />
      <View style={[styles.splitRight, { flex: 1 - ratio }]}>{right}</View>
    </View>
  );
};

interface MasterDetailProps {
  master: React.ReactNode;
  detail: React.ReactNode;
  masterWidth?: number | string;
  showMaster?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Composant maître-détail pour tablettes qui affiche une liste maître et un détail
 * 
 * Exemple d'utilisation:
 * <MasterDetail
 *   master={<ItemsList onSelectItem={setSelectedItem} />}
 *   detail={<ItemDetail item={selectedItem} />}
 *   masterWidth={300}
 * />
 */
export const MasterDetail: React.FC<MasterDetailProps> = ({
  master,
  detail,
  masterWidth = 300,
  showMaster = true,
  style,
}) => {
  const { isTablet } = useResponsive();

  // Si ce n'est pas une tablette ou si le maître ne doit pas être affiché,
  // afficher uniquement le détail
  if (!isTablet || !showMaster) {
    return <View style={[styles.container, style]}>{detail}</View>;
  }

  return (
    <View style={[styles.container, styles.masterDetailContainer, style]}>
      <View style={[styles.master, { width: masterWidth }]}>{master}</View>
      <View style={styles.detail}>{detail}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabletContainer: {
    flexDirection: 'row',
  },
  reverseContainer: {
    flexDirection: 'row-reverse',
  },
  sidebar: {
    backgroundColor: '#f5f5f5',
  },
  main: {
    flex: 1,
  },
  splitContainer: {
    flexDirection: 'row',
  },
  splitLeft: {
    backgroundColor: '#f5f5f5',
  },
  splitRight: {
    backgroundColor: '#ffffff',
  },
  splitVerticalTop: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  splitVerticalBottom: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  divider: {
    backgroundColor: '#e0e0e0',
  },
  masterDetailContainer: {
    flexDirection: 'row',
  },
  master: {
    backgroundColor: '#f5f5f5',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  detail: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default TabletLayout;
