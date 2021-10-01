import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AsyncStorage, Text, View, Dimensions, StyleSheet, LogBox } from 'react-native';
import * as Font from 'expo-font';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

const { height, width } = Dimensions.get('window')

import Setup from './src/pages/setup'
import Main from './src/pages/main'
import Restaurantprofile from './src/pages/restaurants/restaurantprofile'
import Makereservation from './src/pages/restaurants/makereservation'
import Order from './src/pages/restaurants/order'
import Itemprofile from './src/pages/restaurants/itemprofile'

import Menu from './src/components/menu'
import Salonprofile from './src/pages/salons/salonprofile'
import Booktime from './src/pages/salons/booktime'

// logged in pages
import Account from './src/pages/account'
import Recent from './src/pages/recent'
import Cart from './src/components/cart'
import Notifications from './src/components/notifications'

const Stack = createNativeStackNavigator();

export default function App() {
    const [loaded] = Font.useFonts({ appFont: require('./assets/Chilanka-Regular.ttf') });
    const [route, setRoute] = useState(null)

    if (loaded) {
        const retrieveId = async() => {
            let userid = await AsyncStorage.getItem("userid")
            let setup = await AsyncStorage.getItem("setup")

            if (userid) {
                if (setup == "true") {
                    setRoute("main")
                } else {
                    setRoute("setup")
                }
            } else {
                setRoute("main")
            }
        }
        
        retrieveId()

        if (route != null) {
            return (
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={route}>
                        <Stack.Screen name="setup" component={Setup} options={{ headerShown: false }}/>
                        <Stack.Screen name="main" component={Main} options={{ headerShown: false }}/>
                        
                        <Stack.Screen name="restaurantprofile" component={Restaurantprofile} options={{ headerShown: false }}/>
                        <Stack.Screen name="makereservation" component={Makereservation} options={{ headerShown: false }}/>
                        <Stack.Screen name="order" component={Order} options={{ headerShown: false }}/>
                        <Stack.Screen name="itemprofile" component={Itemprofile} options={{ headerShown: false }}/>
                        <Stack.Screen name="recent" component={Recent} options={{ headerShown: false }}/>
                        <Stack.Screen name="cart" component={Cart} options={{ headerShown: false }}/>

                        <Stack.Screen name="salonprofile" component={Salonprofile} options={{ headerShown: false }}/>
                        <Stack.Screen name="menu" component={Menu} options={{ headerShown: false }}/>
                        <Stack.Screen name="booktime" component={Booktime} options={{ headerShown: false }}/>

                        <Stack.Screen name="notifications" component={Notifications} options={{ headerShown: false }}/>
                        <Stack.Screen name="account" component={Account} options={{ headerShown: false }}/>
                    </Stack.Navigator>
                </NavigationContainer>
            )
        }     
    }
    
    return null
}
