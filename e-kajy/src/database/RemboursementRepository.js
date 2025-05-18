import Database from './Database';
import DetteRepository from './DetteRepository';
class RemboursementRepository {
  constructor() {
    this.db = Database;
  }

  async init() {
    try {
      await this.db.init();
      console.log('RemboursementRepository initialized');
    } catch (error) {
      console.error('Failed to initialize RemboursementRepository:', error);
      throw error;
    }
  }

  async executeQuery(sql, params = []) {
    try {
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
      if (isSelect) {
        const result = await this.db.db.getAllAsync(sql, params);
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

  async createRemboursement(idClient, montant, datecreation, description = '') {
    try {
      await DetteRepository.init();
      description = 'remboursement du ' + datecreation;
      const restant = await DetteRepository.getTotalDettesNonRembourseesByClient(idClient);

      if (restant <= 0) {
        throw new Error("Ce client n'a pas de dettes à rembourser.");
      }

      if (montant > restant) {
        throw new Error(`Le montant à rembourser dépasse la dette restante (${restant}).`);
      }

      let dateObj = new Date(datecreation);
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
        `INSERT INTO remboursements (idClient, montant, description, dateRemboursement) VALUES (?, ?, ?, ?)`,
        [idClient, montant, description, datetimeValue]
      );
      const inserted = await this.executeQuery(
        `SELECT * FROM remboursements WHERE idRemboursement = ?`,
        [result.insertId]
      );
console.log('🧪 Vérification : remboursement inséré =>', JSON.stringify(inserted.rows._array, null, 2));


      return result.insertId;

    } catch (error) {
      console.error('Erreur lors du remboursement :', error.message);
      throw error;
    }
  }

  async getAllRemboursements(withClientInfo = false) {
    try {
      const query = withClientInfo
        ? `SELECT r.*, c.nom as clientName 
           FROM remboursements r
           LEFT JOIN clients c ON r.idClient = c.idClient
           ORDER BY r.dateremboursement DESC`
        : 'SELECT * FROM remboursements ORDER BY dateremboursement DESC';

      const result = await this.executeQuery(query);
      return result.rows._array;
    } catch (error) {
      console.error('Error fetching remboursements:', error);
      throw error;
    }
  }

  async getRemboursementsByClient(idClient, withDetteInfo = false) {
    try {
      let query = `SELECT r.* FROM remboursements r 
                   WHERE r.idClient = ? 
                   ORDER BY r.dateremboursement DESC`;

      if (withDetteInfo) {
        query = `SELECT r.*, d.montant as detteInitiale 
                 FROM remboursements r
                 LEFT JOIN dettes d ON r.idDette = d.idDette
                 WHERE r.idClient = ?
                 ORDER BY r.dateremboursement DESC`;
      }

      const result = await this.executeQuery(query, [idClient]);
      return result.rows._array;
    } catch (error) {
      console.error('Error fetching client remboursements:', error);
      throw error;
    }
  }

  async getTotalRemboursementsByClient(idClient) {
    try {
      const result = await this.executeQuery(
        `SELECT SUM(montant) as total 
         FROM remboursements 
         WHERE idClient = ?`,
        [idClient]
      );
      return result.rows._array[0]?.total || 0;
    } catch (error) {
      console.error('Error calculating total remboursements:', error);
      throw error;
    }
  }

  async getRemboursementsByDette(idDette) {
    try {
      const result = await this.executeQuery(
        `SELECT * FROM remboursements 
         WHERE idDette = ?
         ORDER BY dateremboursement DESC`,
        [idDette]
      );
      return result.rows._array;
    } catch (error) {
      console.error('Error fetching remboursements by dette:', error);
      throw error;
    }
  }

  async deleteRemboursement(idRemboursement) {
    try {
      const result = await this.executeQuery(
        'DELETE FROM remboursements WHERE idRemboursement = ?',
        [idRemboursement]
      );
      return result.rowsAffected > 0;
    } catch (error) {
      console.error('Error deleting remboursement:', error);
      throw error;
    }
  }

  async getRemboursementStats() {
    try {
      const result = await this.executeQuery(
        `SELECT 
           strftime('%Y-%m', dateremboursement) as month,
           SUM(montant) as total
         FROM remboursements
         GROUP BY month
         ORDER BY month DESC`
      );
      return result.rows._array;
    } catch (error) {
      console.error('Error getting remboursement stats:', error);
      throw error;
    }
  }
  
  async getTotalRemboursementByClient(idClient) {
    const results = await this.executeQuery(
    `SELECT SUM(montant) as total FROM remboursements WHERE idClient = ?`,
      [idClient]
    );
    const total = results.rows._array[0]?.total || 0;
    return total;
  }

}

const remboursementRepository = new RemboursementRepository();
export default remboursementRepository;
