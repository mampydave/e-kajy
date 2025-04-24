import Database from './Database';

class DepenseRepository {
  constructor() {
    this.db = Database;
  }

  async init() {
    await this.db.init();
  }

  async createDepense(montant, description) {
    try {
      let result;
      await this.db.db.transaction(async (tx) => {
        result = await tx.executeSql(
          'INSERT INTO depenses (montant, describe, datedepense) VALUES (?, ?, datetime("now"))',
          [montant, description]
        );
      });
      return result.insertId;
    } catch (error) {
      console.error('Erreur création dépense:', error);
      throw error;
    }
  }

  async getAllDepenses() {
    try {
      let depenses = [];
      await this.db.db.transaction(async (tx) => {
        const result = await tx.executeSql('SELECT * FROM depenses ORDER BY datedepense DESC');
        for (let i = 0; i < result.rows.length; i++) {
          depenses.push(result.rows.item(i));
        }
      });
      return depenses;
    } catch (error) {
      console.error('Erreur récupération dépenses:', error);
      throw error;
    }
  }

  async getDepensesBetweenDates(startDate, endDate) {
    try {
      let depenses = [];
      await this.db.db.transaction(async (tx) => {
        const result = await tx.executeSql(
          'SELECT * FROM depenses WHERE datedepense BETWEEN ? AND ? ORDER BY datedepense DESC',
          [startDate, endDate]
        );
        for (let i = 0; i < result.rows.length; i++) {
          depenses.push(result.rows.item(i));
        }
      });
      return depenses;
    } catch (error) {
      console.error('Erreur récupération dépenses par date:', error);
      throw error;
    }
  }

  async deleteDepense(idDepense) {
    try {
      await this.db.db.transaction(async (tx) => {
        await tx.executeSql(
          'DELETE FROM depenses WHERE idDepense = ?',
          [idDepense]
        );
      });
      return true;
    } catch (error) {
      console.error('Erreur suppression dépense:', error);
      throw error;
    }
  }
}

export default new DepenseRepository();