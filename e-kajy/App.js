import React from 'react';
import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Layout from './src/components/Layout';
import DashboardScreen from './src/screens/DashboardScreen';
import ClientScreen from './src/screens/ClientScreen';

const Stack = createStackNavigator();

export default function App() {
  const screens = [
    { name: 'Dashboard', component: DashboardScreen },
    { name: 'Clients', component: ClientScreen },
    // { name: 'Fullscreen', component: FullscreenScreen, hideFooter: true },
  ];

  return <Layout screens={screens} />;
}
