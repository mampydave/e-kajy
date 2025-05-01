import Database from './Database';

class DashboardRepository {
  constructor() {
    this.db = Database;
  }

  async init() {
    try {
      await this.db.init();
      console.log('DashboardRepository initialized');
    } catch (error) {
      console.error('Failed to initialize DashboardRepository:', error);
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

  async getDashboardDataByDateType(type = 'jour') {
    try {
      const dateFilter = this._buildDateFilter(type);
      const data = {
        budget: 0,
        depense: 0,
        historique: [],
        clientsAvecDetteNonRembourse: []
      };


      const [budgetRes, depenseRes, historiqueRes, dettesRes] = await Promise.all([
        this.executeQuery(`SELECT SUM(montant) AS total FROM budgets ${dateFilter('datebudget')}`),
        this.executeQuery(`SELECT SUM(montant) AS total FROM depenses ${dateFilter('datedepense')}`),
        this.executeQuery(`
          SELECT 'Budget' AS type, montant, datebudget AS date, idClient FROM budgets ${dateFilter('datebudget')}
          UNION ALL
          SELECT 'Dépense', montant, datedepense, NULL FROM depenses ${dateFilter('datedepense')}
          UNION ALL
          SELECT 'Dette', montant, datedette, idClient FROM dettes ${dateFilter('datedette')}
          UNION ALL
          SELECT 'Remboursement', montant, dateRemboursement, idClient FROM remboursements ${dateFilter('dateRemboursement')}
          ORDER BY date DESC
        `),
        this.executeQuery(`
          SELECT c.nom, 
                 SUM(d.montant) AS totalDette, 
                 IFNULL(SUM(r.montant), 0) AS totalRembourse, 
                 (SUM(d.montant) - IFNULL(SUM(r.montant), 0)) AS restant
          FROM dettes d
          INNER JOIN clients c ON c.idClient = d.idClient
          LEFT JOIN remboursements r ON r.idClient = d.idClient
          GROUP BY d.idClient
          HAVING restant > 0
        `)
      ]);


      data.budget = budgetRes.rows.item(0)?.total || 0;
      data.depense = depenseRes.rows.item(0)?.total || 0;

      const historiqueWithClients = await Promise.all(
        historiqueRes.rows._array.map(async item => ({
          ...item,
          client: item.idClient ? await this._getClientNameById(item.idClient) : '-'
        }))
      );
      data.historique = historiqueWithClients;

      data.clientsAvecDetteNonRembourse = dettesRes.rows._array.map(row => ({
        nom: row.nom,
        montant: row.restant
      }));

      return data;
    } catch (error) {
      console.error('Error in getDashboardDataByDateType:', error);
      throw error;
    }
  }

  _buildDateFilter(type) {
    return (dateCol) => {
      const now = new Date().toISOString();
      switch (type) {
        case 'jour':
          return `WHERE date(${dateCol}) = date('${now}')`;
        case 'semaine':
          return `WHERE strftime('%W', ${dateCol}) = strftime('%W', '${now}') 
                  AND strftime('%Y', ${dateCol}) = strftime('%Y', '${now}')`;
        case 'mois':
          return `WHERE strftime('%m', ${dateCol}) = strftime('%m', '${now}') 
                  AND strftime('%Y', ${dateCol}) = strftime('%Y', '${now}')`;
        case 'annee':
          return `WHERE strftime('%Y', ${dateCol}) = strftime('%Y', '${now}')`;
        default:
          return '';
      }
    };
  }

  async _getClientNameById(idClient) {
    if (!idClient) return '-';
    try {
      const res = await this.executeQuery(
        'SELECT nom FROM clients WHERE idClient = ?',
        [idClient]
      );
      return res.rows.length > 0 ? res.rows.item(0).nom : '-';
    } catch (error) {
      console.error('Error fetching client name:', error);
      return '-';
    }
  }

  async resetAllData() {
    try {
      await this.db.db.transaction(async tx => {
        const tables = ['budgets', 'depenses', 'dettes', 'remboursements', 'clients'];
        for (const table of tables) {
          await tx.executeSql(`DELETE FROM ${table}`);
          await tx.executeSql(`DELETE FROM sqlite_sequence WHERE name = ?`, [table]);
        }
      });
      console.log('All data reset successfully');
      return true;
    } catch (error) {
      console.error('Error resetting data:', error);
      throw error;
    }
  }
}


const dashboardRepository = new DashboardRepository();
export default dashboardRepository;