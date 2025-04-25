import 'react-native-gesture-handler'; // Doit être la PREMIÈRE importation
import React from 'react';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import Layout from './src/components/Layout';
import DashboardScreen from './src/screens/DashboardScreen';
import ClientScreen from './src/screens/ClientScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import AddEventScreen from './src/screens/AddEventScreen';

// Active les vues natives optimisées
enableScreens();

export default function App() {
  const screens = [
    { name: 'Calendar', component: CalendarScreen, hideFooter: true },
    { name: 'AddEvent', component: AddEventScreen, hideFooter: true }, 
    { name: 'Dashboard', component: DashboardScreen },
    { name: 'Clients', component: ClientScreen },
  ];

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Layout screens={screens} />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}