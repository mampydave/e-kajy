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
      console.error('Failed to initialize ClientRepository:', error);
      throw error;
    }
  }

  async executeQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.db.transaction(
        tx => {
          tx.executeSql(
            sql,
            params,
            (_, result) => resolve(result),
            (_, error) => {
              console.error('SQL Error:', error);
              reject(error);
              return true; 
            }
          );
        },
        error => reject(error)
      );
    });
  }

  async createClient(nom) {
    try {
      const result = await this.executeQuery(
        'INSERT INTO clients (nom) VALUES (?)',
        [nom]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating client:', error);
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
      console.error('Error fetching clients:', error);
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
      console.error('Error fetching client:', error);
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
      console.error('Error updating client:', error);
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
      console.error('Error deleting client:', error);
      throw error;
    }
  }
}


const clientRepository = new ClientRepository();
export default clientRepository;