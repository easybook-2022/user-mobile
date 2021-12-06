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
const itemSize = (width / 3) - 20
const imageSize = itemSize - 30

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

	const [showMenus, setShowmenus] = useState(true)
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
					let data = res.menus
					let row = [], column = []
					let rownum = 0, key = ""

					data.forEach(function (menu, index) {
						row.push(menu)
						key = parseInt(menu.key.replace("menu-", ""))

						if (row.length == 3 || (data.length - 1 == index && row.length > 0)) {
							if (data.length - 1 == index && row.length > 0) {
								let leftover = 3 - row.length

								for (let k = 0; k < leftover; k++) {
									key++
									row.push({ key: "menu-" + key })
								}
							}

							column.push({ key: "row-" + rownum, row: row })
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
									<View style={style.logoHolder}>
										<Image style={style.logo} source={{ uri: logo_url + logo }}/>
									</View>
									<Text style={style.header}>{name}</Text>
									<Text style={style.header}>{address}</Text>
									<View style={{ alignItems: 'center' }}>
										<View style={{ flexDirection: 'row' }}>
											<TouchableOpacity onPress={() => Linking.openURL('tel://' + phonenumber)}>
												<AntDesign name="phone" size={20}/>
											</TouchableOpacity>
											<Text style={style.phonenumber}>{phonenumber}</Text>
										</View>
									</View>
									<Text style={style.header}>{distance}</Text>
								</View>
								<View style={style.navs}>
									<View style={{ flexDirection: 'row' }}>
										<TouchableOpacity style={style.nav} onPress={() => getAllMenus()}>
											<Text>Menu ({numMenus})</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.nav} onPress={() => props.navigation.navigate("makereservation", { locationid, initialize: () => initialize() })}>
											<Text>Book Table</Text>
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
										style={{ marginHorizontal: 20, marginTop: 20 }}
										data={menus}
										renderItem={({ item, index }) => 
											<View key={item.key} style={style.row}>
												{item.row.map(( menu, index ) => (
													menu.name ? 
														<TouchableOpacity key={menu.key} style={style.menu} onPress={() => props.navigation.navigate("menu", { locationid: locationid, menuid: menu.id, initialize: () => initialize() })}>
															<View style={style.menuImageHolder}>
																<Image source={{ uri: logo_url + menu.image }} style={{ height: imageSize, width: imageSize }}/>
															</View>
															<Text style={style.menuName}>{menu.name} ({menu.numCategories})</Text>
														</TouchableOpacity>
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
										style={{ height: height - 320 }}
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
																	<Text style={style.productDetail}>$ {product.price}</Text>
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

				{openCart && <Modal><Cart close={() => {
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
			</View>
		</View>
	);
}

const style = StyleSheet.create({
	restaurantprofile: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

	profileInfo: { height: 260 },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginTop: 20, marginHorizontal: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	headers: { alignItems: 'center' },
	logoHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	logo: { height: 50, width: 50 },
	header: { fontFamily: 'appFont', fontSize: 13, fontWeight: 'bold', marginVertical: 5 },
	phonenumber: { fontFamily: 'appFont', fontSize: 13, fontWeight: 'bold', marginHorizontal: 10, marginVertical: 8 },

	navs: { flexDirection: 'row', justifyContent: 'space-around' },
	nav: { alignItems: 'center', backgroundColor: 'white', borderRadius: 8, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, padding: 5, width: 100 },

	body: { flexDirection: 'column', height: screenHeight - 300, justifyContent: 'space-around' },
	row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, width: '100%' },
	menu: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, flexDirection: 'column', height: itemSize, justifyContent: 'space-between', padding: 2, width: itemSize },
	menuDisabled: { height: itemSize, width: itemSize },
	menuImageHolder: { alignItems: 'center', borderRadius: imageSize / 2, flexDirection: 'column', height: imageSize, justifyContent: 'space-around', overflow: 'hidden', width: imageSize },
	menuName: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },

	// product
	product: { alignItems: 'center', marginBottom: 50, marginHorizontal: 10, width: itemSize },
	productImage: { borderRadius: imageSize / 2, height: imageSize, width: imageSize },
	productName: { fontSize: 15, fontWeight: 'bold' },
	productInfo: { fontSize: 15 },
	productDetail: { fontSize: 15, margin: 5 },
	productBuy: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 50 },
	productBuyHeader: { textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, justifyContent: 'space-around', marginVertical: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },
})
