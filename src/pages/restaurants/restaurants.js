import React, { useState } from 'react';
import { AsyncStorage, ActivityIndicator, Dimensions, View, FlatList, Text, TextInput, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { CommonActions } from '@react-navigation/native';

import Cart from '../../components/cart'
import Notifications from '../../components/notifications'

import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - offsetPadding

export default function restaurants({ navigation }) {
	const [locations, setLocations] = useState([
		{ key: "l-row-0", row: [
			{ key: 'l-0', id: "d9df9dsfsdf-0", image: { photo: require('../../../assets/restaurant-logo.png'), width: 0, height: 0 }, nav: "restaurantprofile", name: "Tim Hortons 0", address: "547 Gerrard St", radiusKm: 1 },
			{ key: 'l-1', id: "d9df9dsfsdf-1", image: { photo: require('../../../assets/restaurant-logo.png'), width: 0, height: 0 }, nav: "restaurantprofile", name: "Tim Hortons 1", address: "547 Gerrard St", radiusKm: 2 },
			{ key: 'l-2', id: "d9df9dsfsdf-2", image: { photo: require('../../../assets/restaurant-logo.png'), width: 0, height: 0 }, nav: "restaurantprofile", name: "Tim Hortons 2", address: "547 Gerrard St", radiusKm: 3 }
		]},
		{ key: "l-row-1", row: [
			{ key: 'l-3', id: "d9df9dsfsdf-3", image: { photo: require('../../../assets/restaurant-logo.png'), width: 0, height: 0 }, nav: "restaurantprofile", name: "Tim Hortons 3", address: "547 Gerrard St", radiusKm: 4 },
			{ key: 'l-4', id: "d9df9dsfsdf-4", image: { photo: require('../../../assets/restaurant-logo.png'), width: 0, height: 0 }, nav: "restaurantprofile", name: "Tim Hortons 4", address: "547 Gerrard St", radiusKm: 5 },
			{ key: 'l-5', id: "d9df9dsfsdf-5", image: { photo: require('../../../assets/restaurant-logo.png'), width: 0, height: 0 }, nav: "restaurantprofile", name: "Tim Hortons 5", address: "547 Gerrard St", radiusKm: 6 }
		]},
		{ key: "l-row-2", row: [
			{ key: 'l-6', id: "d9df9dsfsdf-6", image: { photo: require('../../../assets/restaurant-logo.png'), width: 0, height: 0 }, nav: "restaurantprofile", name: "Tim Hortons 6", address: "547 Gerrard St", radiusKm: 7 },
			{ key: 'l-7', id: "d9df9dsfsdf-7", image: { photo: require('../../../assets/restaurant-logo.png'), width: 0, height: 0 }, nav: "restaurantprofile", name: "Tim Hortons 7", address: "547 Gerrard St", radiusKm: 8 },
			{ key: 'l-8', id: "d9df9dsfsdf-8", image: { photo: require('../../../assets/restaurant-logo.png'), width: 0, height: 0 }, nav: "restaurantprofile", name: "Tim Hortons 8", address: "547 Gerrard St", radiusKm: 9 }
		]},
		{ key: "l-row-3", row: [
			{ key: 'l-9', id: "d9df9dsfsdf-9", image: { photo: require('../../../assets/restaurant-logo.png'), width: 0, height: 0 }, nav: "restaurantprofile", name: "Tim Hortons 9", address: "547 Gerrard St", radiusKm: 10 },
			{ key: 'l-10' },
			{ key: 'l-11' }
		]}
	])
	const [loadingLocations, setLoadingLocations] = useState(true)
	const [specialAndDeals, setSpecialAndDeals] = useState([
		{ key: "sp-row-0", row: [
			{ key: 'sp-0', id: '1v99d-sd9d9s999d9d-0', image: { photo: require('../../../assets/product-image.png'), width: 0, height: 0 }, nav: "itemprofile", name: 'roasted milk tea 0', address: "547 Gerrard St", radiusKm: 1 },
			{ key: 'sp-1', id: '1v99d-sd9d9s999d9d-1', image: { photo: require('../../../assets/product-image.png'), width: 0, height: 0 }, nav: "itemprofile", name: 'roasted milk tea 1', address: "547 Gerrard St", radiusKm: 2 },
			{ key: 'sp-2', id: '1v99d-sd9d9s999d9d-2', image: { photo: require('../../../assets/product-image.png'), width: 0, height: 0 }, nav: "itemprofile", name: 'roasted milk tea 2', address: "547 Gerrard St", radiusKm: 3 }
		]},
		{ key: "sp-row-1", row: [
			{ key: 'sp-3', id: '1v99d-sd9d9s999d9d-3', image: { photo: require('../../../assets/product-image.png'), width: 0, height: 0 }, nav: "itemprofile", name: 'roasted milk tea 3', address: "547 Gerrard St", radiusKm: 4 },
			{ key: 'sp-4', id: '1v99d-sd9d9s999d9d-4', image: { photo: require('../../../assets/product-image.png'), width: 0, height: 0 }, nav: "itemprofile", name: 'roasted milk tea 4', address: "547 Gerrard St", radiusKm: 5 },
			{ key: 'sp-5', id: '1v99d-sd9d9s999d9d-5', image: { photo: require('../../../assets/product-image.png'), width: 0, height: 0 }, nav: "itemprofile", name: 'roasted milk tea 5', address: "547 Gerrard St", radiusKm: 6 }
		]},
		{ key: "sp-row-2", row: [
			{ key: 'sp-6', id: '1v99d-sd9d9s999d9d-6', image: { photo: require('../../../assets/product-image.png'), width: 0, height: 0 }, nav: "itemprofile", name: 'roasted milk tea 6', address: "547 Gerrard St", radiusKm: 7 },
			{ key: 'sp-7', id: '1v99d-sd9d9s999d9d-7', image: { photo: require('../../../assets/product-image.png'), width: 0, height: 0 }, nav: "itemprofile", name: 'roasted milk tea 7', address: "547 Gerrard St", radiusKm: 8 },
			{ key: 'sp-8', id: '1v99d-sd9d9s999d9d-8', image: { photo: require('../../../assets/product-image.png'), width: 0, height: 0 }, nav: "itemprofile", name: 'roasted milk tea 8', address: "547 Gerrard St", radiusKm: 9 }
		]},
		{ key: "sp-row-3", row: [
			{ key: 'sp-9', id: '1v99d-sd9d9s999d9d-9', image: { photo: require('../../../assets/product-image.png'), width: 0, height: 0 }, nav: "itemprofile", name: 'roasted milk tea 9', address: "547 Gerrard St", radiusKm: 10 },
			{ key: 'sp-10' },
			{ key: 'sp-11' }
		]}
	])
	const [loadingSpecialAndDeals, setLoadingSpecialAndDeals] = useState(true)
	const [viewType, setViewType] = useState('restaurants')
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
				image: { photo: require('../../../assets/restaurant-logo.png'), width: 0, height: 0 }, 
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
				image: { photo: require('../../../assets/product-image.png'), width: 0, height: 0 },
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
		<View style={{ paddingTop: offsetPadding }}>
			<View style={style.box}>
				<View style={style.header}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<TouchableOpacity style={{ marginVertical: 10 }} onPress={() => navigation.goBack()}>
							<Ionicons name="chevron-back" size={40}/>
						</TouchableOpacity>
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

				<FlatList
					ListFooterComponent={() => {
						if (loadingLocations) {
							return <ActivityIndicator style={{ marginVertical: 50 }} size="large"/>
						}

						return null
					}}
					style={{ height: height - 245 }}
					onEndReached={() => getLocations(false)}
					onEndReachedThreshold={0}
					showsVerticalScrollIndicator={false}
					data={viewType == 'restaurants' ? locations : specialAndDeals}
					renderItem={({ item }) => 
						<View key={item.key} style={style.row}>
							{item.row.map(info => (
								info.id ? 
									<TouchableOpacity key={info.key} style={style.item} onPress={() => navigation.navigate("restaurantprofile", { name: info.name })}>
										<View style={style.itemInfo}>
											<Image style={style.itemLogo} source={info.image.photo}/>
											<Text style={style.itemName}>{info.name}</Text>
											<Text style={style.radiusKm}>{info.radiusKm} km away</Text>
										</View>
										<Text style={style.itemAddress}>{info.address}</Text>
									</TouchableOpacity>
									:
									<View key={info.key} style={style.itemDisabled}></View>
							))}
						</View>
					}
				/>

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
						<Text style={style.bottomNavHeader}>Log-Out</Text>
					</TouchableOpacity>
				</View>
			</View>

			<Modal visible={openCart}><Cart close={() => setOpencart(false)}/></Modal>
			<Modal visible={openNotifications}><Notifications close={() => setOpenNotifications(false)}/></Modal>
		</View>
	);
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	header: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: 120, justifyContent: 'space-between', padding: 5, width: '100%' },
	searchInput: { backgroundColor: '#EFEFEF', borderRadius: 5, fontSize: 15, margin: 10, padding: 10, width: width - 110 },
	notification: { flexDirection: 'row', marginRight: 10, marginVertical: 10 },
	navs: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	nav: { alignItems: 'center' },

	row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },

	item: { alignItems: 'center', backgroundColor: 'white', margin: 5, paddingVertical: 5, width: '30%' },
	itemDisabled: { margin: 5, paddingVertical: 5, width: '30%' },
	itemInfo: { alignItems: 'center' },
	itemAddress: { fontWeight: 'bold', textAlign: 'center' },
	itemLogo: { height: 70, width: 70 },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' }
})
