import Database from './Database';

class BudgetRepository {
  constructor() {
    this.db = Database;
  }

  async init() {
    await this.db.init();
  }

  async createBudget(idClient, montant) {
    try {
      let result;
      await this.db.db.transaction(async (tx) => {
        result = await tx.executeSql(
          'INSERT INTO budgets (idClient, montant, datebudget) VALUES (?, ?, datetime("now"))',
          [idClient, montant]
        );
      });
      return result.insertId;
    } catch (error) {
      console.error('Erreur création budget:', error);
      throw error;
    }
  }

  async getAllBudgets() {
    try {
      let budgets = [];
      await this.db.db.transaction(async (tx) => {
        const result = await tx.executeSql('SELECT * FROM budgets ORDER BY date DESC');
        for (let i = 0; i < result.rows.length; i++) {
          budgets.push(result.rows.item(i));
        }
      });
      return budgets;
    } catch (error) {
      console.error('Erreur récupération budgets:', error);
      throw error;
    }
  }
  
  async getBudgetsByClient(idClient) {
    try {
      let budgets = [];
      await this.db.db.transaction(async (tx) => {
        const result = await tx.executeSql(
          'SELECT * FROM budgets WHERE idClient = ? ORDER BY datebudget DESC',
          [idClient]
        );
        for (let i = 0; i < result.rows.length; i++) {
          budgets.push(result.rows.item(i));
        }
      });
      return budgets;
    } catch (error) {
      console.error('Erreur récupération budgets:', error);
      throw error;
    }
  }

  async updateBudget(idBudget, montant) {
    try {
      await this.db.db.transaction(async (tx) => {
        await tx.executeSql(
          'UPDATE budgets SET montant = ? WHERE idBudget = ?',
          [montant, idBudget]
        );
      });
      return true;
    } catch (error) {
      console.error('Erreur mise à jour budget:', error);
      throw error;
    }
  }

  async deleteBudget(idBudget) {
    try {
      await this.db.db.transaction(async (tx) => {
        await tx.executeSql(
          'DELETE FROM budgets WHERE idBudget = ?',
          [idBudget]
        );
      });
      return true;
    } catch (error) {
      console.error('Erreur suppression budget:', error);
      throw error;
    }
  }
}

export default new BudgetRepository();