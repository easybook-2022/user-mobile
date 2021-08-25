import React, { useState, useEffect } from 'react';
import { AsyncStorage, Dimensions, ScrollView, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import Constants from 'expo-constants';
import { logo_url } from '../../../assets/info'
import { searchFriends, selectUser, requestUserPaymentMethod } from '../../apis/users'
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
	const { productid } = props.route.params

	const [itemName, setItemname] = useState('')
	const [itemInfo, setIteminfo] = useState('')
	const [itemNote, setItemnote] = useState('')
	const [itemImage, setItemimage] = useState('')
	const [itemPrice, setItemprice] = useState(0)
	const [options, setOptions] = useState([])
	const [others, setOthers] = useState([])
	const [sizes, setSizes] = useState([])
	const [quantity, setQuantity] = useState(1)
	const [cost, setCost] = useState(0)
	const [errorMsg, setErrormsg] = useState('')
	const [showPaymentRequired, setShowpaymentrequired] = useState(false)
	const [showNotifyUser, setShownotifyuser] = useState({ show: false, userid: 0, username: "" })

	// friends list
	const [openFriendscart, setOpenfriendscart] = useState(false)
	const [friends, setFriends] = useState([])
	const [numFriends, setNumfriends] = useState(0)
	const [selectedFriends, setSelectedFriends] = useState([])
	const [numSelectedFriends, setNumSelectedFriends] = useState(0)
	const [orderingItem, setOrderingitem] = useState({ name: "", image: "", options: [], others: [], sizes: [], quantity: 0, cost: 0 })

	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(2)

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
	const changeAmount = (index, action) => {
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
	const selectSize = (index) => {
		let newSizes = [...sizes]
		let newCost = cost

		newSizes.forEach(function (size) {
			if (size.selected) {
				size.selected = false

				newCost -= parseFloat(size.price)
			}
		})

		newSizes[index].selected = true
		newCost = quantity * parseFloat(newSizes[index].price)

		setSizes(newSizes)
		setCost(newCost)
	}
	const selectOther = (index) => {
		let newOthers = [...others]
		let newCost = parseFloat(cost)

		newOthers.forEach(function (other, otherindex) {
			if (otherindex == index) {
				if (other.selected) {
					newCost -= parseFloat(other.price)
				} else {
					newCost += parseFloat(other.price)
				}

				other.selected = !other.selected
			}
		})

		setOthers(newOthers)
		setCost(newCost)
	}
	const changeQuantity = (action) => {
		let newQuantity = quantity
		let newCost = 0

		newQuantity = action == "+" ? newQuantity + 1 : newQuantity - 1

		if (newQuantity < 1) {
			newQuantity = 1
		}

		if (sizes.length > 0) {
			sizes.forEach(function (size) {
				if (size.selected) {
					newCost += newQuantity * parseFloat(size.price)
				}
			})
		} else {
			newCost += newQuantity * parseFloat(itemPrice)
		}

		others.forEach(function (other) {
			if (other.selected) {
				newCost += parseFloat(other.price)
			}
		})

		setQuantity(newQuantity)
		setCost(newCost)
	}
	const addCart = async() => {
		const userid = await AsyncStorage.getItem("userid")
		let callfor = [], size = ""
		let newOptions = JSON.parse(JSON.stringify(options))
		let newOthers = JSON.parse(JSON.stringify(others))
		let newSizes = JSON.parse(JSON.stringify(sizes))

		if (openFriendscart && selectedFriends.length == 0) {
			setErrormsg("You didn't select anyone")
		} else {	
			selectedFriends.forEach(function (info) {
				info.row.forEach(function (friend) {
					if (friend.username) {
						callfor.push({ userid: friend.id, status: friend.paymentrequested ? 'payment' : 'waiting' })
					}
				})
			})

			newSizes.forEach(function (info) {
				delete info['key']
			})

			newOptions.forEach(function (option) {
				delete option['key']
			})

			newOthers.forEach(function (other) {
				delete other['key']
			})

			const data = { userid, productid, quantity, callfor, options: newOptions, others: newOthers, sizes: newSizes, note: itemNote }

			addItemtocart(data)
				.then((res) => {
					if (res.status == 200) {
						if (!res.data.errormsg) {
							return res.data
						} else {
							if (res.data.status == "cardrequired") {
								setShowpaymentrequired(true)
							}
						}
					}
				})
				.then((res) => {
					if (res) {
						setOpenfriendscart(false)
						showCart()
					}
				})
				.catch((err) => {
					if (err.response.status == 400) {
						if (err.response.data.status) {
							const status = err.response.data.status

							switch (status) {
								case "cardrequired":
									setShowpaymentrequired(true)

									break;
								default:
							}
						}
					}
				})
		}
	}
	const showCart = () => {
		setOpenfriendscart(false)
		setSelectedFriends([])
		setNumSelectedFriends(0)
		setOpencart(true)
		setNumcartitems(numCartItems + 1)
	}

	const getTheProductInfo = async() => {
		getProductInfo(productid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { image, info, name, options, others, sizes, price } = res.productInfo

					setItemname(name)
					setIteminfo(info)
					setItemimage(image)
					setItemprice(price)
					setOptions(options)
					setOthers(others)
					setSizes(sizes)
					setCost(quantity * price)
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
	const selectFriend = (userid) => {
		let newFriends = [...friends]
		let newSelectedFriends = [...selectedFriends]
		let selected = { id: "", key: "", profile: "", username: "", paymentrequested: false }
		let last_row = null, next_key = null, unfill = false

		if (JSON.stringify(newSelectedFriends).includes("\"id\":" + userid + ",")) {
			return
		}

		selectUser(userid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { username, cards } = res

					if (cards == 0) {
						selected.paymentrequested = true

						setShownotifyuser({ show: true, userid, username })
					}
					
					// get last selected friend
					newFriends.forEach(function (info) {
						info.row.forEach(function (friend) {
							if (friend.id == userid) {
								selected.id = userid
								selected.profile = friend.profile
								selected.username = friend.username
							}
						})
					})

					if (newSelectedFriends.length > 0) {
						last_row = newSelectedFriends[newSelectedFriends.length - 1].row

						for (k in last_row) {
							if (last_row[k].id) {
								next_key = parseInt(last_row[k].key.split("-").pop()) + 1
							} else {
								unfill = true
								selected.key = "selected-friend-" + next_key
								last_row[k] = selected
								next_key += 1

								break
							}
						}

						if (unfill) {
							newSelectedFriends[newSelectedFriends.length - 1].row = last_row
							setNumSelectedFriends(numSelectedFriends + 1)
						} else {
							selected.key = "selected-friend-" + next_key
							newSelectedFriends.push({
								key: "selected-friend-row-" + (newSelectedFriends.length),
								row: [
									selected,
									{ key: "selected-friend-" + (next_key + 1) },
									{ key: "selected-friend-" + (next_key + 2) },
									{ key: "selected-friend-" + (next_key + 3) }
								]
							})
						}

						setNumSelectedFriends(numSelectedFriends + 1)
					} else {
						selected.key = "selected-friend-0"
						newSelectedFriends = [{
							key: "selected-friend-row-0",
							row: [
								selected,
								{ key: "selected-friend-1" },
								{ key: "selected-friend-2" },
								{ key: "selected-friend-3" }
							]
						}]
						setNumSelectedFriends(1)
					}

					setSelectedFriends(newSelectedFriends)
				}
			})
	}
	const requestTheUserPaymentMethod = () => {
		const { userid } = showNotifyUser

		requestUserPaymentMethod(userid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) setShownotifyuser({ show: false, userid: "", username: "" })
			})
	}
	const deselectFriend = (userid) => {
		let list = [...selectedFriends]
		let last_row = list[list.length - 1].row
		let newList = [], row = [], info, num = 0

		list.forEach(function (listitem) {
			listitem.row.forEach(function (info) {
				if (info.id && info.id != userid) {
					row.push({
						key: "selected-friend-" + num,
						id: info.id,
						profile: info.profile,
						username: info.username
					})
					num++

					if (row.length == 4) {
						newList.push({ key: "selected-friend-row-" + (newList.length), row })
						row = []
					}
				}
			})
		})

		if (row.length > 0) {
			while (row.length < 4) {
				row.push({ key: "selected-friend-" + num })
				num++
			}

			newList.push({ key: "selected-friend-row-" + (newList.length), row })
		}

		setSelectedFriends(newList)
		setNumSelectedFriends(numSelectedFriends - 1)
	}
	const openFriendsCart = async() => {
		let newOrderingItem = {...orderingItem}
		let newOptions = JSON.parse(JSON.stringify(options))
		let newOthers = JSON.parse(JSON.stringify(others))
		let newSizes = JSON.parse(JSON.stringify(sizes))
		let price = ""

		if (sizes.length > 0) {
			sizes.forEach(function (size) {
				if (size.selected) {
					price = parseFloat(size.price) * quantity
				}
			})
		} else {
			price = itemPrice * quantity
		}

		if (price) {
			newOrderingItem.name = itemName
			newOrderingItem.image = itemImage
			newOrderingItem.options = options
			newOrderingItem.others = others
			newOrderingItem.sizes = sizes
			newOrderingItem.quantity = quantity
			newOrderingItem.cost = price.toFixed(2)

			setOpenfriendscart(true)
			setOrderingitem(newOrderingItem)
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
		<View style={style.itemprofile}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
						<Text style={style.backHeader}>Back</Text>
					</TouchableOpacity>

					<ScrollView style={{ height: screenHeight - 114 }}>
						<View style={{ alignItems: 'center', marginVertical: 20 }}>
							<View style={style.imageHolder}>
								<Image source={{ uri: logo_url + itemImage }} style={style.image}/>
							</View>
						</View>
						<Text style={style.boxHeader}>{itemName}</Text>
						<Text style={style.boxHeaderInfo}>{itemInfo}</Text>

						{options.map((option, index) => (
							<View key={option.key} style={{ alignItems: 'center' }}>
								<View style={style.info}>
									<Text style={style.infoHeader}>{option.header}:</Text>

									{option.type == "amount" && (
										<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
											<View style={style.amount}>
												<TouchableOpacity style={style.amountAction} onPress={() => changeAmount(index, "-")}>
													<Text style={style.amountActionHeader}>-</Text>
												</TouchableOpacity>
												<Text style={style.amountHeader}>{option.selected}</Text>
												<TouchableOpacity style={style.amountAction} onPress={() => changeAmount(index, "+")}>
													<Text style={style.amountActionHeader}>+</Text>
												</TouchableOpacity>
											</View>
										</View>
									)}

									{option.type == "percentage" && (
										<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
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
							</View>
						))}

						{others.length > 0 && (
							<View style={style.othersBox}>
								<Text style={style.othersHeader}>Other options</Text>

								<View style={style.others}>
									{others.map((other, index) => (
										<View key={other.key} style={{ alignItems: 'center' }}>
											<View style={style.other}>
												<Text style={style.otherName}># {other.name}:</Text>
												<Text style={style.otherInput}>{other.input}</Text>
												<Text style={style.otherPrice}>$ {other.price}</Text>

												<View style={style.otherActions}>
													<TouchableOpacity style={other.selected ? style.otherActionLeftDisabled : style.otherActionLeft} onPress={() => selectOther(index)}>
														<Text style={[style.otherActionHeader, { color: other.selected ? 'white' : 'black' }]}>Yes</Text>
													</TouchableOpacity>
													<TouchableOpacity style={!other.selected ? style.otherActionRightDisabled : style.otherActionRight} onPress={() => selectOther(index)}>
														<Text style={[style.otherActionHeader, { color: !other.selected ? 'white' : 'black' }]}>No</Text>
													</TouchableOpacity>
												</View>
											</View>
										</View>
									))}
								</View>
							</View>
						)}

						{sizes.length > 0 && (
							<View style={style.sizesBox}>
								<Text style={style.sizesHeader}>Select a Size</Text>

								<View style={style.sizes}>
									{sizes.map((size, index) => (
										<View key={size.key} style={style.size}>
											<TouchableOpacity style={size.selected ? style.sizeTouchDisabled : style.sizeTouch} onPress={() => selectSize(index)}>
												<Text style={size.selected ? style.sizeTouchHeaderDisabled : style.sizeTouchHeader}>{size.name}</Text>
											</TouchableOpacity>
											<Text style={style.sizePrice}>$ {size.price}</Text>
										</View>
									))}
								</View>
							</View>
						)}

						<View style={style.note}>
							<TextInput style={style.noteInput} multiline={true} placeholder="Leave a note if you want" maxLength={100} onChangeText={(note) => setItemnote(note)} autoCorrect={false}/>
						</View>

						<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
							<View style={{ flexDirection: 'row' }}>
								<Text style={style.quantityHeader}>Quantity:</Text>
								<View style={style.quantity}>
									<TouchableOpacity style={style.quantityAction} onPress={() => changeQuantity("-")}>
										<Text style={style.quantityActionHeader}>-</Text>
									</TouchableOpacity>
									<Text style={style.quantityHeader}>{quantity}</Text>
									<TouchableOpacity style={style.quantityAction} onPress={() => changeQuantity("+")}>
										<Text style={style.quantityActionHeader}>+</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>

						<Text style={style.price}>Cost: $ {cost.toFixed(2)}</Text>

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

					{openCart && <Modal><Cart close={() => setOpencart(false)}/></Modal>}
					{openFriendscart && (
						<Modal>
							<View style={{ paddingVertical: offsetPadding }}>
								<View style={style.usersList}>
									<TextInput style={style.userNameInput} placeholder="Search friend to order for" onChangeText={(username) => getFriendsList(username)} autoCorrect={false}/>

									<View style={style.usersListContainer}>
										<View style={{ height: '50%', overflow: 'hidden' }}>
											<Text style={style.usersHeader}>{numFriends} Searched Friend(s)</Text>

											<FlatList
												data={friends}
												renderItem={({ item, index }) => 
													<View key={item.key} style={style.row}>
														{item.row.map(friend => (
															friend.username ? 
																<TouchableOpacity key={friend.key} style={style.user} onPress={() => selectFriend(friend.id)}>
																	<View style={style.userProfileHolder}>
																		<Image source={{ uri: logo_url + friend.profile }} style={{ height: 60, width: 60 }}/>
																	</View>
																	<Text style={style.userName}>{friend.username}</Text>
																</TouchableOpacity>
																:
																<View key={friend.key} style={style.user}></View>
														))}
													</View>
												}
											/>
										</View>

										<View style={{ height: '50%', overflow: 'hidden' }}>
											{selectedFriends.length > 0 && (
												<>
													<Text style={style.selectedUsersHeader}>{numSelectedFriends} Selected Friend(s) to order this item</Text>

													<FlatList
														data={selectedFriends}
														renderItem={({ item, index }) => 
															<View key={item.key} style={style.row}>
																{item.row.map(friend => (
																	friend.username ? 
																		<View key={friend.key} style={style.user}>
																			<TouchableOpacity style={style.userDelete} onPress={() => deselectFriend(friend.id)}>
																				<AntDesign name="closecircleo" size={15}/>
																			</TouchableOpacity>
																			<View style={style.userProfileHolder}>
																				<Image source={{ uri: logo_url + friend.profile }} style={{ height: 60, width: 60 }}/>
																			</View>
																			<Text style={style.userName}>{friend.username}</Text>
																		</View>
																		:
																		<View key={friend.key} style={style.user}></View>
																))}
															</View>
														}
													/>
												</>
											)}
										</View>
									</View>

									<View>
										<View style={style.itemContainer}>
											<View style={style.orderingItemImageHolder}>
												<Image style={{ height: 100, width: 100 }} source={{ uri: logo_url + orderingItem.image }}/>
											</View>
											<View style={style.itemInfos}>
												<Text style={style.orderingItemName}>{orderingItem.name}</Text>
												
												{orderingItem.options.map((info, infoindex) => (
													<Text key={info.key} style={style.itemInfo}>
														<Text style={{ fontWeight: 'bold' }}>{info.header}: </Text> 
														{info.selected}
														{info.type == 'percentage' && '%'}
													</Text>
												))}

												{orderingItem.others.map((info, infoindex) => (
													<Text key={info.key} style={style.itemInfo}>
														<Text style={{ fontWeight: 'bold' }}>{info.name}: </Text> 
														<Text>{info.input}</Text>
													</Text>
												))}

												{orderingItem.sizes.map((info, infoindex) => (
													info.selected ? 
														<Text key={info.key} style={style.itemInfo}>
															<Text style={{ fontWeight: 'bold' }}>Size: </Text> 
															<Text>{info.name}</Text>
														</Text>
													: null
												))}
											</View>
											<View>
												<Text style={style.itemHeader}><Text style={{ fontWeight: 'bold' }}>quantity:</Text> {orderingItem.quantity}</Text>
												<Text style={style.itemHeader}><Text style={{ fontWeight: 'bold' }}>cost:</Text> $ {orderingItem.cost}</Text>
											</View>
										</View>

										<Text style={style.friendErrorMsg}>{errorMsg}</Text>

										<View style={{ alignItems: 'center' }}>
											<View style={style.actions}>
												<TouchableOpacity style={style.action} onPress={() => {
													setOpenfriendscart(false)
													setSelectedFriends([])
													setNumSelectedFriends(0)
													setErrormsg('')
												}}>
													<Text style={style.actionHeader}>Close</Text>
												</TouchableOpacity>
												<TouchableOpacity style={style.action} onPress={() => addCart()}>
													<Text style={style.actionHeader}>Add</Text>
												</TouchableOpacity>
											</View>
										</View>
									</View>
								</View>
							</View>

							{showNotifyUser.show && (
								<Modal transparent={true}>
									<View style={{ paddingVertical: offsetPadding }}>
										<View style={style.notifyUserBox}>
											<View style={style.notifyUserContainer}>
												<Text style={style.notifyUserHeader}>
													{showNotifyUser.username} haven't provided a payment method.
													Notify {showNotifyUser.username} to add a payment method
												</Text>

												<View style={style.notifyUserActions}>
													<TouchableOpacity style={style.notifyUserAction} onPress={() => setShownotifyuser({ show: false, userid: 0, username: "" })}>
														<Text style={style.notifyUserActionHeader}>Close</Text>
													</TouchableOpacity>
													<TouchableOpacity style={style.notifyUserAction} onPress={() => requestTheUserPaymentMethod()}>
														<Text style={style.notifyUserActionHeader}>Ok</Text>
													</TouchableOpacity>
												</View>
											</View>
										</View>
									</View>
								</Modal>
							)}
						</Modal>
					)}
					{showPaymentRequired && (
						<Modal transparent={true}>
							<View style={{ paddingVertical: offsetPadding }}>
								<View style={style.cardRequiredBox}>
									<View style={style.cardRequiredContainer}>
										<Text style={style.cardRequiredHeader}>
											You need to provide a payment method to accept
											a reservation
										</Text>

										<View style={style.cardRequiredActions}>
											<TouchableOpacity style={style.cardRequiredAction} onPress={() => setShowpaymentrequired(false)}>
												<Text style={style.cardRequiredActionHeader}>Close</Text>
											</TouchableOpacity>
											<TouchableOpacity style={style.cardRequiredAction} onPress={() => {
												setShowpaymentrequired(false)
												props.navigation.navigate("account", { required: "card" })
											}}>
												<Text style={style.cardRequiredActionHeader}>Ok</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							</View>
						</Modal>
					)}
				</View>
			</View>
		</View>
	);
}

const style = StyleSheet.create({
	itemprofile: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 34, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },

	imageHolder: { borderRadius: 100, height: 200, overflow: 'hidden', width: 200 },
	image: { height: 200, width: 200 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	boxHeaderInfo: {  fontSize: 15, fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },

	info: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30, paddingHorizontal: 5 },
	infoHeader: { fontWeight: 'bold', marginVertical: 7, marginRight: 20 },

	// amount
	amount: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	amountAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	amountHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	// percentage
	percentage: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	percentageAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	percentageHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	// others
	othersBox: { alignItems: 'center', marginVertical: 20 },
	othersHeader: { fontWeight: 'bold' },
	others: { marginVertical: 20, width: '100%' },
	other: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 5, width: '100%' },
	otherName: { fontSize: 20, fontWeight: 'bold' },
	otherInput: { fontSize: 20 },
	otherPrice: { fontWeight: 'bold', marginTop: 5 },
	otherActions: { flexDirection: 'row', marginTop: -5 },
	otherActionLeft: { alignItems: 'center', borderBottomLeftRadius: 5, borderTopLeftRadius: 5, borderRightWidth: 0.25, borderStyle: 'solid', borderWidth: 0.5, padding: 10, width: 50 },
	otherActionLeftDisabled: { alignItems: 'center', backgroundColor: 'black', borderBottomLeftRadius: 5, borderTopLeftRadius: 5, borderRightWidth: 0.25, borderStyle: 'solid', borderWidth: 0.5, padding: 10, width: 50 },
	otherActionRight: { alignItems: 'center', borderBottomRightRadius: 5, borderTopRightRadius: 5, borderLeftWidth: 0.25, borderStyle: 'solid', borderWidth: 0.5, padding: 10, width: 50 },
	otherActionRightDisabled: { alignItems: 'center', backgroundColor: 'black', borderBottomRightRadius: 5, borderTopRightRadius: 5, borderLeftWidth: 0.25, borderStyle: 'solid', borderWidth: 0.5, padding: 10, width: 50 },

	// sizes
	sizesBox: { alignItems: 'center', marginVertical: 20 },
	sizesHeader: { fontWeight: 'bold' },
	sizes: { marginVertical: 20 },
	size: { flexDirection: 'row', marginVertical: 5 },
	sizeTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, padding: 10 },
	sizeTouchDisabled: { backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, padding: 10 },
	sizeTouchHeader: { textAlign: 'center' },
	sizeTouchHeaderDisabled: { color: 'white', textAlign: 'center' },
	sizePrice: { fontWeight: 'bold', margin: 10 },

	// note
	note: { alignItems: 'center', marginBottom: 20 },
	noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, height: 100, padding: 5, width: '80%' },

	// quantity
	quantity: { flexDirection: 'row', justifyContent: 'space-around' },
	quantityAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	quantityHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	price: { fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },

	itemActions: { flexDirection: 'row', justifyContent: 'space-around' },
	itemAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, marginVertical: 30, padding: 10, width: 100 },
	itemActionHeader: { textAlign: 'center' },

	bottomActionsContainer: { backgroundColor: 'white', bottom: 0, flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomActions: { flexDirection: 'row', height: '100%', justifyContent: 'space-between', width: 100 },
	bottomAction: { flexDirection: 'row', height: 30, marginVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },

	// users list
	usersList: { flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	userNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, marginHorizontal: 20, padding: 10 },
	usersListContainer: { flexDirection: 'column', height: screenHeight - 230, justifyContent: 'space-between' },
	usersHeader: { fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
	user: { alignItems: 'center', height: width * 0.2, margin: 5, width: width * 0.2 },
	userDelete: { marginBottom: -5, marginLeft: 60 },
	userProfileHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 30, height: 60, overflow: 'hidden', width: 60 },
	userName: { textAlign: 'center' },
	selectedUsersHeader: { fontWeight: 'bold', textAlign: 'center' },

	// ordering item
	itemContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 10, flexDirection: 'row', height: 130, justifyContent: 'space-between', marginHorizontal: 10, padding: 10 },
	orderingItemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	orderingItemName: { fontWeight: 'bold', marginBottom: 20 },
	itemInfo: { fontSize: 15 },
	itemHeader: { fontSize: 15 },

	friendErrorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 0, textAlign: 'center' },

	actions: { flexDirection: 'row', height: 30, justifyContent: 'space-around' },
	action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 60 },
	actionHeader: { textAlign: 'center' },

	// search friends
	searchFriendsHidden: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	searchFriendsBox: { backgroundColor: 'white', height: '90%', width: '90%' },
	searchFriendNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, margin: 10, padding: 10 },

	cardRequiredBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	cardRequiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	cardRequiredHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	cardRequiredActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cardRequiredAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	cardRequiredActionHeader: { },

	notifyUserBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	notifyUserContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	notifyUserHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	notifyUserActions: { flexDirection: 'row', justifyContent: 'space-around' },
	notifyUserAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	notifyUserActionHeader: { }
})
