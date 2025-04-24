CREATE TABLE clients(
    idClient int primary key,
    nom VARCHAR(30)
);

CREATE TABLE budgets(
    idBudget int primary key,
    idClient int,
    montant decimal(18,2),
    datebudget timestamp,
    FOREIGN KEY idClient REFERENCES clients(idClient)
);

CREATE TABLE depenses(
    idDepense int primary key,
    montant decimal(18,2),
    describe text,
    datedepense timestamp
);

CREATE TABLE dettes(
    idDette int primary key,
    montant decimal(18,2),
    idClient int,
    datedette timestamp,
    FOREIGN KEY idClient REFERENCES clients(idClient)
);

CREATE TABLE remboursements(
    idremboursement int primary key,
    montant decimal(18,2),
    idClient int,
    dateremboursement timestamp,
    FOREIGN KEY idClient REFERENCES clients(idClient)
);