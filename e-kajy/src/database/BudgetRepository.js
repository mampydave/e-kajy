import Database from './Database';

class BudgetRepository {
  constructor() {
    this.db = Database;
  }

  async init() {
    try {
      await this.db.init();
      console.log('BudgetRepository initialized');
    } catch (error) {
      console.error('Failed to initialize BudgetRepository:', error);
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

  async createBudget(idClient, montant) {
    try {
      const result = await this.executeQuery(
        'INSERT INTO budgets (idClient, montant, datebudget) VALUES (?, ?, datetime("now"))',
        [idClient, montant]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }


  async getAllBudgets() {
    try {
      const result = await this.executeQuery(
        'SELECT * FROM budgets ORDER BY datebudget DESC'
      );
      return result.rows._array;
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
  }


  async getBudgetsByClient(idClient) {
    try {
      const result = await this.executeQuery(
        'SELECT * FROM budgets WHERE idClient = ? ORDER BY datebudget DESC',
        [idClient]
      );
      return result.rows._array;
    } catch (error) {
      console.error('Error fetching client budgets:', error);
      throw error;
    }
  }

  async updateBudget(idBudget, montant) {
    try {
      const result = await this.executeQuery(
        'UPDATE budgets SET montant = ? WHERE idBudget = ?',
        [montant, idBudget]
      );
      return result.rowsAffected > 0;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  async deleteBudget(idBudget) {
    try {
      const result = await this.executeQuery(
        'DELETE FROM budgets WHERE idBudget = ?',
        [idBudget]
      );
      return result.rowsAffected > 0;
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }


  async getTotalBudgetByClient(idClient) {
    try {
      const result = await this.executeQuery(
        'SELECT SUM(montant) as total FROM budgets WHERE idClient = ?',
        [idClient]
      );
      return result.rows._array[0]?.total || 0;
    } catch (error) {
      console.error('Error calculating total budget:', error);
      throw error;
    }
  }
}


const budgetRepository = new BudgetRepository();
export default budgetRepository;