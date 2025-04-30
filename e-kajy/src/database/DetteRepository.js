import Database from './Database';

class DetteRepository {
  constructor() {
    this.db = Database;
  }

  async init() {
    try {
      await this.db.init();
      console.log('DetteRepository initialized');
    } catch (error) {
      console.error('Failed to initialize DetteRepository:', error);
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

  async createDette(idClient, montant, description = '') {
    try {
      const result = await this.executeQuery(
        'INSERT INTO dettes (idClient, montant, description, datedette) VALUES (?, ?, ?, datetime("now"))',
        [idClient, montant, description]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating dette:', error);
      throw error;
    }
  }

<<<<<<< Updated upstream
  async getDettesByClient(idClient) {
=======
  async getAllDettes(withClientInfo = false) {
    try {
      const query = withClientInfo 
        ? `SELECT d.*, c.nom as clientName 
           FROM dettes d 
           LEFT JOIN clients c ON d.idClient = c.idClient 
           ORDER BY d.datedette DESC`
        : 'SELECT * FROM dettes ORDER BY datedette DESC';
      
      const result = await this.executeQuery(query);
      return result.rows._array;
    } catch (error) {
      console.error('Error fetching dettes:', error);
      throw error;
    }
  }

  async getDettesByClient(idClient, includeRemboursements = false) {
>>>>>>> Stashed changes
    try {
      let query = 'SELECT * FROM dettes WHERE idClient = ? ORDER BY datedette DESC';
      
      if (includeRemboursements) {
        query = `
          SELECT d.*, 
                 SUM(r.montant) as totalRembourse,
                 (d.montant - IFNULL(SUM(r.montant), 0)) as restant
          FROM dettes d
          LEFT JOIN remboursements r ON r.idDette = d.idDette
          WHERE d.idClient = ?
          GROUP BY d.idDette
          ORDER BY d.datedette DESC
        `;
      }

      const result = await this.executeQuery(query, [idClient]);
      return result.rows._array;
    } catch (error) {
      console.error('Error fetching client dettes:', error);
      throw error;
    }
  }

  async getTotalDettesByClient(idClient) {
    try {
      const result = await this.executeQuery(
        `SELECT SUM(montant) as total 
         FROM dettes 
         WHERE idClient = ?`,
        [idClient]
      );
      return result.rows.item(0)?.total || 0;
    } catch (error) {
      console.error('Error calculating total dettes:', error);
      throw error;
    }
  }

  async getTotalDettesNonRembourseesByClient(idClient) {
    try {
      const result = await this.executeQuery(
        `SELECT 
           SUM(d.montant) as totalDette,
           SUM(IFNULL(r.montant, 0)) as totalRembourse,
           (SUM(d.montant) - SUM(IFNULL(r.montant, 0))) as restant
         FROM dettes d
         LEFT JOIN remboursements r ON r.idDette = d.idDette
         WHERE d.idClient = ?`,
        [idClient]
      );
      return result.rows.item(0)?.restant || 0;
    } catch (error) {
      console.error('Error calculating non-remboursed dettes:', error);
      throw error;
    }
  }

  async deleteDette(idDette) {
    try {
      const result = await this.executeQuery(
        'DELETE FROM dettes WHERE idDette = ?',
        [idDette]
      );
      return result.rowsAffected > 0;
    } catch (error) {
      console.error('Error deleting dette:', error);
      throw error;
    }
  }


  async getGlobalDetteStatus() {
    try {
      const result = await this.executeQuery(
        `SELECT 
           SUM(d.montant) as totalDette,
           SUM(IFNULL(r.montant, 0)) as totalRembourse,
           (SUM(d.montant) - SUM(IFNULL(r.montant, 0))) as restant
         FROM dettes d
         LEFT JOIN remboursements r ON r.idDette = d.idDette`
      );
      return result.rows.item(0);
    } catch (error) {
      console.error('Error getting global dette status:', error);
      throw error;
    }
  }
}


const detteRepository = new DetteRepository();
export default detteRepository;