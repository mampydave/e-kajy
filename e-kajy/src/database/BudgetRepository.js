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
    try {
      const isSelectQuery = sql.trim().toUpperCase().startsWith('SELECT');

      if (isSelectQuery) {
        // getAllAsync retourne un tableau ou undefined => on sécurise
        const rows = await this.db.db.getAllAsync(sql, params);
        return { rows: { _array: rows ?? [] } };
      } else {
        const result = await this.db.db.runAsync(sql, params);
        return {
          insertId: result.lastInsertRowId,
          rowsAffected: result.changes,
        };
      }
    } catch (error) {
      console.error('SQL Error:', error, 'Query:', sql);
      throw error;
    }
  }

  async getBudgetMonthYearClient(annee, mois) {
    try {
      const result = await this.executeQuery(
        `
        SELECT budgets.*, clients.nom 
        FROM budgets 
        JOIN clients ON budgets.idClient = clients.idClient 
        WHERE strftime('%Y', datebudget) = ? AND strftime('%m', datebudget) = ? 
        ORDER BY datebudget DESC
        `,
        [annee.toString(), mois.toString().padStart(2, '0')]
      );
      
      return result.rows._array ?? [];
    } catch (error) {
      console.error('Error fetching budgets by month/year:', error);
      throw error;
    }
  }


  async createBudget(idClient, montant, datecreation) {
    try {
      const dateObj = new Date(datecreation);
      
      if (isNaN(dateObj.getTime())) {
        dateObj = new Date();
      }
      
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const seconds = String(dateObj.getSeconds()).padStart(2, '0');
      
      const datetimeValue = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      
      const result = await this.executeQuery(
        'INSERT INTO budgets (idClient, montant, datebudget) VALUES (?, ?, ?)',
        [idClient, montant, datetimeValue]
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
      return result.rows._array ?? [];
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
      return result.rows._array ?? [];
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
      return result.rows._array[0]?.total ?? 0;
    } catch (error) {
      console.error('Error calculating total budget:', error);
      throw error;
    }
  }
}

const budgetRepository = new BudgetRepository();
export default budgetRepository;
