import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Dimensions, View, FlatList, Image, Text, TouchableOpacity, Linking, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { logo_url } from '../../../assets/info'
import { getLocationProfile } from '../../apis/locations'
import { getMenus } from '../../apis/menus'
import { getProducts } from '../../apis/products'
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

export default function restaurantprofile(props) {
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

	const [showMenus, setShowmenus] = useState(false)
	const [menus, setMenus] = useState([])
	const [numMenus, setNummenus] = useState(0)

	const [showProducts, setShowproducts] = useState(false)
	const [products, setProducts] = useState([])
	const [numProducts, setNumproducts] = useState(0)

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
					const { locationInfo, msg } = res
					const { name, logo, addressOne, addressTwo, city, province, postalcode, phonenumber, distance, longitude, latitude } = locationInfo
					const address = addressOne + " " + addressTwo + ", " + city + " " + province + ", " + postalcode

					setLogo(logo)
					setName(name)
					setAddress(address)
					setPhonenumber(phonenumber)
					setDistance(distance)

					if (msg == "menus") {
						getAllMenus()
					} else if (msg == "products") {
						getAllProducts()
					}
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const getAllMenus = async() => {
		const data = { locationid, parentmenuid: "" }

		getMenus(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					setMenus(res.menus)
					setNummenus(res.nummenus)
					setShowmenus(true)
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const getAllProducts = async() => {
		const data = { locationid, menuid: "" }

		getProducts(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					setProducts(res.products)
					setNumproducts(res.numproducts)
					setShowproducts(true)
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const initialize = () => {
		getTheNumCartItems()
		getTheLocationProfile()
	}

	useEffect(() => {
		isMounted.current = true
		
		initialize()

		return () => isMounted.current = false
	}, [])

	return (
		<View style={style.restaurantprofile}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<View style={style.profileInfo}>
						<TouchableOpacity style={style.back} onPress={() => {
							if (refetch) {
								refetch()
							}

							props.navigation.goBack()
						}}>
							<Text style={style.backHeader}>Back</Text>
						</TouchableOpacity>

						{loaded ? 
							<>
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
											<Text style={style.navHeader}>Menu ({numMenus})</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.nav} onPress={() => props.navigation.navigate("makereservation", { locationid, initialize: () => initialize() })}>
											<Text style={style.navHeader}>Book Table</Text>
										</TouchableOpacity>
									</View>
								</View>
							</>
						: null }
					</View>
					
					<View style={style.body}>
						{loaded ? 
							<>
								{showMenus && (
									<FlatList
										showsVerticalScrollIndicator={false}
										style={{ height: '100%', marginHorizontal: 20 }}
										data={menus}
										renderItem={({ item, index }) => 
											<View key={item.key} style={style.row}>
												{item.row.map(menu => (
													menu.name ? 
														<View key={menu.key} style={style.menu}>
															<View style={style.menuImageHolder}>
																<Image source={{ uri: logo_url + menu.image }} style={{ height: fsize(0.3), width: fsize(0.3) }}/>
															</View>
															<Text style={style.menuName}>{menu.name} ({menu.numCategories})</Text>
															<TouchableOpacity style={style.seeMenu} onPress={() => props.navigation.navigate("menu", { locationid: locationid, menuid: menu.id, initialize: () => initialize() })}>
																<Text style={style.seeMenuHeader}>See menu</Text>
															</TouchableOpacity>
														</View>
														:
														<View key={menu.key} style={style.menuDisabled}></View>
												))}
											</View>
										}i
									/>
								)}

								{showProducts && (
									<FlatList
										showsVerticalScrollIndicator={false}
										data={products}
										style={{ height: '100%', marginHorizontal: 20 }}
										renderItem={({ item, index }) => 
											<View key={item.key} style={style.row}>
												{item.row.map(product => (
													product.name ? 
														<TouchableOpacity key={product.key} style={style.product} onPress={() => props.navigation.navigate("itemprofile", { menuid: "", productid: product.id, initialize: () => initialize() })}>
															<Image style={style.productImage} source={{ uri: logo_url + product.image }}/>
															<Text style={style.productName}>{product.name}</Text>
															{product.info && <Text style={style.productInfo}>{product.info}</Text>}

															{product.price != "" && (
																<View style={{ flexDirection: 'row' }}>
																	<Text style={style.productPrice}>$ {product.price}</Text>
																</View>
															)}

															<TouchableOpacity style={style.productBuy} onPress={() => props.navigation.navigate("itemprofile", { menuid: "", productid: product.id, initialize: () => initialize() })}>
																<Text style={style.productBuyHeader}>Buy</Text>
															</TouchableOpacity>
														</TouchableOpacity>
														:
														<View key={product.key} style={style.product}></View>
												))}
											</View>
										}
									/>
								)}
							</>
							:
							<ActivityIndicator size="large"/>
						}
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
									setShowauth(true)
								}
							}}>
								<Text style={style.bottomNavHeader}>{userId ? 'Log-Out' : 'Log-In'}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>

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
		</View>
	);
}

const style = StyleSheet.create({
	restaurantprofile: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	profileInfo: { height: fsize(0.43) },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginTop: fsize(0.05), marginLeft: fsize(0.05), padding: fsize(0.01), width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: fsize(0.05) },
	headers: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	viewInfoTouch: { borderRadius: fsize(0.2) / 2, borderStyle: 'solid', borderWidth: 2, height: 52, marginTop: fsize(0.03), padding: 5, width: fsize(0.2) },
	viewInfoTouchHeader: { textAlign: 'center' },
	logoHolder: { borderRadius: fsize(0.2) / 2, height: fsize(0.2), overflow: 'hidden', width: fsize(0.2) },
	logo: { height: fsize(0.2), width: fsize(0.2) },
	callTouch: { alignItems: 'center', borderRadius: fsize(0.2) / 2, borderStyle: 'solid', borderWidth: 2, height: 52, marginTop: fsize(0.03), paddingTop: 5, width: fsize(0.2) },

	navs: { flexDirection: 'row', justifyContent: 'space-around' },
	nav: { alignItems: 'center', backgroundColor: 'white', borderRadius: 8, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, padding: 5, width: fsize(0.3) },
	navHeader: { fontSize: fsize(0.05) },

	body: { height: screenHeight - (fsize(0.43) + 40) },
	row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, width: '100%' },
	menu: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, padding: 2, width: fsize(0.3) },
	menuDisabled: { height: fsize(0.3), width: fsize(0.3) },
	menuImageHolder: { alignItems: 'center', borderRadius: fsize(0.3) / 2, flexDirection: 'column', height: fsize(0.3), justifyContent: 'space-around', overflow: 'hidden', width: fsize(0.3) },
	menuName: { fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' },
	seeMenu: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 5, padding: 5 },
	seeMenuHeader: { fontSize: fsize(0.05), textAlign: 'center' },

	// product
	product: { alignItems: 'center', marginBottom: 50, marginHorizontal: 10 },
	productImage: { borderRadius: fsize(0.3) / 2, height: fsize(0.3), width: fsize(0.3) },
	productName: { fontSize: fsize(0.05), fontWeight: 'bold' },
	productInfo: { fontSize: fsize(0.05) },
	productPrice: { fontSize: fsize(0.05), margin: 5 },
	productBuy: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 50 },
	productBuyHeader: { textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },

	showInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	showInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '80%' },
	showInfoClose: { alignItems: 'center', borderRadius: 20, borderStyle: 'solid', borderWidth: 2, width: 44 },
	showInfoHeader: { fontSize: fsize(0.05), fontWeight: 'bold', margin: 10 },
	showInfoPhonenumber: { fontSize: fsize(0.05), fontWeight: 'bold', marginHorizontal: 10, marginVertical: 8, textAlign: 'center' },
})
