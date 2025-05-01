import * as SQLite from 'expo-sqlite';
import { SCHEMA, SCHEMA_VERSION } from './schema';

class Database {
  private db: SQLite.SQLiteDatabase;
  private readonly dbName: string = 'financial.db';

  constructor() {
    this.db = SQLite.openDatabase(
      this.dbName,
      SCHEMA_VERSION,
      'Financial Database'
    );
  }

  async init(): Promise<void> {
    try {
      await this._createTables();
    } catch (error) {
      throw error;
    }
  }

  private async _createTables(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          SCHEMA.tables.forEach(table => {
            const columns = table.columns
              .map(col => col.type ? `${col.name} ${col.type}` : col.name)
              .join(', ');

            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS ${table.name} (${columns})`,
              [],
              () => {},
              (_, error) => {
                return true;
              }
            );
          });
        },
        error => {
          reject(error);
        },
        () => {
          resolve();
        }
      );
    });
  }

  async executeSql(sql: string, params: any[] = []): Promise<SQLite.SQLResultSet> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          tx.executeSql(
            sql,
            params,
            (_, result) => resolve(result),
            (_, error) => {
              reject(error);
              return true;
            }
          );
        },
        error => reject(error)
      );
    });
  }

  async close(): Promise<void> {
    this.db = null as unknown as SQLite.SQLiteDatabase;
  }

  async delete(): Promise<void> {
    await SQLite.deleteDatabaseAsync(this.dbName);
    this.db = null as unknown as SQLite.SQLiteDatabase;
  }
}

const databaseInstance = new Database();
export default databaseInstance;