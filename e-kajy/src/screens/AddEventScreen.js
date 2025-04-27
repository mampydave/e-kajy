import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import BudgetRepository from './../database/BudgetRepository';
import DepenseRepository from './../database/DepenseRepository';
import DetteRepository from './../database/DetteRepository';
import RemboursementRepository from './../database/RemboursementRepository';
import ClientRepository from './../database/ClientRepository';
import EventRepository from './../database/EventRepository'; // <== tu rajoutes

export default function AddEventScreen({ selectedDate, onClose }) {
  const [type, setType] = useState('budget');
  const [montant, setMontant] = useState('');
  const [describe, setDescribe] = useState('');
  const [clients, setClients] = useState([]);
  const [idClient, setIdClient] = useState('');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const list = await ClientRepository.getAllClients();
        setClients(list);
        if (list.length > 0) setIdClient(list[0].idClient.toString());
      } catch (e) {
        console.error("Erreur chargement clients", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const list = await EventRepository.getAllEventsByDate(selectedDate);
      setEvents(list);
    } catch (e) {
      console.error("Erreur chargement événements", e);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSubmit = async () => {
    try {
      switch (type) {
        case 'budget':
          await BudgetRepository.createBudget(parseInt(idClient), parseFloat(montant), selectedDate);
          break;
        case 'depense':
          await DepenseRepository.createDepense(parseFloat(montant), describe, selectedDate);
          break;
        case 'dette':
          await DetteRepository.createDette(parseInt(idClient), parseFloat(montant), selectedDate);
          break;
        case 'remboursement':
          await RemboursementRepository.createRemboursement(parseInt(idClient), parseFloat(montant), selectedDate);
          break;
      }
      alert("Événement ajouté avec succès !");
      await fetchEvents(); 
      setMontant('');
      setDescribe('');
      onClose(); 
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'ajout !");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un événement pour {selectedDate}</Text>

      <Text>Type d'événement :</Text>
      <Picker selectedValue={type} onValueChange={setType}>
        <Picker.Item label="Budget" value="budget" />
        <Picker.Item label="Dépense" value="depense" />
        <Picker.Item label="Dette" value="dette" />
        <Picker.Item label="Remboursement" value="remboursement" />
      </Picker>

      {(type === 'budget' || type === 'dette' || type === 'remboursement') && (
        <>
          <Text>Choisir un client :</Text>
          <Picker selectedValue={idClient} onValueChange={setIdClient}>
            {clients.map(client => (
              <Picker.Item key={client.idClient} label={client.nom} value={client.idClient.toString()} />
            ))}
          </Picker>
        </>
      )}

      <TextInput
        placeholder="Montant"
        value={montant}
        onChangeText={setMontant}
        keyboardType="numeric"
        style={styles.input}
      />

      {type === 'depense' && (
        <TextInput
          placeholder="Description"
          value={describe}
          onChangeText={setDescribe}
          style={styles.input}
        />
      )}

      <Button title="Ajouter l'événement" onPress={handleSubmit} />

      <View style={{ marginTop: 30 }}>
        <Text style={styles.subtitle}>Événements existants :</Text>

        {loadingEvents ? (
          <ActivityIndicator size="small" />
        ) : events.length === 0 ? (
          <Text>Aucun événement pour cette date.</Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.eventItem}>
                <View style={[styles.badge, { backgroundColor: getBadgeColor(item.type) }]}>
                  <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
                </View>
                
                <View style={{ marginLeft: 10 }}>
                  <Text>Montant : {item.montant} Ar</Text>
                  {item.clientName && <Text>Venant de : {item.clientName}</Text>}
                  {item.description && <Text>Description : {item.description}</Text>}
                </View>
              </TouchableOpacity>

            )}
          />
        )}
      </View>
    </View>
  );
}
const getBadgeColor = (type) => {
  switch (type) {
    case 'budget':
      return '#3498db'; 
    case 'depense':
      return '#e74c3c'; 
    case 'dette':
      return '#f39c12'; 
    case 'remboursement':
      return '#2ecc71'; 
    default:
      return '#7f8c8d'; 
  }
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  subtitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
  },  
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
