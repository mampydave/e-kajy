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
    try {
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
      if (isSelect) {
        const rows = await this.db.getDb().getAllAsync(sql, params);
        return { rows: Array.isArray(rows) ? rows : [] };
      } else {
        const result = await this.db.getDb().getAllAsync(sql, params);
        return {
          insertId: result.lastInsertRowId,
          rowsAffected: result.changes,
          rows: []
        };
      }
    } catch (error) {
      console.error('SQL Error:', error, 'Query:', sql);
      throw error;
    }
  }

  async getDashboardDataByYear(year, month) {
    try {
      await this.db.ensureInitialized();
      const dateFilter = this._buildDateFilter(year, month);
      const data = {
        budget: 0,
        depense: 0,
        solde: 0,
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
          SELECT 
            c.nom,
            d.totalDette,
            IFNULL(r.totalRembourse, 0) AS totalRembourse,
            (d.totalDette - IFNULL(r.totalRembourse, 0)) AS restant
          FROM (
            SELECT idClient, SUM(montant) AS totalDette
            FROM dettes
            ${dateFilter('datedette')}
            GROUP BY idClient
          ) d
          INNER JOIN clients c ON c.idClient = d.idClient
          LEFT JOIN (
            SELECT idClient, SUM(montant) AS totalRembourse
            FROM remboursements
            ${dateFilter('dateRemboursement')}
            GROUP BY idClient
          ) r ON r.idClient = d.idClient
          WHERE (d.totalDette - IFNULL(r.totalRembourse, 0)) > 0
        `)

      ]);

      data.budget = budgetRes.rows[0]?.total || 0;
      data.depense = depenseRes.rows[0]?.total || 0;
      data.solde = data.budget - data.depense;

      const historiqueRows = Array.isArray(historiqueRes.rows) ? historiqueRes.rows : [];
      const historiqueWithClients = await Promise.all(
        historiqueRows.map(async item => ({
          ...item,
          client: item.idClient ? await this._getClientNameById(item.idClient) : '-'
        }))
      );
      data.historique = historiqueWithClients;

      const dettesRows = Array.isArray(dettesRes.rows) ? dettesRes.rows : [];
      data.clientsAvecDetteNonRembourse = dettesRows.map(row => ({
        nom: row.nom,
        montant: row.restant
      }));

      return data;
    } catch (error) {
      console.error('Error in getDashboardDataByMonthYear:', error);
      throw error;
    }
  }


  _buildDateFilter(year, month = null) {
    return (dateCol, includeWhere = true) => {
      if (!year) return includeWhere ? '' : '1=1';
      
      let condition;
      if (month) {

        condition = `strftime('%m', ${dateCol}) = '${month.toString().padStart(2, '0')}' 
                    AND strftime('%Y', ${dateCol}) = '${year}'`;
      } else {

        condition = `strftime('%Y', ${dateCol}) = '${year}'`;
      }
      
      if (includeWhere) {
        return condition ? `WHERE ${condition}` : '';
      } else {
        return condition;
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
      return res.rows.length > 0 ? res.rows[0].nom : '-';
    } catch (error) {
      console.error('Error fetching client name:', error);
      return '-';
    }
  }

  async resetAllData() {
    await this.db.ensureInitialized();

    const tables = ['budgets', 'depenses', 'dettes', 'remboursements', 'clients'];

    try {
      for (const table of tables) {
        await this.db.executeSql(`DELETE FROM ${table}`);
        await this.db.executeSql(`DELETE FROM sqlite_sequence WHERE name = ?`, [table]);
      }

      console.log('All data reset successfully');
      await this.db.init(); 
      return true;
    } catch (error) {
      console.error('Error resetting data:', error);
      throw error;
    }
  }

}

const dashboardRepository = new DashboardRepository();
export default dashboardRepository;