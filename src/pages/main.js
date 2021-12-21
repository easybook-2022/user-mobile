import React, { useEffect, useState, useRef } from 'react'
import { 
	ActivityIndicator, Dimensions, View, FlatList, Image, Text, TextInput, 
	TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { CommonActions } from '@react-navigation/native';
import * as Location from 'expo-location';
import { socket, logo_url } from '../../assets/info'
import { getNumUpdates, updateNotificationToken } from '../apis/users'
import { getLocations, getMoreLocations } from '../apis/locations'
import { getNumCartItems } from '../apis/carts'

import NotificationsBox from '../components/notifications'
import Cart from '../components/cart'
import Userauth from '../components/userauth'

import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const imageSize = 100

const fsize = p => {
	return width * p
}

export default function main(props) {
	let updateTrackUser
	const openNotif = props.route.params ? props.route.params.showNotif ? props.route.params.showNotif : false : false

	const [locationPermission, setLocationpermission] = useState(false)
	const [notificationPermission, setNotificationpermission] = useState(false)
	const [localnetworkPermission, setLocalnetworkpermission] = useState(false)
	const [geolocation, setGeolocation] = useState({ longitude: null, latitude: null })
	const [searchLocationname, setSearchlocationname] = useState('')
	const [locations, setLocations] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [openNotifications, setOpenNotifications] = useState(false)
	const [numNotifications, setNumnotifications] = useState(0)
	const [userId, setUserid] = useState(null)

	const [currentGeo, setCurrentgeo] = useState({ msg: "not yet" })
	const [lastGeo, setLastgeo] = useState({ msg: "not yet" })
	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(0)
	const [showAuth, setShowauth] = useState(false)
	const [userName, setUsername] = useState('')
	const [showDisabledScreen, setShowdisabledscreen] = useState(false)
	
	const isMounted = useRef(null)

	const fetchTheNumNotifications = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const time = Date.now()
		const data = { userid, time }

		if (userid) {
			getNumUpdates(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res && isMounted.current == true) {
						socket.emit("socket/user/login", userid, () => {
							setUserid(userid)
							setNumnotifications(res.numNotifications)
						})
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {

					}
				})
		}
	}
	const getTheNumCartItems = async() => {
		const userid = await AsyncStorage.getItem("userid")

		if (userid) {
			getNumCartItems(userid)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res && isMounted.current == true) setNumcartitems(res.numCartItems)
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {

					}
				})
		}
	}
	
	const getTheLocations = async(longitude, latitude, locationName) => {
		const d = new Date(), day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
		const data = { longitude, latitude, locationName, day: day[d.getDay()] }

		setLoaded(false)

		getLocations(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					setLocations(res.locations)
					setSearchlocationname(locationName)
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					switch (status) {
						case "unknowncoords":
							getLocationPermission()

							break;
						default:
					}
				}
			})
	}
	const getTheMoreLocations = async(type, lindex, index) => {
		const newLocations = [...locations]
		const location = newLocations[lindex]
		const { longitude, latitude } = geolocation
		const d = new Date(), day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
		const data = { longitude, latitude, locationName: searchLocationname, type, index, day: day[d.getDay()] }

		getMoreLocations(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
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
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const getLocationPermission = async() => {
		const info = await Location.hasServicesEnabledAsync()
		let longitude = await AsyncStorage.getItem("longitude")
		let latitude = await AsyncStorage.getItem("latitude")

		if (!longitude || !latitude) {
			const { status } = await Location.getForegroundPermissionsAsync()

		 	if (status != 'granted') {
		 		const fore = await Location.requestForegroundPermissionsAsync()

				if (fore.status == 'granted') {
					setLocationpermission(true)
				}
		 	}

			const last = await Location.getLastKnownPositionAsync()

			if (last) {
				longitude = last.coords.longitude
				latitude = last.coords.latitude
			} else {
				const current = await Location.getCurrentPositionAsync()

				if (current.coords.longitude && current.coords.latitude) {
					longitude = current.coords.longitude
					latitude = current.coords.latitude
				}
			}

			if (!longitude && !latitude) {
				const longitude = parseFloat(await AsyncStorage.getItem("longitude"))
				const latitude = parseFloat(await AsyncStorage.getItem("latitude"))
			}
		}

		AsyncStorage.setItem("longitude", longitude.toString())
		AsyncStorage.setItem("latitude", latitude.toString())

		updateTrackUser = setInterval(() => trackUserLocation(), 2000)
		setGeolocation({ longitude, latitude })
		getTheLocations(longitude, latitude, "")
	}
	const getNotificationPermission = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const { status } = await Notifications.getPermissionsAsync()

		if (status == "granted") {
			setNotificationpermission(true)
		} else {
			const info = await Notifications.requestPermissionsAsync()

			if (info.status == "granted") {
				setNotificationpermission(true)
			}
		}

		const { data } = await Notifications.getExpoPushTokenAsync({
			experienceId: "@robogram/easygo-user"
		})

		if (userid) {
			updateNotificationToken({ userid, token: data })
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {

					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {

					}
				})
		}
	}
	const trackUserLocation = async() => {
		let longitude, latitude
		
		if (locationPermission) {
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
	const startWebsocket = async() => {
		socket.on("updateNumNotifications", () => fetchTheNumNotifications())
		socket.io.on("open", () => {
			if (userId != null) {
				socket.emit("socket/user/login", userId, () => setShowdisabledscreen(false))
			}
		})
		socket.io.on("close", () => userId != null ? setShowdisabledscreen(true) : {})
	}

	const initialize = () => {
		fetchTheNumNotifications()
		getTheNumCartItems()
		getLocationPermission()

		if (Constants.isDevice) getNotificationPermission()
		if (openNotif) {
			setTimeout(function () {
				setOpenNotifications(true)
				props.navigation.setParams({ showNotif: false })
			}, 1000)
		}
	}

	useEffect(() => {	
		initialize()
	}, [])
	
	useEffect(() => {
		isMounted.current = true

		startWebsocket()

		if (Constants.isDevice) {
			Notifications.addNotificationResponseReceivedListener(res => {
				const { data } = res.notification.request.content

				if (data.type == "rescheduleAppointment") {
					setOpenNotifications(true)
				} else if (data.type == "acceptRequest") {
					setOpenNotifications(true)
				} else if (data.type == "receivePayment") {
					fetchTheNumNotifications()
				} else if (data.type == "cancelRequest") {
					setOpenNotifications(true)
				} else if (data.type == "orderReady") {
					setOpenNotifications(true)
				} else if (data.type == "canServeDiners") {
					setOpenNotifications(true)
				} else if (data.type == "addDiners") {
					setOpenNotifications(true)
				} else if (data.type == "addItemtoorder") {
					setOpenNotifications(true)
				}
			});
		}

		return () => {
			clearInterval(updateTrackUser)
			socket.off("updateNumNotifications")

			isMounted.current = false
		}
	}, [numNotifications])
	
	return (
		<View style={style.main}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<View style={style.headers}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
							<TextInput style={style.searchInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Search name" onChangeText={(name) => getTheLocations(geolocation.longitude, geolocation.latitude, name)} autoCorrect={false}/>
							{userId && (
								<TouchableOpacity style={style.notification} onPress={() => setOpenNotifications(true)}>
									<FontAwesome name="bell" size={40}/>
									{numNotifications > 0 && <Text style={style.notificationHeader}>{numNotifications}</Text>}
								</TouchableOpacity>
							)}
						</View>
					</View>

					<View style={style.refresh}>
						<TouchableOpacity style={style.refreshTouch} onPress={() => getLocationPermission()}>
							<Text style={style.refreshTouchHeader}>Refresh</Text>
						</TouchableOpacity>
					</View>

					<View style={style.body}>
						{geolocation.longitude && geolocation.latitude && loaded ? 
							<FlatList
								showsVerticalScrollIndicator={false}
								data={locations}
								renderItem={({ item, index }) => 
									<View key={item.key} style={style.service}>
										<Text style={style.rowHeader}>{item.locations.length} {item.header} near you</Text>

										{item.index < item.max && (
											<TouchableOpacity style={style.seeMore} onPress={() => {
												clearInterval(updateTrackUser)
												props.navigation.navigate(item.service, { initialize: () => initialize() })
											}}>
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
													<View style={style.location}>
														<View style={style.locationPhotoHolder}>
															<Image source={{ uri: logo_url + item.logo }} style={{ height: imageSize, width: imageSize }}/>
														</View>

														<Text style={style.locationName}>{item.name}</Text>
														<Text style={style.locationDistance}>{item.distance}</Text>

														<TouchableOpacity style={style.locationMenu} onPress={() => {
															clearInterval(updateTrackUser)
															props.navigation.navigate(item.nav, { locationid: item.id, refetch: () => initialize() })
														}}>
															<Text style={style.locationMenuHeader}>See menu</Text>
														</TouchableOpacity>

														{displayLocationStatus(item.opentime, item.closetime) ? <Text style={style.locationHours}>{displayLocationStatus(item.opentime, item.closetime)}</Text> : null}
													</View>
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
						<View style={style.bottomNavsRow}>
							{userId && (
								<TouchableOpacity style={style.bottomNav} onPress={() => {
									clearInterval(updateTrackUser)
									props.navigation.navigate("account", { refetch: () => initialize() })
								}}>
									<FontAwesome5 name="user-circle" size={30}/>
								</TouchableOpacity>
							)}

							{userId && (
								<TouchableOpacity style={style.bottomNav} onPress={() => {
									clearInterval(updateTrackUser)
									props.navigation.navigate("recent", { refetch: () => initialize() })
								}}>
									<FontAwesome name="history" size={30}/>
								</TouchableOpacity>
							)}

							{userId && (
								<TouchableOpacity style={style.bottomNav} onPress={() => setOpencart(true)}>
									<Entypo name="shopping-cart" size={30}/>
									{numCartItems > 0 && <Text style={style.numCartItemsHeader}>{numCartItems}</Text>}
								</TouchableOpacity>
							)}

							<TouchableOpacity style={style.bottomNav} onPress={() => {
								if (userId) {
									socket.emit("socket/user/logout", userId, () => {
										clearInterval(updateTrackUser)
										AsyncStorage.clear()
										setUserid(null)
									})
								} else {
									setShowauth(true)
								}
							}}>
								<Text style={style.bottomNavHeader}>{userId ? 'Log-Out' : 'Log-In'}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>

				{openNotifications && 
					<Modal><NotificationsBox navigation={props.navigation} close={() => {
						fetchTheNumNotifications()
						setOpenNotifications(false)
					}}/>
					</Modal>
				}
				{openCart && <Modal><Cart showNotif={() => {
					
					setOpencart(false)
					setOpenNotifications(true)

					// props.navigation.dispatch(
					// 	CommonActions.reset({
					// 		index: 0,
					// 		routes: [{ name: "main", params: { showNotif: true } }]
					// 	})
					// )
				}} close={() => {
					getTheNumCartItems()
					setOpencart(false)
				}}/></Modal>}
				{showAuth && (
					<Modal transparent={true}>
						<Userauth close={() => setShowauth(false)} done={(id, msg) => {
							if (msg == "setup") {
								props.navigation.dispatch(
									CommonActions.reset({
										index: 1,
										routes: [{ name: "setup" }]
									})
								);
							} else {
								socket.emit("socket/user/login", "user" + id, () => setUserid(id))
							}

							setShowauth(false)
							initialize()
						}} navigate={props.navigation.navigate}/>
					</Modal>
				)}
			</View>

			{showDisabledScreen && (
				<Modal transparent={true}>
					<View style={style.disabled}>
						<View style={style.disabledContainer}>
							<Text style={style.disabledHeader}>
								There is an update to the app{'\n\n'}
								Please wait a moment{'\n\n'}
								or tap 'Close'
							</Text>

							<TouchableOpacity style={style.disabledClose} onPress={() => socket.emit("socket/user/login", userId, () => setShowdisabledscreen(false))}>
								<Text style={style.disabledCloseHeader}>Close</Text>
							</TouchableOpacity>

							<ActivityIndicator size="large"/>
						</View>
					</View>
				</Modal>
			)}
		</View>
	)
}

const style = StyleSheet.create({
	main: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	headers: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: 70, justifyContent: 'space-between', padding: 5, width: '100%' },
	searchInput: { backgroundColor: '#EFEFEF', borderRadius: 5, fontSize: fsize(0.05), margin: 10, padding: 10, width: width - 100 },
	notification: { flexDirection: 'row', marginRight: 10, marginVertical: 10 },
	notificationHeader: { fontSize: fsize(0.05), fontWeight: 'bold' },

	refresh: { alignItems: 'center', height: 53 },
	refreshTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, marginVertical: 10, padding: 5, width: 100 },
	refreshTouchHeader: { fontSize: fsize(0.04), textAlign: 'center' },
	body: { flexDirection: 'column', height: screenHeight - 163, justifyContent: 'space-around' },

	service: { marginBottom: 10 },
	rowHeader: { fontSize: fsize(0.05), fontWeight: 'bold', margin: 10 },
	seeMore: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	row: { flexDirection: 'row', marginBottom: 20 },
	location: { alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between', margin: 5, width: 100 },
	locationPhotoHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: imageSize / 2, height: imageSize, overflow: 'hidden', width: imageSize },
	locationName: { fontSize: fsize(0.04), fontWeight: 'bold', textAlign: 'center' },
	locationDistance: { fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' },
	locationMenu: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, padding: 5 },
	locationMenuHeader: { fontSize: fsize(0.04), textAlign: 'center' },
	locationHours: { fontWeight: 'bold', textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
	disabledContainer: { alignItems: 'center', width: '100%' },
	disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
	disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },
	disabledCloseHeader: {  }
})
