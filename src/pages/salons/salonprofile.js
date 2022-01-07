import React, { useState, useEffect, useRef } from 'react'
import { ActivityIndicator, Dimensions, ScrollView, View, FlatList, Image, Text, TouchableOpacity, Linking, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { logo_url } from '../../../assets/info'
import { getLocationProfile } from '../../apis/locations'
import { getMenus } from '../../apis/menus'
import { getNumCartItems } from '../../apis/carts'

import Cart from '../../components/cart'
import Userauth from '../../components/userauth'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

const fsize = p => {
	return width * p
}

export default function salonprofile(props) {
	const { locationid, refetch } = props.route.params
	const func = props.route.params

	const [logo, setLogo] = useState('')
	const [name, setName] = useState('')
	const [address, setAddress] = useState('')
	const [phonenumber, setPhonenumber] = useState('')
	const [distance, setDistance] = useState(0)
	const [showAuth, setShowauth] = useState(false)
	const [showInfo, setShowinfo] = useState(false)
	const [userId, setUserid] = useState(null)

	const [menus, setMenus] = useState([])

	const [loaded, setLoaded] = useState(false)

	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(0)

	const isMounted = useRef(null)

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
					if (res && isMounted.current == true) {
						setUserid(userid)
						setNumcartitems(res.numCartItems)
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					} else {
						alert("an error has occurred in server")
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
					alert("an error has occurred in server")
				}
			})
	}
	const getAllMenus = async() => {
		getMenus(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					setMenus(res.menus)
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("an error has occurred in server")
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
					<View style={style.menu}>
						<View style={{ flexDirection: 'row' }}>
							<View style={style.menuImageHolder}>
								<Image style={style.menuImage} source={{ uri: logo_url + image }}/>
							</View>
							<Text style={style.menuName}>{name} (Menu)</Text>
						</View>
						{info.info ? <Text style={style.itemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
						{list.length > 0 && list.map((info, index) => (
							<View key={"list-" + index}>
								{info.listType == "list" ? 
									displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left + 10 })
									:
									<View style={style.item}>
										<View style={{ flexDirection: 'row', }}>
											<View style={style.itemImageHolder}>
												<Image style={style.itemImage} source={{ uri: logo_url + info.image }}/>
											</View>
											<Text style={style.itemHeader}>{info.name}</Text>
											<Text style={style.itemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text>
											{info.listType == "service" && <Text style={style.itemHeader}>{info.duration}</Text>}
										</View>
										{info.info ? <Text style={style.itemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
										<View style={style.itemActions}>
											<TouchableOpacity style={style.itemAction} onPress={() => props.navigation.navigate("booktime", { locationid, menuid: "", serviceid: info.id, initialize: () => getAllMenus() })}>
												<Text style={style.itemActionHeader}>Book a time</Text>
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
								displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left + 10 })
								:
								<View style={style.item}>
									<View style={{ flexDirection: 'row', }}>
										<View style={style.itemImageHolder}>
											<Image style={style.itemImage} source={{ uri: logo_url + info.image }}/>
										</View>
										<Text style={style.itemHeader}>{info.name}</Text>
										<Text style={style.itemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text>
										{info.listType == "service" && <Text style={style.itemHeader}>{info.duration}</Text>}
									</View>
									{info.info ? <Text style={style.itemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
									<View style={style.itemActions}>
										<TouchableOpacity style={style.itemAction} onPress={() => props.navigation.navigate("booktime", { locationid, menuid: "", serviceid: info.id, initialize: () => getAllMenus() })}>
											<Text style={style.itemActionHeader}>Book a time</Text>
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
		isMounted.current = true

		initialize()

		return () => isMounted.current = false
	}, [])

	return (
		<View style={style.salonprofile}>
			{loaded ? 
				<View style={style.box}>
					<View style={style.profileInfo}>
						<View style={style.headers}>
							<TouchableOpacity style={style.viewInfoTouch} onPress={() => setShowinfo(true)}>
								<Text style={style.viewInfoTouchHeader}>View{'\n'}Info</Text>
							</TouchableOpacity>
							<View style={style.logoHolder}>
								<Image style={style.logo} source={{ uri: logo_url + logo }}/>
							</View>
							<TouchableOpacity style={style.callTouch} onPress={() => Linking.openURL('tel://' + phonenumber)}>
								<AntDesign name="phone" size={30}/>
							</TouchableOpacity>
						</View>
						<View style={style.navs}>
							<View style={{ flexDirection: 'row' }}>
								<TouchableOpacity style={style.nav} onPress={() => getAllMenus()}>
									<Text style={style.navHeader}>Refresh menu</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
					
					<View style={style.body}>
						<ScrollView>
							{displayList({ name: "", image: "", list: menus, listType: "list", left: 0 })}
						</ScrollView>
					</View>

					<View style={style.bottomNavs}>
						<View style={style.bottomNavsRow}>
							{userId && (
								<TouchableOpacity style={style.bottomNav} onPress={() => props.navigation.navigate("account")}>
									<FontAwesome5 name="user-circle" size={30}/>
								</TouchableOpacity>
							)}

							{userId && (
								<TouchableOpacity style={style.bottomNav} onPress={() => props.navigation.navigate("recent")}>
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
								props.navigation.dispatch(
									CommonActions.reset({
										index: 0,
										routes: [{ name: "main" }]
									})
								)
							}}>
								<Entypo name="home" size={30}/>
							</TouchableOpacity>
							<TouchableOpacity style={style.bottomNav} onPress={() => {
								if (userId) {
									AsyncStorage.clear()

									setUserid(null)
								} else {
									setShowauth({ show: true, action: false })
								}
							}}>
								<Text style={style.bottomNavHeader}>{userId ? 'Log-Out' : 'Log-In'}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
				:
				<View style={{ alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' }}>
					<ActivityIndicator color="black" size="large"/>
				</View>
			}

			{openCart && <Modal><Cart showNotif={() => {
				setOpencart(false)
				setTimeout(function () {
					props.navigation.dispatch(
						CommonActions.reset({
							index: 0,
							routes: [{ name: "main", params: { showNotif: true } }]
						})
					)
				}, 1000)
			}} close={() => {
				getTheNumCartItems()
				setOpencart(false)
			}}/></Modal>}
			{showAuth.show && (
				<Modal transparent={true}>
					<Userauth close={() => setShowauth({ show: false, action: "" })} done={(id, msg) => {
						if (msg == "setup") {
							props.navigation.dispatch(
								CommonActions.reset({
									index: 1,
									routes: [{ name: "setup" }]
								})
							);
						} else {
							socket.emit("socket/user/login", "user" + id, () => {
								setUserid(id)

								if (showAuth.action == "addcart") {
									addCart()
								} else if (showAuth.action == "openfriendscart") {
									openFriendsCart()
								}
							})
						}

						setShowauth({ show: false, action: false })
					}} navigate={props.navigation.navigate}/>
				</Modal>
			)}
			{showInfo && (
				<Modal transparent={true}>
					<View style={style.showInfoContainer}>
						<View style={style.showInfoBox}>
							<TouchableOpacity style={style.showInfoClose} onPress={() => setShowinfo(false)}>
								<AntDesign name="close" size={40}/>
							</TouchableOpacity>

							<Text style={style.showInfoHeader}>{name}</Text>
							<Text style={style.showInfoHeader}>{address}</Text>
							<View style={{ alignItems: 'center' }}>
								<View style={{ flexDirection: 'row' }}>
									<TouchableOpacity onPress={() => Linking.openURL('tel://' + phonenumber)}>
										<AntDesign name="phone" size={30}/>
									</TouchableOpacity>
									<Text style={style.showInfoPhonenumber}>{phonenumber}</Text>
								</View>
							</View>
							<Text style={style.showInfoHeader}>{distance}</Text>
						</View>
					</View>
				</Modal>
			)}
		</View>
	)
}

const style = StyleSheet.create({
	salonprofile: { backgroundColor: 'white', height: '100%', paddingBottom: offsetPadding, width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	profileInfo: { height: '20%' },
	headers: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 5, width: '100%' },
	viewInfoTouch: { borderRadius: fsize(0.2) / 2, borderStyle: 'solid', borderWidth: 2, height: 52, marginTop: fsize(0.03), padding: 5, width: fsize(0.2) },
	viewInfoTouchHeader: { textAlign: 'center' },
	logoHolder: { borderRadius: fsize(0.2) / 2, height: fsize(0.2), overflow: 'hidden', width: fsize(0.2) },
	logo: { height: fsize(0.2), width: fsize(0.2) },
	callTouch: { alignItems: 'center', borderRadius: fsize(0.2) / 2, borderStyle: 'solid', borderWidth: 2, height: 52, marginTop: fsize(0.03), paddingTop: 5, width: fsize(0.2) },

	navs: { flexDirection: 'row', justifyContent: 'space-around' },
	nav: { alignItems: 'center', backgroundColor: 'white', borderRadius: 8, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 5, padding: 5, width: fsize(0.4) },
	navHeader: { fontSize: fsize(0.04) },

	body: { height: '70%' },
	menu: { backgroundColor: 'white', borderTopLeftRadius: 3, borderTopRightRadius: 3, padding: 3, width: '98%' },
	menuImageHolder: { borderRadius: fsize(0.1) / 2, height: fsize(0.1), overflow: 'hidden', width: fsize(0.1) },
	menuImage: { height: fsize(0.1), width: fsize(0.1) },
	menuName: { fontSize: fsize(0.06), fontWeight: 'bold', marginLeft: 5 },
	itemActions: { flexDirection: 'row', marginTop: 0 },
	itemAction: { backgroundColor: 'white', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5 },
	itemActionHeader: { fontSize: fsize(0.04), textAlign: 'center' },
	item: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 10, margin: '2%', paddingHorizontal: 3, paddingBottom: 30 },
	itemImageHolder: { borderRadius: fsize(0.1) / 2, height: fsize(0.1), margin: 5, overflow: 'hidden', width: fsize(0.1) },
	itemImage: { height: fsize(0.1), width: fsize(0.1) },
	itemHeader: { fontSize: fsize(0.06), fontWeight: 'bold', marginRight: 20, textDecorationStyle: 'solid' },
	itemInfo: { fontSize: fsize(0.05), marginLeft: 10, marginVertical: 10 },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },

	showInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	showInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '80%' },
	showInfoClose: { alignItems: 'center', borderRadius: 20, borderStyle: 'solid', borderWidth: 2, width: 44 },
	showInfoHeader: { fontSize: fsize(0.05), fontWeight: 'bold', margin: 10, textAlign: 'center' },
	showInfoPhonenumber: { fontSize: fsize(0.05), fontWeight: 'bold', marginHorizontal: 10, marginVertical: 8, textAlign: 'center' },
})
