import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

// Database name
const DATABASE_NAME = 'agriconnect.db';

// Database version
const DATABASE_VERSION = 1;

// Database tables
export enum Tables {
  ENCYCLOPEDIA = 'encyclopedia',
  WEATHER = 'weather',
  MARKETPLACE = 'marketplace',
  FARM_MANAGEMENT = 'farm_management',
  CONSULTATIONS = 'consultations',
  NOTIFICATIONS = 'notifications',
  SYNC_INFO = 'sync_info',
  USER_PREFERENCES = 'user_preferences',
  FINANCIAL_PRODUCTS = 'financial_products',
  FINANCIAL_INSTITUTIONS = 'financial_institutions',
  FINANCING_APPLICATIONS = 'financing_applications',
}

// Database service class
class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized: boolean = false;

  // Initialize the database
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Open the database
      this.db = await this.openDatabase();

      // Create tables if they don't exist
      await this.createTables();

      // Check if we need to update the database schema
      await this.checkForSchemaUpdates();

      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  // Open the database
  private async openDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (Platform.OS === 'web') {
      // SQLite is not supported on web, use a mock implementation
      return this.getMockDatabase();
    }

    return SQLite.openDatabase(DATABASE_NAME);
  }

  // Get a mock database for web platform
  private getMockDatabase(): SQLite.SQLiteDatabase {
    // This is a simple mock for web platform
    // In a real app, you might want to use IndexedDB or another web storage solution
    const mockDb: Partial<SQLite.SQLiteDatabase> = {
      transaction: () => ({
        executeSql: (
          _sqlStatement: string,
          _arguments?: any[],
          _success?: (
            transaction: SQLite.SQLTransaction,
            resultSet: SQLite.SQLResultSet
          ) => void,
          _error?: (transaction: SQLite.SQLTransaction, error: Error) => void
        ) => {
          // Mock implementation
          return {} as any;
        },
      }),
      exec: async (_queries: SQLite.Query[], _readOnly: boolean) => {
        return [] as SQLite.ResultSet[];
      },
      closeAsync: async () => {},
      deleteAsync: async () => {},
    };

    return mockDb as SQLite.SQLiteDatabase;
  }

  // Create database tables
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Create tables in a transaction
    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          // Encyclopedia table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ${Tables.ENCYCLOPEDIA} (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              content TEXT NOT NULL,
              category TEXT,
              subcategory TEXT,
              tags TEXT,
              images TEXT,
              last_updated INTEGER,
              is_favorite INTEGER DEFAULT 0,
              view_count INTEGER DEFAULT 0,
              offline_available INTEGER DEFAULT 0
            );`
          );

          // Weather table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ${Tables.WEATHER} (
              id TEXT PRIMARY KEY,
              location_name TEXT,
              latitude REAL,
              longitude REAL,
              forecast_data TEXT,
              last_updated INTEGER
            );`
          );

          // Marketplace table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ${Tables.MARKETPLACE} (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              description TEXT,
              price REAL,
              currency TEXT,
              seller_id TEXT,
              category TEXT,
              images TEXT,
              location TEXT,
              is_favorite INTEGER DEFAULT 0,
              last_updated INTEGER
            );`
          );

          // Farm management table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ${Tables.FARM_MANAGEMENT} (
              id TEXT PRIMARY KEY,
              type TEXT NOT NULL,
              title TEXT NOT NULL,
              description TEXT,
              date INTEGER,
              category TEXT,
              data TEXT,
              images TEXT,
              last_updated INTEGER
            );`
          );

          // Consultations table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ${Tables.CONSULTATIONS} (
              id TEXT PRIMARY KEY,
              expert_id TEXT,
              status TEXT,
              topic TEXT,
              description TEXT,
              date INTEGER,
              messages TEXT,
              last_updated INTEGER
            );`
          );

          // Notifications table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ${Tables.NOTIFICATIONS} (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              message TEXT,
              type TEXT,
              data TEXT,
              is_read INTEGER DEFAULT 0,
              created_at INTEGER,
              expires_at INTEGER
            );`
          );

          // Sync info table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ${Tables.SYNC_INFO} (
              module TEXT PRIMARY KEY,
              last_sync_time INTEGER,
              sync_status TEXT,
              version TEXT
            );`
          );

          // User preferences table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ${Tables.USER_PREFERENCES} (
              key TEXT PRIMARY KEY,
              value TEXT
            );`
          );

          // Financial products table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ${Tables.FINANCIAL_PRODUCTS} (
              id TEXT PRIMARY KEY,
              institution_id TEXT,
              name TEXT NOT NULL,
              description TEXT,
              short_description TEXT,
              type TEXT,
              category TEXT,
              min_amount REAL,
              max_amount REAL,
              currency TEXT,
              interest_rate REAL,
              interest_type TEXT,
              min_term INTEGER,
              max_term INTEGER,
              term_unit TEXT,
              repayment_frequency TEXT,
              grace_period INTEGER,
              eligibility_criteria TEXT,
              required_documents TEXT,
              application_process TEXT,
              processing_time INTEGER,
              fees TEXT,
              benefits TEXT,
              is_active INTEGER DEFAULT 1,
              image_url TEXT,
              tags TEXT,
              last_updated INTEGER
            );`
          );

          // Financial institutions table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ${Tables.FINANCIAL_INSTITUTIONS} (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              description TEXT,
              logo TEXT,
              type TEXT,
              services_offered TEXT,
              operating_regions TEXT,
              contact_email TEXT,
              contact_phone TEXT,
              website TEXT,
              address TEXT,
              is_active INTEGER DEFAULT 1,
              last_updated INTEGER
            );`
          );

          // Financing applications table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ${Tables.FINANCING_APPLICATIONS} (
              id TEXT PRIMARY KEY,
              user_id TEXT,
              product_id TEXT,
              institution_id TEXT,
              application_number TEXT,
              amount REAL,
              currency TEXT,
              purpose TEXT,
              term INTEGER,
              status TEXT,
              submission_date INTEGER,
              decision_date INTEGER,
              disbursement_date INTEGER,
              documents TEXT,
              business_plan TEXT,
              farm_details TEXT,
              financial_history TEXT,
              collateral TEXT,
              approved_amount REAL,
              approved_term INTEGER,
              interest_rate REAL,
              repayment_schedule TEXT,
              comments TEXT,
              created_at INTEGER,
              updated_at INTEGER
            );`
          );
        },
        (error) => {
          console.error('Error creating tables:', error);
          reject(error);
        },
        () => {
          console.log('Tables created successfully');
          resolve();
        }
      );
    });
  }

  // Check if we need to update the database schema
  private async checkForSchemaUpdates(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Get the current database version
    const currentVersion = await this.getDatabaseVersion();

    // If the current version is less than the target version, update the schema
    if (currentVersion < DATABASE_VERSION) {
      await this.updateSchema(currentVersion, DATABASE_VERSION);
    }
  }

  // Get the current database version
  private async getDatabaseVersion(): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          // Check if the user_preferences table exists
          tx.executeSql(
            `SELECT name FROM sqlite_master WHERE type='table' AND name='${Tables.USER_PREFERENCES}';`,
            [],
            (_, result) => {
              if (result.rows.length === 0) {
                // Table doesn't exist, this is a new database
                resolve(0);
                return;
              }

              // Get the database version from user_preferences
              tx.executeSql(
                `SELECT value FROM ${Tables.USER_PREFERENCES} WHERE key='database_version';`,
                [],
                (_, versionResult) => {
                  if (versionResult.rows.length === 0) {
                    // No version found, assume version 0
                    resolve(0);
                    return;
                  }

                  // Return the version
                  resolve(parseInt(versionResult.rows.item(0).value, 10));
                }
              );
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  // Update the database schema
  private async updateSchema(fromVersion: number, toVersion: number): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    console.log(`Updating database schema from version ${fromVersion} to ${toVersion}`);

    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          // Apply schema updates based on version
          if (fromVersion < 1) {
            // Initial schema is already created in createTables
            // Just set the version
            tx.executeSql(
              `INSERT OR REPLACE INTO ${Tables.USER_PREFERENCES} (key, value) VALUES ('database_version', '1');`
            );
          }

          // Add more version updates here as needed
          // if (fromVersion < 2) { ... }
        },
        (error) => {
          console.error('Error updating schema:', error);
          reject(error);
        },
        () => {
          console.log('Schema updated successfully');
          resolve();
        }
      );
    });
  }

  // Close the database
  async close(): Promise<void> {
    if (this.db && Platform.OS !== 'web') {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
    }
  }

  // Generic query method
  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          tx.executeSql(
            sql,
            params,
            (_, result) => {
              const items: T[] = [];
              for (let i = 0; i < result.rows.length; i++) {
                items.push(result.rows.item(i) as T);
              }
              resolve(items);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  // Generic execute method for inserts, updates, and deletes
  async execute(sql: string, params: any[] = []): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      this.db!.transaction(
        (tx) => {
          tx.executeSql(
            sql,
            params,
            (_, result) => {
              resolve(result.rowsAffected);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  // Get the database instance
  getDatabase(): SQLite.SQLiteDatabase | null {
    return this.db;
  }
}

// Export a singleton instance
export default new DatabaseService();
