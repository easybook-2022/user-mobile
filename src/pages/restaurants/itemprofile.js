import React, { useState, useEffect } from 'react';
import { AsyncStorage, Dimensions, ScrollView, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { logo_url } from '../../../assets/info'
import { searchFriends } from '../../apis/users'
import { getProductInfo } from '../../apis/products'
import { getNumCartItems, addItemtocart } from '../../apis/carts'

import Cart from '../../components/cart'

import Entypo from 'react-native-vector-icons/Entypo'
import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const itemSize = (width * 0.3) - 10
const imageSize = (width * 0.3) - 50

export default function itemProfile(props) {
	const { locationid, menuid, productid } = props.route.params

	const [itemName, setItemname] = useState('')
	const [itemInfo, setIteminfo] = useState('')
	const [itemImage, setItemimage] = useState('')
	const [itemPrice, setItemprice] = useState(0)
	const [options, setOptions] = useState([])
	const [quantity, setQuantity] = useState(1)
	const [errorMsg, setErrormsg] = useState('')

	// friends list
	const [openFriendsList, setOpenfriendslist] = useState(false)
	const [friends, setFriends] = useState([])
	const [numFriends, setNumfriends] = useState(0)
	const [selectedFriends, setSelectedFriends] = useState([])
	const [numSelectedFriends, setNumSelectedFriends] = useState(0)

	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(2)
	const [orderingItem, setOrderingItem] = useState({ name: "", image: "", options: [], quantity: 0, cost: 0 })

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
	const changeOption = (index, selected) => {
		let newOptions = [...options]

		newOptions[index].selected = selected

		setOptions(newOptions)
	}
	const changeQuantity = (index, action) => {
		let newOptions = [...options]
		let { selected } = newOptions[index]

		selected = action == "+" ? selected + 1 : selected - 1

		if (selected >= 0) {
			newOptions[index].selected = selected

			setOptions(newOptions)
		}
	}
	const changePercentage = (index, action) => {
		let newOptions = [...options]
		let { selected } = newOptions[index]

		selected = action == "+" ? selected + 10 : selected - 10

		if (selected >= 0 && selected <= 100) {
			newOptions[index].selected = selected

			setOptions(newOptions)
		}
	}
	const addCart = async() => {
		const userid = await AsyncStorage.getItem("userid")
		let callfor = [], newOptions = JSON.parse(JSON.stringify(options))

		if (openFriendsList && selectedFriends.length == 0) {
			setErrormsg("You didn't select anyone")
		} else {
			selectedFriends.forEach(function (info) {
				info.row.forEach(function (friend) {
					if (friend.username) {
						callfor.push({ userid: friend.id, status: 'waiting' })
					}
				})
			})

			newOptions.forEach(function (option) {
				delete option['key']

				if (option['options']) {
					delete option['options']
				}
			})

			const data = { userid, productid, quantity, callfor, options: newOptions }

			addItemtocart(data)
				.then((res) => {
					if (res.status == 200) {
						if (!res.data.errormsg) {
							return res.data
						} else {
							setErrormsg(res.data.errormsg)
						}
					}
				})
				.then((res) => {
					if (res) {
						setOpenfriendslist(false)
						showCart()
					}
				})
		}
	}
	const showCart = () => {
		setOpenfriendslist(false)
		setSelectedFriends([])
		setNumSelectedFriends(0)
		setOpencart(true)
		setNumcartitems(numCartItems + 1)
	}
	const selectFriend = (userid) => {
		let list = [...friends]
		let selectedList = [...selectedFriends]
		let newNumSelectedFriends = 0
		let selected = null, latest = null, empty = false, added = false
		let rowkey = "", itemkey = ""

		if (!JSON.stringify(selectedList).includes("\"userid\": " + userid + ",")) {
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
						profile: info.profile,
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

	const getTheProductInfo = async() => {
		const userid = await AsyncStorage.getItem("userid")

		getProductInfo(productid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { image, info, name, options, price } = res.productInfo

					setItemname(name)
					setIteminfo(info)
					setItemimage(image)
					setItemprice(price)
					setOptions(options)
				}
			})
	}
	const getFriendsList = async(username) => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, username }

		searchFriends(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setFriends(res.searchedFriends)
					setNumfriends(res.numSearchedFriends)
				}
			})
	}
	const openFriendsCart = async() => {
		let newOrderingItem = {...orderingItem}
		let newOptions = JSON.parse(JSON.stringify(options))
		let empty = false

		newOptions.forEach(function (option) {
			if (option["type"] == "size" && option["selected"] == "") {
				empty = true
			}

			if (option["options"]) {
				delete option["options"]
			}
		})

		if (!empty) {
			newOrderingItem.name = itemName
			newOrderingItem.image = itemImage
			newOrderingItem.options = newOptions
			newOrderingItem.quantity = quantity
			newOrderingItem.cost = (itemPrice * quantity).toFixed(2)

			setOpenfriendslist(true)
			setOrderingItem(newOrderingItem)
			setErrormsg('')
		} else {
			setErrormsg("Please choose a size")
		}
	}

	useEffect(() => {
		getTheNumCartItems()
		getTheProductInfo()
	}, [])

	return (
		<View style={{ paddingVertical: offsetPadding }}>
			<ScrollView style={style.box}>
				<View>
					<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
						<Text style={style.backHeader}>Back</Text>
					</TouchableOpacity>
					
					<View style={{ alignItems: 'center', marginVertical: 20 }}>
						<View style={style.imageHolder}>
							<Image source={{ uri: logo_url + itemImage }} style={style.image}/>
						</View>
					</View>
					<Text style={style.boxHeader}>{itemName}</Text>
					<Text style={style.boxHeaderInfo}>{itemInfo}</Text>

					{options.map((option, index) => (
						<View key={option.key} style={style.info}>
							<Text style={style.infoHeader}>{option.header}:</Text>

							{option.type == "size" && (
								<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
									<View style={style.options}>
										{option.options.map((info, optindex) => (
											<TouchableOpacity key={info.key} style={option.selected == info.header ? style.optionSelected : style.option} onPress={() => changeOption(index, info.header)}>
												<Text style={option.selected == info.header ? style.optionSelectedHeader : style.optionHeader}>{info.header}</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>
							)}

							{option.type == "quantity" && (
								<View style={{ flexDirection: 'row', justifyContent: 'space-around', width: width - 100 }}>
									<View style={style.quantity}>
										<TouchableOpacity style={style.quantityAction} onPress={() => changeQuantity(index, "-")}>
											<Text style={style.quantityActionHeader}>-</Text>
										</TouchableOpacity>
										<Text style={style.quantityHeader}>{option.selected}</Text>
										<TouchableOpacity style={style.quantityAction} onPress={() => changeQuantity(index, "+")}>
											<Text style={style.quantityActionHeader}>+</Text>
										</TouchableOpacity>
									</View>
								</View>
							)}

							{option.type == "percentage" && (
								<View style={{ flexDirection: 'row', justifyContent: 'space-around', width: width - 100 }}>
									<View style={style.percentage}>
										<TouchableOpacity style={style.percentageAction} onPress={() => changePercentage(index, "-")}>
											<Text style={style.percentageActionHeader}>-</Text>
										</TouchableOpacity>
										<Text style={style.percentageHeader}>{option.selected}%</Text>
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

					<Text style={style.price}>Cost: $ {(itemPrice * quantity).toFixed(2)}</Text>

					{errorMsg ? <Text style={style.errorMsg}>{errorMsg}</Text> : null}

					<View style={style.itemActions}>
						<View style={{ flexDirection: 'row' }}>
							<TouchableOpacity style={style.itemAction} onPress={() => addCart()}>
								<Text style={style.itemActionHeader}>Add to your cart</Text>
							</TouchableOpacity>
							<TouchableOpacity style={style.itemAction} onPress={() => openFriendsCart()}>
								<Text style={style.itemActionHeader}>Add to a friend's cart</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</ScrollView>

			<View style={style.bottomActionsContainer}>
				<View style={style.bottomActions}>
					<TouchableOpacity style={style.bottomAction} onPress={() => setOpencart(true)}>
						<Entypo name="shopping-cart" size={30}/>
						{numCartItems > 0 && <Text style={style.numCartItemsHeader}>{numCartItems}</Text>}
					</TouchableOpacity>
					<TouchableOpacity style={style.bottomAction} onPress={() => {
						props.navigation.dispatch(
							CommonActions.reset({
								index: 0,
								routes: [{ name: "main" }]
							})
						)
					}}>
						<Entypo name="home" size={30}/>
					</TouchableOpacity>
				</View>
			</View>

			<Modal visible={openCart}><Cart close={() => setOpencart(false)}/></Modal>
			<Modal visible={openFriendsList}>
				<View style={{ paddingVertical: offsetPadding }}>
					<View style={style.friendsList}>
						<TextInput style={style.friendNameInput} placeholder="Search friend to order for" onChangeText={(username) => getFriendsList(username)}/>

						<View style={style.friendsListContainer}>
							<View style={{ height: '50%', overflow: 'hidden' }}>
								<Text style={style.friendsHeader}>{numFriends} Searched Friend(s)</Text>

								<View>
									<FlatList
										data={friends}
										renderItem={({ item, index }) => 
											<View key={item.key} style={style.row}>
												{item.row.map(friend => (
													friend.username ? 
														<TouchableOpacity key={friend.key} style={style.friend} onPress={() => selectFriend(friend.id)}>
															<View style={style.friendProfileHolder}>
																<Image source={{ uri: logo_url + friend.profile }} style={{ height: 60, width: 60 }}/>
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
							</View>
						
							<View style={{ height: '50%', overflow: 'hidden' }}>
								{selectedFriends.length > 0 && (
									<>
										<Text style={style.selectedFriendsHeader}>{numSelectedFriends} Selected Friend(s) to order this item</Text>

										<View>
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
																		<Image source={{ uri: logo_url + friend.profile }} style={{ height: 60, width: 60 }}/>
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
									</>
								)}
							</View>
						</View>

						<View style={style.itemContainer}>
							<View style={style.itemImageHolder}>
								<Image style={{ height: 100, width: 100 }} source={{ uri: logo_url + orderingItem.image }}/>
							</View>
							<View style={style.itemInfos}>
								<Text style={style.itemName}>{orderingItem.name}</Text>
								{orderingItem.options.map((info, infoindex) => (
									<Text key={info.key} style={style.itemInfo}>
										<Text style={{ fontWeight: 'bold' }}>{info.header}: </Text> 
										{info.selected}
										{info.type == 'percentage' && '%'}
									</Text>
								))}
							</View>
							<View>
								<Text style={style.itemHeader}><Text style={{ fontWeight: 'bold' }}>quantity:</Text> {orderingItem.quantity}</Text>
								<Text style={style.itemHeader}><Text style={{ fontWeight: 'bold' }}>cost:</Text> $ {orderingItem.cost}</Text>
							</View>
						</View>

						<Text style={style.errorMsg}>{errorMsg}</Text>

						<View style={{ alignItems: 'center' }}>
							<View style={style.actions}>
								<TouchableOpacity style={style.action} onPress={() => {
									setOpenfriendslist(false)
									setSelectedFriends([])
									setNumSelectedFriends(0)
									setErrormsg('')
								}}>
									<Text style={style.actionHeader}>Close</Text>
								</TouchableOpacity>
								<TouchableOpacity style={style.action} onPress={() => addCart()}>
									<Text style={style.actionHeader}>Done</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },

	imageHolder: { borderRadius: 100, height: 200, overflow: 'hidden', width: 200 },
	image: { height: 200, width: 200 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	boxHeaderInfo: {  fontSize: 15, fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },

	info: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, paddingHorizontal: 5, width: '100%' },
	infoHeader: { fontWeight: 'bold', margin: 5 },

	// options
	options: { flexDirection: 'row', justifyContent: 'space-between' },
	optionSelected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 2, padding: 8 },
	optionSelectedHeader: { color: 'white', fontSize: 15 },
	option: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 2, padding: 8 },
	optionHeader: { color: 'black', fontSize: 15 },

	// quantity
	quantity: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	quantityAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	quantityHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	// percentage
	percentage: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	percentageAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	percentageHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	// quantity
	quantity: { flexDirection: 'row', justifyContent: 'space-around' },
	quantityAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	quantityHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	price: { fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },

	itemActions: { flexDirection: 'row', justifyContent: 'space-around' },
	itemAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, marginVertical: 30, padding: 10, width: 100 },
	itemActionHeader: { textAlign: 'center' },

	bottomActionsContainer: { backgroundColor: 'rgba(0, 0, 0, 0.1)', bottom: 0, flexDirection: 'row', justifyContent: 'space-around', position: 'absolute', width: '100%' },
	bottomActions: { flexDirection: 'row', height: 40, justifyContent: 'space-between', width: 100 },
	bottomAction: { flexDirection: 'row', height: 30, marginVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },

	// friends list
	friendsList: { flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	friendNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, marginHorizontal: 20, padding: 10 },
	friendsListContainer: { flexDirection: 'column', height: '70%', justifyContent: 'space-between' },
	friendsHeader: { fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
	friend: { alignItems: 'center', height: width * 0.2, margin: 5, width: width * 0.2 },
	friendDelete: { marginBottom: -5, marginLeft: 60 },
	friendProfileHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 30, height: 60, overflow: 'hidden', width: 60 },
	friendName: { textAlign: 'center' },

	// selected friends list
	selectedFriendsHeader: { fontWeight: 'bold', textAlign: 'center' },

	// ordering item
	itemContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10, padding: 10 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	itemName: { fontWeight: 'bold', marginBottom: 20 },
	itemInfo: { fontSize: 15 },
	itemHeader: { fontSize: 15 },

	actions: { flexDirection: 'row', justifyContent: 'space-around' },
	action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 60 },
	actionHeader: { textAlign: 'center' },
})
