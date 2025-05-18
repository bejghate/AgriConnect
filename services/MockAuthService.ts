import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, Permission, AuthResponse, LoginCredentials, RegisterData, getAllPermissionsForRoles } from '@/types/user';
import SecurityService from '@/services/SecurityService';

/**
 * Service d'authentification mock pour le développement
 * Permet de simuler les fonctionnalités d'authentification sans backend réel
 */
class MockAuthService {
  private token: string | null = null;
  private mockUsers: Record<string, User> = {};
  private mockDelay = 800; // Délai simulé pour les requêtes (ms)

  constructor() {
    // Charger le token depuis le stockage lors de l'initialisation
    this.loadToken();
    // Charger les utilisateurs mockés depuis le stockage
    this.loadMockUsers();
  }

  // Charger le token depuis AsyncStorage
  private async loadToken() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        this.token = token;
      }
    } catch (error) {
      console.error('Erreur lors du chargement du token:', error);
    }
  }

  // Sauvegarder le token dans AsyncStorage
  private async saveToken(token: string) {
    try {
      await AsyncStorage.setItem('auth_token', token);
      this.token = token;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  }

  // Supprimer le token d'AsyncStorage
  private async removeToken() {
    try {
      await AsyncStorage.removeItem('auth_token');
      this.token = null;
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
    }
  }

  // Charger les utilisateurs mockés depuis AsyncStorage
  private async loadMockUsers() {
    try {
      const storedUsers = await AsyncStorage.getItem('mock_users');
      if (storedUsers) {
        this.mockUsers = JSON.parse(storedUsers);
      } else {
        // Créer un utilisateur par défaut si aucun n'existe
        const defaultUser: User = {
          id: '1',
          username: 'farmer_demo',
          email: 'test@example.com',
          fullName: 'Amadou Diallo',
          roles: ['farmer'],
          primaryRole: 'farmer',
          permissions: getAllPermissionsForRoles(['farmer']),
          profileImage: 'https://example.com/profile.jpg',
          location: {
            region: 'Centre',
            coordinates: {
              latitude: 12.3456,
              longitude: -1.2345,
            },
          },
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          active: true,
          verified: true,
          language: 'fr',
          notificationSettings: {
            email: true,
            push: true,
            sms: false
          },
          preferences: {
            theme: 'light',
            dashboardLayout: 'default'
          }
        };
        this.mockUsers[defaultUser.email] = defaultUser;
        await this.saveMockUsers();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs mockés:', error);
    }
  }

  // Sauvegarder les utilisateurs mockés dans AsyncStorage
  private async saveMockUsers() {
    try {
      await AsyncStorage.setItem('mock_users', JSON.stringify(this.mockUsers));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des utilisateurs mockés:', error);
    }
  }

  // Générer un token simple
  private generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Simuler un délai de réseau
  private async delay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.mockDelay));
  }

  // Enregistrer un nouvel utilisateur
  async register(data: RegisterData): Promise<AuthResponse> {
    await this.delay();

    // Vérifier si l'email existe déjà
    if (this.mockUsers[data.email]) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Créer un nouvel utilisateur
    const newUser: User = {
      id: Date.now().toString(),
      username: data.fullName.toLowerCase().replace(/\s+/g, '_'),
      email: data.email,
      fullName: data.fullName,
      roles: [data.role],
      primaryRole: data.role,
      permissions: getAllPermissionsForRoles([data.role]),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      active: true,
      verified: true,
      language: 'fr',
      notificationSettings: {
        email: true,
        push: true,
        sms: false
      },
      preferences: {
        theme: 'light',
        dashboardLayout: 'default'
      }
    };

    // Ajouter l'utilisateur à la liste des utilisateurs mockés
    this.mockUsers[data.email] = newUser;
    await this.saveMockUsers();

    // Générer un token
    const token = this.generateToken();
    await this.saveToken(token);

    return { user: newUser, token };
  }

  // Connecter un utilisateur
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await this.delay();

    // Vérifier si l'utilisateur existe
    const user = this.mockUsers[credentials.email];
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Dans un vrai service, on vérifierait le mot de passe ici
    // Pour le mock, on accepte n'importe quel mot de passe

    // Vérifier si l'utilisateur a activé l'authentification à deux facteurs
    const twoFactorEnabled = await SecurityService.isTwoFactorAuthEnabled(user.id);

    if (twoFactorEnabled.enabled) {
      // Simuler l'envoi d'un code de vérification
      await SecurityService.requestTwoFactorAuth(user.id, twoFactorEnabled.method || 'email');

      // Générer un token temporaire (ne pas le sauvegarder encore)
      const tempToken = this.generateToken();

      // Retourner une réponse indiquant que l'authentification à deux facteurs est requise
      return {
        user,
        token: tempToken,
        requireTwoFactor: true,
        twoFactorMethod: twoFactorEnabled.method
      };
    }

    // Pas d'authentification à deux facteurs, procéder normalement
    const token = this.generateToken();
    await this.saveToken(token);

    return { user, token };
  }

  // Compléter l'authentification après la vérification à deux facteurs
  async completeTwoFactorAuth(userId: string, token: string): Promise<AuthResponse> {
    await this.delay();

    // Trouver l'utilisateur par ID
    const users = Object.values(this.mockUsers);
    const user = users.find(u => u.id === userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Sauvegarder le token
    await this.saveToken(token);

    return { user, token };
  }

  // Déconnecter un utilisateur
  async logout(): Promise<void> {
    await this.delay();
    await this.removeToken();
  }

  // Obtenir l'utilisateur actuel
  async getCurrentUser(): Promise<User | null> {
    await this.delay();

    if (!this.token) {
      return null;
    }

    // Dans un vrai service, on utiliserait le token pour obtenir l'utilisateur
    // Pour le mock, on retourne le premier utilisateur trouvé
    const users = Object.values(this.mockUsers);
    return users.length > 0 ? users[0] : null;
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Mettre à jour le profil utilisateur
  async updateProfile(data: Partial<User>): Promise<User> {
    await this.delay();

    if (!this.token) {
      throw new Error('Non authentifié');
    }

    // Dans un vrai service, on utiliserait le token pour identifier l'utilisateur
    // Pour le mock, on met à jour le premier utilisateur trouvé
    const users = Object.values(this.mockUsers);
    if (users.length === 0) {
      throw new Error('Aucun utilisateur trouvé');
    }

    const user = users[0];
    const updatedUser = { ...user, ...data, updatedAt: new Date().toISOString() };
    this.mockUsers[user.email] = updatedUser;
    await this.saveMockUsers();

    return updatedUser;
  }

  // Changer le mot de passe
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.delay();
    // Dans un mock, on ne fait rien
  }

  // Demander une réinitialisation de mot de passe
  async requestPasswordReset(email: string): Promise<void> {
    await this.delay();
    // Dans un mock, on ne fait rien
  }

  // Réinitialiser le mot de passe avec un token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.delay();
    // Dans un mock, on ne fait rien
  }

  // Vérifier l'email avec un token
  async verifyEmail(token: string): Promise<void> {
    await this.delay();
    // Dans un mock, on simule une vérification réussie
    const users = Object.values(this.mockUsers);
    if (users.length > 0) {
      const user = users[0];
      user.verified = true;
      this.mockUsers[user.email] = user;
      await this.saveMockUsers();
    }
  }

  // Renvoyer un email de vérification
  async resendVerificationEmail(email?: string): Promise<void> {
    await this.delay();
    // Dans un mock, on ne fait rien
  }

  // Changer le mot de passe
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    await this.delay();

    // Find the user by ID
    const users = Object.values(this.mockUsers);
    const user = users.find(u => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Check if current password is correct
    const hashedCurrentPassword = await this.hashPassword(currentPassword, user.salt);
    if (hashedCurrentPassword !== user.password) {
      const error: any = new Error('Current password is incorrect');
      error.response = { status: 401 };
      throw error;
    }

    // Update the password
    const salt = await this.generateSalt();
    const hashedNewPassword = await this.hashPassword(newPassword, salt);

    user.password = hashedNewPassword;
    user.salt = salt;
    this.mockUsers[user.email] = user;

    await this.saveMockUsers();
    return true;
  }
}

export default new MockAuthService();
