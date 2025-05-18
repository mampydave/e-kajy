import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function TestSQLite() {
  useEffect(() => {
    const initDB = async () => {
      try {
        console.log('SQLite:', SQLite);
        
        // Nouvelle API : openDatabaseAsync
        const db = await SQLite.openDatabaseAsync('test.db');

        await db.execAsync([
          {
            sql: 'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY NOT NULL, value TEXT);',
            args: [],
          },
          {
            sql: 'INSERT INTO items (value) VALUES (?);',
            args: ['Hello from SQLite'],
          },
        ]);

        const result = await db.getAllAsync('SELECT * FROM items');
        console.log('Rows inserer  eeeee :', result);
      } catch (error) {
        console.error('DB Initialization Error:', error);
      }
    };

    initDB();
  }, []);

  return (
    <View>
      <Text>Test SQLite</Text>
    </View>
  );
}
