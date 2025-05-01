import Database from './Database';

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

  async createRemboursement(idClient, montant, idDette = null, description = '') {
    try {
      const result = await this.executeQuery(
        `INSERT INTO remboursements 
         (idClient, idDette, montant, description, dateremboursement) 
         VALUES (?, ?, ?, ?, datetime("now"))`,
        [idClient, idDette, montant, description]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating remboursement:', error);
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
      return result.rows.item(0)?.total || 0;
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
}


const remboursementRepository = new RemboursementRepository();
export default remboursementRepository;