import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Text, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Chilanka_400Regular } from '@expo-google-fonts/chilanka';

import Main from './src/pages/main'
import Restaurantprofile from './src/pages/restaurants/profile'
import Seeorders from './src/pages/seeorders'
import Salonprofile from './src/pages/salons/profile'
import Booktime from './src/pages/salons/booktime'
import Storeprofile from './src/pages/stores/profile'
import Account from './src/pages/account'
import Itemprofile from './src/components/itemprofile'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function App() {
  const Stack = createNativeStackNavigator();
  
  const [fontLoaded] = useFonts({ Chilanka_400Regular });
  
  if (fontLoaded) {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="main">
          <Stack.Screen name="main" component={Main} options={{ headerShown: false }}/>
          <Stack.Screen name="seeorders" component={Seeorders} options={({ navigation, route }) => ({
            headerTitle: () => <Text style={styles.header}>Order(s)</Text>,
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
          <Stack.Screen name="storeprofile" component={Storeprofile} options={({ navigation }) => ({
            headerTitle: () => <Text style={styles.header}>Store Profile</Text>,
            headerLeft: () => (
              Platform.OS == 'ios' && (
                <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                  <Text style={styles.backHeader}>Go Back</Text>
                </TouchableOpacity>
              )
            )
          })}/>
          <Stack.Screen name="booktime" component={Booktime} options={({ navigation, route }) => ({
            headerTitle: () => <Text style={styles.header}>{route.params.scheduleid ? 'Change' : 'Book an'} appointment</Text>,
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
          <Stack.Screen name="account" component={Account} options={({ navigation }) => ({
            headerTitle: () => <Text style={styles.header}>Account Info</Text>,
            headerLeft: () => (
              Platform.OS == 'ios' && (
                <TouchableOpacity style={styles.back} onPress={() => navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "main", params: { initialize: true }}]
                  })
                )}>
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
