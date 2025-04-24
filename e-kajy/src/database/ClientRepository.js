import Database from './Database';

class ClientRepository {
  constructor() {
    this.db = Database;
  }

  async init() {
    await this.db.init();
  }

  async createClient(nom) {
    try {
      let result;
      await this.db.db.transaction(async (tx) => {
        result = await tx.executeSql(
          'INSERT INTO clients (nom) VALUES (?)',
          [nom]
        );
      });
      return result.insertId;
    } catch (error) {
      console.error('Erreur création client:', error);
      throw error;
    }
  }

  async getAllClients() {
    try {
      let clients = [];
      await this.db.db.transaction(async (tx) => {
        const result = await tx.executeSql('SELECT * FROM clients ORDER BY nom');
        for (let i = 0; i < result.rows.length; i++) {
          clients.push(result.rows.item(i));
        }
      });
      return clients;
    } catch (error) {
      console.error('Erreur récupération clients:', error);
      throw error;
    }
  }

  async getClientById(idClient) {
    try {
      let client = null;
      await this.db.db.transaction(async (tx) => {
        const result = await tx.executeSql(
          'SELECT * FROM clients WHERE idClient = ?',
          [idClient]
        );
        if (result.rows.length > 0) {
          client = result.rows.item(0);
        }
      });
      return client;
    } catch (error) {
      console.error('Erreur récupération client:', error);
      throw error;
    }
  }

  async updateClient(idClient, nom) {
    try {
      await this.db.db.transaction(async (tx) => {
        await tx.executeSql(
          'UPDATE clients SET nom = ? WHERE idClient = ?',
          [nom, idClient]
        );
      });
      return true;
    } catch (error) {
      console.error('Erreur mise à jour client:', error);
      throw error;
    }
  }

  async deleteClient(idClient) {
    try {
      await this.db.db.transaction(async (tx) => {
        await tx.executeSql(
          'DELETE FROM clients WHERE idClient = ?',
          [idClient]
        );
      });
      return true;
    } catch (error) {
      console.error('Erreur suppression client:', error);
      throw error;
    }
  }
}

export default new ClientRepository();