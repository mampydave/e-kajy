import 'react-native-gesture-handler'; 
import React from 'react';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Layout from './src/components/Layout';
import DashboardScreen from './src/screens/DashboardScreen';
import ClientScreen from './src/screens/ClientScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import AddEventScreen from './src/screens/AddEventScreen';
import {DatabaseProvider} from './src/context/DatabaseContext';
import SummaryScreen from './src/screens/SummaryScreen';

enableScreens();

export default function App() {
  const screens = [
    { name: 'Calendar', component: CalendarScreen, hideFooter: true },
    { name: 'AddEvent', component: AddEventScreen }, 
    { name: 'Dashboard', component: DashboardScreen },
    { name: 'Clients', component: ClientScreen },
    { name: 'SummaryScreen', component: SummaryScreen },
  ];
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const initApp = async () => {
      setTimeout(() => setIsReady(true), 1000);
    };

    initApp();
  }, []);

  if (!isReady) {
    return (

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <DatabaseProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Layout screens={screens} />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </DatabaseProvider>
  );
}
