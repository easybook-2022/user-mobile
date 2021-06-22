import React, { useState } from 'react';
import { Dimensions, SafeAreaView, View, FlatList, Image, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

import Cart from '../../components/restaurants/cart'

import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const itemSize = (width * 0.3) - 10
const imageSize = (width * 0.3) - 50

export default function locationProfile(props) {
	let { name } = props.route.params

	const [locationName, setLocationname] = useState(name)
	const [address, setAddress] = useState('547 Gerrard St')
	const [viewType, setViewtype] = useState('menu')
	const [menu, setMenu] = useState([
		{ key: "row-0", row: [
			{ key: "product-0", id: '1c828v9s9d-s9d9d8d', name: 'roasted milk tea', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-1", id: '1c828v9s9d-s9d9d8d', name: 'roasted milk tea', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-2", id: '1c828v9s9d-s9d9d8d', name: 'roasted milk tea', image: { photo: '', width: 0, height: 0 } }
		]},
		{ key: "row-1", row: [
			{ key: "product-3", id: '1c828v9s9d-s9d9d8d', name: 'roasted milk tea', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-4", id: '1c828v9s9d-s9d9d8d', name: 'roasted milk tea', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-5", id: '1c828v9s9d-s9d9d8d', name: 'roasted milk tea', image: { photo: '', width: 0, height: 0 } }
		]},
		{ key: "row-2", row: [
			{ key: "product-6", id: '1c828v9s9d-s9d9d8d', name: 'roasted milk tea', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-7", id: '1c828v9s9d-s9d9d8d', name: 'roasted milk tea', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-8", id: '1c828v9s9d-s9d9d8d', name: 'roasted milk tea', image: { photo: '', width: 0, height: 0 } }
		]},
		{ key: "row-3", row: [
			{ key: "product-9", id: '1c828v9s9d-s9d9d8d', name: 'roasted milk tea', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-10", id: '1c828v9s9d-s9d9d8d', name: 'roasted milk tea', image: { photo: '', width: 0, height: 0 } },
			{ key: "product-11", id: '1c828v9s9d-s9d9d8d', name: 'roasted milk tea', image: { photo: '', width: 0, height: 0 } }
		]},
		{ key: "row-4", row: [
			{ key: "product-12", id: '1c828v9s9d-s9d9d8d', name: 'roasted milk tea', image: { photo: '', width: 0, height: 0 } }
		]}
	])
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
	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(2)

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>
				<View style={style.headers}>
					<Text style={style.header}>{locationName}</Text>
					<Text style={style.header}>{address}</Text>
					<Text style={style.header}>5 km away</Text>
				</View>

				<View style={style.navs}>
					<View style={{ flexDirection: 'row' }}>
						<TouchableOpacity style={style.nav} onPress={() => setViewtype('menu')}>
							<Text>menu (34)</Text>
						</TouchableOpacity>
						<TouchableOpacity style={style.nav} onPress={() => setViewtype('specials')}>
							<Text>specials (12)</Text>
						</TouchableOpacity>
					</View>
				</View>

				{viewType == "menu" ? 
					<FlatList
						showsVerticalScrollIndicator={false}
						style={{ marginHorizontal: 20, marginTop: 20 }}
						data={menu}
						renderItem={({ item, index }) => 
							<View key={item.key} style={style.row}>
								{item.row.map(( product, index ) => (
									<TouchableOpacity key={product.key} style={style.product} onPress={() => props.navigation.navigate("itemprofile", { id: product.id })}>
										<View style={style.productImageHolder}>
											<Image source={require("../../../assets/product-image.png")} style={{ height: imageSize, width: imageSize }}/>
										</View>
										<Text style={style.productName}>{product.name}</Text>
									</TouchableOpacity>
								))}
							</View>
						}
					/>
					:
					<FlatList
						showsVerticalScrollIndicator={false}
						style={{ height: height - 100, margin: 20 }}
						data={specials}
						renderItem={({ item, index }) => 
							<View key={item.key} style={style.row}>
								{item.row.map(( product, index ) => (
									<TouchableOpacity key={product.key} style={style.product} onPress={() => props.navigation.navigate("itemprofile", { id: product.id })}>
										<View style={style.productImageHolder}>
											<Image source={require("../../../assets/product-image.png")} style={{ height: imageSize, width: imageSize }}/>
										</View>
										<Text style={style.productName}>{product.name}</Text>
									</TouchableOpacity>
								))}
							</View>
						}
					/>
				}

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
	headers: { marginVertical: 20 },
	header: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', marginVertical: 5, textAlign: 'center' },
	navs: { flexDirection: 'row', justifyContent: 'space-around' },
	nav: { alignItems: 'center', backgroundColor: 'white', borderRadius: 8, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, padding: 5, width: 100 },

	row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, width: '100%' },
	product: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, flexDirection: 'column', height: itemSize, justifyContent: 'space-between', padding: 2, width: itemSize },
	productImageHolder: { alignItems: 'center', borderRadius: imageSize / 2, flexDirection: 'column', height: imageSize, justifyContent: 'space-around', overflow: 'hidden', width: imageSize },
	productName: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },
})
