import React, { useState, useEffect } from 'react';
import { AsyncStorage, Dimensions, SafeAreaView, View, FlatList, Image, Text, TouchableOpacity, Linking, StyleSheet, Modal } from 'react-native';
import { logo_url } from '../../../assets/info'
import { getLocationProfile } from '../../apis/locations'
import { getMenus } from '../../apis/menus'
import { getProducts } from '../../apis/products'
import { getNumCartItems } from '../../apis/carts'

import Cart from '../../components/cart'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const itemSize = (width * 0.3) - 10
const imageSize = (width * 0.3) - 50

export default function restaurantprofile(props) {
	let { locationid } = props.route.params

	const [locationName, setLocationname] = useState('')
	const [address, setAddress] = useState('')
	const [phonenumber, setPhonenumber] = useState('')

	const [showMenus, setShowmenus] = useState(true)
	const [menus, setMenus] = useState([])
	const [numMenus, setNummenus] = useState(0)

	const [showProducts, setShowproducts] = useState(false)
	const [products, setProducts] = useState([])
	const [numProducts, setNumproducts] = useState(0)

	const [showSpecials, setShowspecials] = useState(false)
	const [specials, setSpecials] = useState([
		{ key: "row-0", row: [
			{ key: "product-0", id: '1v99d-sd9d9s999d9d', name: 'roasted milk tea special', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-1", id: '1v99d-sd9d9s999d9d', name: 'roasted milk tea special', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-2", id: '1v99d-sd9d9s999d9d', name: 'roasted milk tea special', image: { photo: '', width: 0, height: 0 } }
		]},
		{ key: "row-1", row: [
			{ key: "product-3", id: '1v99d-sd9d9s999d9d', name: 'roasted milk tea special', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-4", id: '1v99d-sd9d9s999d9d', name: 'roasted milk tea special', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-5", id: '1v99d-sd9d9s999d9d', name: 'roasted milk tea special', image: { photo: '', width: 0, height: 0 } }
		]},
		{ key: "row-2", row: [
			{ key: "product-6", id: '1v99d-sd9d9s999d9d', name: 'roasted milk tea special', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-7", id: '1v99d-sd9d9s999d9d', name: 'roasted milk tea special', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-8", id: '1v99d-sd9d9s999d9d', name: 'roasted milk tea special', image: { photo: '', width: 0, height: 0 } }
		]},
		{ key: "row-3", row: [
			{ key: "product-9", id: '1v99d-sd9d9s999d9d', name: 'roasted milk tea special', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-10", id: '1v99d-sd9d9s999d9d', name: 'roasted milk tea special', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-11", id: '1v99d-sd9d9s999d9d', name: 'roasted milk tea special', image: { photo: '', width: 0, height: 0 } }
		]},
		{ key: "row-4", row: [
			{ key: "product-12", id: '1v99d-sd9d9s999d9d', name: 'roasted milk tea special', image: { photo: '', width: 0, height: 0 } }
		]}
	])
	const [numSpecials, setNumspecials] = useState(0)

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
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, locationid }

		getLocationProfile(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { locationInfo, msg } = res
					const { name, addressOne, addressTwo, city, province, postalcode, phonenumber, longitude, latitude } = locationInfo
					const address = addressOne + " " + addressTwo + ", " + city + " " + province + ", " + postalcode

					setLocationname(name)
					setAddress(address)
					setPhonenumber(phonenumber)

					if (msg == "menus") {
						getAllMenus()
					} else if (msg == "products") {
						getAllProducts()
					}
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

	useEffect(() => {
		getTheNumCartItems
		getTheLocationProfile()
	}, [])

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>
				<View style={style.headers}>
					<Text style={style.header}>{locationName}</Text>
					<Text style={style.header}>{address}</Text>
					<View style={{ alignItems: 'center' }}>
						<View style={{ flexDirection: 'row' }}>
							<TouchableOpacity onPress={() => Linking.openURL('tel://' + phonenumber)}>
								<AntDesign name="phone" size={30}/>
							</TouchableOpacity>
							<Text style={style.phonenumber}>{phonenumber}</Text>
						</View>
					</View>
					<Text style={style.header}>5 km away</Text>
				</View>

				<View style={style.navs}>
					<View style={{ flexDirection: 'row' }}>
						<TouchableOpacity style={style.nav} onPress={() => {}}>
							<Text>menu ({numMenus})</Text>
						</TouchableOpacity>
						<TouchableOpacity style={style.nav} onPress={() => {}}>
							<Text>specials ({numSpecials})</Text>
						</TouchableOpacity>
						<TouchableOpacity style={style.nav} onPress={() => props.navigation.navigate("makereservation", { locationid })}>
							<Text>Make a reserve</Text>
						</TouchableOpacity>
					</View>
				</View>

				{showMenus && (
					<FlatList
						showsVerticalScrollIndicator={false}
						style={{ marginHorizontal: 20, marginTop: 20 }}
						data={menus}
						renderItem={({ item, index }) => 
							<View key={item.key} style={style.row}>
								{item.row.map(( menu, index ) => (
									menu.name ? 
										<TouchableOpacity key={menu.key} style={style.item} onPress={() => props.navigation.navigate("menu", { locationid: locationid, menuid: menu.id })}>
											<View style={style.itemImageHolder}>
												<Image source={{ uri: logo_url + menu.image }} style={{ height: imageSize, width: imageSize }}/>
											</View>
											<Text style={style.itemName}>{menu.name}</Text>
										</TouchableOpacity>
										:
										<View key={menu.key} style={style.itemDisabled}></View>
								))}
							</View>
						}i
					/>
				)}

				{showProducts && (
					<FlatList
						showsVerticalScrollIndicator={false}
						data={products}
						style={{ height: height - 386 }}
						renderItem={({ item, index }) => 
							<View key={item.key} style={style.row}>
								{item.row.map(product => (
									product.name ? 
										<View key={product.key} style={style.product}>
											<Image style={style.productImage} source={{ uri: logo_url + product.image }}/>
											<Text style={style.productName}>{product.name}</Text>
											{product.info && <Text style={style.productInfo}>{product.info}</Text>}

											<View style={{ flexDirection: 'row' }}>
												<Text style={style.productDetail}>{product.price}</Text>
											</View>

											<TouchableOpacity style={style.productBuy} onPress={() => props.navigation.navigate("itemprofile", { locationid, menuid: "", productid: product.id })}>
												<Text style={style.productBuyHeader}>Buy</Text>
											</TouchableOpacity>
										</View>
										:
										<View key={product.key} style={style.product}></View>
								))}
							</View>
						}
					/>
				)}

				{showSpecials && (
					<FlatList
						showsVerticalScrollIndicator={false}
						style={{ height: height - 100, margin: 20 }}
						data={specials}
						renderItem={({ item, index }) => 
							<View key={item.key} style={style.row}>
								{item.row.map(( item, index ) => (
									item.name ? 
										<TouchableOpacity key={item.key} style={style.item} onPress={() => props.navigation.navigate("itemprofile", { id: item.id, name: item.name })}>
											<View style={style.itemImageHolder}>
												<Image source={require("../../../assets/product-image.png")} style={{ height: imageSize, width: imageSize }}/>
											</View>
											<Text style={style.itemName}>{item.name}</Text>
										</TouchableOpacity>
										:
										<View key={item.key} style={style.itemDisabled}></View>
								))}
							</View>
						}
					/>
				)}

				<View style={style.bottomNavs}>
					<TouchableOpacity style={style.bottomNav} onPress={() => setOpencart(true)}>
						<Entypo name="shopping-cart" size={30}/>
						{numCartItems > 0 && <Text style={style.numCartItemsHeader}>{numCartItems}</Text>}
					</TouchableOpacity>
				</View>
			</View>

			<Modal visible={openCart}><Cart close={() => setOpencart(false)}/></Modal>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	headers: { margin: 20 },
	header: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', marginVertical: 5, textAlign: 'center' },
	phonenumber: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', marginHorizontal: 10, marginVertical: 8, textAlign: 'center' },

	navs: { flexDirection: 'row', justifyContent: 'space-around' },
	nav: { alignItems: 'center', backgroundColor: 'white', borderRadius: 8, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, padding: 5, width: 100 },

	row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, width: '100%' },
	item: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, flexDirection: 'column', height: itemSize, justifyContent: 'space-between', padding: 2, width: itemSize },
	itemDisabled: { height: itemSize, width: itemSize },
	itemImageHolder: { alignItems: 'center', borderRadius: imageSize / 2, flexDirection: 'column', height: imageSize, justifyContent: 'space-around', overflow: 'hidden', width: imageSize },
	itemName: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },

	// product
	product: { alignItems: 'center', marginBottom: 50, marginHorizontal: 10 },
	productImage: { borderRadius: imageSize / 2, height: imageSize, width: imageSize },
	productName: { fontSize: 20, fontWeight: 'bold' },
	productInfo: { fontSize: 15 },
	productDetail: { fontSize: 15, marginHorizontal: 10, marginVertical: 5 },
	productBuy: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 50 },
	productBuyHeader: { textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },
})
