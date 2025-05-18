export const SCHEMA = {
    tables: [
      {
        name: 'clients',
        columns: [
          { name: 'idClient', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
          { name: 'nom', type: 'TEXT NOT NULL' }
        ]
      },
      {
        name: 'budgets',
        columns: [
          { name: 'idBudget', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
          { name: 'idClient', type: 'INTEGER' },
          { name: 'montant', type: 'REAL' },
          { name: 'datebudget', type: 'TEXT DEFAULT CURRENT_TIMESTAMP' },
          { 
            name: 'FOREIGN KEY(idClient) REFERENCES clients(idClient)',
            type: ''
          }
        ]
      },
      {
        name: 'depenses',
        columns: [
          { name: 'idDepense', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
          { name: 'montant', type: 'REAL' },
          { name: 'describe', type: 'TEXT' },
          { name: 'datedepense', type: 'TEXT DEFAULT CURRENT_TIMESTAMP' }
        ]
      },
      {
        name: 'dettes',
        columns: [
          { name: 'idDette', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
          { name: 'montant', type: 'REAL' },
          { name: 'idClient', type: 'INTEGER' },
          { name: 'description', type: 'TEXT' },
          { name: 'datedette', type: 'TEXT DEFAULT CURRENT_TIMESTAMP' },
          { 
            name: 'FOREIGN KEY(idClient) REFERENCES clients(idClient)',
            type: ''
          }
        ]
      },
      {
        name: 'remboursements',
        columns: [
          { name: 'idRemboursement', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
          { name: 'montant', type: 'REAL' },
          { name: 'idClient', type: 'INTEGER' },
          { name: 'idDette', type: 'INTEGER' },
          { name: 'description', type: 'TEXT' },
          { name: 'dateRemboursement', type: 'TEXT DEFAULT CURRENT_TIMESTAMP' },
          { 
            name: 'FOREIGN KEY(idClient) REFERENCES clients(idClient)',
            type: ''
          },
          { 
            name: 'FOREIGN KEY(idDette) REFERENCES dettes(idDette)',
            type: ''
          }
        ]
      }
    ]
  };
  
  export const SCHEMA_VERSION = 1;