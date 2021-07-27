import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AsyncStorage, Dimensions, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as Font from 'expo-font';

const { height, width } = Dimensions.get('window')

// pages
import Login from './src/pages/login'
import Register from './src/pages/register'
import Setup from './src/pages/setup'

import Main from './src/pages/main'

// restaurants
import Restaurants from './src/pages/restaurants'
import Restaurantprofile from './src/pages/restaurants/restaurantprofile'
import Makereservation from './src/pages/restaurants/makereservation'
import Itemprofile from './src/pages/restaurants/itemprofile'
import Recent from './src/pages/restaurants/recent'

// restaurants' components
import Cart from './src/components/cart'

// salons
import Salons from './src/pages/salons'
import Salonprofile from './src/pages/salons/salonprofile'
import Menu from './src/pages/salons/menu'
import Booktime from './src/pages/salons/booktime'

import Account from './src/pages/account'
import Notifications from './src/components/notifications'

const Stack = createStackNavigator();

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
                setRoute("register")
            }
        }
        
        retrieveId()

        if (route != null) {
            return (
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={route}>
                        <Stack.Screen name="login" component={Login} options={{ headerShown: false }}/>
                        <Stack.Screen name="register" component={Register} options={{ headerShown: false }}/>
                        <Stack.Screen name="setup" component={Setup} options={{ headerShown: false }}/>
                        <Stack.Screen name="main" component={Main} options={{ headerShown: false }}/>

                        <Stack.Screen name="restaurants" component={Restaurants} options={{ headerShown: false }}/>
                        
                        <Stack.Screen name="restaurantprofile" component={Restaurantprofile} options={{ headerShown: false }}/>
                        <Stack.Screen name="makereservation" component={Makereservation} options={{ headerShown: false }}/>
                        <Stack.Screen name="itemprofile" component={Itemprofile} options={{ headerShown: false }}/>
                        <Stack.Screen name="recent" component={Recent} options={{ headerShown: false }}/>
                        <Stack.Screen name="cart" component={Cart} options={{ headerShown: false }}/>

                        <Stack.Screen name="salons" component={Salons} options={{ headerShown: false }}/>
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
