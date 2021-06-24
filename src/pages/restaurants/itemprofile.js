import React, { useState } from 'react';
import { Dimensions, SafeAreaView, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';

import Cart from '../../components/restaurants/cart'

import Entypo from 'react-native-vector-icons/Entypo'
import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const itemSize = (width * 0.3) - 10
const imageSize = (width * 0.3) - 50

export default function itemProfile(props) {
	let { id, name } = props.route.params

	const productId = useState(id)
	const [itemName, setItemname] = useState(name)
	const [info, setInfo] = useState([
		{ 
			key: "info-0", header: 'Size', type: 'options', 
			options: [
				{ key: "info-opt-0", header: 'small' },
				{ key: "info-opt-1", header: 'medium' },
				{ key: "info-opt-2", header: 'large' },
				{ key: "info-opt-3", header: "extra large" }
			], selected: 'small' 
		},
		{ 
			key: "info-1", header: 'Sugar', type: 'amount', selected: 3 
		},
		{ 
			key: "info-2", header: 'Cream', type: 'amount', selected: 3 
		},
		{
			key: "info-3", header: 'Milk', type: 'percentage', selected: 10
		}
	])
	const [quantity, setQuantity] = useState(1)

	// friends list
	const [openFriendsList, setOpenfriendslist] = useState(false)
	const [friends, setFriends] = useState([
		{ key: "friend-row-0", row: [
			{ key: "friend-0", id: "10d0d9d-d-s-d-0", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 0" },
			{ key: "friend-1", id: "10d0d9d-d-s-d-1", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 1" },
			{ key: "friend-2", id: "10d0d9d-d-s-d-2", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 2" },
			{ key: "friend-3", id: "10d0d9d-d-s-d-3", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 3" },
		]},
		{ key: "friend-row-1", row: [
			{ key: "friend-4", id: "10d0d9d-d-s-d-4", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 4" },
			{ key: "friend-5", id: "10d0d9d-d-s-d-5", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 5" },
			{ key: "friend-6", id: "10d0d9d-d-s-d-6", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 6" },
			{ key: "friend-7", id: "10d0d9d-d-s-d-7", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 7" },
		]},
		{ key: "friend-row-2", row: [
			{ key: "friend-8", id: "10d0d9d-d-s-d-8", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 8" },
			{ key: "friend-9", id: "10d0d9d-d-s-d-9", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 9" },
			{ key: "friend-10", id: "10d0d9d-d-s-d-10", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 10" },
			{ key: "friend-11", id: "10d0d9d-d-s-d-11", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 11" },
		]},
		{ key: "friend-row-3", row: [
			{ key: "friend-12", id: "10d0d9d-d-s-d-12", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 12" },
			{ key: "friend-13", id: "10d0d9d-d-s-d-13", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 13" },
			{ key: "friend-14", id: "10d0d9d-d-s-d-14", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 14" },
			{ key: "friend-15", id: "10d0d9d-d-s-d-15", profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 }, username: "good girl 15" },
		]}
	])
	const [selectedFriends, setSelectedFriends] = useState([])
	const [numSelectedFriends, setNumSelectedFriends] = useState(0)

	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(2)
	const [orderingItem, setOrderingItem] = useState({
		key: "item-0",
		name: "Roasted milk tea", 
		info: [
			{ key: "item-info-0", header: 'Size', selected: 'small' },
			{ key: "item-info-1", header: 'Sugar', selected: 3 },
			{ key: "item-info-2", header: 'Cream', selected: 3 }
		], 
		quantity: 4, price: 5.49
	})

	const changeOption = (index, selected) => {
		let newInfo = [...info]

		newInfo[index].selected = selected

		setInfo(newInfo)
	}
	const changeAmount = (index, action) => {
		let newInfo = [...info]
		let { selected } = newInfo[index]

		selected = action == "+" ? selected + 1 : selected - 1

		if (selected >= 0) {
			newInfo[index].selected = selected

			setInfo(newInfo)
		}
	}
	const changePercentage = (index, action) => {
		let newInfo = [...info]
		let { selected } = newInfo[index]

		selected = action == "+" ? selected + 10 : selected - 10

		if (selected >= 0 && selected <= 100) {
			newInfo[index].selected = selected

			setInfo(newInfo)
		}
	}
	const addCart = () => {
		setNumcartitems(numCartItems + 1)
	}
	const selectFriend = (userid) => {
		let list = [...friends]
		let selectedList = [...selectedFriends]
		let newNumSelectedFriends = 0
		let selected = null, latest = null, empty = false, added = false
		let rowkey = "", itemkey = ""

		if (!JSON.stringify(selectedList).includes(userid)) {
			list.forEach(function (items) {
				items.row.forEach(function (item) {
					if (item.id == userid) {
						selected = {
							...selected,
							id: item.id,
							username: item.username,
							profile: item.profile
						}
					}
				})
			})

			selectedList.forEach(function (items, index) {
				items.row.forEach(function (item) {
					if (item.id) {
						latest = item
						
						newNumSelectedFriends += 1
					} else if (!added) {
						added = true

						item.id = selected.id
						item.profile = selected.profile
						item.username = selected.username

						newNumSelectedFriends += 1
					}


				})
			})

			if (!added) {
				if (selectedList.length > 0) {
					rowkey = parseInt(selectedList[selectedList.length - 1].key.replace("selected-friend-row-", ""))
					itemkey = parseInt(latest.key.replace("selected-friend-", ""))

					selected.key = "selected-friend-" + (itemkey + 1)

					selectedList.push({ 
						key: "selected-friend-row-" + (rowkey + 1),
						row: [
							selected,
							{ key: "selected-friend-" + (itemkey + 2)}, 
							{ key: "selected-friend-" + (itemkey + 3)}, 
							{ key: "selected-friend-" + (itemkey + 4)}
						]
					})

					newNumSelectedFriends += 1
				} else {
					selected.key = "selected-friend-0"

					selectedList.push({ 
						key: "selected-friend-row-0",
						row: [
							selected,
							{ key: "selected-friend-1" }, 
							{ key: "selected-friend-2" }, 
							{ key: "selected-friend-3" }
						]
					})

					newNumSelectedFriends += 1
				}
			}

			setSelectedFriends(selectedList)
			setNumSelectedFriends(newNumSelectedFriends)
		}
	}
	const deselectFriend = (userid) => {
		let friends = [...selectedFriends]
		let newFriends = [], newNumFriends = 0
		let itemrow = [], itemnum = 0, rownum = 0

		friends.forEach(function ({ row }, friendindex) {
			row.forEach(function (info, rowindex) {
				if (info.id && info.id != userid) {
					itemrow.push({
						key: "selected-friend-row-" + itemnum,
						id: "10d0d9d-d-s-d-" + itemnum,
						profile: { photo: require("../../../assets/profile.jpeg"), width: 0, height: 0 },
						username: info.username
					})
					newNumFriends += 1
					itemnum += 1

					if (itemrow.length == 4) {
						newFriends.push({
							key: "friend-row-" + rownum,
							row: itemrow
						})

						itemrow = []

						rownum += 1
					}
				}
			})
		})

		if (itemrow.length > 0) {
			while (itemrow.length < 4) {
				itemrow.push({
					key: "selected-friend-" + itemnum
				})

				itemnum += 1
			}

			newFriends.push({
				key: "friend-row-" + rownum,
				row: itemrow
			})

			itemrow = []
		}

		if (!JSON.stringify(newFriends).includes("id")) {
			newFriends = []
			newNumFriends = 0
		}

		setSelectedFriends(newFriends)
		setNumSelectedFriends(newNumFriends)
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>
				
				<Text style={style.boxHeader}>{itemName}</Text>

				{info.map((item, index) => (
					<View key={item.key} style={style.info}>
						<Text style={style.infoHeader}>{item.header}:</Text>

						{item.type == "options" && (
							<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
								<View style={style.options}>
									{item.options.map((option, optindex) => (
										<TouchableOpacity key={option.key} style={item.selected == option ? style.optionSelected : style.option} onPress={() => changeOption(index, option.header)}>
											<Text style={item.selected == option ? style.optionSelectedHeader : style.optionHeader}>{option.header}</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>
						)}

						{item.type == "amount" && (
							<View style={{ flexDirection: 'row', justifyContent: 'space-around', width: width - 100 }}>
								<View style={style.amount}>
									<TouchableOpacity style={style.amountAction} onPress={() => changeAmount(index, "-")}>
										<Text style={style.amountActionHeader}>-</Text>
									</TouchableOpacity>
									<Text style={style.amountHeader}>{item.selected}</Text>
									<TouchableOpacity style={style.amountAction} onPress={() => changeAmount(index, "+")}>
										<Text style={style.amountActionHeader}>+</Text>
									</TouchableOpacity>
								</View>
							</View>
						)}

						{item.type == "percentage" && (
							<View style={{ flexDirection: 'row', justifyContent: 'space-around', width: width - 100 }}>
								<View style={style.percentage}>
									<TouchableOpacity style={style.percentageAction} onPress={() => changePercentage(index, "-")}>
										<Text style={style.percentageActionHeader}>-</Text>
									</TouchableOpacity>
									<Text style={style.percentageHeader}>{item.selected}%</Text>
									<TouchableOpacity style={style.percentageAction} onPress={() => changePercentage(index, "+")}>
										<Text style={style.percentageActionHeader}>+</Text>
									</TouchableOpacity>
								</View>
							</View>
						)}
					</View>
				))}

				<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
					<View style={{ flexDirection: 'row' }}>
						<Text style={style.quantityHeader}>Quantity</Text>
						<View style={style.quantity}>
							<TouchableOpacity style={style.quantityAction} onPress={() => setQuantity(quantity > 1 ? quantity - 1 : quantity)}>
								<Text style={style.quantityActionHeader}>-</Text>
							</TouchableOpacity>
							<Text style={style.quantityHeader}>{quantity}</Text>
							<TouchableOpacity style={style.quantityAction} onPress={() => setQuantity(quantity + 1)}>
								<Text style={style.quantityActionHeader}>+</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>

				<View style={style.itemActions}>
					<View style={{ flexDirection: 'row' }}>
						<TouchableOpacity style={style.itemAction} onPress={() => addCart()}>
							<Text style={style.itemActionHeader}>Add to your cart</Text>
						</TouchableOpacity>
						<TouchableOpacity style={style.itemAction} onPress={() => setOpenfriendslist(true)}>
							<Text style={style.itemActionHeader}>Add to a friend's cart</Text>
						</TouchableOpacity>
					</View>
				</View>

				<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
					<TouchableOpacity style={style.cart} onPress={() => setOpencart(true)}>
						<Entypo name="shopping-cart" size={30}/>
						{numCartItems > 0 && <Text style={style.numCartItemsHeader}>{numCartItems}</Text>}
					</TouchableOpacity>
				</View>
			</View>

			<Modal visible={openCart}><Cart close={() => setOpencart(false)}/></Modal>
			<Modal visible={openFriendsList}>
				<SafeAreaView style={{ flex: 1 }}>
					<View style={style.friendsList}>
						<TextInput style={style.friendNameInput} placeholder="Search friend to order for"/>

						<Text style={style.friendsHeader}>Your friend(s)</Text>

						<View style={{ height: '30%', marginVertical: 10 }}>
							<FlatList
								data={friends}
								renderItem={({ item, index }) => 
									<View key={item.key} style={style.row}>
										{item.row.map(friend => (
											friend.username ? 
												<TouchableOpacity key={friend.key} style={style.friend} onPress={() => selectFriend(friend.id)}>
													<View style={style.friendProfileHolder}>
														<Image source={friend.profile.photo} style={{ height: 60, width: 60 }}/>
													</View>
													<Text style={style.friendName}>{friend.username}</Text>
												</TouchableOpacity>
												:
												<View key={friend.key} style={style.friend}></View>
										))}
									</View>
								}
							/>
						</View>

						<Text style={style.selectedFriendsHeader}>{numSelectedFriends} Selected Friend(s) to order this item</Text>

						<View style={{ height: '30%', marginVertical: 10 }}>
							<FlatList
								data={selectedFriends}
								renderItem={({ item, index }) => 
									<View key={item.key} style={style.row}>
										{item.row.map(friend => (
											friend.username ? 
												<View key={friend.key} style={style.friend}>
													<TouchableOpacity style={style.friendDelete} onPress={() => deselectFriend(friend.id)}>
														<AntDesign name="closecircleo" size={15}/>
													</TouchableOpacity>
													<View style={style.friendProfileHolder}>
														<Image source={friend.profile.photo} style={{ height: 60, width: 60 }}/>
													</View>
													<Text style={style.friendName}>{friend.username}</Text>
												</View>
												:
												<View key={friend.key} style={style.friend}></View>
										))}
									</View>
								}
							/>
						</View>

						<View style={style.itemContainer}>
							<View style={style.itemImageHolder}>
								<Image style={{ height: 100, width: 100 }} source={require("../../../assets/product-image.png")}/>
							</View>
							<View style={style.itemInfos}>
								{orderingItem.info.map((info, infoindex) => (
									<Text key={info.key} style={style.itemInfo}><Text style={{ fontWeight: 'bold' }}>{info.header}:</Text> {info.selected}</Text>
								))}
							</View>
							<Text style={style.orderingQuantity}><Text style={{ fontWeight: 'bold' }}>quantity:</Text> {orderingItem.quantity}</Text>
						</View>

						<View style={{ alignItems: 'center' }}>
							<TouchableOpacity style={style.checkout} onPress={() => {
								setOpenfriendslist(false)
								setSelectedFriends([])
								setNumSelectedFriends(0)
							}}>
								<Text style={style.checkoutHeader}>Checkout</Text>
							</TouchableOpacity>
						</View>
					</View>
				</SafeAreaView>
			</Modal>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },

	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },

	info: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, marginHorizontal: 10 },
	infoHeader: { fontWeight: 'bold', margin: 5, width: 100 },

	// options
	options: { flexDirection: 'row', justifyContent: 'space-between' },
	optionSelected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 2, padding: 8 },
	optionSelectedHeader: { color: 'white', fontSize: 15 },
	option: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 2, padding: 8 },
	optionHeader: { color: 'black', fontSize: 15 },

	// amount
	amount: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	amountAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	amountHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	// percentage
	percentage: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	percentageAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	percentageHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	// quantity
	quantity: { flexDirection: 'row', justifyContent: 'space-around' },
	quantityAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	quantityHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	itemActions: { flexDirection: 'row', justifyContent: 'space-around' },
	itemAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, marginVertical: 100, padding: 10, width: 100 },
	itemActionHeader: { textAlign: 'center' },

	cart: { flexDirection: 'row', height: 30, marginVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },

	// friends list
	friendsList: { height: '100%', width: '100%' },
	friendNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.5)', borderRadius: 5, marginHorizontal: 20, padding: 10 },
	friendsHeader: { fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
	friend: { alignItems: 'center', height: width * 0.2, margin: 5, width: width * 0.2 },
	friendDelete: { marginBottom: -5, marginLeft: 60 },
	friendProfileHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 30, height: 60, overflow: 'hidden', width: 60 },
	friendName: { textAlign: 'center' },

	// selected friends list
	selectedFriendsHeader: { fontWeight: 'bold', marginTop: 10, textAlign: 'center' },

	// ordering item
	itemContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', margin: 10, padding: 10 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', height: 100, overflow: 'hidden', width: 100 },
	itemInfo: { fontSize: 15 },
	orderingQuantity: { fontSize: 15 },
})
