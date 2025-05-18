import React, { createContext, useContext, useEffect, useState } from 'react';
import databaseInstance from '../database/Database';

const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const setupDb = async () => {
      try {
        await databaseInstance.init();
        setIsDbReady(true);
      } catch (error) {
        console.error('Erreur d\'initialisation de la base :', error);
      }
    };

    setupDb();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isDbReady }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
