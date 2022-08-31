import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, Platform, ActivityIndicator, Dimensions, ScrollView, View, FlatList, Image, Text, 
  TextInput, TouchableOpacity, Linking, StyleSheet, Modal 
} from 'react-native';
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { socket, logo_url } from '../../../assets/info';
import { resizePhoto } from 'geottuse-tools'
import { getWorkersTime } from '../../apis/owners';
import { getLocationProfile } from '../../apis/locations';
import { getNumCartItems } from '../../apis/carts';

// components
import Orders from '../../components/orders'

// widgets
import Userauth from '../../widgets/userauth'
import Menus from '../../widgets/menus'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}
let source

export default function Profile(props) {
	const { locationid } = props.route.params
  
	const [logo, setLogo] = useState('')
	const [name, setName] = useState('')
	const [address, setAddress] = useState('')
	const [phonenumber, setPhonenumber] = useState('')
	const [distance, setDistance] = useState(0)
	const [showAuth, setShowauth] = useState(false)
	const [showInfo, setShowinfo] = useState({ show: false, workerHours: [], locationHours: [] })
  const [refetchMenu, setRefetchmenu] = useState(false)
	const [userId, setUserid] = useState(null)

	const [loaded, setLoaded] = useState(false)

	const [openOrders, setOpenorders] = useState(false)
	const [numCartItems, setNumcartitems] = useState(0)

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
					if (res) {
						setUserid(userid)
						setNumcartitems(res.numCartItems)
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data
					}
				})
		}
	}
	const getTheLocationProfile = async() => {
		const longitude = await AsyncStorage.getItem("longitude")
		const latitude = await AsyncStorage.getItem("latitude")
		const data = { locationid, longitude, latitude, cancelToken: source.token }

		getLocationProfile(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { name, logo, fullAddress, city, province, postalcode, phonenumber, distance, hours } = res.info

					setLogo(logo)
					setName(name)
					setAddress(fullAddress)
					setPhonenumber(phonenumber)
					setDistance(distance)
          setShowinfo({ ...showInfo, locationHours: hours })
          setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
				}
			})
	}
	const initialize = () => {
		getTheNumCartItems()
		getTheLocationProfile()
	}
  const getTheWorkersTime = () => {
    const data = { locationid, cancelToken: source.token }

    getWorkersTime(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setShowinfo({ ...showInfo, show: true, workerHours: res.workers })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
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

	return (
		<SafeAreaView style={styles.profile}>
			{loaded ? 
				<View style={styles.box}>
					<View style={styles.profileInfo}>
						<View style={styles.column}>
              <TouchableOpacity style={styles.headerAction} onPress={() => getTheWorkersTime()}>
                <Text style={styles.headerActionHeader}>Info</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.column}>
              <TouchableOpacity style={styles.headerAction} onPress={() => setRefetchmenu(!refetchMenu)}>
                <Text style={styles.headerActionHeader}>Refresh{'\n'}Menu</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.column}>
              <TouchableOpacity style={styles.headerAction} onPress={() => Linking.openURL('tel://' + phonenumber)}>
                <Text style={styles.headerActionHeader}>Call</Text>
              </TouchableOpacity>
            </View>
					</View>
					
					<View style={styles.body}>
            <Menus 
              locationid={locationid} 
              navigation={props.navigation} 
              route={props.route}
              type="salon"
              refetchMenu={refetchMenu}
            />
          </View>

					<View style={styles.bottomNavs}>
						<View style={styles.bottomNavsRow}>
							{userId && (
								<TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.navigate("account")}>
									<FontAwesome5 name="user-circle" size={wsize(7)}/>
								</TouchableOpacity>
							)}

							{userId && (
								<TouchableOpacity style={styles.bottomNav} onPress={() => setOpenorders(true)}>
									<Entypo name="shopping-cart" size={wsize(7)}/>
									{numCartItems > 0 && <Text style={styles.numCartItemsHeader}>{numCartItems}</Text>}
								</TouchableOpacity>
							)}

							<TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "main" }]}))}>
								<Entypo name="home" size={wsize(7)}/>
							</TouchableOpacity>
							<TouchableOpacity style={styles.bottomNav} onPress={() => {
								if (userId) {
									socket.emit("socket/user/logout", userId, () => {
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
				<View style={{ alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' }}>
					<ActivityIndicator color="black" size="large"/>
				</View>
			}
      
			{openOrders && <Modal><Orders showNotif={() => {
				setOpenorders(false)
				setTimeout(function () {
          props.navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "main", params: { showNotif: true }}]}))
				}, 1000)
			}} navigate={() => {
        setOpenorders(false)
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
            })
					}} navigate={props.navigation.navigate}/>
				</Modal>
			)}
			{showInfo.show && (
				<Modal transparent={true}>
					<View style={styles.showInfoContainer}>
            <View style={styles.showInfoBox}>
              <ScrollView style={{ width: '100%' }}>
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity style={styles.showInfoClose} onPress={() => setShowinfo(false)}>
                    <AntDesign name="close" size={wsize(7)}/>
                  </TouchableOpacity>

                  <Text style={styles.showInfoHeader}>{name}</Text>
                  <Text style={styles.showInfoHeader}>{address}</Text>
                  <Text style={styles.showInfoPhonenumber}>{phonenumber}</Text>
                  <Text style={styles.showInfoHeader}>{distance}</Text>

                  <View style={styles.placeHours}>
                    <Text style={styles.placeHoursHeader}>Business's Hour(s)</Text>

                    {showInfo.locationHours.map(info => (
                      !info.close && (
                        <View style={styles.workerTimeContainer} key={info.key}>
                          <Text style={styles.dayHeader}>{info.header}: </Text>
                          <View style={styles.timeHeaders}>
                            <Text style={styles.timeHeader}>{info.opentime.hour}</Text>
                            <View style={styles.column}><Text>:</Text></View>
                            <Text style={styles.timeHeader}>{info.opentime.minute}</Text>
                            <Text style={styles.timeHeader}>{info.opentime.period}</Text>
                          </View>
                          <View style={styles.column}><Text> - </Text></View>
                          <View style={styles.timeHeaders}>
                            <Text style={styles.timeHeader}>{info.closetime.hour}</Text>
                            <View style={styles.column}><Text>:</Text></View>
                            <Text style={styles.timeHeader}>{info.closetime.minute}</Text>
                            <Text style={styles.timeHeader}>{info.closetime.period}</Text>
                          </View>
                        </View>
                      )
                    ))}
                  </View>

                  <View style={styles.workerInfoList}>
                    <Text style={styles.workerInfoListHeader}>Stylist(s)</Text>

                    {showInfo.workerHours.map(worker => (
                      <View key={worker.key} style={styles.worker}>
                        <View style={styles.workerInfo}>
                          <View style={[styles.workerInfoProfile, resizePhoto(worker.profile, 50)]}>
                            <Image style={{ height: '100%', width: '100%' }} source={{ uri: logo_url + worker.profile.name }}/>
                          </View>
                          <Text style={styles.workerInfoName}>{worker.name}</Text>
                        </View>
                        <View style={styles.workerTime}>
                          {worker.hours.map(info => (
                            info.working && (
                              <View style={styles.workerTimeContainer} key={info.key}>
                                <Text style={styles.dayHeader}>{info.header}: </Text>
                                <View style={styles.timeHeaders}>
                                  <Text style={styles.timeHeader}>{info.opentime.hour}</Text>
                                  <View style={styles.column}><Text>:</Text></View>
                                  <Text style={styles.timeHeader}>{info.opentime.minute}</Text>
                                  <Text style={styles.timeHeader}>{info.opentime.period}</Text>
                                </View>
                                <View style={styles.column}><Text> - </Text></View>
                                <View style={styles.timeHeaders}>
                                  <Text style={styles.timeHeader}>{info.closetime.hour}</Text>
                                  <View style={styles.column}><Text>:</Text></View>
                                  <Text style={styles.timeHeader}>{info.closetime.minute}</Text>
                                  <Text style={styles.timeHeader}>{info.closetime.period}</Text>
                                </View>
                              </View>
                            )
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
					</View>
				</Modal>
			)}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	profile: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	profileInfo: { flexDirection: 'row', height: '7%', justifyContent: 'space-around' },
  headerAction: { alignItems: 'center', borderRadius: 10, borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', height: '90%', justifyContent: 'space-around', width: wsize(22) },
  headerActionHeader: { color: 'black', fontSize: wsize(3), fontWeight: 'bold', textAlign: 'center' },

  body: { height: '83%' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontSize: wsize(5), fontWeight: 'bold' },
	numCartItemsHeader: { fontSize: wsize(4), fontWeight: 'bold' },

	showInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	showInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '80%' },
	showInfoClose: { alignItems: 'center', borderRadius: 20, borderStyle: 'solid', borderWidth: 2, marginVertical: 30 },
	showInfoHeader: { fontSize: wsize(5), fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	showInfoPhonenumber: { fontSize: wsize(5), fontWeight: 'bold', marginHorizontal: 10, marginVertical: 8, textAlign: 'center' },
  placeHours: { marginVertical: 40 },
  placeHoursHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  workerInfoList: { width: '100%' },
  workerInfoListHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
  worker: { alignItems: 'center', backgroundColor: 'rgba(127, 127, 127, 0.2)', marginBottom: 30, paddingVertical: 20, width: '100%' },
  workerInfo: {  },
  workerInfoProfile: { borderRadius: 25, overflow: 'hidden' },
  workerInfoName: { color: 'black', fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  workerTime: {  },
  workerTimeContainer: { flexDirection: 'row', marginBottom: 10 },
  dayHeader: {  },
  timeHeaders: { flexDirection: 'row' },
  timeHeader: { fontSize: wsize(5), fontWeight: 'bold' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
})
