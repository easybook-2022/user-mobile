import React, { useState, useEffect } from 'react'
import { ActivityIndicator, AsyncStorage, Dimensions, View, FlatList, Image, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { logo_url } from '../../assets/info'
import { getInfo } from '../apis/locations'
import { getMenus } from '../apis/menus'
import { getProducts } from '../apis/products'
import { getServices } from '../apis/services'
import { getNumCartItems } from '../apis/carts'

import Cart from '../components/cart'

import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const itemSize = (width / 3) - 20
const imageSize = itemSize - 30

export default function menu(props) {
	let { locationid, menuid } = props.route.params

	const [menuName, setMenuname] = useState('')
	const [menuInfo, setMenuinfo] = useState('')

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
	const getTheNumCartItems = async() => {
		const userid = await AsyncStorage.getItem("userid")

		getNumCartItems(userid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setNumcartitems(res.numCartItems)
				}
			})
	}
	
	const getTheInfo = async() => {
		const data = { locationid, menuid }

		getInfo(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { msg, menuName, menuInfo } = res

					setMenuname(menuName)
					setMenuinfo(menuInfo)

					if (msg == "menus") {
						getAllMenus()
					} else if (msg == "services") {
						getAllServices()
					} else if (msg == "products") {
						getAllProducts()
					}

					setLoaded(true)
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
				if (res) {
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
				if (res) {
					setProducts(res.products)
					setNumproducts(res.numproducts)
					setShowproducts(true)
				}
			})
	}
	const getAllServices = async() => {
		const data = { locationid, menuid }

		getServices(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setServices(res.services)
					setNumservices(res.numservices)
					setShowservices(true)
				}
			})
	}

	useEffect(() => {
		getTheNumCartItems()
		getTheInfo()
	}, [])

	return (
		<View style={style.boxContainer}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
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
										<Text style={style.bodyHeader}>{numMenus} Menu(s)</Text>

										<FlatList
											showsVerticalScrollIndicator={false}
											data={menus}
											renderItem={({ item, index }) => 
												<View key={item.key} style={style.row}>
													{item.items.map(( menu, index ) => (
														menu.name ? 
															<TouchableOpacity key={menu.key} style={style.menu} onPress={() => props.navigation.push("menu", { locationid: locationid, menuid: menu.id })}>
																<View style={style.menuImageHolder}>
																	<Image source={{ uri: logo_url + menu.image }} style={{ height: imageSize, width: imageSize }}/>
																</View>
																<Text style={style.menuName}>({menu.numCategories}) {menu.name}</Text>
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
										<Text style={style.bodyHeader}>{numProducts} Product(s)</Text>

										<FlatList
											showsVerticalScrollIndicator={false}
											data={products}
											renderItem={({ item, index }) => 
												<View style={style.row}>
													{item.row.map(product => (
														product.name ? 
															<TouchableOpacity key={product.key} style={style.product} onPress={() => props.navigation.navigate("itemprofile", { menuid, productid: product.id })}>
																<Image style={style.productImage} source={{ uri: logo_url + product.image }}/>
																<Text style={style.productName}>{product.name}</Text>
																{product.info && <Text style={style.productInfo}>{product.info}</Text>}

																<View style={{ flexDirection: 'row' }}>
																	<Text style={style.productDetail}>{product.price}</Text>
																</View>

																<TouchableOpacity style={style.productBuy} onPress={() => props.navigation.navigate("itemprofile", { menuid, productid: product.id })}>
																	<Text style={style.productBuyHeader}>Buy</Text>
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
												<TouchableOpacity key={item.key} style={style.service} onPress={() => props.navigation.navigate("booktime", { locationid, serviceid: item.id })}>
													<Image style={style.serviceImage} source={{ uri: logo_url + item.image }}/>
													<View style={{ marginLeft: 10, width: (width - imageSize) - 30 }}>
														<Text style={style.serviceName}>{item.name}</Text>
														{item.info ? <Text style={style.serviceInfo}>{item.info}</Text> : null}
														
														<Text style={style.serviceDetail}><Text style={{ fontWeight: 'bold' }}>Price</Text>: ${item.price}</Text>

														<TouchableOpacity style={style.serviceBook} onPress={() => props.navigation.navigate("booktime", { locationid, serviceid: item.id })}>
															<Text>Book a time</Text>
														</TouchableOpacity>
													</View>
												</TouchableOpacity>
											}
										/>
									</>
								)}

								{(!showMenus && !showProducts && !showServices) && (
									<Text style={style.noResults}>There is nothing on this menu</Text>
								)}
							</>
							:
							<ActivityIndicator size="large"/>
						}	
					</View>

					<View style={style.bottomNavs}>
						<TouchableOpacity style={style.bottomNav} onPress={() => props.navigation.navigate("account")}>
							<FontAwesome5 name="user-circle" size={30}/>
						</TouchableOpacity>
						<TouchableOpacity style={style.bottomNav} onPress={() => props.navigation.navigate("recent")}>
							<FontAwesome name="history" size={30}/>
						</TouchableOpacity>
						<TouchableOpacity style={style.bottomNav} onPress={() => setOpencart(true)}>
							<Entypo name="shopping-cart" size={30}/>
							{numCartItems > 0 && <Text style={style.numCartItemsHeader}>{numCartItems}</Text>}
						</TouchableOpacity>
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
							AsyncStorage.clear()

							props.navigation.dispatch(
								CommonActions.reset({
									index: 1,
									routes: [{ name: 'login' }]
								})
							);
						}}>
							<Text style={style.bottomNavHeader}>Log-Out</Text>
						</TouchableOpacity>
					</View>
				</View>

				<Modal visible={openCart}><Cart close={() => setOpencart(false)}/></Modal>
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	boxContainer: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 30, marginTop: 20, marginHorizontal: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },

	body: { height: screenHeight - 110 },
	headers: { height: 56 },
	header: { fontSize: 20, textAlign: 'center' },
	bodyHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },

	row: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },

	// menu
	menu: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, flexDirection: 'column', height: itemSize, justifyContent: 'space-between', padding: 2, width: itemSize },
	menuDisabled: { height: itemSize, width: itemSize },
	menuImageHolder: { alignItems: 'center', borderRadius: imageSize / 2, flexDirection: 'column', height: imageSize, justifyContent: 'space-around', overflow: 'hidden', width: imageSize },
	menuName: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },

	// product
	product: { alignItems: 'center', height: itemSize, marginBottom: 50, marginHorizontal: 10, width: itemSize },
	productImage: { borderRadius: imageSize / 2, height: imageSize, width: imageSize },
	productName: { fontSize: 20, fontWeight: 'bold' },
	productInfo: { fontSize: 15 },
	productDetail: { fontSize: 15, marginHorizontal: 10, marginVertical: 5 },
	productBuy: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 50 },
	productBuyHeader: { textAlign: 'center' },

	// service
	service: { alignItems: 'center', flexDirection: 'row', marginBottom: 50, marginHorizontal: 10 },
	serviceImage: { borderRadius: imageSize / 2, height: imageSize, width: imageSize },
	serviceName: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
	serviceInfo: { fontSize: 15, marginBottom: 10 },
	serviceDetail: { fontSize: 15 },
	serviceBook: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },

	noResults: { fontWeight: '100', marginVertical: 100, textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },
})
