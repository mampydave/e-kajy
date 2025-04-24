import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import ClientRepository from './../database/ClientRepository'; 

const ClientScreen = () => {
  const [nom, setNom] = useState('');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await ClientRepository.getAllClients();
      setClients(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les clients.');
    }
  };

  const handleAddClient = async () => {
    if (!nom.trim()) {
      Alert.alert('Erreur', 'Le nom du client est requis.');
      return;
    }

    try {
      await ClientRepository.createClient(nom);
      Alert.alert('Succès', 'Client ajouté avec succès !');
      setNom('');
      loadClients();
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'ajouter le client.");
    }
  };

  const handleDeleteClient = async (idClient) => {
    Alert.alert('Confirmation', 'Supprimer ce client ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await ClientRepository.deleteClient(idClient);
            loadClients();
          } catch (error) {
            Alert.alert('Erreur', "Impossible de supprimer le client.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.clientItem}>
      <Text>{item.nom}</Text>
      <TouchableOpacity onPress={() => handleDeleteClient(item.idClient)}>
        <Text style={styles.deleteBtn}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un client</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom du client"
        value={nom}
        onChangeText={setNom}
      />
      <Button title="Ajouter" onPress={handleAddClient} />

      <Text style={styles.subTitle}>Liste des clients</Text>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.idClient.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Aucun client pour le moment.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 18,
    marginTop: 30,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    marginBottom: 20,
    borderRadius: 6,
  },
  clientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f2f2f2',
    marginBottom: 8,
    borderRadius: 6,
  },
  deleteBtn: {
    color: 'red',
    fontSize: 18,
  },
});

export default ClientScreen;
