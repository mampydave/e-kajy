import SQLite from 'react-native-sqlite-storage';
import { SCHEMA, SCHEMA_VERSION } from './schema';

// Active le mode debug si nécessaire
SQLite.DEBUG(true);
SQLite.enablePromise(true);

class Database {
  constructor() {
    this.db = null;
    this.dbName = 'financial.db';
  }

  // Initialisation de la base de données
  async init() {
    try {
      this.db = await SQLite.openDatabase(
        this.dbName,
        SCHEMA_VERSION,
        'Financial Database',
        -1, // Taille max (infinie si -1)
        this._onDatabaseOpen,
        this._onDatabaseError
      );
      
      await this._createTables();
      return this.db;
    } catch (error) {
      console.error('Erreur initialisation DB:', error);
      throw error;
    }
  }

  // Création des tables
  async _createTables() {
    try {
      await this.db.transaction(async (tx) => {
        for (const table of SCHEMA.tables) {
          // Construction de la requête CREATE TABLE
          const columns = table.columns.map(col => {
            if (col.type) {
              return `${col.name} ${col.type}`;
            }
            return col.name;
          }).join(', ');
          
          await tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ${table.name} (${columns})`,
            []
          );
        }
      });
    } catch (error) {
      console.error('Erreur création tables:', error);
      throw error;
    }
  }


  _onDatabaseOpen(db) {
    console.log('Database OPENED:', db);
  }


  _onDatabaseError(error) {
    console.error('Database ERROR:', error);
  }


  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }


  async delete() {
    await SQLite.deleteDatabase(this.dbName);
    this.db = null;
  }
}

export default new Database();