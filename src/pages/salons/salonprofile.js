import React, { useState, useEffect } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, View, FlatList, Image, Text, TouchableOpacity, Linking, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { logo_url } from '../../../assets/info'
import { getLocationProfile } from '../../apis/locations'
import { getMenus } from '../../apis/menus'
import { getProducts } from '../../apis/products'
import { getServices } from '../../apis/services'
import { getNumCartItems } from '../../apis/carts'

import Cart from '../../components/cart'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const imageSize = (width / 3) - 10

export default function salonprofile(props) {
	let { locationid, refetch } = props.route.params

	const [logo, setLogo] = useState('')
	const [name, setName] = useState('')
	const [address, setAddress] = useState('')
	const [phonenumber, setPhonenumber] = useState('')
	const [distance, setDistance] = useState(0)

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

					setLoaded(true)
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
				if (res) {
					let data = res.menus
					let row = [], column = []
					let rownum = 0

					data.forEach(function (menu, index) {
						row.push(menu)

						if (row.length == 2 || (data.length - 1 == index && row.length > 0)) {
							column.push({ key: "r-" + rownum, items: row })
							row = []
							rownum++
						}
					})

					setMenus(column)
					setNummenus(data.length)
					setShowmenus(true)
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
				if (res) {
					setProducts(res.products)
					setNumproducts(res.numproducts)
					setShowproducts(true)
				}
			})
	}
	const getAllServices = async() => {
		const data = { locationid, menuid: "" }

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
		getTheLocationProfile()
	}, [])

	return (
		<View style={style.salonprofile}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<View style={style.profileInfo}>
						<TouchableOpacity style={style.back} onPress={() => {
							refetch()
							props.navigation.goBack()
						}}>
							<Text style={style.backHeader}>Back</Text>
						</TouchableOpacity>
						
						{loaded ? 
							<View style={style.headers}>
								<View style={style.logoHolder}>
									<Image style={style.logo} source={{ uri: logo_url + logo }}/>
								</View>
								<Text style={style.header}>{name}</Text>
								<Text style={style.header}>{address}</Text>
								<View style={{ alignItems: 'center' }}>
									<View style={{ flexDirection: 'row' }}>
										<TouchableOpacity onPress={() => Linking.openURL('tel://' + phonenumber)}>
											<AntDesign name="phone" size={30}/>
										</TouchableOpacity>
										<Text style={style.phonenumber}>{phonenumber}</Text>
									</View>
								</View>
								<Text style={style.header}>{distance}</Text>
							</View>
						: null }
					</View>
					
					<View style={style.body}>
						{loaded ? 
							<>
								{showMenus && (
									<>
										<Text style={style.bodyHeader}>{numMenus} Menu(s)</Text>

										<FlatList
											showsVerticalScrollIndicator={false}
											data={menus}
											style={{ height: height - 386 }}
											renderItem={({ item, index }) => 
												<View key={item.key} style={style.row}>
													{item.items.map(( menu, index ) => (
														<TouchableOpacity key={menu.key} style={style.item} onPress={() => props.navigation.navigate("menu", { locationid: locationid, menuid: menu.id })}>
															<View style={style.itemPhotoHolder}>
																<Image source={{ uri: logo_url + menu.image }} style={{ height: (width * 0.5) - 100, width: (width * 0.5) - 100 }}/>
															</View>
															<Text style={style.itemHeader}>{menu.name} ({menu.numCategories})</Text>
														</TouchableOpacity>
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
											style={{ height: height - 386 }}
											renderItem={({ item, index }) => 
												<View key={item.key} style={style.row}>
													{item.row.map(product => (
														product.name ? 
															<TouchableOpacity key={product.key} style={style.product} onPress={() => props.navigation.navigate("itemprofile", { menuid: "", productid: product.id })}>
																<Image style={style.productImage} source={{ uri: logo_url + product.image }}/>
																<Text style={style.productName}>{product.name}</Text>
																
																{product.info && <Text style={style.productInfo}>{product.info}</Text>}

																<View style={{ flexDirection: 'row' }}>
																	<Text style={style.productDetail}>{product.price}</Text>
																</View>

																<TouchableOpacity style={style.productBuy} onPress={() => props.navigation.navigate("itemprofile", { menuid: "", productid: product.id })}>
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
											style={{ height: height - 386 }}
											renderItem={({ item, index }) => 
												<TouchableOpacity key={item.key} style={style.service} onPress={() => props.navigation.navigate("booktime", { locationid, menuid: "", serviceid: item.id })}>
													<Image style={style.serviceImage} source={{ uri: logo_url + item.image }}/>
													<View style={{ marginLeft: 10, width: (width - imageSize) - 30 }}>
														<Text style={style.serviceName}>{item.name}</Text>
														{item.info ? <Text style={style.serviceInfo}>{item.info}</Text> : null}

														<Text style={style.serviceDetail}><Text style={{ fontWeight: 'bold' }}>Price</Text>: ${item.price}</Text>
														<Text style={style.serviceDetail}>{JSON.stringify(item.time)}</Text>

														<TouchableOpacity style={style.serviceBook} onPress={() => props.navigation.navigate("booktime", { locationid, menuid: "", serviceid: item.id })}>
															<Text>Book a time</Text>
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
	salonprofile: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	profileInfo: { height: 180 },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 30, marginHorizontal: 20, marginTop: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },

	header: { fontFamily: 'appFont', fontSize: 15, fontWeight: 'bold', marginVertical: 5, paddingHorizontal: 50, textAlign: 'center' },
	phonenumber: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', marginHorizontal: 10, marginVertical: 8, textAlign: 'center' },

	body: { flexDirection: 'column', height: screenHeight - 220, justifyContent: 'space-around' },
	bodyHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },

	item: { alignItems: 'center', height: width * 0.5, width: width * 0.5 },
	itemPhotoHolder: { borderRadius: ((width * 0.5) - 100) / 2, height: (width * 0.5) - 100, overflow: 'hidden', width: (width * 0.5) - 100 },
	itemHeader: { fontFamily: 'appFont', fontSize: 20, marginVertical: 20 },

	// product
	product: { alignItems: 'center', marginBottom: 50, marginHorizontal: 10 },
	productImage: { borderRadius: imageSize / 2, height: imageSize, width: imageSize },
	productName: { fontSize: 20, fontWeight: 'bold' },
	productInfo: { fontSize: 15 },
	productDetail: { fontSize: 15, marginHorizontal: 10, marginVertical: 5 },
	productBuy: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 50 },
	productBuyHeader: { textAlign: 'center' },

	// service
	service: { alignItems: 'center', flexDirection: 'row', marginBottom: 50, marginHorizontal: 10 },
	serviceImage: { borderRadius: 50, height: 100, width: 100 },
	serviceName: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
	serviceInfo: { fontSize: 15, marginBottom: 10 },
	serviceDetail: { fontSize: 15 },
	serviceBook: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },
})
