import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, TouchableOpacity, StyleSheet, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

import Setup from './src/pages/setup'
import Main from './src/pages/main'
import Restaurantprofile from './src/pages/restaurants/restaurantprofile'
import Makereservation from './src/pages/restaurants/makereservation'
import Order from './src/pages/restaurants/order'
import Itemprofile from './src/pages/restaurants/itemprofile'

import Salonprofile from './src/pages/salons/salonprofile'
import Booktime from './src/pages/salons/booktime'

// logged in pages
import Account from './src/pages/account'
import Recent from './src/pages/recent'
import Cart from './src/components/cart'
import Notifications from './src/components/notifications'

export default function App() {
    const Stack = createNativeStackNavigator();
    
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
                        <Stack.Screen name="restaurantprofile" component={Restaurantprofile} options={({ navigation }) => ({
                            headerTitle: () => <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Restaurant Profile</Text>,
                            headerLeft: () => (
                                Platform.OS == 'ios' && (
                                    <TouchableOpacity style={style.back} onPress={() => navigation.goBack()}>
                                        <Text style={style.backHeader}>Go Back</Text>
                                    </TouchableOpacity>
                                )
                            )
                        })}/>
                        <Stack.Screen name="makereservation" component={Makereservation} options={({ navigation, route }) => ({
                            headerTitle: () => <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Make reservation</Text>,
                            headerLeft: () => (
                                Platform.OS == 'ios' && (
                                    <TouchableOpacity style={style.back} onPress={() => {
                                        if (route.params && route.params.initialize) {
                                            route.params.initialize()
                                        }

                                        navigation.goBack()
                                    }}>
                                        <Text style={style.backHeader}>Go Back</Text>
                                    </TouchableOpacity>
                                )
                            )
                        })}/>
                        <Stack.Screen name="order" component={Order} options={({ navigation }) => ({
                            headerTitle: () => <Text style={{ fontSize: 20, fontWeight: 'bold' }}></Text>,
                            headerLeft: () => (
                                Platform.OS == 'ios' && (
                                    <TouchableOpacity style={style.back} onPress={() => navigation.goBack()}>
                                        <Text style={style.backHeader}>Go Back</Text>
                                    </TouchableOpacity>
                                )
                            )
                        })}/>
                        <Stack.Screen name="itemprofile" component={Itemprofile} options={({ navigation }) => ({
                            headerTitle: () => <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Item Profile</Text>,
                            headerLeft: () => (
                                Platform.OS == 'ios' && (
                                    <TouchableOpacity style={style.back} onPress={() => navigation.goBack()}>
                                        <Text style={style.backHeader}>Go Back</Text>
                                    </TouchableOpacity>
                                )
                            )
                        })}/>
                        <Stack.Screen name="recent" component={Recent} options={({ navigation }) => ({
                            headerTitle: () => <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Recent(s)</Text>,
                            headerLeft: () => (
                                Platform.OS == 'ios' && (
                                    <TouchableOpacity style={style.back} onPress={() => navigation.goBack()}>
                                        <Text style={style.backHeader}>Go Back</Text>
                                    </TouchableOpacity>
                                )
                            )
                        })}/>
                        <Stack.Screen name="cart" component={Cart} options={{ headerShown: false }}/>

                        <Stack.Screen name="salonprofile" component={Salonprofile} options={({ navigation }) => ({
                            headerTitle: () => <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Salon Profile</Text>,
                            headerLeft: () => (
                                Platform.OS == 'ios' && (
                                    <TouchableOpacity style={style.back} onPress={() => navigation.goBack()}>
                                        <Text style={style.backHeader}>Go Back</Text>
                                    </TouchableOpacity>
                                )
                            )
                        })}/>
                        <Stack.Screen name="booktime" component={Booktime} options={({ navigation, route }) => ({
                            headerTitle: () => <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{route.params.scheduleid ? 'Rebook' : 'Book'} a time</Text>,
                            headerLeft: () => (
                                Platform.OS == 'ios' && (
                                    <TouchableOpacity style={style.back} onPress={() => {
                                        if (route.params && route.params.initialize) {
                                            route.params.initialize()
                                        }
                                        
                                        navigation.goBack()
                                    }}>
                                        <Text style={style.backHeader}>Go Back</Text>
                                    </TouchableOpacity>
                                )           
                            )
                        })}/>

                        <Stack.Screen name="notifications" component={Notifications} options={{ headerShown: false }}/>
                        <Stack.Screen name="account" component={Account} options={({ navigation, route }) => ({
                            headerTitle: () => <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Account Info</Text>,
                            headerLeft: () => (
                                Platform.OS == 'ios' && (
                                    <TouchableOpacity style={style.back} onPress={() => {
                                        if (route.params && route.params.refetch) {
                                            route.params.refetch()
                                        }

                                        navigation.goBack()
                                    }}>
                                        <Text style={style.backHeader}>Go Back</Text>
                                    </TouchableOpacity>
                                )
                            )
                        })}/>
                    </Stack.Navigator>
                </NavigationContainer>
            )
        }     
    }
    
    return null
}

const style = StyleSheet.create({
    back: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 1, padding: 5 },
    backHeader: { fontWeight: 'bold' },
})
