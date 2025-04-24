import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(null);
  const navigation = useNavigation();

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    navigation.navigate('AddEvent', { selectedDate: day.dateString });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendrier</Text>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: {
            selected: true,
            marked: true,
            selectedColor: 'black',
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
});
