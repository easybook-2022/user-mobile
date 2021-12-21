import React, { useState, useEffect, useRef } from 'react'
import { ActivityIndicator, Dimensions, View, FlatList, Image, Text, TouchableOpacity, Linking, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { logo_url } from '../../assets/info'
import { getInfo } from '../apis/locations'
import { getMenus } from '../apis/menus'
import { getProducts } from '../apis/products'
import { getServices } from '../apis/services'
import { getNumCartItems } from '../apis/carts'

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

const fsize = p => {
	return width * p
}

export default function menu(props) {
	const { locationid, menuid } = props.route.params
	const func = props.route.params

	const [menuName, setMenuname] = useState('')
	const [menuInfo, setMenuinfo] = useState('')
	const [showAuth, setShowauth] = useState(false)
	const [showInfo, setShowinfo] = useState({ show: false, info: {} })
	const [userId, setUserid] = useState(null)

	const [showMenus, setShowmenus] = useState(false)
	const [menus, setMenus] = useState([])
	const [numMenus, setNummenus] = useState(0)

	const [showProducts, setShowproducts] = useState(false)
	const [products, setProducts] = useState([])
	const [numProducts, setNumproducts] = useState(0)

	const [showServices, setShowservices] = useState(false)
	const [services, setServices] = useState([])
	const [numServices, setNumservices] = useState(0)
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
	
	const getTheInfo = async() => {
		const longitude = await AsyncStorage.getItem("longitude")
		const latitude = await AsyncStorage.getItem("latitude")
		const data = { locationid, menuid, longitude, latitude }

		getInfo(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					const { msg, menuName, menuInfo, info } = res
					const { name, logo, addressOne, addressTwo, city, province, postalcode, phonenumber, distance, longitude, latitude } = info
					const address = addressOne + " " + addressTwo + ", " + city + " " + province + ", " + postalcode

					info["address"] = address

					setMenuname(menuName)
					setMenuinfo(menuInfo)
					setShowinfo({ ...showInfo, info })

					if (msg == "menus") {
						getAllMenus()
					} else if (msg == "services") {
						getAllServices()
					} else if (msg == "products") {
						getAllProducts()
					} else {
						setLoaded(true)
					}
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	
	const getAllMenus = async() => {
		const data = { locationid, parentmenuid: menuid }

		getMenus(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					let data = res.menus
					let row = [], column = []
					let rownum = 0

					data.forEach(function (menu, index) {
						row.push(menu)

						if (row.length == 2 || (data.length - 1 == index && row.length > 0)) {
							column.push({ key: "r-" + rownum, items: row })
						}
					})

					setMenus(column)
					setNummenus(data.length)
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
		const data = { locationid, menuid }

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
	const getAllServices = async() => {
		const data = { userid: userId, locationid, menuid }

		getServices(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					setServices(res.services)
					setNumservices(res.numservices)
					setShowservices(true)
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
		getTheInfo()
	}

	useEffect(() => {
		isMounted.current = true

		initialize()

		return () => isMounted.current = false
	}, [])

	return (
		<View style={style.boxContainer}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<TouchableOpacity style={style.back} onPress={() => {
						if (func.initialize) {
							func.initialize()
						}

						props.navigation.goBack()
					}}>
						<Text style={style.backHeader}>Back</Text>
					</TouchableOpacity>

					<View style={style.body}>
						<View style={style.headers}>
							<Text style={[style.header, { fontFamily: 'appFont' }]}>{menuName}</Text>
							<Text style={style.header}>{menuInfo}</Text>
						</View>

						{loaded ? 
							<>
								{showMenus && (
									<>
										<View style={{ alignItems: 'center' }}>
											<TouchableOpacity style={style.moreInfo} onPress={() => setShowinfo(true)}>
												<Text style={style.moreInfoHeader}>View Salon Info</Text>
											</TouchableOpacity>
											<Text style={style.bodyHeader}>{numMenus} Menu(s)</Text>
										</View>

										<FlatList
											showsVerticalScrollIndicator={false}
											data={menus}
											renderItem={({ item, index }) => 
												<View key={item.key} style={style.row}>
													{item.items.map(( menu, index ) => (
														menu.name ? 
															<TouchableOpacity key={menu.key} style={style.menu}>
																<View style={style.menuImageHolder}>
																	<Image source={{ uri: logo_url + menu.image }} style={{ height: fsize(0.3), width: fsize(0.3) }}/>
																</View>
																<Text style={style.menuName}>({menu.numCategories}) {menu.name}</Text>
																<TouchableOpacity style={style.seeMenu} onPress={() => props.navigation.push("menu", { locationid: locationid, menuid: menu.id })}>
																	<Text style={style.seeMenuHeader}>See Menu</Text>
																</TouchableOpacity>
															</TouchableOpacity>
															:
															<View key={menu.key} style={style.menuDisabled}></View>
													))}
												</View>
											}
										/>
									</>
								)}

								{showProducts && (
									<>
										<View style={{ alignItems: 'center' }}>
											<TouchableOpacity style={style.moreInfo} onPress={() => setShowinfo({ ...showInfo, show: true })}>
												<Text style={style.moreInfoHeader}>Restaurant Info</Text>
											</TouchableOpacity>
											<Text style={style.bodyHeader}>{numProducts} Product(s)</Text>
										</View>

										<FlatList
											showsVerticalScrollIndicator={false}
											data={products}
											renderItem={({ item, index }) => 
												<View style={style.row}>
													{item.row.map(product => (
														product.name ? 
															<TouchableOpacity key={product.key} style={style.product} onPress={() => props.navigation.navigate("itemprofile", { menuid, productid: product.id, initialize: () => initialize() })}>
																<Image style={style.productImage} source={{ uri: logo_url + product.image }}/>
																<Text style={style.productName}>{product.name}</Text>
																{product.info && <Text style={style.productInfo}>{product.info}</Text>}

																<Text style={style.productPrice}>$ {product.price}</Text>

																<TouchableOpacity style={style.productBuy} onPress={() => props.navigation.navigate("itemprofile", { menuid, productid: product.id, initialize: () => initialize() })}>
																	<Text style={style.productBuyHeader}>Buy / See</Text>
																</TouchableOpacity>
															</TouchableOpacity>
															:
															<View key={product.key} style={style.product}></View>
													))}
												</View>
											}
										/>
									</>
								)}

								{showServices && (
									<>
										<Text style={style.bodyHeader}>{numServices} Service(s)</Text>

										<FlatList
											showsVerticalScrollIndicator={false}
											data={services}
											renderItem={({ item, index }) => 
												<TouchableOpacity key={item.key} style={style.service} onPress={() => props.navigation.navigate("booktime", { 
													locationid, scheduleid: item.scheduleid,
													serviceid: item.id, initialize: () => initialize()
												})}>
													<Image style={style.serviceImage} source={{ uri: logo_url + item.image }}/>
													<View style={{ marginLeft: 10, width: (width - fsize(0.3)) - 30 }}>
														<Text style={style.serviceName}>{item.name}</Text>
														<Text style={style.serviceInfo}><Text style={{ fontWeight: 'bold' }}>Information</Text>: {item.info}</Text>
														<Text style={style.serviceDetail}><Text style={{ fontWeight: 'bold' }}>Price</Text>: ${item.price}</Text>
														<TouchableOpacity style={style.serviceBook} onPress={() => props.navigation.navigate("booktime", { 
															locationid, scheduleid: item.scheduleid,
															serviceid: item.id, initialize: () => initialize() 
														})}>
															<Text style={style.serviceBookHeader}>Book a time</Text>
														</TouchableOpacity>
													</View>
												</TouchableOpacity>
											}
										/>
									</>
								)}

								{(!showMenus && !showProducts && !showServices) && (
									<Text style={style.noResults}>nothing is here ):</Text>
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

				{openCart && <Modal><Cart navigation={props.navigation} close={() => {
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
				{showInfo.show && (
					<Modal transparent={true}>
						<View style={style.showInfoContainer}>
							<View style={style.showInfoBox}>
								<TouchableOpacity style={style.showInfoClose} onPress={() => setShowinfo({ ...showInfo, show: false })}>
									<AntDesign name="close" size={40}/>
								</TouchableOpacity>

								<View style={style.logoHolder}>
									<Image style={style.logo} source={{ uri: logo_url + showInfo.info.logo }}/>
								</View>
								<Text style={style.showInfoHeader}>{showInfo.info.name}</Text>
								<Text style={style.showInfoHeader}>{showInfo.info.address}</Text>
								<View style={{ alignItems: 'center' }}>
									<View style={{ flexDirection: 'row' }}>
										<TouchableOpacity onPress={() => Linking.openURL('tel://' + showInfo.info.phonenumber)}>
											<AntDesign name="phone" size={30}/>
										</TouchableOpacity>
										<Text style={style.phonenumber}>{showInfo.info.phonenumber}</Text>
									</View>
								</View>
								<Text style={style.showInfoHeader}>{showInfo.info.distance}</Text>
							</View>
						</View>
					</Modal>
				)}
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	boxContainer: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginTop: 20, marginHorizontal: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: fsize(0.05) },

	moreInfo: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, padding: 5, width: 160 },
	moreInfoHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), textAlign: 'center' },

	body: { height: screenHeight - 85 },
	headers: { height: 56 },
	header: { fontSize: fsize(0.05), textAlign: 'center' },
	bodyHeader: { fontSize: fsize(0.05), fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },

	row: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },

	// menu
	menu: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, padding: 2, width: fsize(0.3) },
	menuDisabled: { height: fsize(0.3), width: fsize(0.3) },
	menuImageHolder: { alignItems: 'center', borderRadius: fsize(0.3) / 2, flexDirection: 'column', height: fsize(0.3), justifyContent: 'space-around', overflow: 'hidden', width: fsize(0.3) },
	menuName: { fontSize: fsize(0.03), fontWeight: 'bold', textAlign: 'center' },
	seeMenu: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, padding: 5 },
	seeMenuHeader: { fontSize: fsize(0.05) },

	// product
	product: { alignItems: 'center', marginBottom: 30, marginHorizontal: 10, width: fsize(0.3) },
	productImage: { borderRadius: fsize(0.3) / 2, height: fsize(0.3), width: fsize(0.3) },
	productName: { fontSize: fsize(0.05), fontWeight: 'bold' },
	productInfo: { fontSize: fsize(0.04) },
	productPrice: { fontSize: fsize(0.05), fontWeight: 'bold', marginHorizontal: 10, marginVertical: 5 },
	productBuy: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },
	productBuyHeader: { fontSize: fsize(0.05), textAlign: 'center' },

	// service
	service: { alignItems: 'center', flexDirection: 'row', marginVertical: 30, marginHorizontal: 10 },
	serviceImage: { borderRadius: fsize(0.3) / 2, height: fsize(0.3), width: fsize(0.3) },
	serviceName: { fontSize: fsize(0.04), fontWeight: 'bold', marginBottom: 10 },
	serviceInfo: { fontSize: fsize(0.04), marginBottom: 10 },
	serviceDetail: { fontSize: fsize(0.04), marginBottom: 20 },
	serviceBook: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: fsize(0.35) },
	serviceBookHeader: { fontSize: fsize(0.05) },

	noResults: { fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },

	showInfoContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	showInfoBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '80%' },
	showInfoClose: { alignItems: 'center', borderRadius: 20, borderStyle: 'solid', borderWidth: 2, width: 44 },
	logoHolder: { borderRadius: 50, height: 100, overflow: 'hidden', width: 100 },
	logo: { height: 100, width: 100 },
	showInfoHeader: { fontSize: fsize(0.05), fontWeight: 'bold', margin: 10 },
	phonenumber: { fontSize: fsize(0.05), fontWeight: 'bold', marginHorizontal: 10, marginVertical: 8, textAlign: 'center' },
})
