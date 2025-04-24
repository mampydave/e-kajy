import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>For Dashboard</Text>

    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      position: 'relative'
    },
    content: {
      flex: 1,
      paddingBottom: 70 // Pour éviter le chevauchement avec le footer
    }
  });
  
export default DashboardScreen;
