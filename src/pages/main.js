import React, { useState } from 'react';
import { AsyncStorage, SafeAreaView, ActivityIndicator, Dimensions, View, FlatList, Text, TextInput, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { CommonActions } from '@react-navigation/native';

import Cart from '../components/cart'
import Notifications from '../components/notifications'

import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')

export default function main({ navigation }) {
	const [locations, setLocations] = useState([
		{ key: "l-row-0", row: [
			{ key: 'l-0', id: "d9df9dsfsdf-0", logo: { photo: '', width: 0, height: 0 }, name: "Tim Hortons 0", address: "547 Gerrard St", radiusKm: 1 },
			{ key: 'l-1', id: "d9df9dsfsdf-1", logo: { photo: '', width: 0, height: 0 }, name: "Tim Hortons 1", address: "547 Gerrard St", radiusKm: 2 },
			{ key: 'l-2', id: "d9df9dsfsdf-2", logo: { photo: '', width: 0, height: 0 }, name: "Tim Hortons 2", address: "547 Gerrard St", radiusKm: 3 }
		]},
		{ key: "l-row-1", row: [
			{ key: 'l-3', id: "d9df9dsfsdf-3", logo: { photo: '', width: 0, height: 0 }, name: "Tim Hortons 3", address: "547 Gerrard St", radiusKm: 4 },
			{ key: 'l-4', id: "d9df9dsfsdf-4", logo: { photo: '', width: 0, height: 0 }, name: "Tim Hortons 4", address: "547 Gerrard St", radiusKm: 5 },
			{ key: 'l-5', id: "d9df9dsfsdf-5", logo: { photo: '', width: 0, height: 0 }, name: "Tim Hortons 5", address: "547 Gerrard St", radiusKm: 6 }
		]},
		{ key: "l-row-2", row: [
			{ key: 'l-6', id: "d9df9dsfsdf-6", logo: { photo: '', width: 0, height: 0 }, name: "Tim Hortons 6", address: "547 Gerrard St", radiusKm: 7 },
			{ key: 'l-7', id: "d9df9dsfsdf-7", logo: { photo: '', width: 0, height: 0 }, name: "Tim Hortons 7", address: "547 Gerrard St", radiusKm: 8 },
			{ key: 'l-8', id: "d9df9dsfsdf-8", logo: { photo: '', width: 0, height: 0 }, name: "Tim Hortons 8", address: "547 Gerrard St", radiusKm: 9 }
		]},
		{ key: "l-row-3", row: [
			{ key: 'l-9', id: "d9df9dsfsdf-9", logo: { photo: '', width: 0, height: 0 }, name: "Tim Hortons 9", address: "547 Gerrard St", radiusKm: 10 },
			{ key: 'l-10' },
			{ key: 'l-11' }
		]}
	])
	const [loadingLocations, setLoadingLocations] = useState(true)
	const [specialAndDeals, setSpecialAndDeals] = useState([
		{ key: "sp-row-0", row: [
			{ key: 'sp-0', id: '1v99d-sd9d9s999d9d-0', name: 'roasted milk tea 0', image: { photo: '', width: 0, height: 0 }, radiusKm: 5 },
			{ key: 'sp-1', id: '1v99d-sd9d9s999d9d-1', name: 'roasted milk tea 1', image: { photo: '', width: 0, height: 0 }, radiusKm: 5 },
			{ key: 'sp-2', id: '1v99d-sd9d9s999d9d-2', name: 'roasted milk tea 2', image: { photo: '', width: 0, height: 0 }, radiusKm: 5 }
		]},
		{ key: "sp-row-1", row: [
			{ key: 'sp-3', id: '1v99d-sd9d9s999d9d-3', name: 'roasted milk tea 3', image: { photo: '', width: 0, height: 0 }, radiusKm: 5 },
			{ key: 'sp-4', id: '1v99d-sd9d9s999d9d-4', name: 'roasted milk tea 4', image: { photo: '', width: 0, height: 0 }, radiusKm: 5 },
			{ key: 'sp-5', id: '1v99d-sd9d9s999d9d-5', name: 'roasted milk tea 5', image: { photo: '', width: 0, height: 0 }, radiusKm: 5 }
		]},
		{ key: "sp-row-2", row: [
			{ key: 'sp-6', id: '1v99d-sd9d9s999d9d-6', name: 'roasted milk tea 6', image: { photo: '', width: 0, height: 0 }, radiusKm: 5 },
			{ key: 'sp-7', id: '1v99d-sd9d9s999d9d-7', name: 'roasted milk tea 7', image: { photo: '', width: 0, height: 0 }, radiusKm: 5 },
			{ key: 'sp-8', id: '1v99d-sd9d9s999d9d-8', name: 'roasted milk tea 8', image: { photo: '', width: 0, height: 0 }, radiusKm: 5 }
		]},
		{ key: "sp-row-3", row: [
			{ key: 'sp-9', id: '1v99d-sd9d9s999d9d-9', name: 'roasted milk tea 9', image: { photo: '', width: 0, height: 0 }, radiusKm: 5 },
			{ key: 'sp-10' },
			{ key: 'sp-11' }
		]}
	])
	const [loadingSpecialAndDeals, setLoadingSpecialAndDeals] = useState(true)
	const [viewType, setViewType] = useState('specialanddeals')
	const [openCart, setOpencart] = useState(false)
	const [openNotifications, setOpenNotifications] = useState(false)
	const [numCartItems, setNumcartitems] = useState(2)
	const getLocations = (start) => {
		let list = locations
		let newLocation, km = 0, itemkey = 0
		let last_row = list[list.length - 1]
		let rowkey = parseInt(last_row.key.replace("l-row-", ""))
		let row = last_row.row, rowfull = true
		let i

		row.forEach(function (item) {
			if (item.id) {
				itemkey = parseInt(item.key.replace("l-", ""))
				km = item.radiusKm
			} else {
				rowfull = false
			}
		})

		for (let k = 1; k <= 5; k++) {
			itemkey += 1
			km += 5

			newLocation = {
				id: "d9df9dsfsdf-" + itemkey,
				key: 'l-' + itemkey.toString(),
				logo: { photo: '', width: 0, height: 0 }, 
				name: "Tim Hortons " + itemkey, 
				address: "547 Gerrard St",
				radiusKm: km
			}

			if (rowfull) {
				rowkey += 1

				list.push({
					key: "l-row-" + rowkey,
					row: [
						newLocation,
						{ key: (itemkey + 1).toString() },
						{ key: (itemkey + 2).toString() }
					]
				})

				row = list[list.length - 1].row
				rowfull = false
			} else {
				for (i = 0; i <= 2; i++) {
					if (!row[i].id) {
						row[i] = newLocation

						break
					}
				}

				if (i == 2) {
					list[list.length - 1].row = row

					rowfull = true
				}
			}
		}

		setLocations(list)
		setViewType('restaurants')
	}
	const getSpecialAndDeals = (start) => {
		let list = specialAndDeals
		let newSpecialAndDeal, km, itemkey = 0
		let last_row = list[list.length - 1]
		let rowkey = parseInt(last_row.key.replace("sp-row-", ""))
		let row = last_row.row, rowfull = true
		let i

		row.forEach(function (item) {
			if (item.id) {
				itemkey = parseInt(item.key.replace("sp-", ""))
				km = item.radiusKm
			} else {
				rowfull = false
			}
		})

		for (let k = 1; k <= 5; k++) {
			itemkey += 1
			km += 5
			newSpecialAndDeal = {
				id: "1v99d-sd9d9s999d9d-" + itemkey,
				key: 'sp-' + itemkey.toString(),
				image: { photo: '', width: 0, height: 0 },
				name: "Product name " + itemkey,
				radiusKm: km
			}

			if (rowfull) {
				rowkey += 1

				list.push({
					key: "sp-row-" + rowkey,
					row: [
						newSpecialAndDeal,
						{ key: (itemkey + 1).toString() },
						{ key: (itemkey + 2).toString() }
					]
				})

				row = list[list.length - 1].row
				rowfull = false
			} else {
				for (i = 0; i <= 2; i++) {
					if (!row[i].id) {
						row[i] = newSpecialAndDeal

						break
					}
				}

				if (i == 2) {
					list[list.length - 1].row = row

					rowfull = true
				}
			}
		}

		setSpecialAndDeals(list)
		setViewType('specialanddeals')
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<View style={style.header}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<TextInput style={style.searchInput} placeholder="Search any restaurants, food, drinks"/>
						<TouchableOpacity style={style.notification} onPress={() => setOpenNotifications(true)}>
							<FontAwesome name="bell" size={30}/>
							<Text style={{ fontWeight: 'bold' }}>12</Text>
						</TouchableOpacity>
					</View>
					<View style={style.navs}>
						<TouchableOpacity style={style.nav} onPress={() => getLocations(true)}>
							<Ionicons name="restaurant" size={25}/>
							<Text>near you (200)</Text>
						</TouchableOpacity>

						<TouchableOpacity style={style.nav} onPress={() => getSpecialAndDeals(true)}>
							<MaterialCommunityIcons name="food" size={25}/>
							<View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around' }}>
								<AntDesign name="star" size={15}/>
								<Text>(200)</Text>
							</View>
						</TouchableOpacity>
					</View>
				</View>

				<View style={style.body}>
					{viewType == 'restaurants' ? 
						<FlatList
							ListFooterComponent={() => {
								if (loadingLocations) {
									return <ActivityIndicator style={{ marginVertical: 50 }} size="large"/>
								}

								return null
							}}
							style={{ height: height - 233 }}
							onEndReached={() => getLocations(false)}
							onEndReachedThreshold={0}
							showsVerticalScrollIndicator={false}
							data={locations}
							renderItem={({ item }) => 
								<View key={item.key} style={style.row}>
									{item.row.map(info => (
										info.id ? 
											<TouchableOpacity key={info.key} style={style.restaurant} onPress={() => navigation.navigate("locationprofile", { name: info.name })}>
												<View style={style.restaurantInfo}>
													<Image style={style.restaurantLogo} source={require('../../assets/restaurant-logo.png')}/>
													<Text style={style.restaurantName}>{info.name}</Text>
													<Text style={style.radiusKm}>{info.radiusKm} km away</Text>
												</View>
												<Text style={style.restaurantAddress}>{info.address}</Text>
											</TouchableOpacity>
											:
											<View key={info.key} style={style.restaurantDisabled}></View>
									))}
								</View>
							}
						/>
						:
						<FlatList
							ListFooterComponent={() => {
								if (loadingSpecialAndDeals) {
									return <ActivityIndicator style={{ marginVertical: 20 }} size="large"/>
								}

								return null
							}}
							style={{ height: height - 233 }}
							onEndReached={() => getSpecialAndDeals(false)}
							onEndReachedThreshold={0}
							showsVerticalScrollIndicator={false}
							data={specialAndDeals}
							renderItem={({ item }) => 
								<View key={item.key} style={style.row}>
									{item.row.map(info => (
										info.id ? 
											<TouchableOpacity key={info.key} style={style.specialAndDeal} onPress={() => navigation.navigate("itemprofile", { id: info.id })}>
												<Image style={style.specialAndDealImage} source={require('../../assets/product-image.png')}/>
												<Text style={style.specialAndDealName}>{info.name}</Text>
												<Text style={style.radiusKm}>{info.radiusKm} km away</Text>
											</TouchableOpacity>
											:
											<View key={info.key} style={style.specialAndDealDisabled}></View>
									))}
								</View>
							}
						/>
					}
				</View>
				<View style={style.bottomNavs}>
					<TouchableOpacity style={style.bottomNav} onPress={() => setOpencart(true)}>
						<Entypo name="shopping-cart" size={30}/>
						{numCartItems > 0 && <Text style={style.numCartItemsHeader}>{numCartItems}</Text>}
					</TouchableOpacity>
					<TouchableOpacity style={style.bottomNav} onPress={() => navigation.navigate("account")}>
						<FontAwesome5 name="user-circle" size={30}/>
					</TouchableOpacity>
					<TouchableOpacity style={style.bottomNav} onPress={() => navigation.navigate("recent")}>
						<FontAwesome name="history" size={30}/>
					</TouchableOpacity>
					<TouchableOpacity style={style.bottomNav} onPress={() => {
						AsyncStorage.clear()

						navigation.dispatch(
							CommonActions.reset({
								index: 1,
								routes: [{ name: 'login' }]
							})
						);
					}}>
						<Text style={{ paddingVertical: 5 }}>Log-Out</Text>
					</TouchableOpacity>
				</View>
			</View>

			<Modal visible={openCart}><Cart close={() => setOpencart(false)}/></Modal>
			<Modal visible={openNotifications}><Notifications close={() => setOpenNotifications(false)}/></Modal>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	header: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: 110, justifyContent: 'space-between', padding: 5, width: '100%' },
	searchInput: { backgroundColor: '#EFEFEF', borderRadius: 5, fontSize: 15, margin: 10, padding: 10, width: width - 80 },
	notification: { flexDirection: 'row', marginRight: 10, marginVertical: 10 },
	navs: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	nav: { alignItems: 'center' },

	row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },

	// nearest restaurants
	restaurant: { backgroundColor: 'white', margin: 5, padding: 5, width: '30%' },
	restaurantDisabled: { margin: 5, paddingVertical: 5, width: '30%' },
	restaurantInfo: { alignItems: 'center' },
	restaurantAddress: { fontWeight: 'bold', textAlign: 'center' },
	restaurantLogo: { height: 70, width: 70 },
	restaurantName: {  },
	radiusKm: { },

	// special and deals
	specialAndDeal: { alignItems: 'center', backgroundColor: 'white', margin: 5, paddingVertical: 5, width: '30%' },
	specialAndDealDisabled: { margin: 5, paddingVertical: 5, width: '30%' },
	specialAndDealImage: { height: 50, width: 50 },
	specialAndDealName: { fontWeight: 'bold', paddingHorizontal: 5, paddingVertical: 15 },
	radiusKm: { fontWeight: 'bold', paddingVertical: 15 },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },
})
