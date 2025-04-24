import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Sidebar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dave's App</Text>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Dashboard')}>
        <Ionicons name="speedometer-outline" size={20} color="#fff" />
        <Text style={styles.text}>Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Clients')}>
        <Ionicons name="people-outline" size={20} color="#fff" />
        <Text style={styles.text}>Clients</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default Sidebar;
