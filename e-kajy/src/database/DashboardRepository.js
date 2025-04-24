import Database from './Database';

class DashboardRepository {
  constructor() {
    this.db = Database;
  }

  async init() {
    await this.db.init();
  }

  /**
   * Récupère les données pour le dashboard en filtrant par jour, semaine, mois ou année
   * @param {'jour'|'semaine'|'mois'|'annee'} type
   */
  async getDashboardDataByDateType(type = 'jour') {
    try {
      const data = {
        budget: 0,
        depense: 0,
        historique: [],
        clientsAvecDetteNonRembourse: []
      };

      const dateFilter = this._buildDateFilter(type);

      await this.db.db.transaction(async (tx) => {
        // Total budget
        const budgetRes = await tx.executeSql(
          `SELECT SUM(montant) AS total FROM budgets ${dateFilter('datebudget')}`
        );
        data.budget = budgetRes[0].rows.item(0).total || 0;

        // Total dépenses
        const depenseRes = await tx.executeSql(
          `SELECT SUM(montant) AS total FROM depenses ${dateFilter('datedepense')}`
        );
        data.depense = depenseRes[0].rows.item(0).total || 0;

        // Historique combiné (avec clients)
        const historiqueRes = await tx.executeSql(
          `
            SELECT 'Budget' AS type, montant, datebudget AS date, idClient FROM budgets ${dateFilter('datebudget')}
            UNION ALL
            SELECT 'Dépense', montant, datedepense, NULL FROM depenses ${dateFilter('datedepense')}
            UNION ALL
            SELECT 'Dette', montant, datedette, idClient FROM dettes ${dateFilter('datedette')}
            UNION ALL
            SELECT 'Remboursement', montant, dateRemboursement, idClient FROM remboursements ${dateFilter('dateRemboursement')}
            ORDER BY date DESC
          `
        );

        for (let i = 0; i < historiqueRes[0].rows.length; i++) {
          const row = historiqueRes[0].rows.item(i);
          data.historique.push({
            type: row.type,
            montant: row.montant,
            date: row.date,
            client: row.idClient ? await this._getClientNameById(tx, row.idClient) : '-'
          });
        }

        // Clients avec dettes non remboursées
        const dettesRes = await tx.executeSql(
          `
          SELECT c.nom, 
                 SUM(d.montant) AS totalDette, 
                 IFNULL(SUM(r.montant), 0) AS totalRembourse, 
                 (SUM(d.montant) - IFNULL(SUM(r.montant), 0)) AS restant
          FROM dettes d
          INNER JOIN clients c ON c.idClient = d.idClient
          LEFT JOIN remboursements r ON r.idClient = d.idClient
          GROUP BY d.idClient
          HAVING restant > 0
          `
        );

        for (let i = 0; i < dettesRes[0].rows.length; i++) {
          const row = dettesRes[0].rows.item(i);
          data.clientsAvecDetteNonRembourse.push({
            nom: row.nom,
            montant: row.restant
          });
        }
      });

      return data;
    } catch (error) {
      console.error('Erreur getDashboardDataByDateType:', error);
      throw error;
    }
  }

  _buildDateFilter(type) {
    return (dateCol) => {
      switch (type) {
        case 'jour':
          return `WHERE date(${dateCol}) = date('now')`;
        case 'semaine':
          return `WHERE strftime('%W', ${dateCol}) = strftime('%W', 'now') AND strftime('%Y', ${dateCol}) = strftime('%Y', 'now')`;
        case 'mois':
          return `WHERE strftime('%m', ${dateCol}) = strftime('%m', 'now') AND strftime('%Y', ${dateCol}) = strftime('%Y', 'now')`;
        case 'annee':
          return `WHERE strftime('%Y', ${dateCol}) = strftime('%Y', 'now')`;
        default:
          return '';
      }
    };
  }
  

  async _getClientNameById(tx, idClient) {
    if (!idClient) return '-';
    const res = await tx.executeSql(
      `SELECT nom FROM clients WHERE idClient = ?`,
      [idClient]
    );
    return res[0].rows.length > 0 ? res[0].rows.item(0).nom : '-';
  }
}

export default new DashboardRepository();
