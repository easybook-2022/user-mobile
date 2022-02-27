import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, ActivityIndicator, Dimensions, ScrollView, View, FlatList, Image, Text, 
  TextInput, TouchableOpacity, Linking, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { logo_url } from '../../../assets/info'
import { getLocationProfile } from '../../apis/locations'
import { getMenus } from '../../apis/menus'
import { getNumCartItems } from '../../apis/carts'

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

export default function Restaurantprofile(props) {
	const { locationid, refetch } = props.route.params
	const func = props.route.params

	const [logo, setLogo] = useState('')
	const [name, setName] = useState('')
	const [address, setAddress] = useState('')
	const [phonenumber, setPhonenumber] = useState('')
	const [distance, setDistance] = useState(0)
	const [showAuth, setShowauth] = useState(false)
	const [userId, setUserid] = useState(null)
	const [showInfo, setShowinfo] = useState(false)

	const [productInfo, setProductinfo] = useState('')
	const [menuInfo, setMenuinfo] = useState({ type: '', items: [], error: false })

	const [loaded, setLoaded] = useState(false)
	
	const [openOrders, setOpenorders] = useState(false)
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
						
					} else {
						alert("server error")
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
					
				} else {
					alert("server error")
				}
			})
	}
	const getAllMenus = async() => {
		setLoaded(false)

		getMenus(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { type, menus } = res

					setMenuinfo({ type, items: menus })
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("server error")
				}
			})
	}
	const initialize = () => {
		getTheNumCartItems()
		getTheLocationProfile()
		getAllMenus()
	}
	const displayList = info => {
		let { id, image, name, list, listType, left } = info
		let add = name ? true : false

		return (
			<View style={{ marginLeft: left }}>
				{name ?
					<View style={styles.menu}>
						<View style={{ flexDirection: 'row' }}>
							<View style={styles.menuImageHolder}>
								<Image style={styles.menuImage} source={{ uri: logo_url + image }}/>
							</View>
							<Text style={styles.menuName}>{name} (Menu)</Text>
						</View>
						{info.info ? <Text style={styles.itemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
						{list.length > 0 && list.map((info, index) => (
							<View key={"list-" + index} style={{ marginBottom: (list.length - 1 == index && info.listType != "list") ? 50 : 0 }}>
								{info.listType == "list" ? 
									displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left + 10 })
									:
									<View style={styles.item}>
										<View style={{ flexDirection: 'row', }}>
											<View style={styles.itemImageHolder}>
												<Image style={styles.itemImage} source={{ uri: logo_url + info.image }}/>
											</View>
											<Text style={styles.itemHeader}>{info.name}</Text>
											<Text style={styles.itemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text>
											{info.listType == "service" && <Text style={styles.itemHeader}>{info.duration}</Text>}
										</View>
										{info.info ? <Text style={styles.itemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
										<View style={styles.itemActions}>
											<TouchableOpacity style={styles.itemAction} onPress={() => props.navigation.navigate("itemprofile", { locationid, menuid: "", productid: info.id, productinfo: "", initialize: () => getAllMenus() })}>
												<Text style={styles.itemActionHeader}>See / Buy</Text>
											</TouchableOpacity>
										</View>
									</View>
								}
							</View>
						))}
					</View>
					:
					list.map((info, index) => (
						<View key={"list-" + index} style={{ marginBottom: (list.length - 1 == index && info.listType != "list") ? 50 : 0 }}>
							{info.listType == "list" ? 
								displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left + 10 })
								:
								<View style={styles.item}>
									<View style={{ flexDirection: 'row', }}>
										<View style={styles.itemImageHolder}>
											<Image style={styles.itemImage} source={{ uri: logo_url + info.image }}/>
										</View>
										<Text style={styles.itemHeader}>{info.name}</Text>
										<Text style={styles.itemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text>
										{info.listType == "service" && <Text style={styles.itemHeader}>{info.duration}</Text>}
									</View>
									{info.info ? <Text style={styles.itemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
									<View style={styles.itemActions}>
										<TouchableOpacity style={styles.itemAction} onPress={() => props.navigation.navigate("itemprofile", { locationid, menuid: "", productid: info.id, productinfo: "", initialize: () => getAllMenus() })}>
											<Text style={styles.itemActionHeader}>See / Buy</Text>
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

	useEffect(() => {
		initialize()
	}, [])

	return (
		<SafeAreaView style={styles.restaurantprofile}>
			{loaded ? 
				<View style={styles.box}>
					<View style={styles.profileInfo}>
						<View style={styles.column}>
              <TouchableOpacity style={styles.headerAction} onPress={() => setShowinfo(true)}>
                <Text style={styles.headerActionHeader}>View Info</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.column}>
              <TouchableOpacity style={styles.headerAction} onPress={() => getAllMenus()}>
                <Text style={styles.headerActionHeader}>Refresh menu</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.column}>
              <TouchableOpacity style={styles.headerAction} onPress={() => Linking.openURL('tel://' + phonenumber)}>
                <Text style={styles.headerActionHeader}>Call</Text>
              </TouchableOpacity>
            </View>
					</View>
					
					<View style={styles.body}>
						{(menuInfo.type && menuInfo.type == "photos") && (
              <>
  							<View style={styles.menuInputBox}>
  								<TextInput style={styles.menuInput} type="text" placeholder="Enter product # or name" onChangeText={(info) => setProductinfo(info)} autoCorrect={false} autoCapitalize="none"/>
                  <View style={styles.menuInputActions}>
    								<TouchableOpacity style={styles.menuInputTouch} onPress={() => {
                      if (productInfo) {
                        props.navigation.navigate(
                          "itemprofile", 
                          { 
                            locationid, menuid: "", productid: "", 
                            productinfo: productInfo, initialize: () => getAllMenus() 
                          }
                        )
                      } else {
                        setMenuinfo({ ...menuInfo, error: true })
                      }
                    }}>
    									<Text style={styles.menuInputTouchHeader}>Order item</Text>
    								</TouchableOpacity>
                  </View>
  							</View>
                {menuInfo.error && <Text style={styles.menuInputError}>Your request is empty</Text>}
              </>
						)}

						<ScrollView style={{ height: '90%', width: '100%' }}>
							{menuInfo.type ? 
								menuInfo.type == "photos" ? 
									menuInfo.items.map(info => (
										info.row.map(item => (
											item.photo ? 
												<View key={item.key} style={styles.menuPhoto}>
													<Image style={{ height: '100%', width: '100%' }} source={{ uri: logo_url + item.photo }}/>
												</View>
											: null
										))
									))
									:
									displayList({ name: "", image: "", list: menuInfo.items, listType: menuInfo.type, left: 0 })
							: null }
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
								<TouchableOpacity style={styles.bottomNav} onPress={() => setOpenorders(true)}>
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
									AsyncStorage.clear()

									setUserid(null)
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

			{openOrders && <Modal><Cart showNotif={() => {
				setOpenorders(false)
				setTimeout(function () {
					props.navigation.dispatch(
						CommonActions.reset({
							index: 0,
							routes: [{ name: "main", params: { showNotif: true } }]
						})
					)
				}, 1000)
			}} navigate={() => {
        setOpenorders(false)
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
							setUserid(id)
						}

						setShowauth(false)
					}} navigate={props.navigation.navigate}/>
				</Modal>
			)}
			{showInfo && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.showInfoContainer}>
						<View style={styles.showInfoBox}>
							<TouchableOpacity style={styles.showInfoClose} onPress={() => setShowinfo(false)}>
								<AntDesign name="close" size={wsize(7)}/>
							</TouchableOpacity>

							<Text style={styles.showInfoHeader}>{name}</Text>
							<Text style={styles.showInfoHeader}>{address}</Text>
							<View style={{ alignItems: 'center' }}>
								<View style={{ flexDirection: 'row' }}>
									<TouchableOpacity onPress={() => Linking.openURL('tel://' + phonenumber)}>
										<AntDesign name="phone" size={wsize(7)}/>
									</TouchableOpacity>
									<Text style={styles.showInfoPhonenumber}>{phonenumber}</Text>
								</View>
							</View>
							<Text style={styles.showInfoHeader}>{distance}</Text>
						</View>
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	restaurantprofile: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	profileInfo: { flexDirection: 'row', height: '7%', justifyContent: 'space-around', width: '100%' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
	headerAction: { alignItems: 'center', borderRadius: 10, borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', height: '90%', justifyContent: 'space-around', width: wsize(20) },
	headerActionHeader: { color: 'black', fontSize: wsize(3), textAlign: 'center' },

	body: { height: '83%' },

	menuInputBox: { alignItems: 'center', marginBottom: 5, width: '100%' },
  menuInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 10, width: '95%' },
  menuInputActions: { flexDirection: 'row', justifyContent: 'space-around' },
  menuInputTouch: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), margin: 5, padding: 10, width: '40%' },
	menuInputTouchHeader: { fontSize: wsize(4), textAlign: 'center' },
  menuInputError: { color: 'darkred', marginLeft: 10 },
	menuPhoto: { height, marginBottom: 10, marginHorizontal: width * 0.025, width: width * 0.95 },

	menu: { backgroundColor: 'white', borderTopLeftRadius: 3, borderTopRightRadius: 3, padding: 3 },
	menuImageHolder: { borderRadius: wsize(10) / 2, height: wsize(10), overflow: 'hidden', width: wsize(10) },
	menuImage: { height: wsize(10), width: wsize(10) },
	menuName: { fontSize: wsize(6), fontWeight: 'bold', marginLeft: 5, marginTop: wsize(4) / 2 },
	itemActions: { flexDirection: 'row', marginTop: 0 },
	itemAction: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5 },
	itemActionHeader: { fontSize: wsize(6), textAlign: 'center' },
	item: { backgroundColor: 'rgba(127, 127, 127, 0.3)', borderRadius: 10, margin: '2%', paddingHorizontal: 3, paddingBottom: 30 },
	itemImageHolder: { borderRadius: wsize(10) / 2, height: wsize(10), margin: 5, overflow: 'hidden', width: wsize(10) },
	itemImage: { height: wsize(10), width: wsize(10) },
	itemHeader: { fontSize: wsize(6), fontWeight: 'bold', marginRight: 20, paddingTop: wsize(4), textDecorationStyle: 'solid' },
	itemInfo: { fontSize: wsize(5), marginLeft: 10, marginVertical: 10 },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontSize: wsize(5), fontWeight: 'bold' },
	numCartItemsHeader: { fontSize: wsize(4), fontWeight: 'bold' },

	showInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	showInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '80%' },
	showInfoClose: { alignItems: 'center', borderRadius: 20, borderStyle: 'solid', borderWidth: 2, width: 44 },
	showInfoHeader: { fontSize: wsize(5), fontWeight: 'bold', margin: 10, textAlign: 'center' },
	showInfoPhonenumber: { fontSize: wsize(5), fontWeight: 'bold', marginHorizontal: 10, marginVertical: 8, textAlign: 'center' },
})
