import { StyleSheet } from 'react-native';
import { COLORS } from './Theme';

// Styles globaux pour l'application
export const globalStyles = StyleSheet.create({
  // Conteneurs
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  contentContainer: {
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Cartes et sections
  card: {
    backgroundColor: COLORS.background.paper,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  
  // Texte
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  
  // Boutons
  primaryButton: {
    backgroundColor: COLORS.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: COLORS.primary.main,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Formulaires
  input: {
    backgroundColor: COLORS.background.paper,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  inputError: {
    color: COLORS.state.error,
    fontSize: 14,
    marginTop: 4,
  },
  
  // Images
  roundImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  banner: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  
  // Listes
  listItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  listItemText: {
    flex: 1,
    marginLeft: 16,
  },
  
  // Espacement
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },
  mv8: { marginVertical: 8 },
  mv16: { marginVertical: 16 },
  mv24: { marginVertical: 24 },
  mh8: { marginHorizontal: 8 },
  mh16: { marginHorizontal: 16 },
  mh24: { marginHorizontal: 24 },
  p8: { padding: 8 },
  p16: { padding: 16 },
  p24: { padding: 24 },
  
  // États
  success: {
    color: COLORS.state.success,
  },
  error: {
    color: COLORS.state.error,
  },
  warning: {
    color: COLORS.state.warning,
  },
  info: {
    color: COLORS.state.info,
  },
  
  // Badges
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Ombres
  shadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Animations
  fadeIn: {
    opacity: 1,
  },
  fadeOut: {
    opacity: 0,
  },
});

// Styles spécifiques pour les différentes sections de l'application
export const homeStyles = StyleSheet.create({
  welcomeCard: {
    backgroundColor: COLORS.primary.main,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  featureCard: {
    backgroundColor: COLORS.background.paper,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
});

export default globalStyles;
