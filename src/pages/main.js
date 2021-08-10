import React, { useEffect, useState } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import * as Location from 'expo-location';
import { logo_url } from '../../assets/info'
import { getNumUpdates } from '../apis/users'
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
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

let updateTrackUser, updateNotifications

export default function main({ navigation }) {
	const [locationPermission, setLocationpermission] = useState(false)
	const [geolocation, setGeolocation] = useState({ longitude: null, latitude: null })
	const [searchLocationname, setSearchlocationname] = useState('')
	const [locations, setLocations] = useState([])
	const [openNotifications, setOpenNotifications] = useState(false)
	const [numNotifications, setNumnotifications] = useState(0)

	const [currentGeo, setCurrentgeo] = useState({ msg: "not yet" })
	const [lastGeo, setLastgeo] = useState({ msg: "not yet" })
	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(0)

	const getTheNumUpdates = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const time = Date.now()
		const data = { userid, time }

		if (userid != null) {
			getNumUpdates(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) setNumnotifications(res.numNotifications)
				})
		}
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
		const d = new Date(), day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
		const data = { userid, longitude, latitude, locationName, day: day[d.getDay()] }

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
		const location = newLocations[lindex]
		const { longitude, latitude } = geolocation
		const d = new Date(), day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
		const data = { userid, longitude, latitude, locationName: searchLocationname, type, index, day: day[d.getDay()] }

		getMoreLocations(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { index, max, newlocations } = res

					if (newlocations.length > 0) {
						location["locations"] = location["locations"].concat(newlocations)
						location["index"] = index
						location["max"] = max

						newLocations[lindex] = location
						setLocations(newLocations)
					}
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

		if (info) {
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

			const last = await Location.getLastKnownPositionAsync()

			if (last) {
				longitude = last.coords.longitude
				latitude = last.coords.latitude

				setGeolocation({ longitude, latitude })

				AsyncStorage.setItem("longitude", longitude.toString())
				AsyncStorage.setItem("latitude", latitude.toString())
			} else {
				const current = await Location.getCurrentPositionAsync()

				if (current.coords.longitude && current.coords.latitude) {
					longitude = current.coords.longitude
					latitude = current.coords.latitude

					setGeolocation({ longitude, latitude })

					AsyncStorage.setItem("longitude", longitude.toString())
					AsyncStorage.setItem("latitude", latitude.toString())
				}
			}

			if (longitude && latitude) {
				getTheLocations(longitude, latitude, '')

				updateTrackUser = setInterval(() => trackUserLocation(), 1000)
			} else {
				const longitude = parseFloat(await AsyncStorage.getItem("longitude"))
				const latitude = parseFloat(await AsyncStorage.getItem("latitude"))

				setGeolocation({ longitude, latitude })
			}
		}
	}
	const trackUserLocation = async() => {
		let longitude, latitude

		if (locationPermission) {
			const last = await Location.getLastKnownPositionAsync()

			if (last.coords.longitude && last.coords.latitude) {
				longitude = last.coords.longitude
				latitude = last.coords.latitude

				setGeolocation({ longitude, latitude })

				AsyncStorage.setItem("longitude", longitude.toString())
				AsyncStorage.setItem("latitude", latitude.toString())
			} else {
				const current = await Location.getCurrentPositionAsync()

				if (current.coords.longitude && current.coords.latitude) {
					longitude = current.coords.longitude
					latitude = current.coords.latitude

					setGeolocation({ longitude, latitude })

					AsyncStorage.setItem("longitude", longitude.toString())
					AsyncStorage.setItem("latitude", latitude.toString())
				}
			}			
		}
	}
	const displayLocationStatus = (opentime, closetime) => {
		let openHour = parseInt(opentime['hour']), openMinute = parseInt(opentime['minute']), openPeriod = opentime['period']
		let closeHour = parseInt(closetime['hour']), closeMinute = parseInt(closetime['minute']), closePeriod = closetime['period']
		let currentTime = new Date(Date.now()).toString().split(" "), currTime = Date.now()

		openHour = openPeriod == "PM" ? parseInt(openHour) + 12 : openHour
		closeHour = closePeriod == "PM" ? parseInt(closeHour) + 12 : closeHour

		let openStr = currentTime[0] + " " + currentTime[1] + " " + currentTime[2] + " " + currentTime[3] + " " + openHour + ":" + openMinute
		let closeStr = currentTime[0] + " " + currentTime[1] + " " + currentTime[2] + " " + currentTime[3] + " " + closeHour + ":" + closeMinute
		let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr)

		if (currTime < openDateStr && currTime > closeDateStr) {
			return "Closed"
		}

		return ""
	}

	useEffect(() => {
		getTheNumUpdates()
		getTheNumCartItems()
		getLocationPermission()

		updateNotifications = setInterval(() => getTheNumUpdates(), 1000)

		return () => {
			clearInterval(updateTrackUser)
			clearInterval(updateNotifications)
		}
	}, [])

	return (
		<View style={{ paddingVertical: offsetPadding }}>
			<View style={style.box}>
				<View style={style.headers}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<TextInput style={style.searchInput} placeholder="Search any locations" onChangeText={(name) => getTheLocations(geolocation.longitude, geolocation.latitude, name)}/>
						<TouchableOpacity style={style.notification} onPress={() => setOpenNotifications(true)}>
							<FontAwesome name="bell" size={30}/>
							{numNotifications > 0 && <Text style={{ fontWeight: 'bold' }}>{numNotifications}</Text>}
						</TouchableOpacity>
					</View>
				</View>

				<View style={style.body}>
					{geolocation.longitude && geolocation.latitude ? 
						<FlatList
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
													<Text style={style.locationDistance}>{item.distance}</Text>

													{displayLocationStatus(item.opentime, item.closetime) ? <Text style={style.locationHours}>{displayLocationStatus(item.opentime, item.closetime)}</Text> : null}
												</TouchableOpacity>
											}
										/>
									</View>
								</View>
							}
						/>
						:
						<ActivityIndicator size="large"/>
					}
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
						clearInterval(updateTrackUser)
						clearInterval(updateNotifications)

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
		</View>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	headers: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: 70, justifyContent: 'space-between', padding: 5, width: '100%' },
	searchInput: { backgroundColor: '#EFEFEF', borderRadius: 5, fontSize: 15, margin: 10, padding: 10, width: width - 80 },
	notification: { flexDirection: 'row', marginRight: 10, marginVertical: 10 },

	body: { flexDirection: 'column', height: screenHeight - 100, justifyContent: 'space-around' },

	service: { marginBottom: 10, marginHorizontal: 5 },
	rowHeader: { fontWeight: 'bold', margin: 10 },
	seeMore: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	row: { flexDirection: 'row', marginBottom: 50 },
	location: { alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between', margin: 5, width: 100 },
	locationPhotoHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 40, height: 80, overflow: 'hidden', width: 80 },
	locationName: { textAlign: 'center' },
	locationDistance: { fontWeight: 'bold', textAlign: 'center' },
	locationHours: { fontWeight: 'bold', textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 50, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },
})
