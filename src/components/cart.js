import React, { useState, useEffect } from 'react';
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { logo_url } from '../../assets/info'
import { searchFriends, selectUser, requestUserPaymentMethod } from '../apis/users'
import { getCartItems, editCartItem, updateCartItem, removeFromCart, changeCartItem, editCallfor, updateCallfor, removeCallfor, checkoutCart } from '../apis/carts'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function cart(props) {
	const [items, setItems] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [activeCheckout, setActivecheckout] = useState(false)
	const [loading, setLoading] = useState(false)
	const [showConfirm, setShowconfirm] = useState(false)
	const [itemInfo, setIteminfo] = useState({ 
		show: false, cartid: "", name: "", info: "", note: "", 
		image: "", price: "", options: [], others: [], sizes: [], quantity: 1, cost: 0,
		errorMsg: ""
	})

	// friends cart
	const [openFriendscart, setOpenfriendscart] = useState(false)
	const [friends, setFriends] = useState([])
	const [numFriends, setNumfriends] = useState(0)
	const [selectedFriends, setSelectedFriends] = useState([])
	const [numSelectedFriends, setNumselectedfriends] = useState(0)
	const [orderingItem, setOrderingItem] = useState({ name: "", image: "", options: [], quantity: 0, cost: 0, price: 0 })
	const [errorMsg, setErrormsg] = useState('')
	const [showPaymentRequired, setShowpaymentrequired] = useState(false)
	const [showNotifyUser, setShownotifyuser] = useState({ show: false, userid: 0, username: "" })

	const changeOption = (index, selected) => {
		let { options } = itemInfo
		let newOptions = [...options]

		newOptions[index].selected = selected

		setIteminfo({ ...itemInfo, options: newOptions })
	}
	const changeAmount = (index, action) => {
		let { options } = itemInfo
		let newOptions = [...options]
		let { selected } = newOptions[index]

		selected = action == "+" ? selected + 1 : selected - 1

		if (selected >= 0) {
			newOptions[index].selected = selected

			setIteminfo({ ...itemInfo, options: newOptions })
		}
	}
	const changePercentage = (index, action) => {
		let { options } = itemInfo
		let newOptions = [...options]
		let { selected } = newOptions[index]

		selected = action == "+" ? selected + 10 : selected - 10

		if (selected >= 0 && selected <= 100) {
			newOptions[index].selected = selected

			setIteminfo({ ...itemInfo, options: newOptions })
		}
	}
	const selectSize = (index) => {
		let { sizes, quantity, cost } = itemInfo
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

		setIteminfo({
			...itemInfo,
			sizes: newSizes,
			cost: newCost
		})
	}
	const selectOther = (index) => {
		let { others, cost } = itemInfo
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

		setIteminfo({
			...itemInfo,
			others: newOthers,
			cost: newCost
		})
	}
	const changeQuantity = (action) => {
		let { price, others, sizes, quantity } = itemInfo
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
			newCost += newQuantity * parseFloat(price)
		}

		others.forEach(function (other) {
			if (other.selected) {
				newCost += parseFloat(other.price)
			}
		})

		setIteminfo({
			...itemInfo,
			quantity: newQuantity,
			cost: newCost
		})
	}

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
					setLoaded(true)
				}
			})
	}
	const editTheCartItem = async(cartid) => {
		editCartItem(cartid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { name, info, image, quantity, options, others, sizes, note, price, cost } = res.cartItem

					setIteminfo({
						...itemInfo,
						show: true,
						cartid,
						name, info, image,
						quantity, note, options, others, sizes,
						price, cost
					})
				}
			})
	}
	const updateTheCartItem = async() => {
		const { cartid, quantity, options, others, sizes, note } = itemInfo
		const newOptions = JSON.parse(JSON.stringify(options))
		const newOthers = JSON.parse(JSON.stringify(others))
		const newSizes = JSON.parse(JSON.stringify(sizes))
		const data = { cartid, quantity, note }

		newOptions.forEach(function (option) {
			delete option['key']
		})

		newOthers.forEach(function (other) {
			delete other['key']
		})

		newSizes.forEach(function (size) {
			delete size['key']
		})

		data['options'] = newOptions
		data['others'] = newOthers
		data['sizes'] = newSizes

		updateCartItem(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setIteminfo({ ...itemInfo, show: false })
					getTheCartItems()
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
								next_key = parseInt(last_row[k].key.substr(16)) + 1
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
							setNumselectedfriends(numSelectedFriends + 1)
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

						setNumselectedfriends(numSelectedFriends + 1)
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
						setNumselectedfriends(1)
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
		setNumselectedfriends(numSelectedFriends - 1)
	}
	const openFriendsCart = async() => {
		const { quantity, price, options, others, sizes } = itemInfo
		let newOrderingItem = {...orderingItem}
		let newOptions = JSON.parse(JSON.stringify(options))
		let newOthers = JSON.parse(JSON.stringify(others))
		let newSizes = JSON.parse(JSON.stringify(sizes))
		let empty = false, cost = 0

		if (newSizes.length > 0) {
			newSizes.forEach(function (size) {
				if (size.selected) {
					cost += parseFloat(size.price) * quantity
				}
			})
		} else {
			cost += price * quantity
		}

		if (!cost) {
			newOrderingItem.name = itemName
			newOrderingItem.image = itemImage
			newOrderingItem.options = newOptions
			newOrderingItem.others = newOthers
			newOrderingItem.sizes = newSizes
			newOrderingItem.quantity = quantity
			newOrderingItem.cost = cost
			newOrderingItem.price = price

			setOpenfriendscart(true)
			setOrderingItem(newOrderingItem)
			setErrormsg('')
		} else {
			setErrormsg("Please choose a size")
		}
	}
	const editTheCallfor = async(cartid) => {
		editCallfor(cartid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setSelectedFriends(res.searchedFriends)
					setNumselectedfriends(res.numSearchedFriends)
					setOrderingItem(res.orderingItem)
					setOpenfriendscart(true)
					setIteminfo({ ...itemInfo, cartid })
				}
			})
	}
	const updateTheCallfor = async() => {
		let { cartid } = itemInfo
		let callfor = []

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

			const data = { cartid, callfor }

			updateCallfor(data)
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
						getTheCartItems()
						setOpenfriendscart(false)
					}
				})
		}
	}
	const removeTheCallfor = async(cartid, callforid) => {
		const data = { cartid, callforid }

		removeCallfor(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) getTheCartItems()
			})
	}
	const checkout = async() => {
		const time = Date.now()
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, time }

		setLoading(true)

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
					setLoading(false)
				}
			})
	}

	useEffect(() => {
		getTheCartItems()
	}, [])

	return (
		<View style={style.cart}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={[style.box, { opacity: loading ? 0.5 : 1 }]}>
					<View style={{ alignItems: 'center', width: '100%' }}>
						<TouchableOpacity style={style.close} onPress={() => props.close()}>
							<AntDesign name="closecircleo" size={30}/>
						</TouchableOpacity>
					</View>
					<Text style={style.boxHeader}>Cart</Text>

					{loaded ? 
						items.length > 0 ?
							<>
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
														<Text key={option.key} style={style.itemInfo}>
															<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
															{option.selected}
															{option.type == 'percentage' && '%'}
														</Text>
													))}

													{item.others.map((other, otherindex) => (
														other.selected ? 
															<Text key={other.key} style={style.itemInfo}>
																<Text style={{ fontWeight: 'bold' }}>{other.name}: </Text>
																<Text>{other.input}</Text>
															</Text>
														: null
													))}

													{item.sizes.map((size, sizeindex) => (
														size.selected ? 
															<Text key={size.key} style={style.itemInfo}>
																<Text style={{ fontWeight: 'bold' }}>Size: </Text>
																<Text>{size.name}</Text>
															</Text>
														: null
													))}
												</View>
												<View>
													<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>Quantity:</Text> {item.quantity}</Text>
													<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>Cost:</Text> ${item.cost.toFixed(2)}</Text>
												</View>
											</View>

											<View style={{ alignItems: 'center' }}>
												<TouchableOpacity style={style.itemChange} onPress={() => editTheCartItem(item.id)}>
													<Text style={style.itemChangeHeader}>Edit Order</Text>
												</TouchableOpacity>
											</View>

											{item.note ? 
												<View style={style.note}>
													<Text style={style.noteHeader}><Text style={{ fontWeight: 'bold' }}>Customer's note:</Text> {'\n' + item.note}</Text>
												</View>
											: null }

											<View style={{ alignItems: 'center' }}>
												<View style={style.orderersEdit}>
													<Text style={style.orderersEditHeader}>Calling for</Text>
													<TouchableOpacity style={style.orderersEditTouch} onPress={() => editTheCallfor(item.id)}>
														<Text style={style.orderersEditTouchHeader}>{item.orderers.length > 0 ? 'Edit' : 'Add'}</Text>
													</TouchableOpacity>
												</View>
											</View>

											{item.orderers.length > 0 && (
												<View style={style.orderersContainer}>
													<View style={style.orderers}>
														{item.orderers.map((orderer) => (
															<View key={orderer.key} style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
																{orderer.row.map((info) => (
																	info.id ? 
																		<View key={info.key} style={style.orderer}>
																			<View style={style.ordererProfileHolder}>
																				<Image source={{ uri: logo_url + info.profile }} style={style.ordererProfile}/>
																			</View>
																			<Text style={style.ordererHeader}>{info.username}</Text>
																			<Text style={style.ordererStatus}>{info.status}</Text>

																			<TouchableOpacity style={style.ordererRemove} onPress={() => removeTheCallfor(item.id, info.id)}>
																				<Text style={style.ordererRemoveHeader}>Remove</Text>
																			</TouchableOpacity>
																		</View>
																		:
																		<View key={info.key} style={style.orderer}></View>
																))}
															</View>
														))}
													</View>
												</View>
											)}
										</View>
									}
								/>

								<View style={{ alignItems: 'center' }}>
									{loading && <ActivityIndicator size="small"/>}
									<TouchableOpacity style={activeCheckout && !loading ? style.checkout : style.checkoutDisabled} disabled={!activeCheckout || loading} onPress={() => checkout()}>
										<Text style={style.checkoutHeader}>Checkout</Text>
									</TouchableOpacity>
								</View>
							</>
							:
							<View style={{ alignItems: 'center', flexDirection: 'column', height: screenHeight - 117, justifyContent: 'space-around' }}>
								<Text>Your cart is empty</Text>
							</View>
						:
						<View style={{ flexDirection: 'column', height: screenHeight - 113, justifyContent: 'space-around' }}>
							<ActivityIndicator size="small"/>
						</View>
					}
				</View>

				{showConfirm && (
					<Modal transparent={true}>
						<View style={style.confirm}>
							<View style={{ paddingVertical: offsetPadding }}>
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
							</View>
						</View>
					</Modal>
				)}

				{itemInfo.show && (
					<Modal transparent={true}>
						<View style={style.itemInfoBox}>
							<View style={{ paddingVertical: offsetPadding }}>
								<View style={style.itemInfoContainer}>
									<View style={{ alignItems: 'center', marginVertical: 20 }}>
										<TouchableOpacity style={style.itemClose} onPress={() => setIteminfo({ ...itemInfo, show: false })}>
											<AntDesign name="close" size={20}/>
										</TouchableOpacity>
									</View>
									<ScrollView style={{ height: screenHeight - 68 }}>
										<View style={{ alignItems: 'center', marginBottom: 20 }}>
											<View style={style.imageHolder}>
												<Image source={{ uri: logo_url + itemInfo.image }} style={style.image}/>
											</View>
										</View>
										<Text style={style.boxItemHeader}>{itemInfo.name}</Text>
										<Text style={style.boxItemHeaderInfo}>{itemInfo.info}</Text>

										{itemInfo.options.map((option, index) => (
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

										{itemInfo.others.length > 0 && (
											<View style={style.othersBox}>
												<Text style={style.othersHeader}>Other options</Text>

												<View style={style.others}>
													{itemInfo.others.map((other, index) => (
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

										{itemInfo.sizes.length > 0 && (
											<View style={style.sizesBox}>
												<Text style={style.sizesHeader}>Select a Size</Text>

												<View style={style.sizes}>
													{itemInfo.sizes.map((size, index) => (
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
											<TextInput style={style.noteInput} multiline={true} placeholder="Leave a note if you want" maxLength={100} onChangeText={(note) => setIteminfo({ ...itemInfo, note })} value={itemInfo.note} autoCorrect={false}/>
										</View>

										<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
											<View style={{ flexDirection: 'row' }}>
												<Text style={style.quantityHeader}>Quantity</Text>
												<View style={style.quantity}>
													<TouchableOpacity style={style.quantityAction} onPress={() => changeQuantity("-")}>
														<Text style={style.quantityActionHeader}>-</Text>
													</TouchableOpacity>
													<Text style={style.quantityHeader}>{itemInfo.quantity}</Text>
													<TouchableOpacity style={style.quantityAction} onPress={() => changeQuantity("+")}>
														<Text style={style.quantityActionHeader}>+</Text>
													</TouchableOpacity>
												</View>
											</View>
										</View>

										<Text style={style.price}>Cost: $ {itemInfo.cost.toFixed(2)}</Text>

										{itemInfo.errorMsg ? <Text style={style.errorMsg}>{itemInfo.errorMsg}</Text> : null}

										<View style={style.itemActions}>
											<View style={{ flexDirection: 'row' }}>
												<TouchableOpacity style={style.itemAction} onPress={() => updateTheCartItem()}>
													<Text style={style.itemActionHeader}>Update item to cart</Text>
												</TouchableOpacity>
											</View>
										</View>
									</ScrollView>
								</View>
							</View>
						</View>
					</Modal>
				)}

				{openFriendscart && (
					<Modal>
						<View style={style.friendsCart}>
							<View style={{ paddingVertical: offsetPadding }}>
								<View style={style.friendsList}>
									<TextInput style={style.friendNameInput} placeholder="Search friend to order for" onChangeText={(username) => getFriendsList(username)} autoCorrect={false}/>

									<View style={style.friendsListContainer}>
										<View style={style.friendsListSearched}>
											<Text style={style.friendsHeader}>{numFriends} Searched Friend(s)</Text>

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

										<View style={style.friendsListSelected}>
											{selectedFriends.length > 0 && (
												<>
													<Text style={style.selectedFriendsHeader}>{numSelectedFriends} Selected Friend(s) to order this item</Text>

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
												</>
											)}
										</View>
									</View>

									<View>
										<View style={style.itemContainer}>
											<View style={style.orderingItemImageHolder}>
												<Image style={{ height: 50, width: 50 }} source={{ uri: logo_url + orderingItem.image }}/>
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

												{orderingItem.others.map((other, infoindex) => (
													other.selected ? 
														<Text key={other.key} style={style.itemInfo}>
															<Text style={{ fontWeight: 'bold' }}>{other.name}: </Text>
															<Text>{other.input}</Text>
														</Text>
													: null
												))}

												{orderingItem.sizes.map((size, infoindex) => (
													size.selected ? 
														<Text key={size.key} style={style.itemInfo}>
															<Text style={{ fontWeight: 'bold' }}>Size: </Text>
															<Text>{size.name}</Text>
														</Text>
													: null
												))}
											</View>
											<View>
												<Text style={style.itemHeader}><Text style={{ fontWeight: 'bold' }}>quantity:</Text> {orderingItem.quantity}</Text>
												<Text style={style.itemHeader}><Text style={{ fontWeight: 'bold' }}>cost:</Text> $ {orderingItem.cost.toFixed(2)}</Text>
											</View>
										</View>

										<Text style={style.friendErrorMsg}>{errorMsg}</Text>

										<View style={{ alignItems: 'center' }}>
											<View style={style.actions}>
												<TouchableOpacity style={style.action} onPress={() => {
													setOpenfriendscart(false)
													setSelectedFriends([])
													setNumselectedfriends(0)
													setErrormsg('')
												}}>
													<Text style={style.actionHeader}>Close</Text>
												</TouchableOpacity>
												<TouchableOpacity style={style.action} onPress={() => updateTheCallfor()}>
													<Text style={style.actionHeader}>Update</Text>
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
						</View>
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
	);
}

const style = StyleSheet.create({
	cart: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', height: screenHeight, width: '100%' },
	close: { margin: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },

	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 35, height: 70, overflow: 'hidden', width: 70 },
	itemImage: { height: 70, width: 70 },
	itemInfos: {  },
	itemName: { fontSize: 20, marginBottom: 10 },
	itemInfo: { fontSize: 15 },
	header: { fontSize: 15 },
	itemChange: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 5, width: 80 },
	itemChangeHeader: { fontSize: 13, textAlign: 'center' },
	note: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, padding: 5 },
	noteHeader: { textAlign: 'center' },
	orderersContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, marginVertical: 10, padding: 5 },
	orderersEdit: { flexDirection: 'row' },
	orderersEditHeader: { fontWeight: 'bold', marginRight: 10, marginTop: 7, textAlign: 'center' },
	orderersEditTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	orderersEditTouchHeader: { },
	orderers: {  },
	orderer: { alignItems: 'center', margin: 10, width: width / 4 },
	ordererProfileHolder: { backgroundColor: 'white', borderRadius: 20, height: 40, overflow: 'hidden', width: 40 },
	ordererProfile: { height: 40, width: 40 },
	ordererHeader: {  },
	ordererStatus: { fontWeight: 'bold' },
	ordererRemove: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	ordererRemoveHeader: { },

	checkout: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginVertical: 20, padding: 10 },
	checkoutDisabled: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginVertical: 20, opacity: 0.3, padding: 10 },
	checkoutHeader: { },

	// confirm & requested box
	confirm: { backgroundColor: 'white' },
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmOptions: { flexDirection: 'row', justifyContent: 'space-around' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmOptionHeader: { },

	// item info
	itemInfoBox: { backgroundColor: 'white' },
	itemInfoContainer: { backgroundColor: '#EAEAEA' },
	itemClose: { alignItems: 'center', borderRadius: 15, borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', justifyContent: 'space-around', padding: 2 },
	imageHolder: { borderRadius: 100, height: 200, overflow: 'hidden', width: 200 },
	image: { height: 200, width: 200 },
	boxItemHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	boxItemHeaderInfo: {  fontSize: 15, fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },
	info: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30, paddingHorizontal: 5 },
	infoHeader: { fontWeight: 'bold', marginVertical: 7, marginRight: 20 },
	itemActions: { flexDirection: 'row', justifyContent: 'space-around' },
	itemAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, marginVertical: 30, padding: 10, width: 120 },
	itemActionHeader: { textAlign: 'center' },

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

	// friends list
	friendsCart: { backgroundColor: 'white' },
	friendsList: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	friendNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, margin: 10, padding: 10 },
	friendsListContainer: { flexDirection: 'column', height: screenHeight - 270, justifyContent: 'space-between' },
	friendsListSearched: { height: '50%', overflow: 'hidden' },
	friendsListSelected: { height: '50%', overflow: 'hidden' },
	selectedFriendsHeader: { fontWeight: 'bold', textAlign: 'center' },
	friendsHeader: { fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
	friend: { alignItems: 'center', height: width * 0.2, margin: 5, width: width * 0.2 },
	friendDelete: { marginBottom: -5, marginLeft: 60 },
	friendProfileHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 30, height: 60, overflow: 'hidden', width: 60 },
	friendName: { textAlign: 'center' },
	itemContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 10, flexDirection: 'row', height: 150, justifyContent: 'space-between', marginHorizontal: 10, padding: 10 },
	orderingItemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	orderingItemName: { fontWeight: 'bold', marginBottom: 20 },
	itemInfo: { fontSize: 15 },
	itemHeader: { fontSize: 15 },
	friendErrorMsg: { color: 'red', fontWeight: 'bold', textAlign: 'center' },
	actions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
	action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 70 },
	actionHeader: { textAlign: 'center' },

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
