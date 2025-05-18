import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import BudgetRepository from './../database/BudgetRepository';
import DepenseRepository from './../database/DepenseRepository';
import DetteRepository from './../database/DetteRepository';
import RemboursementRepository from './../database/RemboursementRepository';
import ClientRepository from './../database/ClientRepository';
import EventRepository from './../database/EventRepository';

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
        await Promise.all([
          BudgetRepository.init(),
          DepenseRepository.init(),
          DetteRepository.init(),
          RemboursementRepository.init(),
          ClientRepository.init(),
          EventRepository.init()
        ]);

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
      const montantFloat = parseFloat(montant);
      const idClientInt = parseInt(idClient);

      if (isNaN(montantFloat)){
        alert("Veuillez entrer un montant valide.");
        return;
      }

      let message = "Événement ajouté avec succès !";

      if (type === 'remboursement') {
        const totalDette = await DetteRepository.getTotalDetteByClient(idClientInt); 
        const totalRembourse = await RemboursementRepository.getTotalRemboursementByClient(idClientInt);
        const reste = totalDette - totalRembourse;

        if (reste <= 0) {
          alert("Ce client n'a plus de dette. Action rejetée.");
          return;
        }
        if (montantFloat > reste) {
          alert(`Le montant à rembourser dépasse la dette restante (${reste}). Action rejetée.`);
          return;
        }
        if (montantFloat === reste) {
          message = "Remboursement accepté. Ce client a réglé toutes ses dettes.";
        } else {
          const nouveauReste = reste - montantFloat;
          message = `Remboursement partiel accepté. Il reste ${nouveauReste.toFixed(2)} Ar à payer.`;
        }
      }

      switch (type) {
        case 'budget':
          await BudgetRepository.createBudget(idClientInt, montantFloat, selectedDate);
          break;
        case 'depense':
          await DepenseRepository.createDepense(montantFloat, describe, selectedDate);
          break;
        case 'dette':
          await DetteRepository.createDette(idClientInt, montantFloat, selectedDate);
          break;
        case 'remboursement':
          await RemboursementRepository.createRemboursement(idClientInt, montantFloat, selectedDate);
          break;
      }

      alert(message);
      await fetchEvents(); 
      setMontant('');
      setDescribe('');
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

      <View style={styles.formGroup}>
        <Text style={styles.label}>Type d'événement :</Text>
        <Picker 
          selectedValue={type} 
          onValueChange={setType}
          style={styles.picker}
        >
          <Picker.Item label="Budget" value="budget" />
          <Picker.Item label="Dépense" value="depense" />
          <Picker.Item label="Dette" value="dette" />
          <Picker.Item label="Remboursement" value="remboursement" />
        </Picker>
      </View>

      {(type === 'budget' || type === 'dette' || type === 'remboursement') && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Choisir un client :</Text>
          <Picker 
            selectedValue={idClient} 
            onValueChange={setIdClient}
            style={styles.picker}
          >
            {clients.map(client => (
              <Picker.Item 
                key={client.idClient} 
                label={client.nom} 
                value={client.idClient.toString()} 
              />
            ))}
          </Picker>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Montant :</Text>
        <TextInput
          placeholder="Entrez le montant"
          value={montant}
          onChangeText={setMontant}
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      {type === 'depense' && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description :</Text>
          <TextInput
            placeholder="Décrivez la dépense"
            value={describe}
            onChangeText={setDescribe}
            style={[styles.input, styles.textArea]}
            multiline
          />
        </View>
      )}

      <Button 
        title="Ajouter l'événement" 
        onPress={handleSubmit} 
        color="#4285f4"
      />

      <View style={styles.eventsContainer}>
        <Text style={styles.sectionTitle}>Événements existants :</Text>
        
        {loadingEvents ? (
          <ActivityIndicator size="small" />
        ) : events.length === 0 ? (
          <Text style={styles.noEvents}>Aucun événement pour cette date.</Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) => (
              <View style={[
                styles.eventItem,
                { borderLeftColor: getBadgeColor(item.type) }
              ]}>
                <Text style={styles.eventType}>{item.type.toUpperCase()}</Text>
                <Text style={styles.eventAmount}>Montant : {item.montant} Ar</Text>
                {item.clientName && (
                  <Text style={styles.eventClient}>Client : {item.clientName}</Text>
                )}
                {item.description && (
                  <Text style={styles.eventDescription}>Description : {item.description}</Text>
                )}
              </View>
            )}
          />
        )}
      </View>


    </View>
  );
}

const getBadgeColor = (type) => {
  switch (type) {
    case 'budget': return '#0f9d58';
    case 'depense': return '#db4437';
    case 'dette': return '#4285f4';
    case 'remboursement': return '#ffbb33';
    default: return '#9e9e9e';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#202124',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: '500',
    color: '#5f6368',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#202124',
  },
  eventsContainer: {
    flex: 1,
    marginTop: 20,
  },
  eventItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  eventType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventAmount: {
    fontSize: 15,
    marginBottom: 3,
  },
  eventClient: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 3,
  },
  eventDescription: {
    fontSize: 14,
    color: '#5f6368',
    fontStyle: 'italic',
  },
  noEvents: {
    textAlign: 'center',
    color: '#9e9e9e',
    marginTop: 10,
  },
  closeButton: {
    marginTop: 20,
  },
});