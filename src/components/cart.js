import React, { useState, useEffect } from 'react';
import { AsyncStorage, SafeAreaView, View, FlatList, Image, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { logo_url } from '../../assets/info'
import { getCartItems, removeFromCart, checkoutCart } from '../apis/carts'

import AntDesign from 'react-native-vector-icons/AntDesign'

export default function cart(props) {
	const [items, setItems] = useState([])
	const [activeCheckout, setActivecheckout] = useState(false)
	const [showConfirm, setShowconfirm] = useState(false)

	const getTheCartItems = async() => {
		const userid = await AsyncStorage.getItem("userid")

		getCartItems(userid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setItems(res.cartItems)
					setActivecheckout(res.activeCheckout)
				}
			})
	}
	const checkout = async() => {
		const time = Date.now()
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, time }

		checkoutCart(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setActivecheckout(false)
					setShowconfirm(true)
				}
			})
	}

	useEffect(() => {
		getTheCartItems()
	}, [])

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<View style={{ alignItems: 'center', width: '100%' }}>
					<TouchableOpacity style={style.close} onPress={() => props.close()}>
						<AntDesign name="closecircleo" size={30}/>
					</TouchableOpacity>
				</View>
				<Text style={style.boxHeader}>Cart</Text>

				<FlatList
					showsVerticalScrollIndicator={false}
					data={items}
					renderItem={({ item, index }) => 
						<View style={style.item} key={item.key}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<TouchableOpacity style={style.itemRemove} onPress={async() => {
									removeFromCart(item.id)
										.then((res) => {
											if (res.status == 200) {
												return res.data
											}
										})
										.then((res) => {
											if (res) getTheCartItems()
										})
								}}>
									<AntDesign name="closecircleo" size={20}/>
								</TouchableOpacity>
								<View style={style.itemImageHolder}>
									<Image source={{ uri: logo_url + item.image }} style={style.itemImage}/>
								</View>
								<View style={style.itemInfos}>
									<Text style={style.itemName}>{item.name}</Text>
									{item.options.map((option, infoindex) => (
										<Text key={infoindex.toString()} style={style.itemInfo}>
											<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
											{option.selected}
											{option.type == 'percentage' && '%'}
										</Text>
									))}
								</View>
								<View>
									<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>quantity:</Text> {item.quantity}</Text>
									<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>price:</Text> ${item.price}</Text>
								</View>
							</View>

							{item.orderers.length > 0 && (
								<View style={style.orderersContainer}>
									<Text style={style.orderersHeader}>Calling for</Text>

									<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
										<View style={style.orderers}>
											{item.orderers.map(orderer => (
												<View key={orderer.key} style={style.orderer}>
													<View style={style.ordererProfileHolder}>
														<Image source={{ uri: logo_url + orderer.profile }} style={style.ordererProfile}/>
													</View>
													<Text style={style.ordererHeader}>{orderer.username}</Text>
													<Text style={style.ordererStatus}>{orderer.status}</Text>
												</View>
											))}
										</View>
									</View>
								</View>
							)}
						</View>
					}
				/>

				<View style={{ alignItems: 'center' }}>
					<TouchableOpacity style={activeCheckout ? style.checkout : style.checkoutDisabled} disabled={!activeCheckout} onPress={() => checkout()}>
						<Text style={style.checkoutHeader}>Checkout</Text>
					</TouchableOpacity>
				</View>
			</View>

			{showConfirm && (
				<Modal transparent={true}>
					<SafeAreaView style={{ flex: 1 }}>
						<View style={style.confirmBox}>
							<View style={style.confirmContainer}>
								<Text style={style.confirmHeader}>Checkout and purchases completed</Text>

								<View style={style.confirmOptions}>
									<TouchableOpacity style={style.confirmOption} onPress={() => {
										setShowconfirm(false)
										props.close()
									}}>
										<Text style={style.confirmOptionHeader}>Ok</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	box: { height: '100%', width: '100%' },
	close: { margin: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },

	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
	itemRemove: { marginVertical: 30, marginRight: 0 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', height: 100, overflow: 'hidden', width: 100 },
	itemImage: { height: 100, width: 100 },
	itemInfos: {  },
	itemName: { fontSize: 20, marginBottom: 10 },
	itemInfo: { fontSize: 15 },
	header: { fontSize: 15 },
	orderersContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, marginVertical: 10, padding: 5 },
	orderersHeader: { fontWeight: 'bold', textAlign: 'center' },
	orderers: { flexDirection: 'row' },
	orderer: { alignItems: 'center', margin: 10 },
	ordererProfileHolder: { backgroundColor: 'white', borderRadius: 20, height: 40, overflow: 'hidden', width: 40 },
	ordererProfile: { height: 40, width: 40 },
	ordererHeader: {  },
	ordererStatus: { fontWeight: 'bold' },

	checkout: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginVertical: 20, padding: 10 },
	checkoutDisabled: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginVertical: 20, opacity: 0.3, padding: 10 },
	checkoutHeader: { },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmOptions: { flexDirection: 'row', justifyContent: 'space-around' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmOptionHeader: { },
})
