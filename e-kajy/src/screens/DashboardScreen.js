import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import DashboardRepository from './../database/DashboardRepository';

const DashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [filter, setFilter] = useState('jour');

  useEffect(() => {
    loadData();
  }, [filter]);

  const getColorByType = (type) => {
    switch (type) {
      case 'Budget': return 'green';
      case 'Dépense': return 'orange';
      case 'Dette': return 'red';
      case 'Remboursement': return 'blue';
      default: return 'black';
    }
  };

  const loadData = async () => {
    try {
      const data = await DashboardRepository.getDashboardDataByDateType(filter);
      setDashboardData(data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    }
  };

  const resetAllData = async () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment réinitialiser toutes les données ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui',
          onPress: async () => {
            try {
              await DashboardRepository.resetAllData();
              await loadData();
            } catch (error) {
              console.error('Erreur lors de la réinitialisation :', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {['jour', 'semaine', 'mois', 'annee'].map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() => setFilter(item)}
          style={[styles.filterButton, filter === item && styles.activeFilter]}
        >
          <Text style={styles.filterText}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {renderFilterButtons()}

      <TouchableOpacity style={styles.resetButton} onPress={resetAllData}>
        <Text style={styles.resetText}>Réinitialiser toutes les données</Text>
      </TouchableOpacity>

      {dashboardData && (
        <View>
          <Text style={styles.summary}>Budget: {dashboardData.budget.toFixed(2)} Ar</Text>
          <Text style={styles.summary}>Dépenses: {dashboardData.depense.toFixed(2)} Ar</Text>

          <Text style={styles.subtitle}>Historique:</Text>
          {dashboardData.historique.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={{ color: getColorByType(item.type) }}>
                {item.date?.split('T')[0] || item.date} - {item.type} ({item.client}) : {item.montant} Ar
              </Text>
            </View>
          ))}

          <Text style={styles.subtitle}>Clients avec dette non remboursée:</Text>
          {dashboardData.clientsAvecDetteNonRembourse.map((client, index) => (
            <Text key={index} style={styles.debtItem}>{client.nom} : {client.montant} Ar</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'gray',
  },
  activeFilter: {
    backgroundColor: '#000',
  },
  filterText: {
    color: 'white',
    textTransform: 'capitalize'
  },
  summary: {
    fontSize: 16,
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  historyItem: {
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  debtItem: {
    marginTop: 4,
    fontSize: 16,
    color: 'red'
  },
  resetButton: {
    alignSelf: 'center',
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  resetText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
