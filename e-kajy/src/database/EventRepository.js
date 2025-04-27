import Database from './Database';
import BudgetRepository from './BudgetRepository';
import DepenseRepository from './DepenseRepository';
import DetteRepository from './DetteRepository';
import RemboursementRepository from './RemboursementRepository';
import ClientRepository from './ClientRepository';

class EventRepository {
  constructor() {
    this.db = Database;
  }

  async init() {
    await this.db.init();

    await BudgetRepository.init();
    await DepenseRepository.init();
    await DetteRepository.init();
    await RemboursementRepository.init();
    await ClientRepository.init();
  }

  static async getAllEvents() {
    const budgets = await BudgetRepository.getAllBudgets();
    const depenses = await DepenseRepository.getAllDepenses();
    const dettes = await DetteRepository.getAllDettes();
    const remboursements = await RemboursementRepository.getAllRemboursements();
    const clients = await ClientRepository.getAllClients(); 

    const findClientName = (idClient) => {
      const client = clients.find(c => c.idClient === idClient);
      return client ? client.nom : 'Client inconnu';
    };

    const all = [
      ...budgets.map(b => ({ 
        date: b.date, 
        type: 'budget', 
        montant: b.montant,
        id: b.idBudget,
        clientName: findClientName(b.idClient)
      })),
      ...depenses.map(d => ({ 
        date: d.date, 
        type: 'depense', 
        montant: d.montant, 
        description: d.description,
        id: d.idDepense
      })),
      ...dettes.map(d => ({ 
        date: d.date, 
        type: 'dette', 
        montant: d.montant,
        id: d.idDette,
        clientName: findClientName(d.idClient)
      })),
      ...remboursements.map(r => ({ 
        date: r.date, 
        type: 'remboursement', 
        montant: r.montant,
        id: r.idRemboursement,
        clientName: findClientName(r.idClient)
      }))
    ];
    
    return all;
  }

  static async getAllEventsByDate(date) {
    const all = await EventRepository.getAllEvents();
    return all.filter(event => event.date === date);
  }
}

export default new EventRepository();
