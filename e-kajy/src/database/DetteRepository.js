import Database from './Database';

class DetteRepository {
  constructor() {
    this.db = Database;
  }

  async init() {
    await this.db.init();
  }

  async createDette(idClient, montant) {
    try {
      let result;
      await this.db.db.transaction(async (tx) => {
        result = await tx.executeSql(
          'INSERT INTO dettes (idClient, montant, datedette) VALUES (?, ?, datetime("now"))',
          [idClient, montant]
        );
      });
      return result.insertId;
    } catch (error) {
      console.error('Erreur création dette:', error);
      throw error;
    }
  }

  async getDettesByClient(idClient) {
    try {
      let dettes = [];
      await this.db.db.transaction(async (tx) => {
        const result = await tx.executeSql(
          'SELECT * FROM dettes WHERE idClient = ? ORDER BY datedette DESC',
          [idClient]
        );
        for (let i = 0; i < result.rows.length; i++) {
          dettes.push(result.rows.item(i));
        }
      });
      return dettes;
    } catch (error) {
      console.error('Erreur récupération dettes:', error);
      throw error;
    }
  }

  async getTotalDettesByClient(idClient) {
    try {
      let total = 0;
      await this.db.db.transaction(async (tx) => {
        const result = await tx.executeSql(
          'SELECT SUM(montant) as total FROM dettes WHERE idClient = ?',
          [idClient]
        );
        total = result.rows.item(0).total || 0;
      });
      return total;
    } catch (error) {
      console.error('Erreur calcul total dettes:', error);
      throw error;
    }
  }

  async deleteDette(idDette) {
    try {
      await this.db.db.transaction(async (tx) => {
        await tx.executeSql(
          'DELETE FROM dettes WHERE idDette = ?',
          [idDette]
        );
      });
      return true;
    } catch (error) {
      console.error('Erreur suppression dette:', error);
      throw error;
    }
  }
}

export default new DetteRepository();