import Database from './Database';

class ClientRepository {
  constructor() {
    this.db = Database;
  }

  async init() {
    try {
      await this.db.init();
      console.log('ClientRepository initialized');
    } catch (error) {
      console.error('ClientRepository Init Error:', error);
      throw error;
    }
  }

  async executeQuery(sql, params = []) {
    try {
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
      if (isSelect) {
        const result = await this.db.getDb().getAllAsync(sql, params);
        return { rows: { _array: result } };
      } else {
        const result = await this.db.db.runAsync(sql, params);
        return {
          insertId: result.lastInsertRowId,
          rowsAffected: result.changes,
          rows: { _array: [] }
        };
      }
    } catch (error) {
      console.error('SQL Error:', error, 'Query:', sql);
      throw error;
    }
  }

  async createClient(nom) {
    try {
      const result = await this.executeQuery(
        'INSERT INTO clients (nom) VALUES (?)',
        [nom]
      );
      return result.insertId;
    } catch (error) {
      console.error('Create Client Error:', error);
      throw error;
    }
  }

  async getAllClients() {
    try {
      const result = await this.executeQuery(
        'SELECT * FROM clients ORDER BY nom'
      );
      return result.rows._array;
    } catch (error) {
      console.error('Get Clients Error:', error);
      throw error;
    }
  }

  async getClientById(idClient) {
    try {
      const result = await this.executeQuery(
        'SELECT * FROM clients WHERE idClient = ?',
        [idClient]
      );
      return result.rows._array[0] || null;
    } catch (error) {
      console.error('Get Client Error:', error);
      throw error;
    }
  }

  async updateClient(idClient, nom) {
    try {
      const result = await this.executeQuery(
        'UPDATE clients SET nom = ? WHERE idClient = ?',
        [nom, idClient]
      );
      return result.rowsAffected > 0;
    } catch (error) {
      console.error('Update Client Error:', error);
      throw error;
    }
  }

  async deleteClient(idClient) {
    try {
      const result = await this.executeQuery(
        'DELETE FROM clients WHERE idClient = ?',
        [idClient]
      );
      return result.rowsAffected > 0;
    } catch (error) {
      console.error('Delete Client Error:', error);
      throw error;
    }
  }
}

const clientRepository = new ClientRepository();
export default clientRepository;
