import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Drawer = createDrawerNavigator();

const ScreenWrapper = ({ component: Component, hideFooter, ...props }) => (
  <View style={styles.layoutContainer}>
    <View style={styles.content}>
      <Component {...props} />
    </View>
    {!hideFooter && <Footer />}
  </View>
);

export default function Layout({ screens }) {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <Sidebar {...props} />}
        screenOptions={{
          headerShown: true,
          drawerType: 'slide',
          overlayColor: 'transparent',
          drawerStyle: {
            backgroundColor: '#1c1c1e',
            width: 240,
          },
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        }}
      >
        {screens.map((screen) => (
          <Drawer.Screen
            key={screen.name}
            name={screen.name}
          >
            {(props) => (
              <ScreenWrapper 
                component={screen.component} 
                hideFooter={screen.hideFooter} 
                {...props} 
              />
            )}
          </Drawer.Screen>
        ))}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  layoutContainer: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    paddingBottom: 70,
  },
});