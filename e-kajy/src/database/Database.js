import * as SQLite from 'expo-sqlite';
import { SCHEMA, SCHEMA_VERSION } from './schema';

class Database {
  constructor() {
    this.db = null;
    this.dbName = 'financial.db';
  }


  async init() {
    try {
      this.db = SQLite.openDatabase(
        this.dbName,
        SCHEMA_VERSION,
        'Financial Database'
      );
      
      await this._createTables();
      return this.db;
    } catch (error) {
      console.error('Erreur initialisation DB:', error);
      throw error;
    }
  }


  async _createTables() {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          for (const table of SCHEMA.tables) {

            const columns = table.columns.map(col => {
              if (col.type) {
                return `${col.name} ${col.type}`;
              }
              return col.name;
            }).join(', ');
            
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS ${table.name} (${columns})`,
              [],
              () => {},
              (_, error) => {
                console.error(`Erreur création table ${table.name}:`, error);
                return false; 
              }
            );
          }
        },
        error => {
          console.error('Erreur transaction création tables:', error);
          reject(error);
        },
        () => {
          console.log('Tables créées avec succès');
          resolve();
        }
      );
    });
  }

  async close() {
    this.db = null;
  }

  async delete() {

    this.db = null;
    await SQLite.deleteDatabaseAsync(this.dbName);
  }
}

export default new Database();