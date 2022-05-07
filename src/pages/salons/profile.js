import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, Platform, ActivityIndicator, Dimensions, ScrollView, View, FlatList, Image, Text, 
  TextInput, TouchableOpacity, Linking, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { socket, logo_url } from '../../../assets/info';
import { resizePhoto } from 'geottuse-tools'
import { getWorkersTime } from '../../apis/owners';
import { getLocationProfile } from '../../apis/locations';
import { getMenus } from '../../apis/menus';
import { getNumCartItems } from '../../apis/carts';

import Orders from '../../components/orders'
import Userauth from '../../components/userauth'

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

export default function Profile(props) {
	const { locationid, refetch } = props.route.params
	const func = props.route.params

	const [logo, setLogo] = useState('')
	const [name, setName] = useState('')
	const [address, setAddress] = useState('')
	const [phonenumber, setPhonenumber] = useState('')
	const [distance, setDistance] = useState(0)
	const [showAuth, setShowauth] = useState(false)
	const [showInfo, setShowinfo] = useState({ show: false, workerHours: [] })
	const [userId, setUserid] = useState(null)

	const [serviceInfo, setServiceinfo] = useState('')
	const [menuInfo, setMenuinfo] = useState({ items: [], error: false })

	const [loaded, setLoaded] = useState(false)

	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(0)

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
		const data = { locationid, longitude, latitude }

		getLocationProfile(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { name, logo, fullAddress, city, province, postalcode, phonenumber, distance } = res.info

					setLogo(logo)
					setName(name)
					setAddress(fullAddress)
					setPhonenumber(phonenumber)
					setDistance(distance)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
				}
			})
	}
	const getAllMenus = () => {
		getMenus(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { menus } = res

					setMenuinfo({ ...menuInfo, items: menus })
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
		getAllMenus()
	}
	const displayList = info => {
		let { id, image, name, list, left } = info

		return (
			<View style={{ marginLeft: left }}>
				{name ?
					<View style={styles.menu}>
						<View style={{ flexDirection: 'row' }}>
  						{image.name ? 
                <View style={styles.menuImageHolder}>
                  <Image style={resizePhoto(image, wsize(10))} source={{ uri: logo_url + image.name }}/>
                </View>
              : null }
              <View style={styles.column}>
                <Text style={styles.menuName}>{name} (Menu)</Text>
              </View>
						</View>
						{list.length > 0 && list.map((info, index) => (
							<View key={"list-" + index}>
								{info.listType == "list" ? 
									displayList({ id: info.id, name: info.name, image: info.image, list: info.list, left: left + 10 })
									:
									<View style={styles.item}>
  									{info.image.name ? 
                      <View style={styles.itemImageHolder}>
                        <Image source={{ uri: logo_url + info.image.name }} style={resizePhoto(info.image, wsize(10))}/>
                      </View>
                    : null }
										<View style={styles.column}>
                      <Text style={styles.itemHeader}>{info.name}</Text>
                    </View>
                    <View style={styles.column}>
                      <Text style={styles.itemHeader}>$ {info.price}</Text>
                    </View>
                    <View style={styles.column}>
  										<TouchableOpacity style={styles.itemAction} onPress={() => props.navigation.navigate("booktime", { locationid, menuid: "", serviceid: info.id, serviceInfo: "", initialize: () => getAllMenus() })}>
                        <Text style={styles.itemActionHeader}>Book a time</Text>
                      </TouchableOpacity>
                    </View>
									</View>
								}
							</View>
						))}
					</View>
					:
					list.map((info, index) => (
						<View key={"list-" + index}>
							{info.listType == "list" ? 
								displayList({ id: info.id, name: info.name, image: info.image, list: info.list, left: left + 10 })
								:
								<View style={styles.item}>
  								{info.image.name ? 
                    <View style={styles.itemImageHolder}>
                      <Image source={{ uri: logo_url + info.image.name }} style={resizePhoto(info.image, wsize(10))}/>
                    </View>
                  : null }
                  <View style={styles.column}>
                    <Text style={styles.itemHeader}>{info.name}</Text>
                  </View>
                  <View style={styles.column}>
                    <Text style={styles.itemHeader}>$ {info.price}</Text>
                  </View>
                  <View style={styles.column}>
  									<TouchableOpacity style={styles.itemAction} onPress={() => props.navigation.navigate("booktime", { locationid, menuid: "", serviceid: info.id, serviceInfo: "", initialize: () => getAllMenus() })}>
                      <Text style={styles.itemActionHeader}>Book a time</Text>
                    </TouchableOpacity>
                  </View>
								</View>
							}
						</View>
					))
				}
			</View>
		)
	}
  const getTheWorkersTime = () => {
    getWorkersTime(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setShowinfo({ show: true, workerHours: res.workerHours })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
	
	useEffect(() => {
		initialize()
	}, [])

	return (
		<SafeAreaView style={styles.profile}>
			{loaded ? 
				<View style={styles.box}>
					<View style={styles.profileInfo}>
						<View style={styles.column}>
              <TouchableOpacity style={styles.headerAction} onPress={() => getTheWorkersTime()}>
                <Text style={styles.headerActionHeader}>View Salon{'\n'}Info</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.column}>
              <TouchableOpacity style={styles.headerAction} onPress={() => getAllMenus()}>
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
						{(menuInfo.items.length > 0 && menuInfo.items[0].row) && (
              <>
  							<View style={styles.menuInputBox}>
  								<TextInput style={styles.menuInput} type="text" placeholder="Enter service # or name" onChangeText={(info) => {
                    setServiceinfo(info)
                    setMenuinfo({ ...menuInfo, error: false })
                  }} autoCorrect={false} autoCapitalize="none"/>
                  <TouchableOpacity style={styles.menuInputTouch} onPress={() => {
                    if (serviceInfo) {
                      props.navigation.navigate(
                        "booktime", 
                        { 
                          locationid, menuid: "", serviceid: "", 
                          serviceinfo: serviceInfo, initialize: () => getAllMenus(), 
                          type: "salon"
                        }
                      )
                    } else {
                      setMenuinfo({ ...menuInfo, error: true })
                    }
                  }}>
                    <Text style={styles.menuInputTouchHeader}>Book now</Text>
                  </TouchableOpacity>
  							</View>
                {menuInfo.error && <Text style={styles.menuInputError}>Your request is empty</Text>}
              </>
						)}

						<ScrollView style={{ width: '100%' }}>
							{menuInfo.items.length && ( 
								menuInfo.items[0].row ? 
									menuInfo.items.map(info => (
										info.row.map(item => (
                      (item.photo && item.photo.name) && (
                        <View key={item.key} style={[styles.menuPhoto, resizePhoto(item.photo, width * 0.95)]}>
                          <Image source={{ uri: logo_url + item.photo.name }} style={{ height: '100%', width: '100%' }}/>
                        </View>
                      )
										))
									))
									:
                  <View style={{ marginHorizontal: 10 }}>
									 {displayList({ id: "", name: "", image: "", list: menuInfo.items, left: 0 })}
                  </View>
							)}
						</ScrollView>
					</View>

					<View style={styles.bottomNavs}>
						<View style={styles.bottomNavsRow}>
							{userId && (
								<TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.navigate("account")}>
									<FontAwesome5 name="user-circle" size={wsize(7)}/>
								</TouchableOpacity>
							)}

							{userId && (
								<TouchableOpacity style={styles.bottomNav} onPress={() => setOpencart(true)}>
									<Entypo name="shopping-cart" size={wsize(7)}/>
									{numCartItems > 0 && <Text style={styles.numCartItemsHeader}>{numCartItems}</Text>}
								</TouchableOpacity>
							)}

							<TouchableOpacity style={styles.bottomNav} onPress={() => {
								props.navigation.dispatch(
									CommonActions.reset({
										index: 0,
										routes: [{ name: "main" }]
									})
								)
							}}>
								<Entypo name="home" size={wsize(7)}/>
							</TouchableOpacity>
							<TouchableOpacity style={styles.bottomNav} onPress={() => {
								if (userId) {
									socket.emit("socket/user/logout", userId, () => {
                    AsyncStorage.clear()
                    setUserid(null)
                  })
								} else {
									setShowauth({ show: true, action: false })
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

			{openCart && <Modal><Orders showNotif={() => {
				setOpencart(false)
				setTimeout(function () {
					props.navigation.dispatch(
						CommonActions.reset({
							index: 0,
							routes: [{ name: "main", params: { showNotif: true } }]
						})
					)
				}, 1000)
			}} navigate={() => {
        setOpencart(false)
        props.navigation.navigate("account")
      }} close={() => {
				getTheNumCartItems()
				setOpencart(false)
			}}/></Modal>}
			{showAuth.show && (
				<Modal transparent={true}>
					<Userauth close={() => setShowauth({ show: false, action: "" })} done={id => {
						socket.emit("socket/user/login", "user" + id, () => setUserid(id))
						setShowauth({ show: false, action: false })
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
                  <View style={styles.workerInfoList}>
                    {showInfo.workerHours.map(worker => (
                      <View key={worker.key} style={styles.worker}>
                        <View style={styles.workerInfo}>
                          <View style={styles.workerInfoProfile}>
                            <Image style={resizePhoto(worker.profile, 50)} source={{ uri: logo_url + worker.profile.name }}/>
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

  menuInputBox: { alignItems: 'center', marginBottom: 5, width: '100%' },
  menuInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 10, width: '95%' },
  menuInputTouch: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), marginVertical: 5, padding: 10, width: '50%' },
  menuInputTouchHeader: { fontSize: wsize(4), textAlign: 'center' },
  menuInputError: { color: 'darkred', marginLeft: 10 },
  menuPhoto: { marginBottom: 10, marginHorizontal: width * 0.025 },

	menu: { backgroundColor: 'white', borderTopLeftRadius: 3, borderTopRightRadius: 3, marginBottom: 30, padding: 3, width: '98%' },
	menuImageHolder: { borderRadius: wsize(10) / 2, flexDirection: 'column', height: wsize(10), justifyContent: 'space-around', overflow: 'hidden', width: wsize(10) },
	menuImage: { height: wsize(10), width: wsize(10) },
	menuName: { fontSize: wsize(6), fontWeight: 'bold', marginLeft: 5, textDecorationLine: 'underline' },
  item: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, width: '100%' },
	itemImageHolder: { borderRadius: wsize(10) / 2, flexDirection: 'column', height: wsize(10), justifyContent: 'space-around', margin: 5, overflow: 'hidden', width: wsize(10) },
	itemImage: { height: wsize(10), width: wsize(10) },
	itemHeader: { fontSize: wsize(6) },
  itemActions: { flexDirection: 'row' },
  itemAction: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 5 },
  itemActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontSize: wsize(5), fontWeight: 'bold' },
	numCartItemsHeader: { fontSize: wsize(4), fontWeight: 'bold' },

	showInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	showInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '80%' },
	showInfoClose: { alignItems: 'center', borderRadius: 20, borderStyle: 'solid', borderWidth: 2, marginVertical: 30 },
	showInfoHeader: { fontSize: wsize(5), fontWeight: 'bold', marginVertical: 30, textAlign: 'center' },
	showInfoPhonenumber: { fontSize: wsize(5), fontWeight: 'bold', marginHorizontal: 10, marginVertical: 8, textAlign: 'center' },
  workerInfoList: { width: '100%' },
  worker: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 30, width: '100%' },
  workerInfo: {  },
  workerInfoProfile: { borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
  workerInfoName: { color: 'black', textAlign: 'center' },
  workerTime: {  },
  workerTimeContainer: { flexDirection: 'row', marginBottom: 10 },
  dayHeader: {  },
  timeHeaders: { flexDirection: 'row' },
  timeHeader: { fontSize: wsize(4), fontWeight: 'bold' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
