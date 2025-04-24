import Database from './Database';

class RemboursementRepository {
  constructor() {
    this.db = Database;
  }

  async init() {
    await this.db.init();
  }

  async createRemboursement(idClient, montant) {
    try {
      let result;
      await this.db.db.transaction(async (tx) => {
        result = await tx.executeSql(
          'INSERT INTO remboursements (idClient, montant, dateremboursement) VALUES (?, ?, datetime("now"))',
          [idClient, montant]
        );
      });
      return result.insertId;
    } catch (error) {
      console.error('Erreur création remboursement:', error);
      throw error;
    }
  }

  async getRemboursementsByClient(idClient) {
    try {
      let remboursements = [];
      await this.db.db.transaction(async (tx) => {
        const result = await tx.executeSql(
          'SELECT * FROM remboursements WHERE idClient = ? ORDER BY dateremboursement DESC',
          [idClient]
        );
        for (let i = 0; i < result.rows.length; i++) {
          remboursements.push(result.rows.item(i));
        }
      });
      return remboursements;
    } catch (error) {
      console.error('Erreur récupération remboursements:', error);
      throw error;
    }
  }

  async getTotalRemboursementsByClient(idClient) {
    try {
      let total = 0;
      await this.db.db.transaction(async (tx) => {
        const result = await tx.executeSql(
          'SELECT SUM(montant) as total FROM remboursements WHERE idClient = ?',
          [idClient]
        );
        total = result.rows.item(0).total || 0;
      });
      return total;
    } catch (error) {
      console.error('Erreur calcul total remboursements:', error);
      throw error;
    }
  }

  async deleteRemboursement(idRemboursement) {
    try {
      await this.db.db.transaction(async (tx) => {
        await tx.executeSql(
          'DELETE FROM remboursements WHERE idRemboursement = ?',
          [idRemboursement]
        );
      });
      return true;
    } catch (error) {
      console.error('Erreur suppression remboursement:', error);
      throw error;
    }
  }
}

export default new RemboursementRepository();