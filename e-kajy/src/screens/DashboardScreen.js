import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import DashboardRepository from './../database/DashboardRepository';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, []);

  const months = [
    { id: null, name: 'Tous les mois' },
    { id: 1, name: 'Janvier' },
    { id: 2, name: 'Février' },
    { id: 3, name: 'Mars' },
    { id: 4, name: 'Avril' },
    { id: 5, name: 'Mai' },
    { id: 6, name: 'Juin' },
    { id: 7, name: 'Juillet' },
    { id: 8, name: 'Août' },
    { id: 9, name: 'Septembre' },
    { id: 10, name: 'Octobre' },
    { id: 11, name: 'Novembre' },
    { id: 12, name: 'Décembre' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await DashboardRepository.init();
        await loadData();
      } catch (error) {
        console.error('Initialization error:', error);
        Alert.alert('Erreur', 'Impossible de charger les données');
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await DashboardRepository.getDashboardDataByYear(selectedYear, selectedMonth);
      setDashboardData(data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      Alert.alert('Erreur', 'Problème de chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const resetAllData = async () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment réinitialiser toutes les données ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer',
          onPress: () => setShowPasswordModal(true),
        },
      ],
      { cancelable: true }
    );
  };

  const validatePassword = async () => {
    const correctPassword = "rmdirdev1";

    if (password === correctPassword) {
      try {
        setLoading(true);
        await DashboardRepository.resetAllData();
        await loadData();
        Alert.alert('Succès', 'Toutes les données ont été réinitialisées');
      } catch (error) {
        console.error('Erreur lors de la réinitialisation :', error);
        Alert.alert('Erreur', 'Échec de la réinitialisation');
      } finally {
        setLoading(false);
        setShowPasswordModal(false);
        setPassword('');
      }
    } else {
      Alert.alert('Erreur', 'Mot de passe incorrect');
      setPassword('');
    }
  };

  const renderPieChart = () => {
    if (!dashboardData) return null;

    const data = [
      {
        name: 'Budget',
        amount: dashboardData.budget,
        color: '#4CAF50',
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
      {
        name: 'Dépenses',
        amount: dashboardData.depense,
        color: '#F44336',
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
    ];

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Répartition Budget/Dépenses</Text>
        <PieChart
          data={data}
          width={width - 40}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  const renderDetteChart = () => {
    if (!dashboardData || !dashboardData.clientsAvecDetteNonRembourse.length) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Dettes par Client</Text>
          <View style={styles.emptyState}>
            <AntDesign name="exclamationcircle" size={24} color="#9E9E9E" />
            <Text style={styles.emptyStateText}>Aucune dette enregistrée</Text>
          </View>
        </View>
      );
    }

    const chartData = dashboardData.clientsAvecDetteNonRembourse;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Dettes par Client</Text>
          <TouchableOpacity onPress={() => Alert.alert('Détails', 'Voir la liste complète des dettes')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Dettes</Text>
            <Text style={styles.summaryValue}>
              {chartData.reduce((sum, item) => sum + item.montant, 0).toLocaleString()} Ar
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Clients endettés</Text>
            <Text style={styles.summaryValue}>{chartData.length}</Text>
          </View>
        </View>

        <BarChart
          data={{
            labels: chartData.map(item => item.nom),
            datasets: [{
              data: chartData.map(item => item.montant),
              colors: chartData.map((_, index) => 
                (opacity = 1) => `rgba(244, 67, 54, ${opacity})`
              )
            }]
          }}
          width={width - 40}
          height={220}
          yAxisLabel="Ar "
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#f8f9fa',
            backgroundGradientTo: '#f8f9fa',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            barPercentage: 0.5,
            propsForLabels: {
              fontSize: 10
            }
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          fromZero
        />

        <View style={styles.clientList}>
          {chartData.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.clientItem}>
              <Text style={styles.clientName} numberOfLines={1}>{item.nom}</Text>
              <Text style={styles.clientAmount}>{item.montant.toLocaleString()} Ar</Text>
            </View>
          ))}
          {chartData.length > 3 && (
            <Text style={styles.moreItems}>+ {chartData.length - 3} autres clients</Text>
          )}
        </View>
      </View>
    );
  };

  const renderMonthYearFilter = () => (
    <View style={styles.filterContainer}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedMonth}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedMonth(itemValue)}
        >
          {months.map((month) => (
            <Picker.Item key={month.id || 'all'} label={month.name} value={month.id} />
          ))}
        </Picker>
      </View>
      
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedYear}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
        >
          {years.map((year) => (
            <Picker.Item key={year} label={year.toString()} value={year} />
          ))}
        </Picker>
      </View>
    </View>
  );

  const renderHistoryItem = (item, index) => (
    <View key={index} style={[
      styles.historyItem,
      { borderLeftColor: getColorByType(item.type) }
    ]}>
      <View style={styles.historyHeader}>
        <Text style={[styles.historyType, { color: getColorByType(item.type) }]}>
          {item.type}
        </Text>
        <Text style={styles.historyAmount}>{item.montant} Ar</Text>
      </View>
      <Text style={styles.historyDate}>{item.date?.split('T')[0] || item.date}</Text>
      {item.client && <Text style={styles.historyClient}>{item.client}</Text>}
    </View>
  );

  const getColorByType = (type) => {
    switch (type) {
      case 'Budget': return '#4CAF50';
      case 'Dépense': return '#F44336';
      case 'Dette': return '#FF9800';
      case 'Remboursement': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  if (loading && !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285f4" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#4285f4']}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de Bord</Text>
        <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color="#4285f4" />
        </TouchableOpacity>
      </View>

      {renderMonthYearFilter()}

      <View style={styles.summaryCards}>
        <View style={[styles.card, styles.budgetCard]}>
          <MaterialIcons name="attach-money" size={24} color="#4CAF50" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Budget Total</Text>
            <Text style={styles.cardAmount}>
              {(dashboardData?.budget || 0).toLocaleString()} Ar
            </Text>
          </View>
        </View>
        <View style={[styles.card, styles.expenseCard]}>
          <MaterialIcons name="money-off" size={24} color="#F44336" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Dépenses Total</Text>
            <Text style={styles.cardAmount}>
              {(dashboardData?.depense || 0).toLocaleString()} Ar
            </Text>
          </View>
        </View>
        <View style={[styles.card, dashboardData?.solde >= 0 ? styles.positiveBalance : styles.negativeBalance]}>
          <MaterialIcons 
            name={dashboardData?.solde >= 0 ? "trending-up" : "trending-down"} 
            size={24} 
            color={dashboardData?.solde >= 0 ? "#1976D2" : "#EF6C00"} 
          />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Solde</Text>
            <Text style={[styles.cardAmount, { color: dashboardData?.solde >= 0 ? "#1976D2" : "#EF6C00" }]}>
              {(dashboardData?.solde || 0).toLocaleString()} Ar
            </Text>
          </View>
        </View>
      </View>

      {renderPieChart()}
      {renderDetteChart()}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Historique Récent</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      
      {dashboardData?.historique.slice(0, 5).map(renderHistoryItem)}

      <TouchableOpacity 
        style={styles.resetButton} 
        onPress={resetAllData}
      >
        <MaterialIcons name="delete" size={20} color="white" />
        <Text style={styles.resetText}>Réinitialiser les Données</Text>
      </TouchableOpacity>

      {showPasswordModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmation</Text>
            <Text style={styles.modalText}>Veuillez entrer le mot de passe pour confirmer la réinitialisation :</Text>
            
            <TextInput
              style={styles.passwordInput}
              secureTextEntry
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={validatePassword}
                disabled={!password}
              >
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#202124',
  },
  refreshButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
    elevation: 2,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  picker: {
    height: 50,
  },
  summaryCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetCard: {
    backgroundColor: '#E8F5E9',
  },
  expenseCard: {
    backgroundColor: '#FFEBEE',
  },
  positiveBalance: {
    backgroundColor: '#E3F2FD',
  },
  negativeBalance: {
    backgroundColor: '#FFF3E0',
  },
  cardText: {
    marginLeft: 10,
  },
  cardTitle: {
    fontSize: 14,
    color: '#555',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  seeAll: {
    color: '#4285f4',
    fontSize: 14,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryItem: {
    backgroundColor: '#f1f3f4',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#5f6368',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  clientList: {
    marginTop: 15,
  },
  clientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clientName: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  clientAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
  },
  moreItems: {
    textAlign: 'center',
    color: '#5f6368',
    marginTop: 5,
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  historyItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 5,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  historyType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#777',
    marginBottom: 3,
  },
  historyClient: {
    fontSize: 14,
    color: '#555',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginLeft: 10,
    color: '#9E9E9E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
  },
  confirmButton: {
    backgroundColor: '#F44336',
  },
  cancelButtonText: {
    color: '#333',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DashboardScreen;