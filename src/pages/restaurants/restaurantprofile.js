import React, { useState, useEffect, useRef } from 'react';
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

import Cart from '../../components/cart'
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
	const [menuInfo, setMenuinfo] = useState({ type: '', items: [] })

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
				if (res && isMounted.current == true) {
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
		setLoaded(false)

		getMenus(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					const { type, menus } = res

					setMenuinfo({ type, items: menus })
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
							<View key={"list-" + index} style={{ marginBottom: (list.length - 1 == index && info.listType != "list") ? 50 : 0 }}>
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
											<TouchableOpacity style={style.itemAction} onPress={() => props.navigation.navigate("itemprofile", { locationid, menuid: "", productid: info.id, productinfo: "", initialize: () => getAllMenus() })}>
												<Text style={style.itemActionHeader}>See / Buy</Text>
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
										<TouchableOpacity style={style.itemAction} onPress={() => props.navigation.navigate("itemprofile", { locationid, menuid: "", productid: info.id, productinfo: "", initialize: () => getAllMenus() })}>
											<Text style={style.itemActionHeader}>See / Buy</Text>
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
		<SafeAreaView style={style.restaurantprofile}>
			{loaded ? 
				<View style={style.box}>
					<View style={style.profileInfo}>
						<View style={style.column}>
              <TouchableOpacity style={style.headerAction} onPress={() => setShowinfo(true)}>
                <Text style={style.headerActionHeader}>View Info</Text>
              </TouchableOpacity>
            </View>
            <View style={style.column}>
              <TouchableOpacity style={style.headerAction} onPress={() => getAllMenus()}>
                <Text style={style.headerActionHeader}>Refresh menu</Text>
              </TouchableOpacity>
            </View>
            <View style={style.column}>
              <TouchableOpacity style={style.headerAction} onPress={() => props.navigation.navigate("makereservation", { locationid, initialize: () => initialize() })}>
                <Text style={style.headerActionHeader}>Book Table</Text>
              </TouchableOpacity>
            </View>
            <View style={style.column}>
              <TouchableOpacity style={style.headerAction} onPress={() => Linking.openURL('tel://' + phonenumber)}>
                <Text style={style.headerActionHeader}>Call</Text>
              </TouchableOpacity>
            </View>
					</View>
					
					<View style={style.body}>
						{(menuInfo.type && menuInfo.type == "photos") && (
							<View style={style.menuInputBox}>
								<TextInput style={style.menuInput} type="text" placeholder="Enter product # or name" onChangeText={(info) => setProductinfo(info)} autoCorrect={false} autoCapitalize="none"/>
								<TouchableOpacity style={style.menuInputTouch} onPress={() => props.navigation.navigate("itemprofile", { locationid, menuid: "", productid: "", productinfo: productInfo, initialize: () => getAllMenus() })}>
									<Text style={style.menuInputTouchHeader}>Buy item</Text>
								</TouchableOpacity>
							</View>
						)}

						<ScrollView style={{ height: '90%', width: '100%' }}>
							{menuInfo.type ? 
								menuInfo.type == "photos" ? 
									menuInfo.items.map(info => (
										info.row.map(item => (
											item.photo ? 
												<View key={item.key} style={style.menuPhoto}>
													<Image style={{ height: '100%', width: '100%' }} source={{ uri: logo_url + item.photo }}/>
												</View>
											: null
										))
									))
									:
									displayList({ name: "", image: "", list: menuInfo.list, listType: "list", left: 0 })
							: null }
						</ScrollView>
					</View>

					<View style={style.bottomNavs}>
						<View style={style.bottomNavsRow}>
							{userId && (
								<TouchableOpacity style={style.bottomNav} onPress={() => props.navigation.navigate("account")}>
									<FontAwesome5 name="user-circle" size={wsize(7)}/>
								</TouchableOpacity>
							)}

							{userId && (
								<TouchableOpacity style={style.bottomNav} onPress={() => props.navigation.navigate("recent")}>
									<FontAwesome name="history" size={wsize(7)}/>
								</TouchableOpacity>
							)}

							{userId && (
								<TouchableOpacity style={style.bottomNav} onPress={() => setOpencart(true)}>
									<Entypo name="shopping-cart" size={wsize(7)}/>
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
								<Entypo name="home" size={wsize(7)}/>
							</TouchableOpacity>
							<TouchableOpacity style={style.bottomNav} onPress={() => {
								if (userId) {
									AsyncStorage.clear()

									setUserid(null)
								} else {
									setShowauth(true)
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
					<SafeAreaView style={style.showInfoContainer}>
						<View style={style.showInfoBox}>
							<TouchableOpacity style={style.showInfoClose} onPress={() => setShowinfo(false)}>
								<AntDesign name="close" size={wsize(7)}/>
							</TouchableOpacity>

							<Text style={style.showInfoHeader}>{name}</Text>
							<Text style={style.showInfoHeader}>{address}</Text>
							<View style={{ alignItems: 'center' }}>
								<View style={{ flexDirection: 'row' }}>
									<TouchableOpacity onPress={() => Linking.openURL('tel://' + phonenumber)}>
										<AntDesign name="phone" size={wsize(7)}/>
									</TouchableOpacity>
									<Text style={style.showInfoPhonenumber}>{phonenumber}</Text>
								</View>
							</View>
							<Text style={style.showInfoHeader}>{distance}</Text>
						</View>
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	restaurantprofile: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	profileInfo: { flexDirection: 'row', height: '7%', justifyContent: 'space-around', width: '100%' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
	headerAction: { alignItems: 'center', borderRadius: 10, borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', height: '90%', justifyContent: 'space-around', width: wsize(20) },
	headerActionHeader: { color: 'black', fontSize: wsize(3), textAlign: 'center' },

	body: { height: '83%' },

	menuInputBox: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 5, marginHorizontal: 10 },
	menuInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(4), paddingLeft: 5, width: '68%' },
	menuInputTouch: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), marginLeft: 2, padding: 5, width: '28%' },
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
