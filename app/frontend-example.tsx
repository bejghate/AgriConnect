import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Button, 
  Card, 
  Title, 
  Paragraph, 
  Divider, 
  List, 
  Chip, 
  TextInput, 
  Switch,
  ProgressBar,
  Snackbar,
  FAB,
  IconButton,
  Avatar,
  Badge,
  Portal,
  Dialog,
  RadioButton
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { useEncyclopediaStore } from '@/store/useEncyclopediaStore';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { useFarmManagementStore } from '@/store/useFarmManagementStore';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { COLORS } from '@/constants/Theme';
import { useResponsive } from '@/hooks/useResponsive';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { ResponsiveText } from '@/components/ResponsiveText';
import { TabletLayout } from '@/components/TabletLayout';
import NotificationService from '@/services/NotificationService';
import api from '@/utils/api';

export default function FrontendExampleScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isTablet, screenSize } = useResponsive();
  
  // Zustand stores
  const { user, login, logout, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { isOnline, settings, updateSettings } = useAppStore();
  const { articles, fetchArticles, isLoading: encyclopediaLoading } = useEncyclopediaStore();
  const { products, fetchProducts, isLoading: marketplaceLoading } = useMarketplaceStore();
  const { logEntries, fetchLogEntries, isLoading: farmLoading } = useFarmManagementStore();
  
  // Local state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(settings.theme);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Fetch data on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchArticles();
      fetchProducts();
      fetchLogEntries();
    }
  }, [isAuthenticated]);
  
  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      setSnackbarMessage('Veuillez entrer un email et un mot de passe');
      setShowSnackbar(true);
      return;
    }
    
    try {
      await login(email, password);
      setSnackbarMessage('Connexion réussie');
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage('Échec de la connexion');
      setShowSnackbar(true);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    setSnackbarMessage('Déconnexion réussie');
    setShowSnackbar(true);
  };
  
  // Handle theme change
  const handleThemeChange = () => {
    updateSettings({ theme: selectedTheme });
    setShowDialog(false);
    setSnackbarMessage(`Thème ${selectedTheme} appliqué`);
    setShowSnackbar(true);
  };
  
  // Handle push notification registration
  const handleRegisterForPushNotifications = async () => {
    try {
      await NotificationService.registerForPushNotifications();
      setSnackbarMessage('Enregistrement pour les notifications push réussi');
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage('Échec de l\'enregistrement pour les notifications push');
      setShowSnackbar(true);
    }
  };
  
  // Handle API call example
  const handleApiCall = async () => {
    try {
      // This is just an example, it won't actually work without a real API
      const response = await api.get('/example');
      setSnackbarMessage('Appel API réussi');
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage('Échec de l\'appel API');
      setShowSnackbar(true);
    }
  };
  
  // Render login form
  const renderLoginForm = () => (
    <Card style={styles.card}>
      <Card.Title title="Connexion" subtitle="Entrez vos identifiants" />
      <Card.Content>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />
        <Button 
          mode="contained" 
          onPress={handleLogin} 
          loading={authLoading}
          style={styles.button}
        >
          Se connecter
        </Button>
      </Card.Content>
    </Card>
  );
  
  // Render user profile
  const renderUserProfile = () => (
    <Card style={styles.card}>
      <Card.Title
        title={user?.fullName || 'Utilisateur'}
        subtitle={user?.email || ''}
        left={(props) => (
          <Avatar.Image
            {...props}
            source={{ uri: user?.profileImage || 'https://via.placeholder.com/40' }}
          />
        )}
      />
      <Card.Content>
        <Paragraph>Type d'utilisateur principal: {user?.primaryUserType}</Paragraph>
        <View style={styles.chipContainer}>
          {user?.userTypes.map((type) => (
            <Chip key={type} style={styles.chip}>{type}</Chip>
          ))}
        </View>
      </Card.Content>
      <Card.Actions>
        <Button onPress={handleLogout}>Déconnexion</Button>
      </Card.Actions>
    </Card>
  );
  
  // Render settings
  const renderSettings = () => (
    <Card style={styles.card}>
      <Card.Title title="Paramètres" />
      <Card.Content>
        <List.Item
          title="Mode hors ligne"
          right={() => (
            <Switch
              value={settings.offlineMode}
              onValueChange={(value) => updateSettings({ offlineMode: value })}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Notifications"
          right={() => (
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Thème"
          description={settings.theme}
          onPress={() => setShowDialog(true)}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </Card.Content>
    </Card>
  );
  
  // Render data preview
  const renderDataPreview = () => (
    <Card style={styles.card}>
      <Card.Title title="Aperçu des données" />
      <Card.Content>
        <Title style={styles.subtitle}>Encyclopédie</Title>
        {encyclopediaLoading ? (
          <ProgressBar indeterminate />
        ) : (
          <Paragraph>
            {articles.length} articles disponibles
          </Paragraph>
        )}
        
        <Title style={styles.subtitle}>Marketplace</Title>
        {marketplaceLoading ? (
          <ProgressBar indeterminate />
        ) : (
          <Paragraph>
            {products.length} produits disponibles
          </Paragraph>
        )}
        
        <Title style={styles.subtitle}>Gestion d'exploitation</Title>
        {farmLoading ? (
          <ProgressBar indeterminate />
        ) : (
          <Paragraph>
            {logEntries.length} entrées dans le carnet de bord
          </Paragraph>
        )}
      </Card.Content>
    </Card>
  );
  
  // Render Material UI components showcase
  const renderComponentsShowcase = () => (
    <Card style={styles.card}>
      <Card.Title title="Composants Material UI" />
      <Card.Content>
        <View style={styles.componentsRow}>
          <Button mode="contained" style={styles.component}>
            Bouton
          </Button>
          <Button mode="outlined" style={styles.component}>
            Bouton
          </Button>
          <Button mode="text" style={styles.component}>
            Bouton
          </Button>
        </View>
        
        <View style={styles.componentsRow}>
          <Chip icon="information" style={styles.component}>Chip</Chip>
          <Badge style={styles.badge}>3</Badge>
          <IconButton icon="star" size={24} />
        </View>
        
        <ProgressBar progress={0.5} style={styles.progressBar} />
      </Card.Content>
    </Card>
  );
  
  // Render responsive design showcase
  const renderResponsiveShowcase = () => (
    <Card style={styles.card}>
      <Card.Title title="Design Responsive" />
      <Card.Content>
        <ResponsiveText
          sizes={{
            small: 14,
            medium: 16,
            large: 18,
            tablet: 20
          }}
          style={{ marginBottom: 8 }}
        >
          Taille d'écran actuelle: {screenSize}
        </ResponsiveText>
        
        <ResponsiveGrid
          columns={{
            small: 2,
            medium: 3,
            large: 4,
            tablet: 6
          }}
          spacing={8}
        >
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <View key={item} style={styles.gridItem}>
              <ThemedText>{item}</ThemedText>
            </View>
          ))}
        </ResponsiveGrid>
      </Card.Content>
    </Card>
  );
  
  // Main render
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Retour</ThemedText>
        </TouchableOpacity>
        
        <ThemedText type="subtitle" style={styles.headerTitle}>
          Exemple Frontend
        </ThemedText>
        
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
      
      <TabletLayout
        sidebarContent={
          <ThemedView style={styles.sidebar}>
            <ThemedText type="subtitle" style={styles.sidebarTitle}>
              Navigation
            </ThemedText>
            <List.Item
              title="Accueil"
              left={props => <List.Icon {...props} icon="home" />}
              onPress={() => router.push('/')}
            />
            <List.Item
              title="Encyclopédie"
              left={props => <List.Icon {...props} icon="book" />}
              onPress={() => router.push('/encyclopedia')}
            />
            <List.Item
              title="Marketplace"
              left={props => <List.Icon {...props} icon="cart" />}
              onPress={() => router.push('/marketplace')}
            />
            <List.Item
              title="Gestion d'exploitation"
              left={props => <List.Icon {...props} icon="chart-bar" />}
              onPress={() => router.push('/farm-management')}
            />
          </ThemedView>
        }
        showSidebar={isTablet}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={styles.description}>
            Cet écran présente un exemple d'utilisation des composants Material UI, de la gestion d'état avec Zustand, et des appels API avec Axios dans l'application AgriConnect.
          </ThemedText>
          
          {isAuthenticated ? renderUserProfile() : renderLoginForm()}
          
          {renderSettings()}
          
          {isAuthenticated && renderDataPreview()}
          
          {renderComponentsShowcase()}
          
          {renderResponsiveShowcase()}
          
          <Card style={styles.card}>
            <Card.Title title="Fonctionnalités" />
            <Card.Content>
              <Button 
                mode="contained" 
                icon="bell" 
                onPress={handleRegisterForPushNotifications}
                style={styles.actionButton}
              >
                Activer les notifications
              </Button>
              
              <Button 
                mode="outlined" 
                icon="api" 
                onPress={handleApiCall}
                style={styles.actionButton}
              >
                Exemple d'appel API
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </TabletLayout>
      
      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>Choisir un thème</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={setSelectedTheme} value={selectedTheme}>
              <RadioButton.Item label="Clair" value="light" />
              <RadioButton.Item label="Sombre" value="dark" />
              <RadioButton.Item label="Système" value="system" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Annuler</Button>
            <Button onPress={handleThemeChange}>Appliquer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setShowSnackbar(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
      
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          setSnackbarMessage('Bouton d\'action flottant pressé');
          setShowSnackbar(true);
        }}
      />
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  description: {
    marginBottom: 24,
    color: '#757575',
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  componentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  component: {
    marginRight: 8,
  },
  badge: {
    marginRight: 16,
  },
  progressBar: {
    marginVertical: 8,
  },
  gridItem: {
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  actionButton: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  sidebar: {
    padding: 16,
  },
  sidebarTitle: {
    marginBottom: 16,
  },
});
