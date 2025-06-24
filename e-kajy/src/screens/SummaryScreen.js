import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import budgetRepository from '../database/BudgetRepository';
import depenseRepository from '../database/DepenseRepository';

const SummaryScreen = ({ route }) => {
  const { annee, mois } = route.params;

  const [budgets, setBudgets] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const budgetData = await budgetRepository.getBudgetMonthYearClient(annee, mois);
      const depenseData = await depenseRepository.getDepensesByMonthYear(annee, mois);
      setBudgets(budgetData);
      setDepenses(depenseData);
    } catch (error) {
      console.error('Erreur chargement des données :', error);
    }
  };
  
  useEffect(() => {
    loadData();
  }, [annee, mois]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [annee, mois]);

  const totalBudget = budgets.reduce((sum, b) => sum + b.montant, 0);
  const totalDepense = depenses.reduce((sum, d) => sum + d.montant, 0);


  const groupedDepenses = depenses.reduce((acc, dep) => {
    const date = new Date(dep.datedepense).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(dep);
    return acc;
  }, {});

  const getMonthName = (monthNumber) => {
    const months = [
      'Janvier','Février','Mars','Avril','Mai','Juin',
      'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
    ];
    return months[monthNumber - 1];
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6A1B9A']} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerIcon}>👁️</Text>
        <Text style={styles.headerText}>
          {getMonthName(mois)} {annee}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Clients ({totalBudget.toLocaleString()} AR)</Text>
      <View style={styles.card}>
        {budgets.map((b, index) => (
          <View style={styles.row} key={index}>
            <Text style={styles.label}>{b.nom}</Text>
            <Text style={styles.amount}>{b.montant.toLocaleString()} AR</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Dépenses ({totalDepense.toLocaleString()} AR)</Text>
      {Object.keys(groupedDepenses).map((date) => {
        const items = groupedDepenses[date];
        const totalDate = items.reduce((sum, item) => sum + item.montant, 0);
        return (
          <View style={styles.depenseCard} key={date}>
            <View style={styles.dateHeader}>
              <Icon name="event" size={18} color="#6A1B9A" />
              <Text style={styles.dateText}>{date}</Text>
            </View>
            {items.map((d, index) => (
              <View style={styles.row} key={index}>
                <Text style={styles.label}>{d.describe}</Text>
                <Text style={styles.amount}>{d.montant.toLocaleString()} AR</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total du {date}</Text>
              <Text style={styles.totalAmount}>{totalDate.toLocaleString()} AR</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#6A1B9A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  depenseCard: {
    backgroundColor: '#F3E5F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A1B9A',
    marginLeft: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6A1B9A',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7fd2d5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 5,
  },
  headerIcon: {
    fontSize: 22,
    marginRight: 5,
  },

});

export default SummaryScreen;
