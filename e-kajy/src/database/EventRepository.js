import Database from './Database';
import BudgetRepository from './BudgetRepository';
import DepenseRepository from './DepenseRepository';
import DetteRepository from './DetteRepository';
import RemboursementRepository from './RemboursementRepository';
import ClientRepository from './ClientRepository';

class EventRepository {
  constructor() {
    this.db = Database;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      await this.db.init();

      await Promise.all([
        BudgetRepository.init(),
        DepenseRepository.init(),
        DetteRepository.init(),
        RemboursementRepository.init(),
        ClientRepository.init()
      ]);

      this.initialized = true;
      console.log('EventRepository initialized');
    } catch (error) {
      console.error('Failed to initialize EventRepository:', error);
      throw error;
    }
  }

async getAllEvents() {
    try {
      await this.db.ensureInitialized();
      const [budgets, depenses, dettes, remboursements, clients] = await Promise.all([
        BudgetRepository.getAllBudgets(),
        DepenseRepository.getAllDepenses(),
        DetteRepository.getAllDettes(true),
        RemboursementRepository.getAllRemboursements(true),
        ClientRepository.getAllClients()
      ]);

      const clientsMap = new Map(clients.map(client => [client.idClient, client]));

      const transformEvent = (item, type) => {
        let rawDate;

        switch (type) {
          case 'budget':
            rawDate = item.datebudget;
            break;
          case 'depense':
            rawDate = item.datedepense;
            break;
          case 'dette':
            rawDate = item.datedette;
            break;
          case 'remboursement':
            rawDate = item.dateRemboursement;
            break;
          default:
            rawDate = item.date;
        }

        const dateOnly = rawDate 
          ? rawDate.toString().split(' ')[0] 
          : new Date().toISOString().split('T')[0];

        return {
          date: dateOnly,
          type,
          montant: item.montant,
          id: item[`id${type.charAt(0).toUpperCase() + type.slice(1)}`],
          description: item.description || item.describe || null,
          clientName: type !== 'depense' && item.idClient 
            ? (clientsMap.get(item.idClient)?.nom || 'Client inconnu')
            : undefined
        };
      };


      const allEvents = [
        ...budgets.map(b => transformEvent(b, 'budget')),
        ...depenses.map(d => transformEvent(d, 'depense')),
        ...dettes.map(d => transformEvent(d, 'dette')),
        ...remboursements.map(r => transformEvent(r, 'remboursement'))
      ];

      console.log('Événements transformés:', allEvents);
      return allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error getting all events:', error);
      throw error;
    }
  }

  async getEventsByDateRange(startDate, endDate) {
    try {
      const allEvents = await this.getAllEvents();
      return allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
      });
    } catch (error) {
      console.error('Error getting events by date range:', error);
      throw error;
    }
  }
  async getAllEventsByDate(date) {
    try {
      const allEvents = await this.getAllEvents();
      const targetDate = new Date(date).toISOString().slice(0, 10); 

      return allEvents.filter(event => {
        if (!event.date) return false;
        const eventDate = new Date(event.date).toISOString().slice(0, 10);
        return eventDate === targetDate;
      });
    } catch (error) {
      console.error('Error getting events by date:', error);
      throw error;
    }
  }

  async getFinancialSummary() {
    try {
      const [budgets, depenses, dettes, remboursements] = await Promise.all([
        BudgetRepository.getAllBudgets(),
        DepenseRepository.getAllDepenses(),
        DetteRepository.getAllDettes(),
        RemboursementRepository.getAllRemboursements()
      ]);

      const totalBudgets = budgets.reduce((sum, b) => sum + (b.montant || 0), 0);
      const totalDepenses = depenses.reduce((sum, d) => sum + (d.montant || 0), 0);
      const totalDettes = dettes.reduce((sum, d) => sum + (d.montant || 0), 0);
      const totalRemboursements = remboursements.reduce((sum, r) => sum + (r.montant || 0), 0);

      return {
        totalBudgets,
        totalDepenses,
        totalDettes,
        totalRemboursements,
        solde: totalBudgets - totalDepenses,
        dettesRestantes: totalDettes - totalRemboursements
      };
    } catch (error) {
      console.error('Error calculating financial summary:', error);
      throw error;
    }
  }
}

const eventRepository = new EventRepository();
export default eventRepository;
