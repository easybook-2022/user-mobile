import React, { useState, useEffect, useRef } from 'react'
import { ActivityIndicator, Dimensions, View, FlatList, Image, Text, TouchableOpacity, Linking, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { logo_url } from '../../../assets/info'
import { getLocationProfile } from '../../apis/locations'
import { getMenus } from '../../apis/menus'
import { getProducts } from '../../apis/products'
import { getServices } from '../../apis/services'
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
					} else if (msg == "services") {
						getAllServices()
					} else if (msg == "products") {
						getAllProducts()
					}
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
					
				} else {
					alert("an error has occurred in server")
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
					
				} else {
					alert("an error has occurred in server")
				}
			})
	}
	const getAllServices = async() => {
		const data = { userid: userId, locationid, menuid: "" }

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
					
				} else {
					alert("an error has occurred in server")
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
		<View style={style.salonprofile}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<View style={style.profileInfo}>
						<TouchableOpacity style={style.back} onPress={() => {
							if (refetch) {
								refetch()
							}
							
							props.navigation.goBack()
						}}>
							<Text allowFontScaling={false} style={style.backHeader}>Back</Text>
						</TouchableOpacity>
					</View>
					
					<View style={style.body}>
						{loaded ? 
							<>
								{showMenus && (
									<>
										<View style={{ alignItems: 'center' }}>
											<TouchableOpacity style={style.moreInfo} onPress={() => setShowinfo(true)}>
												<Text allowFontScaling={false} style={style.moreInfoHeader}>View Salon Info</Text>
											</TouchableOpacity>
											<Text allowFontScaling={false} style={style.bodyHeader}>{numMenus} Menu(s)</Text>
										</View>

										<FlatList
											showsVerticalScrollIndicator={false}
											data={menus}
											style={{ height: height - 386 }}
											renderItem={({ item, index }) => 
												<View key={item.key} style={style.row}>
													{item.row.map(menu => (
														menu.id ? 
															<View key={menu.key} style={style.item}>
																<View style={style.itemPhotoHolder}>
																	<Image source={{ uri: logo_url + menu.image }} style={{ height: fsize(0.3), width: fsize(0.3) }}/>
																</View>
																<Text allowFontScaling={false} style={style.itemHeader}>{menu.name}</Text>
																<Text allowFontScaling={false} style={style.itemNumCatHeader}>{menu.numCategories} service(s)</Text>
																<TouchableOpacity style={style.seeMenu} onPress={() => props.navigation.navigate("menu", { locationid: locationid, menuid: menu.id, initialize: () => initialize() })}>
																	<Text allowFontScaling={false} style={style.seeMenuHeader}>See Menu</Text>
																</TouchableOpacity>
															</View>
															:
															<View key={menu.key} style={style.item}></View>
													))}
												</View>
											}
										/>
									</>
								)}

								{showProducts && (
									<>
										<View style={{ alignItems: 'center' }}>
											<TouchableOpacity style={style.moreInfo} onPress={() => setShowinfo(true)}>
												<Text allowFontScaling={false} style={style.moreInfoHeader}>More Info</Text>
											</TouchableOpacity>
											<Text allowFontScaling={false} style={style.bodyHeader}>{numProducts} Product(s)</Text>
										</View>

										<FlatList
											showsVerticalScrollIndicator={false}
											data={products}
											style={{ height: height - 386 }}
											renderItem={({ item, index }) => 
												<View key={item.key} style={style.row}>
													{item.row.map(product => (
														product.name ? 
															<TouchableOpacity key={product.key} style={style.product} onPress={() => props.navigation.navigate("itemprofile", { menuid: "", productid: product.id, initialize: () => initialize() })}>
																<Image style={style.productImage} source={{ uri: logo_url + product.image }}/>
																<Text allowFontScaling={false} style={style.productName}>{product.name}</Text>
																
																{product.info && <Text allowFontScaling={false} style={style.productInfo}>{product.info}</Text>}

																<View style={{ flexDirection: 'row' }}>
																	<Text allowFontScaling={false} style={style.productPrice}>$ {product.price}</Text>
																</View>

																<TouchableOpacity style={style.productBuy} onPress={() => props.navigation.navigate("itemprofile", { menuid: "", productid: product.id, initialize: () => initialize() })}>
																	<Text allowFontScaling={false} style={style.productBuyHeader}>Buy</Text>
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
										<View style={{ alignItems: 'center' }}>
											<TouchableOpacity style={style.moreInfo} onPress={() => setShowinfo(true)}>
												<Text allowFontScaling={false} style={style.moreInfoHeader}>More Info</Text>
											</TouchableOpacity>
											<Text allowFontScaling={false} style={style.bodyHeader}>{numServices} Service(s)</Text>
										</View>

										<FlatList
											showsVerticalScrollIndicator={false}
											data={services}
											style={{ height: height - 386 }}
											renderItem={({ item, index }) => 
												<TouchableOpacity key={item.key} style={style.service} onPress={() => props.navigation.navigate("booktime", { locationid, menuid: "", serviceid: item.id, initialize: () => initialize() })}>
													<Image style={style.serviceImage} source={{ uri: logo_url + item.image }}/>
													<View style={{ marginLeft: 10, width: (width - fsize(0.3)) - 30 }}>
														<Text allowFontScaling={false} style={style.serviceName}>{item.name}</Text>
														{item.info ? <Text allowFontScaling={false} style={style.serviceInfo}>{item.info}</Text> : null}

														<Text allowFontScaling={false} style={style.serviceDetail}><Text allowFontScaling={false} style={{ fontWeight: 'bold' }}>Price</Text>: ${item.price}</Text>
														<Text allowFontScaling={false} style={style.serviceDetail}>{JSON.stringify(item.time)}</Text>

														<TouchableOpacity style={style.serviceBook} onPress={() => props.navigation.navigate("booktime", { locationid, menuid: "", serviceid: item.id, initialize: () => initialize() })}>
															<Text allowFontScaling={false} style={style.serviceBookHeader}>Book a time</Text>
														</TouchableOpacity>
													</View>
												</TouchableOpacity>
											}
										/>
									</>
								)}
							</>
							:
							<ActivityIndicator size="small"/>
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
									{numCartItems > 0 && <Text allowFontScaling={false} style={style.numCartItemsHeader}>{numCartItems}</Text>}
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
								<Text allowFontScaling={false} style={style.bottomNavHeader}>{userId ? 'Log-Out' : 'Log-In'}</Text>
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

								<View style={style.logoHolder}>
									<Image style={style.logo} source={{ uri: logo_url + logo }}/>
								</View>
								<Text allowFontScaling={false} style={style.showInfoHeader}>{name}</Text>
								<Text allowFontScaling={false} style={style.showInfoHeader}>{address}</Text>
								<View style={{ alignItems: 'center' }}>
									<View style={{ flexDirection: 'row' }}>
										<TouchableOpacity onPress={() => Linking.openURL('tel://' + phonenumber)}>
											<AntDesign name="phone" size={30}/>
										</TouchableOpacity>
										<Text allowFontScaling={false} style={style.phonenumber}>{phonenumber}</Text>
									</View>
								</View>
								<Text allowFontScaling={false} style={style.showInfoHeader}>{distance}</Text>
							</View>
						</View>
					</Modal>
				)}
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	salonprofile: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	profileInfo: { height: 55 },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginHorizontal: 20, marginTop: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: fsize(0.05) },

	moreInfo: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, padding: 5, width: 160 },
	moreInfoHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), textAlign: 'center' },

	body: { flexDirection: 'column', height: screenHeight - 85, justifyContent: 'space-around' },
	bodyHeader: { fontSize: fsize(0.05), fontWeight: 'bold', padding: 3, textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },

	item: { alignItems: 'center', height: width * 0.5, marginBottom: 10, width: width * 0.5 },
	itemPhotoHolder: { borderRadius: (fsize(0.3)) / 2, height: fsize(0.3), overflow: 'hidden', width: fsize(0.3) },
	itemHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), marginTop: 20 },
	itemNumCatHeader: { fontFamily: 'appFont', fontSize: fsize(0.04) },
	seeMenu: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, padding: 5 },
	seeMenuHeader: { fontSize: fsize(0.05) },

	// product
	product: { alignItems: 'center', marginBottom: 50, marginHorizontal: 10 },
	productImage: { borderRadius: fsize(0.3) / 2, height: fsize(0.3), width: fsize(0.3) },
	productName: { fontSize: fsize(0.05), fontWeight: 'bold' },
	productInfo: { fontSize: fsize(0.04) },
	productPrice: { fontSize: fsize(0.05), marginHorizontal: 10, marginVertical: 5 },
	productBuy: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },
	productBuyHeader: { fontSize: fsize(0.05), textAlign: 'center' },

	// service
	service: { alignItems: 'center', flexDirection: 'row', marginBottom: 50, marginHorizontal: 10 },
	serviceImage: { borderRadius: 50, height: 100, width: 100 },
	serviceName: { fontSize: fsize(0.04), fontWeight: 'bold', marginBottom: 10 },
	serviceInfo: { fontSize: fsize(0.04), marginBottom: 10 },
	serviceDetail: { fontSize: fsize(0.04) },
	serviceBook: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 150 },
	serviceBookHeader: { fontSize: fsize(0.05) },

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
	showInfoHeader: { fontFamily: 'appFont', fontSize: fsize(0.06), fontWeight: 'bold', marginVertical: 5 },
	phonenumber: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', marginHorizontal: 10, marginVertical: 8, textAlign: 'center' },
})
