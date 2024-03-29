import React, { useEffect, useState, useCallback } from 'react'
import { 
	SafeAreaView, Platform, ActivityIndicator, Dimensions, View, FlatList, Image, Text, TextInput, 
	TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native'
import axios from 'axios'
import { useFocusEffect, useIsFocused } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { socket, logo_url, useSpeech } from '../../assets/info'
import { resizePhoto } from 'geottuse-tools';
import { getNumNotifications, updateNotificationToken } from '../apis/users'
import { getLocations, getMoreLocations } from '../apis/locations'
import { getNumCartItems } from '../apis/carts'

// components
import Orders from '../components/orders'

// widgets
import Disable from '../widgets/disable'
import Userauth from '../widgets/userauth'
import NotificationsBox from '../widgets/notification'

import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}
let source

export default function Main(props) {
	let updateTrackUser
  
	const [locationPermission, setLocationpermission] = useState(null)
	const [notificationPermission, setNotificationpermission] = useState(false)
	const [localnetworkPermission, setLocalnetworkpermission] = useState(false)
	const [geolocation, setGeolocation] = useState({ longitude: null, latitude: null })
	const [searchLocationname, setSearchlocationname] = useState('')
	const [locations, setLocations] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [openNotifications, setOpennotifications] = useState(false)
	const [numNotifications, setNumnotifications] = useState(0)
	const [userId, setUserid] = useState(null)

	const [openOrders, setOpenorders] = useState(false)
	const [numCartItems, setNumcartitems] = useState(0)
	const [showAuth, setShowauth] = useState(false)
	const [userName, setUsername] = useState('')
	const [showDisabledScreen, setShowdisabledscreen] = useState(false)

  const fetchTheNumNotifications = async() => {
		const userid = await AsyncStorage.getItem("userid")

		if (userid) {
      const data = { userid, cancelToken: source.token }

			getNumNotifications(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						socket.emit("socket/user/login", userid, () => {
							setUserid(userid)
							setNumnotifications(res.numNotifications)
						})
					}
				})
				.catch((err) => {
          console.log(err)
					if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
					}
				})
		}
	}
	const getTheNumCartItems = async() => {
		const userid = await AsyncStorage.getItem("userid")

		if (userid) {
      const data = { userid, cancelToken: source.token }

			getNumCartItems(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) setNumcartitems(res.numCartItems)
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
					}
				})
		}
	}

	const getTheLocations = async(longitude, latitude, locationName) => {
		const d = new Date(), day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
		const data = { longitude, latitude, locationName, day: day[d.getDay()], cancelToken: source.token }

    setLoaded(false)

		getLocations(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
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
		const data = { longitude, latitude, locationName: searchLocationname, type, index, day: day[d.getDay()], cancelToken: source.token }

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
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
				}
			})
	}
	const getLocationPermission = async() => {
		let longitude = parseFloat(await AsyncStorage.getItem("longitude"))
		let latitude = parseFloat(await AsyncStorage.getItem("latitude"))
    
		const { status } = await Location.getForegroundPermissionsAsync()
    let realStatus = status == "granted"

    if (status != 'granted') {
      const fore = await Location.requestForegroundPermissionsAsync()

      if (fore.status == 'granted') {
        setLocationpermission(true)
        realStatus = true
      }
    } else {
      setLocationpermission(true)
    }

    if (realStatus) {
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

      if (longitude && latitude) {
        AsyncStorage.setItem("longitude", longitude.toString())
        AsyncStorage.setItem("latitude", latitude.toString())

        updateTrackUser = setInterval(() => trackUserLocation(), 2000)
        setGeolocation({ longitude, latitude })
        getTheLocations(longitude, latitude, "")
      }
    } else {
      setLoaded(true)
    }
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
			experienceId: "@robogram/serviceapp-user"
		})

		if (userid) {
			updateNotificationToken({ userid, token: data, cancelToken: source.token })
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
            const { errormsg, status } = err.response.data
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
	const startWebsocket = async() => {
		socket.on("updateNumNotifications", data => {
      fetchTheNumNotifications()

      if (data.type == "orderDone") {
        if (Constants.isDevice && useSpeech == true) Speech.speak("Order #: " + data.ordernumber + " is done. You can pick it up now")
      }
    })
		socket.io.on("open", () => {
			if (userId != null) {
				socket.emit("socket/user/login", userId, () => setShowdisabledscreen(false))
			}
		})
		socket.io.on("close", () => userId != null ? setShowdisabledscreen(true) : setShowdisabledscreen(false))

    return () => {
      socket.off("updateNumNotifications")
    }
	}

	const initialize = () => {
		fetchTheNumNotifications()
		getTheNumCartItems()
    getLocationPermission()

		if (Constants.isDevice) {
      getNotificationPermission()
    }
		if (props.route.params && props.route.params.showNotif) {
			setTimeout(function () {
				setOpennotifications(true)
			}, 1000)
		}
	}

  useEffect(() => {
    source = axios.CancelToken.source();
    
    initialize()

    return () => {
      if (source) {
        source.cancel("components got unmounted");
      }
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (props.route.params) {
        const params = props.route.params

        if (params.initialize) initialize()

        props.navigation.setParams({ initialize: false, showNotif: false })
      }
    }, [useIsFocused()])
  );
  
	useEffect(() => {
		startWebsocket()

		if (Constants.isDevice) {
			Notifications.addNotificationResponseReceivedListener(res => {
				const { data } = res.notification.request.content

				if (data.type == "rescheduleAppointment") {
					setOpennotifications(true)
				} else if (data.type == "acceptRequest") {
					setOpennotifications(true)
				} else if (data.type == "cancelRequest") {
					setOpennotifications(true)
				} else if (data.type == "orderReady") {
					setOpennotifications(true)
				}
			});
		}

		return () => {
			clearInterval(updateTrackUser)
			socket.off("updateNumNotifications")
		}
	}, [numNotifications, userId])
  
	return (
		<SafeAreaView style={styles.main}> 
			<View style={styles.box}>
				<View style={styles.headers}>
					<View style={styles.headersRow}>
						<TextInput 
							style={[styles.searchInput, { width: userId ? width - 100 : '90%' }]} placeholderTextColor="rgba(127, 127, 127, 0.5)" 
							placeholder="Search salons, restaurants and stores" onChangeText={(name) => getTheLocations(geolocation.longitude, geolocation.latitude, name)} 
							autoCorrect={false}
						/>

						{userId && (
							<TouchableOpacity style={styles.notification} onPress={() => {
                if (userId) {
                  setOpennotifications(true)
                } else {
                  setShowauth(true)
                }
              }}>
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
          {loaded ?
            locationPermission != null ?  
              locationPermission == true ? 
      					geolocation.longitude && geolocation.latitude ? 
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
                              renderItem={({ item, index }) => 
                                <TouchableOpacity style={styles.location} onPress={() => {
                                  clearInterval(updateTrackUser)
                                  
                                  props.navigation.navigate(item.nav, { locationid: item.id })
                                }}>
                                  <View style={styles.locationPhotoHolder}>
                                    <Image source={
                                      item.logo.name ? { uri: logo_url + item.logo.name } : 
                                        (
                                          item.service == "store" && require("../../assets/store-profile.png")
                                          ||
                                          item.service == "restaurant" && require("../../assets/restaurant-profile.png")
                                          ||
                                          item.service == "hair" && require("../../assets/hairsalon-profile.png")
                                          ||
                                          item.service == "nail" && require("../../assets/nailsalon-profile.png")
                                        )
                                    } style={resizePhoto(item.logo, wsize(25))}/>
                                  </View>

                                  <Text style={styles.locationHeader}>{item.name}</Text>
                                  <Text style={styles.locationHeader}>{item.distance}</Text>

                                  <View style={styles.locationAction}>
                                    <Text>
                                      {(item.service == "restaurant" || item.service == "store") && "Order"}
                                      {(item.service == "hair" || item.service == "nail") && "Book"}
                                      {' '}now
                                    </Text>
                                  </View>
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
                :
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.requestLocationHeader}>You need to allow location permission in your settings</Text>
                  <Text style={styles.requestLocationHeader}>in order to see the nearest salons, restaurants and stores</Text>
                </View>
              :
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.requestLocationHeader}>You need to allow location permission in your settings</Text>
                <Text style={styles.requestLocationHeader}>in order to see the nearest salons, restaurants and stores</Text>
              </View>
            :
            <View style={styles.loading}>
              <ActivityIndicator color="black" size="small"/>
            </View>
          }
				</View>

				<View style={styles.bottomNavs}>
					<View style={styles.bottomNavsRow}>
						{userId && (
							<TouchableOpacity style={styles.bottomNav} onPress={() => {
								clearInterval(updateTrackUser)

								props.navigation.navigate("account")
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

			{openNotifications && 
				<Modal><NotificationsBox navigation={props.navigation} close={async() => {
          const userid = await AsyncStorage.getItem("userid")

          socket.emit("socket/user/login", userid, () => {
            fetchTheNumNotifications()
            setOpennotifications(false)
          })
				}}/>
				</Modal>
			}
			{openOrders && <Modal><Orders showNotif={() => {
				setOpenorders(false)
				setOpennotifications(true)
			}} navigate={() => {
        setOpenorders(false)
        setOpennotifications(false)
        props.navigation.navigate("account")
      }} close={() => {
				getTheNumCartItems()
				setOpenorders(false)
			}}/></Modal>}
			{showAuth && (
				<Modal transparent={true}>
					<Userauth close={() => setShowauth(false)} done={id => {
						socket.emit("socket/user/login", "user" + id, () => {
              setUserid(id)
              setShowauth(false)
              initialize()
            })
					}} navigate={props.navigation.navigate} dispatch={props.navigation.dispatch}/>
				</Modal>
			)}
			{showDisabledScreen && (
				<Modal transparent={true}>
          <Disable 
            close={() => socket.emit("socket/user/login", userId, () => setShowdisabledscreen(false))}
          />
        </Modal>
			)}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	main: { backgroundColor: 'white', height: '100%', paddingTop: Platform.OS == "ios" ? 0 : Constants.statusBarHeight, width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	
	headers: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	headersRow: { flexDirection: 'row', justifyContent: 'space-between' },
  searchInput: { backgroundColor: '#EFEFEF', borderRadius: 5, fontSize: wsize(4), height: '80%', margin: 10, paddingLeft: 5 },
	notification: { flexDirection: 'row', marginVertical: 10 },
	notificationHeader: { fontSize: wsize(4), fontWeight: 'bold' },

	refresh: { alignItems: 'center', flexDirection: 'column', height: '10%', justifyContent: 'space-around' },
	refreshTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 3, padding: 5 },
	refreshTouchHeader: { fontSize: wsize(4), textAlign: 'center' },
	body: { flexDirection: 'column', height: '70%', justifyContent: 'space-around' },
	service: { marginBottom: 10 },
	rowHeader: { fontSize: wsize(6), fontWeight: 'bold', margin: 10 },
	
	location: { alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between', margin: 5, width: wsize(40) },
	locationPhotoHolder: { alignItems: 'center', backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: wsize(30) / 2, flexDirection: 'column', height: wsize(30), justifyContent: 'space-around', overflow: 'hidden', width: wsize(30) },
	locationHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  locationAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
  locationActionHeader: { textAlign: 'center' },

  requestLocationHeader: { textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around' },
	bottomNavHeader: { fontSize: wsize(5), fontWeight: 'bold' },
	numCartItemsHeader: { fontSize: wsize(4), fontWeight: 'bold' },

  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  row: { flexDirection: 'row' },
})
