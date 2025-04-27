import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Button } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AddEventScreen from './AddEventScreen';
import EventRepository from './../database/EventRepository'; 

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState({});

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const allEvents = await EventRepository.getAllEvents(); 

      const typeColors = {
        budget: 'green',
        depense: 'red',
        dette: 'blue',
        remboursement: 'orange'
      };
      
      const marked = {};
      allEvents.forEach(event => {
        marked[event.date] = {
          marked: true,
          dotColor: typeColors[event.type] || 'black'
        };
      });
      
      setEvents(marked);
    } catch (error) {
      console.error('Erreur chargement événements', error);
    }
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    loadEvents();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendrier</Text>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          ...events,
          ...(selectedDate && {
            [selectedDate]: {
              selected: true,
              selectedColor: 'black',
              marked: true,
              dotColor: 'black',
            }
          })
        }}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContent}>
          <AddEventScreen selectedDate={selectedDate} onClose={handleCloseModal} />
          <Button title="Fermer" onPress={handleCloseModal} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  modalContent: { flex: 1, padding: 20 },
});
