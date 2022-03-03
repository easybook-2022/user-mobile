import React, { useEffect, useState, useRef } from 'react'
import { 
	SafeAreaView, ActivityIndicator, Dimensions, View, FlatList, Image, Text, TextInput, 
	TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { CommonActions } from '@react-navigation/native';
import * as Location from 'expo-location';
import { socket, logo_url } from '../../assets/info'
import { getNumNotifications, updateNotificationToken } from '../apis/users'
import { getLocations, getMoreLocations } from '../apis/locations'
import { getNumCartItems } from '../apis/carts'

import NotificationsBox from '../components/notification'
import Orders from '../components/orders'
import Userauth from '../components/userauth'

import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Main(props) {
	let updateTrackUser
	const firstTime = props.route.params ? 
    props.route.params.firstTime ? 
      true 
      : 
      false 
    : 
    false
	const openNotif = props.route.params ? 
    props.route.params.showNotif ? 
      true 
      : 
      false 
    : 
    false

	const [locationPermission, setLocationpermission] = useState(false)
	const [notificationPermission, setNotificationpermission] = useState(false)
	const [localnetworkPermission, setLocalnetworkpermission] = useState(false)
	const [geolocation, setGeolocation] = useState({ longitude: null, latitude: null })
	const [searchLocationname, setSearchlocationname] = useState('')
	const [locations, setLocations] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [openNotifications, setOpennotifications] = useState(false)
	const [numNotifications, setNumnotifications] = useState(0)
	const [userId, setUserid] = useState(null)

	const [currentGeo, setCurrentgeo] = useState({ msg: "not yet" })
	const [lastGeo, setLastgeo] = useState({ msg: "not yet" })
	const [openOrders, setOpenorders] = useState(false)
	const [numCartItems, setNumcartitems] = useState(0)
	const [showAuth, setShowauth] = useState(false)
	const [userName, setUsername] = useState('')
	const [showDisabledScreen, setShowdisabledscreen] = useState(false)
	
	const isMounted = useRef(null)

	const fetchTheNumNotifications = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid }

		if (userid) {
			getNumNotifications(data)
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

					} else {
						alert("fetch num notifications")
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

					} else {
            alert("get num cart items")	
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
				} else {
          alert("get locations")
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
					
				} else {
          alert("get more locations")
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

					} else {
            alert("get notification permission")
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
				setOpennotifications(true)
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
					setOpennotifications(true)
				} else if (data.type == "acceptRequest") {
					setOpennotifications(true)
				} else if (data.type == "receivePayment") {
					fetchTheNumNotifications()
				} else if (data.type == "cancelRequest") {
					setOpennotifications(true)
				} else if (data.type == "orderReady") {
					setOpennotifications(true)
				} else if (data.type == "canServeDiners") {
					setOpennotifications(true)
				} else if (data.type == "addDiners") {
					setOpennotifications(true)
				} else if (data.type == "addItemtoorder") {
					setOpennotifications(true)
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
		<SafeAreaView style={styles.main}>
      {loaded ? 
  			<View style={styles.box}>
  				<View style={styles.headers}>
  					<View style={styles.headersRow}>
  						<TextInput 
  							style={styles.searchInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" 
  							placeholder="Search name" onChangeText={(name) => getTheLocations(geolocation.longitude, geolocation.latitude, name)} 
  							autoCorrect={false}
  						/>

  						{userId && (
  							<TouchableOpacity style={styles.notification} onPress={() => setOpennotifications(true)}>
  								<FontAwesome name="bell" size={wsize(7)}/>
  								{numNotifications > 0 && <Text style={styles.notificationHeader}>{numNotifications}</Text>}
  							</TouchableOpacity>
  						)}
  					</View>
  				</View>

  				<View style={styles.refresh}>
  					<TouchableOpacity style={styles.refreshTouch} onPress={() => getLocationPermission()}>
  						<Text style={styles.refreshTouchHeader}>Reload</Text>
  					</TouchableOpacity>
  				</View>

  				<View style={styles.body}>
  					{geolocation.longitude && geolocation.latitude && loaded ? 
  						<FlatList
  							showsVerticalScrollIndicator={false}
  							data={locations}
  							renderItem={({ item, index }) => 
                  item.locations.length > 0 && (
    								<View key={item.key} style={styles.service}>
    									<Text style={styles.rowHeader}>{item.locations.length} {item.header} near you</Text>

    									<View style={styles.row}>
    										<FlatList
    											ListFooterComponent={() => {
    												if (item.loading && item.index < item.max) {
    													return <ActivityIndicator style={{ marginVertical: 50 }} color="black" size="large"/>
    												}

    												return null
    											}}
    											horizontal
    											onEndReached={() => getTheMoreLocations(item.service, index, item.index)}
    											onEndReachedThreshold={0}
    											showsHorizontalScrollIndicator={false}
    											data={item.locations}
    											renderItem={({ item }) => 
    												<TouchableOpacity style={styles.location} onPress={() => {
                              clearInterval(updateTrackUser)
                              props.navigation.navigate(item.nav, { locationid: item.id, refetch: () => initialize() })
                            }}>
    													<View style={styles.locationPhotoHolder}>
    														<Image source={{ uri: logo_url + item.logo }} style={{ height: '100%', width: '100%' }}/>
    													</View>

    													<Text style={styles.locationHeader}>{item.name}</Text>

    													{displayLocationStatus(item.opentime, item.closetime) ? <Text style={styles.locationHours}>{displayLocationStatus(item.opentime, item.closetime)}</Text> : null}
    												</TouchableOpacity>
    											}
    										/>
    									</View>
    								</View>
                  )
  							}
  						/>
  						:
  						<ActivityIndicator color="black" size="large"/>
  					}
  				</View>

  				<View style={styles.bottomNavs}>
  					<View style={styles.bottomNavsRow}>
  						{userId && (
  							<TouchableOpacity style={styles.bottomNav} onPress={() => {
  								clearInterval(updateTrackUser)
  								props.navigation.navigate("account", { refetch: () => initialize() })
  							}}>
  								<FontAwesome5 name="user-circle" size={wsize(7)}/>
  							</TouchableOpacity>
  						)}

  						{userId && (
  							<TouchableOpacity style={styles.bottomNav} onPress={() => setOpenorders(true)}>
  								<Entypo name="shopping-cart" size={wsize(7)}/>
  								{numCartItems > 0 && <Text style={styles.numCartItemsHeader}>{numCartItems}</Text>}
  							</TouchableOpacity>
  						)}

  						<TouchableOpacity style={styles.bottomNav} onPress={() => {
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
  							<Text style={styles.bottomNavHeader}>{userId ? 'Log-Out' : 'Log-In'}</Text>
  						</TouchableOpacity>
  					</View>
  				</View>
  			</View>
        :
        <View style={styles.loading}>
          <ActivityIndicator color="black" size="small"/>
        </View>
      }

			{openNotifications && 
				<Modal><NotificationsBox navigation={props.navigation} close={() => {
					fetchTheNumNotifications()
					setOpennotifications(false)
				}}/>
				</Modal>
			}
			{openOrders && <Modal><Orders showNotif={() => {
				setOpenorders(false)
				setOpennotifications(true)
			}} navigate={() => {
        setOpenorders(false)
        setOpennotifications(false)
        props.navigation.navigate("account", { required: "card" })
      }} close={() => {
				getTheNumCartItems()
				setOpenorders(false)
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
					}} navigate={props.navigation.navigate} dispatch={props.navigation.dispatch}/>
				</Modal>
			)}
			{showDisabledScreen && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.disabled}>
						<View style={styles.disabledContainer}>
							<Text style={styles.disabledHeader}>
								There is an update to the app{'\n\n'}
								Please wait a moment{'\n\n'}
								or tap 'Close'
							</Text>

							<TouchableOpacity style={styles.disabledClose} onPress={() => socket.emit("socket/user/login", userId, () => setShowdisabledscreen(false))}>
								<Text style={styles.disabledCloseHeader}>Close</Text>
							</TouchableOpacity>

							<ActivityIndicator color="black" size="large"/>
						</View>
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	main: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	
	headers: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	headersRow: { flexDirection: 'row', justifyContent: 'space-between' },
  searchInput: { backgroundColor: '#EFEFEF', borderRadius: 5, fontSize: wsize(4), height: '80%', margin: 10, paddingLeft: 5, width: width - 100 },
	notification: { flexDirection: 'row', marginVertical: 10 },
	notificationHeader: { fontSize: wsize(4), fontWeight: 'bold' },

	refresh: { alignItems: 'center', flexDirection: 'column', height: '10%', justifyContent: 'space-around' },
	refreshTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, padding: 5 },
	refreshTouchHeader: { fontSize: wsize(4), textAlign: 'center' },
	
	body: { flexDirection: 'column', height: '70%', justifyContent: 'space-around' },
	service: { marginBottom: 10 },
	rowHeader: { fontSize: wsize(6), fontWeight: 'bold', margin: 10 },
	row: { flexDirection: 'row', marginBottom: 20 },
	location: { alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between', margin: 5, width: wsize(40) },
	locationPhotoHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: wsize(30) / 2, height: wsize(30), overflow: 'hidden', width: wsize(30) },
	locationHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
	locationHours: { fontWeight: 'bold', textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around' },
	bottomNavHeader: { fontSize: wsize(5), fontWeight: 'bold' },
	numCartItemsHeader: { fontSize: wsize(4), fontWeight: 'bold' },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
	disabledContainer: { alignItems: 'center', width: '100%' },
	disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
	disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },
	disabledCloseHeader: {  },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' }
})
