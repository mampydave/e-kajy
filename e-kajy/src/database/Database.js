import SQLite from 'react-native-sqlite-storage';
import { SCHEMA, SCHEMA_VERSION } from './schema';

// Active le mode debug si nécessaire
SQLite.DEBUG(true);
SQLite.enablePromise(true);

class Database {
  constructor() {
    this.db = SQLite.openDatabase(
      'financial.db',
      SCHEMA_VERSION,
      'Financial Database'
    );
  }

<<<<<<< Updated upstream
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
=======
  init() {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          // Création des tables
          SCHEMA.tables.forEach(table => {
            const columns = table.columns
              .map(col => `${col.name} ${col.type || 'TEXT'}`)
              .join(', ');
            
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS ${table.name} (${columns});`,
              [],
              () => console.log(`Table ${table.name} prête`),
              (_, error) => {
                console.error(`Erreur sur table ${table.name}:`, error);
                return true; // Continue malgré l'erreur
              }
            );
          });
        },
        error => {
          console.error('Erreur transaction init:', error);
          reject(error);
        },
        () => {
          console.log('Initialisation DB complète');
          resolve();
>>>>>>> Stashed changes
        }
      });
    } catch (error) {
      console.error('Erreur création tables:', error);
      throw error;
    }
  }

<<<<<<< Updated upstream

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
=======
  executeSql(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            sql,
            params,
            (_, result) => resolve(result),
            (_, error) => {
              console.error('Erreur SQL:', error, 'Query:', sql);
              reject(error);
              return true;
            }
          );
        },
        error => reject(error)
      );
    });
  }

  async close() {

    return Promise.resolve();
  }

  async delete() {
    await SQLite.deleteDatabaseAsync('financial.db');
>>>>>>> Stashed changes
    this.db = null;
  }
}


const databaseInstance = new Database();
export default databaseInstance;