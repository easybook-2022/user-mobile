import React, { useState, useEffect } from 'react'
import { AsyncStorage, Dimensions, SafeAreaView, View, FlatList, Image, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { logo_url } from '../../../assets/info'
import { getInfo } from '../../apis/locations'
import { getMenus } from '../../apis/menus'
import { getProducts } from '../../apis/products'
import { getServices } from '../../apis/services'
import { getNumCartItems } from '../../apis/carts'

import Cart from '../../components/cart'

import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const imageSize = (width / 3) - 10

const items = {
	"Foot Care": [
		{ 
			key: "s-0", name: "Add On Shellac", 
			price: "$15"
		},
		{ 
			key: "s-1", name: "Shellac Removal", 
			price: "$10"
		},
		{ 
			key: "s-2", name: "Shellac Color Only", 
			price: "$25 +"
		},
		{ 
			key: "s-3", 
			name: "Express Pedicure", time: { month: "", week: "", day: "", hour: "", minute: "30" }, 
			info: "Includes warm whirlpool soak, color removal, trimming and shaping nails, cuticles care and regular polish.", 
			price: "$30 +"
		},
		{ 
			key: "s-4", 
			name: "Spa Pedicure", time: { month: "", week: "", day: "", hour: "", minute: "35" }, 
			info: "Includes warm whirlpool soak with Rock Sea Salt, nails, cuticles & callous care, a mini massage with oil, hot towel wrap, and application of regular polish. \n\n Add Paraffin:...", 
			price: "$45 +"
		},
		{
			key: "s-5",
			name: "Deluxe Pedicure", time: { month: "", week: "", day: "", hour: "", minute: "45" },
			info: "Includes warm whirlpool soak with Foaming Flower Soap; nails, cuticles & callous care, relaxing lotion massage, paraffin, and mint mask, finishing with hot towel wrap and regular polish.", 
			price: "$59 +"
		},
		{
			key: "s-6",
			name: "The One Lavender Pedicure", time: { month: "", week: "", day: "", hour: "", minute: "55" },
			info: "Enjoy the relaxing and anti-stress benefits of Lavender. This treatment starts with a gentle exfoliation consisting of Lavender Salt and scrubs to remove dry skin and improve skin's texture. The feet are wrapped in Lavender paraffin & a mask. Regular polish is included.", 
			price: "$69 +"
		},
		{
			key: "s-7",
			name: "The One Jell-ous Feet Treat", time: { month: "", week: "", day: "", hour: "", minute: "60" },
			info: "Translucent fluffy jelly provides the ultimate relief for stress and aching muscles. Exfoliates and hydrates dry skin.", 
			price: "$79 +"
		},
		{
			key: "s-8",
			name: "The One Organic Pedicure", time: { month: "", week: "", day: "", hour: "", minute: "60" },
			info: "Designed to brighten & lighten skin tone for a flawless, porcelain finish without the use of dangerous chemicals in purely natural & organic treatment. \n\n Your choice of fresh lemon & ginger/orange & ginger", 
			price: "$89 +"
		}
	],
	"Foot Massage": [
		{ key: "s-0", time: { month: "", week: "", day: "", hour: "", minute: "10" }, price: "$20" },
		{ key: "s-1", time: { month: "", week: "", day: "", hour: "", minute: "20" }, price: "$30" },
		{ key: "s-2", time: { month: "", week: "", day: "", hour: "", minute: "15" }, price: "$25" },
	],
	"Nail Enhancement": [
		{ key: "s-0", name: "Manicure", price: "$10" },
		{ key: "s-1", name: "Repair 1 Nails", price: "$5" },
		{ key: "s-2", name: "Change Shape", price: "$10" },
		{ key: "s-3", name: "Dip Overlay", price: "$40 +" },
		{ key: "s-4", name: "Dip Overlay Full Set", price: "$45 +" },
		{ key: "s-5", name: "Dip Overlay Fill in", price: "$40 +" },
		{ key: "s-6", name: "Acrylic Full Set", price: "$35 +" },
		{ key: "s-7", name: "Acrylic Fill in", price: "$30 +" },
		{ key: "s-8", name: "UV Gel Full Set", price: "$45 +" },
		{ key: "s-9", name: "UV Gel Fill in", price: "$40" },
		{ key: "s-10", name: "Bio Gel Overlay", price: "$45" },
		{ key: "s-11", name: "Bio Gel Full Set", price: "$50" },
		{ key: "s-12", name: "Bio Gel Fill in", price: "$40" }
	],
	"Hand Care": [
		{ key: "s-0", name: "Shellac Removal only", price: "$10" },
		{ key: "s-1", name: "Shellac Color Only", price: "$20 +" },
		{ key: "s-2", name: "Shellac Removal", price: "$10" },
		{ key: "s-3", name: "Express Manicure", price: "$30 +" },
	],
	"Children 10 years & under": [
		{ key: "s-0", name: "Manicure", price: "$10" },
		{ key: "s-1", name: "Pedicure", price: "$20 +" },
		{ key: "s-2", name: "Combo", price: "$10" }
	],
	"Facial": [
		{ key: "s-0", name: "Basic Facial", price: "$50 +" },
		{ key: "s-1", name: "Deep Cleaning", price: "$65 +" },
		{ key: "s-2", name: "Teen Facial", price: "$40" },
		{ key: "s-3", name: "Acne Facial Treatment", price: "$75 +" },
		{ key: "s-4", name: "Aqua Peeling Head", price: "$20 +" },
		{ key: "s-5", name: "RF Eyes Pen", price: "$10 +" },
		{ key: "s-6", name: "Oxygen Spayer", price: "$15 +" },
	],
	"Eyelash Extensions": [
		{ key: "s-0", name: "Single Mink Lashes", price: "$145 +" },
		{ key: "s-1", name: "Refill", time: { month: "", week: "2", day: "", hour: "", minute: "" }, price: "$60 +" },
	],

	"Waxing for women": [
		{ key: "s-0", name: "Bikini Line", price: "$25 +" },
		{ key: "s-1", name: "Brazilian", price: "$45 +" },
		{ key: "s-2", name: "Eyebrow", price: "$9 +" },
		{ key: "s-3", name: "Lip", price: "$6" },
		{ key: "s-4", name: "Chin", price: "$9" },
		{ key: "s-5", name: "Full Face", price: "$35" },
		{ key: "s-6", name: "Sideburns", price: "$12 +" },
		{ key: "s-7", name: "Half Arms", price: "$25" },
		{ key: "s-8", name: "Full Arms", price: "$35 +" },
		{ key: "s-9", name: "Half Leg", price: "$25 +" },
		{ key: "s-10", name: "Full Legs", price: "$45 +" },
		{ key: "s-11", name: "Under arms", price: "$20 +" },
		{ key: "s-12", name: "Threading Eyebrow", price: "$10" }
	],
	"Waxing for men": [
		{ key: "s-0", name: "Back", price: "$50" },
		{ key: "s-1", name: "Chest", price: "$35" },
	],
	"Relaxing Massages": [
		{ key: "s-0", name: "Half Body 30 Mins", price: "$45" },
		{ key: "s-1", name: "Full Body Massage 60 Mins", price: "$70" },
		{ key: "s-2", name: "Hot Stone Massage 30 Mins", price: "$50" },
		{ key: "s-3", name: "Hot Stone Massage 60 Mins", price: "$90" },
		{ key: "s-4", name: "Leg Massage 20 Mins", price: "$30" },
		{ key: "s-5", name: "Shoulders & Neck 30 Mins", price: "$45" },
		{ key: "s-6", name: "Foot Massage 20 Mins", price: "$30" },
	]
}

export default function menu(props) {
	let { locationid, menuid } = props.route.params

	const [menuName, setMenuname] = useState('')

	const [showMenus, setShowmenus] = useState(false)
	const [menus, setMenus] = useState([])
	const [numMenus, setNummenus] = useState(0)

	const [showProducts, setShowproducts] = useState(false)
	const [products, setProducts] = useState([])
	const [numProducts, setNumproducts] = useState(0)

	const [showServices, setShowservices] = useState(false)
	const [services, setServices] = useState([])
	const [numServices, setNumservices] = useState(0)

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
					const { msg, menuName } = res

					setMenuname(menuName)

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
		const data = { locationid, parentmenuid: menuid }

		getMenus(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setMenus(res.menus)
					setNummenus(res.nummenus)
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
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>

				<View>
					{showMenus && (
						<>
							<Text style={style.bodyHeader}>{numMenus} Menu(s)</Text>
						</>
					)}

					{showProducts && (
						<>
							<Text style={style.bodyHeader}>{numProducts} Product(s)</Text>

							<FlatList
								data={products}
								style={{ height: height - 269 }}
								renderItem={({ item, index }) => 
									<View style={{ flexDirection: 'row' }}>
										{item.row.map(product => (
											product.name ? 
												<View key={product.key} style={style.product}>
													<Image style={style.productImage} source={{ uri: logo_url + product.image }}/>
													<Text style={style.productName}>{product.name}</Text>
													{product.info && <Text style={style.productInfo}>{product.info}</Text>}

													<View style={{ flexDirection: 'row' }}>
														<Text style={style.productDetail}>{product.price}</Text>
													</View>

													<TouchableOpacity style={style.productBuy} onPress={() => props.navigation.navigate("itemprofile", { locationid, menuid, productid: product.id })}>
														<Text style={style.productBuyHeader}>Buy</Text>
													</TouchableOpacity>
												</View>
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
								data={services}
								style={{ height: height - 269 }}
								renderItem={({ item, index }) => 
									<View key={item.key} style={style.service}>
										<Image style={style.serviceImage} source={{ uri: logo_url + item.image }}/>
										<View style={{ marginLeft: 10, width: (width - imageSize) - 30 }}>
											<Text style={style.serviceName}>{item.name}</Text>
											{item.info || 'dsjfksldjfsldkfjdslf' ? <Text style={style.serviceInfo}>{item.info}sdfjlsdk fjlksadfjladsjf ldsajf ladsfjadlsfjldas;fj</Text> : null}

											<Text style={style.serviceDetail}><Text style={{ fontWeight: 'bold' }}>Price</Text>: ${item.price}</Text>
											<Text style={style.serviceDetail}>{JSON.stringify(item.time)}</Text>

											<TouchableOpacity style={style.serviceBook} onPress={() => props.navigation.navigate("booktime", { locationid, menuid, serviceid: item.id })}>
												<Text>Book a time</Text>
											</TouchableOpacity>
										</View>
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
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },

	bodyHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },

	// product
	product: { alignItems: 'center', marginBottom: 50, marginHorizontal: 10 },
	productImage: { borderRadius: imageSize / 2, height: imageSize, width: imageSize },
	productName: { fontSize: 20, fontWeight: 'bold' },
	productInfo: { fontSize: 15 },
	productDetail: { fontSize: 15, marginHorizontal: 10, marginVertical: 5 },
	productBuy: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 50 },
	productBuyHeader: { textAlign: 'center' },

	service: { alignItems: 'center', flexDirection: 'row', marginBottom: 50, marginHorizontal: 10 },
	serviceImage: { borderRadius: 50, height: 100, width: 100 },
	serviceName: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
	serviceInfo: { fontSize: 15, marginBottom: 10 },
	serviceDetail: { fontSize: 15 },
	serviceBook: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },

	cart: { flexDirection: 'row', height: 30, marginVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },
})
