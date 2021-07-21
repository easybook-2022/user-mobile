import React, { useState, useEffect } from 'react'
import { AsyncStorage, Dimensions, SafeAreaView, View, FlatList, Image, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { logo_url } from '../../../assets/info'
import { getLocationProfile } from '../../apis/locations'
import { getMenus } from '../../apis/menus'
import { getProducts } from '../../apis/products'
import { getServices } from '../../apis/services'
import { getNumCartItems } from '../../apis/carts'

import Cart from '../../components/cart'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')

export default function salonprofile(props) {
	let { locationid } = props.route.params

	const [locationName, setLocationname] = useState('')
	const [address, setAddress] = useState('')
	const [phonenumber, setPhonenumber] = useState('')

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

	const [showMenus, setShowmenus] = useState(false)
	const [menus, setMenus] = useState([])
	const [numMenus, setNummenus] = useState(0)

	const [showProducts, setShowproducts] = useState(false)
	const [products, setProducts] = useState([])
	const [numProducts, setNumproducts] = useState(0)

	const [showServices, setShowservices] = useState(false)
	const [services, setServices] = useState([
		{ key: "r-0", items: [
			{ key: "s-0", image: require("../../../assets/nailsalon/footcare.jpeg"), name: "Foot Care" },
			{ key: "s-1", image: require("../../../assets/nailsalon/footmassage.jpeg"), name: "Foot Massage" }
		]},
		{ key: "r-1", items: [
			{ key: "s-2", image: require("../../../assets/nailsalon/nailenhancement.jpeg"), name: "Nail Enhancement" },
			{ key: "s-3", image: require("../../../assets/nailsalon/handcare.jpeg"), name: "Hand Care" }
		]},
		{ key: "r-2", items: [
			{ key: "s-4", image: require("../../../assets/nailsalon/child.jpeg"), name: "Children 10 years & under" },
			{ key: "s-5", image: require("../../../assets/nailsalon/facial.jpeg"), name: "Facial" }
		]},
		{ key: "r-3", items: [
			{ key: "s-6", image: require("../../../assets/nailsalon/eyelashextensions.jpeg"), name: "Eyelash Extensions" },
			{ key: "s-7", image: require("../../../assets/nailsalon/womenwaxing.jpeg"), name: "Waxing for women" },
			
		]},
		{ key: "r-4", items: [
			{ key: "s-8", image: require("../../../assets/nailsalon/menwaxing.jpeg"), name: "Waxing for men" },
			{ key: "s-9", image: require("../../../assets/nailsalon/relaxingmassages.jpeg"), name: "Relaxing Massages" }
		]},
	])
	const [numServices, setNumservices] = useState(0)

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
					} else if (msg == "services") {
						getAllServices()
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
					setShowservices(true)
				}
			})
	}

	useEffect(() => {
		getTheNumCartItems()
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
							<AntDesign name="phone" size={30}/>
							<Text style={style.phonenumber}>{phonenumber}</Text>
						</View>
					</View>
					<Text style={style.header}>5 km away</Text>
				</View>

				<View>
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
												<Text style={style.itemHeader}>{menu.name}</Text>
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
										{item.items.map(( product, index ) => (
											<TouchableOpacity key={product.key} style={style.item} onPress={() => {}}>
												<View style={style.itemPhotoHolder}>
													<Image source={{ uri: logo_url + product.image }} style={{ height: (width * 0.5) - 100, width: (width * 0.5) - 100 }}/>
												</View>
												<Text style={style.itemHeader}>{product.name}</Text>
											</TouchableOpacity>
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
									<View key={item.key} style={style.row}>
										{item.items.map(( service, index ) => (
											<TouchableOpacity key={service.key} style={style.item} onPress={() => {}}>
												<View style={style.itemPhotoHolder}>
													<Image source={{ uri: logo_url + service.image }} style={{ height: (width * 0.5) - 100, width: (width * 0.5) - 100 }}/>
												</View>
												<Text style={style.itemHeader}>{service.name}</Text>
											</TouchableOpacity>
										))}
									</View>
								}
							/>
						</>
					)}
				</View>

				<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
					<TouchableOpacity style={style.cart} onPress={() => setOpencart(true)}>
						<Entypo name="shopping-cart" size={30}/>
						{numCartItems > 0 && <Text style={style.numCartItemsHeader}>{numCartItems}</Text>}
					</TouchableOpacity>
				</View>
			</View>

			<Modal visible={openCart}><Cart close={() => setOpencart(false)}/></Modal>
		</SafeAreaView>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginHorizontal: 20, marginTop: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	headers: { marginVertical: 20 },
	header: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', marginVertical: 5, paddingHorizontal: 50, textAlign: 'center' },
	phonenumber: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', marginHorizontal: 10, marginVertical: 8, textAlign: 'center' },

	bodyHeader: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },

	item: { alignItems: 'center', height: width * 0.5, width: width * 0.5 },
	itemPhotoHolder: { borderRadius: ((width * 0.5) - 100) / 2, height: (width * 0.5) - 100, overflow: 'hidden', width: (width * 0.5) - 100 },
	itemHeader: { fontFamily: 'appFont', fontSize: 20, marginVertical: 20 },

	cart: { flexDirection: 'row', height: 30, marginVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },
})
