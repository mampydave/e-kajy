import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Calendar, Agenda } from 'react-native-calendars';
import AddEventScreen from './AddEventScreen';
import EventRepository from './../database/EventRepository';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState({});
  const [dayEvents, setDayEvents] = useState([]);
  const [viewMode, setViewMode] = useState('month');
  const [refreshing, setRefreshing] = useState(false);
  const [eventsByDate, setEventsByDate] = useState({});

  useEffect(() => {
    const initialize = async () => {
      try {
        await EventRepository.init();
        loadEvents();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initialize();
  }, []);

  const loadEvents = async () => {
    try {
      const allEvents = await EventRepository.getAllEvents();

      const marked = {};
      const eventsByDate = {};

      allEvents.forEach(event => {
        if (!event.date) return;
        const eventDate = event.date.split('T')[0];

        if (!marked[eventDate]) {
          marked[eventDate] = { dots: [] };
        }

        marked[eventDate].dots.push({
          key: `${event.type}-${event.id}`,
          color: getEventColor(event.type),
        });

        if (!eventsByDate[eventDate]) {
          eventsByDate[eventDate] = [];
        }
        eventsByDate[eventDate].push(event);
      });

      setEvents(marked);
      setDayEvents(eventsByDate[selectedDate] || []);
    } catch (error) {
      console.error('Erreur chargement événements', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, []);

  const getEventColor = (type) => {
    const colors = {
      budget: '#0f9d58',
      depense: '#db4437',
      dette: '#4285f4',
      remboursement: '#ffbb33',
    };
    return colors[type] || '#999';
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    if (viewMode === 'month') {
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    loadEvents();
  };

  const renderEventItem = (event) => (
    <TouchableOpacity
      style={[styles.eventItem, { borderLeftColor: getEventColor(event.type) }]}
      onPress={() => console.log('Edit event', event.id)}
    >
      <Text style={styles.eventTitle}>
        {(event.type ? event.type.toUpperCase() : 'TYPE INCONNU')}: {event.montant} Ar
      </Text>
      {event.clientName && <Text style={styles.eventClient}>Client: {event.clientName}</Text>}
      {event.description && <Text style={styles.eventDescription}>{event.description}</Text>}
      <Text style={styles.eventDate}>{event.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Agenda</Text>
        <View style={styles.viewSwitcher}>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'month' && styles.activeView]}
            onPress={() => setViewMode('month')}
          >
            <MaterialIcons name="calendar-today" size={24} color={viewMode === 'month' ? '#fff' : '#4285f4'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'agenda' && styles.activeView]}
            onPress={() => setViewMode('agenda')}
          >
            <MaterialIcons name="view-agenda" size={24} color={viewMode === 'agenda' ? '#fff' : '#4285f4'} />
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'month' ? (
        <>
          <Calendar
            theme={{
              todayTextColor: '#4285f4',
              selectedDayBackgroundColor: '#4285f4',
              arrowColor: '#4285f4',
              dotColor: '#ffffff',
              selectedDotColor: '#ffffff',
            }}
            onDayPress={handleDayPress}
            markedDates={{
              ...Object.keys(events).reduce((acc, date) => {
                acc[date] = {
                  dots: events[date].dots,
                  selected: date === selectedDate,
                };
                return acc;
              }, {}),
              [selectedDate]: {
                selected: true,
                selectedColor: '#4285f4',
              }
            }}
            markingType="multi-dot"
          />

          <View style={styles.dayEvents}>
            <Text style={styles.sectionTitle}>
              Événements du {new Date(selectedDate).toLocaleDateString()}
            </Text>
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {dayEvents.map(event => (
                <View key={`${event.id}-${event.type}`} style={styles.eventItem}>
                  {renderEventItem(event)}
                </View>
              ))}
              {dayEvents.length === 0 && (
                <Text style={styles.noEvents}>Aucun événement ce jour</Text>
              )}
            </ScrollView>
          </View>
        </>
      ) : (
        <Agenda
          items={Object.keys(events).reduce((acc, date) => {
            acc[date] = events[date].dots.map(dot => ({
              ...dayEvents.find(e => e.id === dot.key.split('-')[1]),
              height: 50
            }));
            return acc;
          }, {})}
          selected={selectedDate}
          renderItem={renderEventItem}
          renderEmptyDate={() => (
            <View style={styles.emptyDate}>
              <Text>Aucun événement</Text>
            </View>
          )}
          theme={{
            selectedDayBackgroundColor: '#4285f4',
            todayTextColor: '#4285f4',
            agendaDayTextColor: '#4285f4',
            agendaDayNumColor: '#4285f4',
            agendaTodayColor: '#4285f4',
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContent}>
          <AddEventScreen selectedDate={selectedDate} onClose={handleCloseModal} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#202124',
  },
  viewSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#e8f0fe',
    borderRadius: 20,
    padding: 2,
  },
  viewButton: {
    padding: 8,
    borderRadius: 18,
  },
  activeView: {
    backgroundColor: '#4285f4',
  },
  dayEvents: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#5f6368',
  },
  eventItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#202124',
  },
  eventClient: {
    color: '#5f6368',
    fontSize: 14,
    marginTop: 4,
  },
  eventDescription: {
    color: '#5f6368',
    marginTop: 4,
    fontSize: 14,
  },
  eventDate: {
    color: '#5f6368',
    fontSize: 12,
    marginTop: 4,
  },
  noEvents: {
    color: '#5f6368',
    textAlign: 'center',
    marginTop: 20,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4285f4',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  modalContent: {
    flex: 1,
    paddingTop: 40,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
});
