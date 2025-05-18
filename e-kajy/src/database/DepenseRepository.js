import Database from './Database';

class DepenseRepository {
  constructor() {
    this.db = Database;
  }

  async init() {
    try {
      await this.db.init();
      console.log('DepenseRepository initialized');
    } catch (error) {
      console.error('Failed to initialize DepenseRepository:', error);
      throw error;
    }
  }

  async executeQuery(sql, params = []) {
    try {
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
      if (isSelect) {
        // getAllAsync retourne un tableau natif, on enveloppe pour assurer un objet avec _array
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

  async createDepense(montant, description, datecreation) {
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
        'INSERT INTO depenses (montant, describe, datedepense) VALUES (?, ?, ?)',
        [montant, description,datetimeValue]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating depense:', error);
      throw error;
    }
  }

  async getAllDepenses() {
    try {
      const result = await this.executeQuery(
        'SELECT * FROM depenses ORDER BY datedepense DESC'
      );
      return result.rows._array ?? [];
    } catch (error) {
      console.error('Error fetching depenses:', error);
      throw error;
    }
  }

  async getDepensesBetweenDates(startDate, endDate) {
    try {
      const result = await this.executeQuery(
        'SELECT * FROM depenses WHERE datedepense BETWEEN ? AND ? ORDER BY datedepense DESC',
        [startDate, endDate]
      );
      return result.rows._array ?? [];
    } catch (error) {
      console.error('Error fetching depenses by date range:', error);
      throw error;
    }
  }

  async getTotalDepensesBetweenDates(startDate, endDate) {
    try {
      const result = await this.executeQuery(
        'SELECT SUM(montant) as total FROM depenses WHERE datedepense BETWEEN ? AND ?',
        [startDate, endDate]
      );
      return result.rows._array[0]?.total ?? 0;
    } catch (error) {
      console.error('Error calculating total depenses:', error);
      throw error;
    }
  }

  async deleteDepense(idDepense) {
    try {
      const result = await this.executeQuery(
        'DELETE FROM depenses WHERE idDepense = ?',
        [idDepense]
      );
      return result.rowsAffected > 0;
    } catch (error) {
      console.error('Error deleting depense:', error);
      throw error;
    }
  }

  async getMonthlyDepensesStats(year) {
    try {
      const result = await this.executeQuery(
        `SELECT 
          strftime('%m', datedepense) as month,
          SUM(montant) as total
         FROM depenses
         WHERE strftime('%Y', datedepense) = ?
         GROUP BY month
         ORDER BY month`,
        [year]
      );
      return result.rows._array ?? [];
    } catch (error) {
      console.error('Error getting monthly stats:', error);
      throw error;
    }
  }
}

const depenseRepository = new DepenseRepository();
export default depenseRepository;
