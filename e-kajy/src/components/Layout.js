import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Drawer = createDrawerNavigator();

const ScreenWrapper = ({ component: Component, hideFooter, ...props }) => {
  return (
    <View style={styles.layoutContainer}>
      <View style={styles.content}>
        <Component {...props} />
      </View>
      {!hideFooter && <Footer />}
    </View>
  );
};

function Layout({ screens }) {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Calendar"  
        drawerContent={(props) => <Sidebar {...props} />}
        screenOptions={{
          headerShown: true,
          drawerType: 'slide',
          overlayColor: 'transparent',
          drawerStyle: styles.drawerStyle,
          headerStyle: styles.headerStyle,
          headerTintColor: '#fff',
          drawerActiveTintColor: '#fff',
          drawerInactiveTintColor: '#aaa',
          drawerActiveBackgroundColor: '#2c2c2e',
        }}
      >
        {screens.map((screen) => (
          <Drawer.Screen
            key={screen.name}
            name={screen.name}
            options={{
              title: screen.name,  
              ...screen.options,  
            }}
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
    backgroundColor: '#fff',  
  },
  content: {
    flex: 1,
    paddingBottom: 70,  
  },
  drawerStyle: {
    backgroundColor: '#1c1c1e',
    width: 240,
  },
  headerStyle: {
    backgroundColor: '#000',
    elevation: 0,       
    shadowOpacity: 0,   
  },
});

export default Layout;