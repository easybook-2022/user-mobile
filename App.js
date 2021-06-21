import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AsyncStorage, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as Font from 'expo-font';

// pages
import Login from './src/pages/login'
import Register from './src/pages/register'


// restaurants
import Main from './src/pages/main'
import Locationprofile from './src/pages/locationprofile'
import Itemprofile from './src/pages/itemprofile'

import Account from './src/pages/account'
import Recent from './src/pages/recent'

// components
import Cart from './src/components/cart'
import Notifications from './src/components/notifications'

const Stack = createStackNavigator();

export default function App() {
    const [loaded] = Font.useFonts({ appFont: require('./assets/Chilanka-Regular.ttf') });
    const [route, setRoute] = useState(null)

    if (loaded) {
        const retrieveId = async() => {
            let id = await AsyncStorage.getItem("id")

            setRoute(id ? "main" : "login")
        }

        retrieveId()

        if (route != null) {
            return (
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={route}>
                        <Stack.Screen name="login" component={Login} options={{ headerShown: false }}/>
                        <Stack.Screen name="register" component={Register} options={{ headerShown: false }}/>
                        <Stack.Screen name="main" component={Main} options={{ headerShown: false }}/>
                        <Stack.Screen name="locationprofile" component={Locationprofile} options={{ headerShown: false }}/>
                        <Stack.Screen name="itemprofile" component={Itemprofile} options={{ headerShown: false }}/>
                        <Stack.Screen name="cart" component={Cart} options={{ headerShown: false }}/>
                        <Stack.Screen name="notifications" component={Notifications} options={{ headerShown: false }}/>
                        <Stack.Screen name="account" component={Account} options={{ headerShown: false }}/>
                        <Stack.Screen name="recent" component={Recent} options={{ headerShown: false }}/>
                    </Stack.Navigator>
                </NavigationContainer>
            )
        }
            
    }

    return null
}
