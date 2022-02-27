import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Text, View, TouchableOpacity, StyleSheet, Dimensions, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

import Main from './src/pages/main'
import Restaurantprofile from './src/pages/restaurants/restaurantprofile'
import Itemprofile from './src/pages/restaurants/itemprofile'
import Seeorders from './src/pages/seeorders'

import Salonprofile from './src/pages/salons/salonprofile'
import Booktime from './src/pages/salons/booktime'

// logged in pages
import Account from './src/pages/account'
import Orders from './src/components/orders'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function App() {
    const Stack = createNativeStackNavigator();
    
    const [loaded] = Font.useFonts({ appFont: require('./assets/Chilanka-Regular.ttf') });

    if (loaded) {
      return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="main">
              <Stack.Screen name="main" component={Main} options={{ headerShown: false }}/>
              <Stack.Screen name="seeorders" component={Seeorders} options={({ navigation, route }) => ({
                headerTitle: () => <Text style={styles.header}>#{route.params.ordernumber} Order(s)</Text>,
                headerLeft: () => (
                  Platform.OS == 'ios' && (
                  <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Text style={styles.backHeader}>Go Back</Text>
                  </TouchableOpacity>
                )
                )
              })}/>
              <Stack.Screen name="restaurantprofile" component={Restaurantprofile} options={({ navigation }) => ({
                headerTitle: () => <Text style={styles.header}>Restaurant Profile</Text>,
                headerLeft: () => (
                  Platform.OS == 'ios' && (
                    <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                      <Text style={styles.backHeader}>Go Back</Text>
                    </TouchableOpacity>
                  )
                )
              })}/>
              <Stack.Screen name="itemprofile" component={Itemprofile} options={({ navigation }) => ({
                headerTitle: () => <Text style={styles.header}>Item Profile</Text>,
                headerLeft: () => (
                  Platform.OS == 'ios' && (
                    <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                      <Text style={styles.backHeader}>Go Back</Text>
                    </TouchableOpacity>
                  )
                )
              })}/>
              <Stack.Screen name="orders" component={Orders} options={{ headerShown: false }}/>
              <Stack.Screen name="salonprofile" component={Salonprofile} options={({ navigation }) => ({
                headerTitle: () => <Text style={styles.header}>Salon Profile</Text>,
                headerLeft: () => (
                  Platform.OS == 'ios' && (
                    <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                      <Text style={styles.backHeader}>Go Back</Text>
                    </TouchableOpacity>
                  )
                )
              })}/>
              <Stack.Screen name="booktime" component={Booktime} options={({ navigation, route }) => ({
                headerTitle: () => <Text style={styles.header}>{route.params.scheduleid ? 'Rebook' : 'Book'} an appointment</Text>,
                headerLeft: () => (
                  Platform.OS == 'ios' && (
                    <TouchableOpacity style={styles.back} onPress={() => {
                      if (route.params && route.params.initialize) {
                          route.params.initialize()
                      }
                      
                      navigation.goBack()
                    }}>
                      <Text style={styles.backHeader}>Go Back</Text>
                    </TouchableOpacity>
                  )           
                )
              })}/>
              <Stack.Screen name="account" component={Account} options={({ navigation, route }) => ({
                headerTitle: () => <Text style={styles.header}>Account Info</Text>,
                headerLeft: () => (
                  Platform.OS == 'ios' && (
                    <TouchableOpacity style={styles.back} onPress={() => {
                      if (route.params && route.params.refetch) {
                          route.params.refetch()
                      }

                      navigation.goBack()
                    }}>
                      <Text style={styles.backHeader}>Go Back</Text>
                    </TouchableOpacity>
                  )
                )
              })}/>
            </Stack.Navigator>
        </NavigationContainer>
      ) 
    }
    
    return null
}

const styles = StyleSheet.create({
  header: { fontSize: wsize(5), fontWeight: 'bold' },
  back: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 1, padding: 5, width: wsize(20) },
  backHeader: { fontSize: wsize(3), fontWeight: 'bold' },
})
