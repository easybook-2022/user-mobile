import React, { useEffect, useState } from 'react'
import { AsyncStorage, SafeAreaView, ActivityIndicator, Dimensions, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { CommonActions } from '@react-navigation/native';
import * as Location from 'expo-location';
import { logo_url } from '../../assets/info'
import { getNotifications, getNumNotifications } from '../apis/users'
import { getLocations, getMoreLocations } from '../apis/locations'
import { getNumCartItems } from '../apis/carts'

import Notifications from '../components/notifications'
import Cart from '../components/cart'

import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')

export default function main({ navigation }) {
	const [locationPermission, setLocationpermission] = useState(false)
	const [geolocation, setGeolocation] = useState({ longitude: null, latitude: null })
	const [trackUser, setTrackuser] = useState()
	const [searchLocationname, setSearchlocationname] = useState('')
	const [locations, setLocations] = useState([])
	const [openNotifications, setOpenNotifications] = useState(false)
	const [numNotifications, setNumnotifications] = useState(0)

	const [currentGeo, setCurrentgeo] = useState({ msg: "not yet" })
	const [lastGeo, setLastgeo] = useState({ msg: "not yet" })
	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(0)

	const getTheNumNotifications = async() => {
		const userid = await AsyncStorage.getItem("userid")

		getNumNotifications(userid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) setNumnotifications(res.numNotifications)
			})
	}
	const getTheNumCartItems = async() => {
		const userid = await AsyncStorage.getItem("userid")

		getNumCartItems(userid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setNumcartitems(res.numCartItems)
				}
			})
	}

	const getTheLocations = async(longitude, latitude, locationName) => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, longitude, latitude, locationName }

		getLocations(data)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					}
				}
			})
			.then((res) => {
				if (res) {
					setLocations(res.locations)
					setSearchlocationname(locationName)
				}
			})
	}
	const getTheMoreLocations = async(type, lindex, index) => {
		const userid = await AsyncStorage.getItem("userid")
		const newLocations = [...locations]
		const { longitude, latitude } = geolocation
		const data = { userid, longitude, latitude, locationName: searchLocationname, type, index }

		getMoreLocations(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { index, max, newlocations } = res

					newLocations[lindex]["locations"] = newLocations[lindex]["locations"].concat(newlocations)
					newLocations[lindex]["index"] = index
					newLocations[lindex]["max"] = max

					setLocations(newLocations)
				}
			})
	}
	const getLocationPermission = async() => {
		const info = await Location.hasServicesEnabledAsync()
		let longitude = await AsyncStorage.getItem("longitude")
		let latitude = await AsyncStorage.getItem("latitude")
		let permission = false

		if (longitude && latitude) {
			setGeolocation({ longitude, latitude })

			setLocationpermission(true)
			getTheLocations(longitude, latitude, '')
		}

		if (info) { // location service is enabled
			const getfore = await Location.getForegroundPermissionsAsync()
			const getback = await Location.getBackgroundPermissionsAsync()

			if (getfore.status == 'granted' || getback.status == 'granted') {
				setLocationpermission(true)
			} else {
				const fore = await Location.requestForegroundPermissionsAsync()
				const back = await Location.requestBackgroundPermissionsAsync()

				if (fore.status == 'granted' && back.status == 'granted') {
					setLocationpermission(true)
				}
			}

			const current = await Location.getCurrentPositionAsync()
			const last = await Location.getLastKnownPositionAsync()

			if (current.coords.longitude && current.coords.latitude) {
				longitude = current.coords.longitude
				latitude = current.coords.latitude

				setGeolocation({ longitude, latitude })

				AsyncStorage.setItem("longitude", longitude.toString())
				AsyncStorage.setItem("latitude", latitude.toString())
			} else if (last.coords.longitude && last.coords.latitude) {
				longitude = last.coords.longitude
				latitude = last.coords.latitude

				setGeolocation({ longitude, latitude })

				AsyncStorage.setItem("longitude", longitude.toString())
				AsyncStorage.setItem("latitude", latitude.toString())
			}

			if (longitude && latitude) {
				getTheLocations(longitude, latitude, '')
				setTrackuser(setInterval(() => trackUserLocation(), 1000))
			} else {
				const longitude = parseFloat(await AsyncStorage.getItem("longitude"))
				const latitude = parseFloat(await AsyncStorage.getItem("latitude"))

				setGeolocation({ longitude, latitude })
			}
		}
	}
	const trackUserLocation = async() => {
		if (locationPermission) {
			const current = await Location.getCurrentPositionAsync()
			const last = await Location.getLastKnownPositionAsync()
			let known = false

			if (current.coords.longitude && current.coords.latitude) {
				const { longitude, latitude } = current.coords

				setGeolocation({ longitude, latitude })

				known = true
			}

			if (last.coords.longitude && last.coords.latitude && !known) {
				const { longitude, latitude } = last.coords

				setGeolocation({ longitude, latitude })

				known = true
			}
		}
	}

	useEffect(() => {
		getTheNumNotifications()
		getTheNumCartItems()
		getLocationPermission()

		return () => {
			if (locationPermission) {
				clearInterval(trackUser)
			}
		}
	}, [])

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<View style={style.header}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<TextInput style={style.searchInput} placeholder="Search any locations" onChangeText={(name) => getTheLocations(geolocation.longitude, geolocation.latitude, name)}/>
						<TouchableOpacity style={style.notification} onPress={() => setOpenNotifications(true)}>
							<FontAwesome name="bell" size={30}/>
							{numNotifications > 0 && <Text style={{ fontWeight: 'bold' }}>{numNotifications}</Text>}
						</TouchableOpacity>
					</View>
				</View>

				<View>
					<FlatList
						style={{ height: height - 223 }}
						showsVerticalScrollIndicator={false}
						data={locations}
						renderItem={({ item, index }) => 
							<View key={item.key} style={style.service}>
								<Text style={style.rowHeader}>{item.locations.length} {item.header} near you</Text>

								{item.index < item.max && (
									<TouchableOpacity style={style.seeMore} onPress={() => navigation.navigate(item.service)}>
										<Text style={style.seeMoreHeader}>See More</Text>
									</TouchableOpacity>
								)}

								<View style={style.row}>
									<FlatList
										ListFooterComponent={() => {
											if (item.loading && item.index < item.max) {
												return <ActivityIndicator style={{ marginVertical: 50 }} size="large"/>
											}

											return null
										}}
										horizontal
										onEndReached={() => getTheMoreLocations(item.service, index, item.index)}
										onEndReachedThreshold={0}
										showsHorizontalScrollIndicator={false}
										data={item.locations}
										renderItem={({ item }) => 
											<TouchableOpacity style={style.location} onPress={() => navigation.navigate(item.nav, { locationid: item.id })}>
												<View style={style.locationPhotoHolder}>
													<Image source={{ uri: logo_url + item.logo }} style={{ height: 80, width: 80 }}/>
												</View>

												<Text style={style.locationName}>{item.name}</Text>
											</TouchableOpacity>
										}
									/>
								</View>
							</View>
						}
					/>
				</View>

				<View style={style.bottomNavs}>
					<TouchableOpacity style={style.bottomNav} onPress={() => navigation.navigate("account")}>
						<FontAwesome5 name="user-circle" size={30}/>
					</TouchableOpacity>
					<TouchableOpacity style={style.bottomNav} onPress={() => navigation.navigate("recent")}>
						<FontAwesome name="history" size={30}/>
					</TouchableOpacity>
					<TouchableOpacity style={style.bottomNav} onPress={() => setOpencart(true)}>
						<Entypo name="shopping-cart" size={30}/>
						{numCartItems > 0 && <Text style={style.numCartItemsHeader}>{numCartItems}</Text>}
					</TouchableOpacity>
					<TouchableOpacity style={style.bottomNav} onPress={() => {
						AsyncStorage.clear()

						navigation.dispatch(
							CommonActions.reset({
								index: 1,
								routes: [{ name: 'login' }]
							})
						);
					}}>
						<Text style={style.bottomNavHeader}>Log-Out</Text>
					</TouchableOpacity>
				</View>
			</View>

			<Modal visible={openNotifications}><Notifications navigation={navigation} close={() => setOpenNotifications(false)}/></Modal>
			<Modal visible={openCart}><Cart close={() => setOpencart(false)}/></Modal>
		</SafeAreaView>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	header: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: 70, justifyContent: 'space-between', padding: 5, width: '100%' },
	searchInput: { backgroundColor: '#EFEFEF', borderRadius: 5, fontSize: 15, margin: 10, padding: 10, width: width - 80 },
	notification: { flexDirection: 'row', marginRight: 10, marginVertical: 10 },

	service: { marginBottom: 10, marginHorizontal: 5 },
	rowHeader: { fontWeight: 'bold', margin: 10 },
	seeMore: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	row: { flexDirection: 'row' },
	location: { alignItems: 'center', flexDirection: 'column', height: 100, justifyContent: 'space-between', margin: 5, width: 100 },
	locationPhotoHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 40, height: 80, overflow: 'hidden', width: 80 },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },
})
