import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Picker, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import BudgetRepository from './../database/BudgetRepository';
import DepenseRepository from './../database/DepenseRepository';
import DetteRepository from './../database/DetteRepository';
import RemboursementRepository from './../database/RemboursementRepository';
import ClientRepository from './../database/ClientRepository';

export default function AddEventScreen() {
  const route = useRoute();
  const selectedDate = route.params?.selectedDate || new Date().toISOString().split('T')[0];

  const [type, setType] = useState('budget');
  const [montant, setMontant] = useState('');
  const [describe, setDescribe] = useState('');
  const [clients, setClients] = useState([]);
  const [idClient, setIdClient] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const list = await ClientRepository.getAllClients(); // méthode à créer si tu ne l’as pas encore
        setClients(list);
        if (list.length > 0) setIdClient(list[0].idClient.toString());
      } catch (e) {
        console.error("Erreur chargement clients", e);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
  },
});
