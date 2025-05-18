import * as SQLite from 'expo-sqlite';
import { SCHEMA } from './schema';

class Database {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    this.db = await SQLite.openDatabaseAsync('devfinancial4.db');
    await this._createTables();
    this.initialized = true;
  }

  async ensureInitialized() {
    if (!this.initialized || !this.db) {
      await this.init();
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  async _createTables() {
    for (const table of SCHEMA.tables) {
      const columns = table.columns
        .map(col => col.type ? `${col.name} ${col.type}` : col.name)
        .join(', ');
      const sql = `CREATE TABLE IF NOT EXISTS ${table.name} (${columns})`;
      await this.db.runAsync(sql, []);
    }
  }

  async executeSql(sql, params = []) {
    return await this.db.runAsync(sql, params);
  }

  async close() {
    this.db = null;
  }

  async delete() {
    await SQLite.deleteDatabaseAsync('devfinancial4.db');
    this.db = null;
  }
}

const databaseInstance = new Database();
export default databaseInstance;
