import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, Dimensions, ScrollView, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import Constants from 'expo-constants';
import { socket, logo_url } from '../../../assets/info'
import { searchFriends, selectUser, requestUserPaymentMethod } from '../../apis/users'
import { getProductInfo } from '../../apis/products'
import { getNumCartItems, addItemtocart } from '../../apis/carts'

import Cart from '../../components/cart'
import Userauth from '../../components/userauth'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Itemprofile(props) {
	const { locationid, productid, productinfo } = props.route.params
	const func = props.route.params

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
	const [showAuth, setShowauth] = useState({ show: false, action: "" })
	const [userId, setUserid] = useState(null)

	// friends list
	const [openFriendscart, setOpenfriendscart] = useState(false)
	const [friends, setFriends] = useState([])
	const [numFriends, setNumfriends] = useState(0)
	const [selectedFriends, setSelectedFriends] = useState([])
	const [numSelectedFriends, setNumSelectedFriends] = useState(0)
	const [orderingItem, setOrderingitem] = useState({ name: "", image: "", options: [], others: [], sizes: [], quantity: 0, cost: 0 })

	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(2)

	const isMounted = useRef(null)

	const getTheNumCartItems = async() => {
		const userid = await AsyncStorage.getItem("userid")

		if (userid) {
			getNumCartItems(userid)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res && isMounted.current == true) {
						setUserid(userid)
						setNumcartitems(res.numCartItems)
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					} else {
						alert("server error")
					}
				})
		}
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
		if (userId) {
			let callfor = [], receiver = []
			let newOptions = JSON.parse(JSON.stringify(options))
			let newOthers = JSON.parse(JSON.stringify(others))
			let newSizes = JSON.parse(JSON.stringify(sizes))
			let size = "", price = 0
				

			if (openFriendscart && selectedFriends.length == 0) {
				setErrormsg("You didn't select anyone")
			} else {	
				selectedFriends.forEach(function (info) {
					info.row.forEach(function (friend) {
						if (friend.username) {
							callfor.push({ userid: friend.id.toString(), status: friend.paymentrequested ? 'payment' : 'waiting' })
							receiver.push("user" + friend.id)
						}
					})
				})

				if (!productinfo) {
					if (newSizes.length > 0) {
						newSizes.forEach(function (info) {
							delete info['key']

							if (info.selected) {
								price = parseFloat(info.price) * quantity
							}
						})
					} else {
						price = itemPrice * quantity
					}

					newOptions.forEach(function (option) {
						delete option['key']
					})

					newOthers.forEach(function (other) {
						delete other['key']
					})
				}
					

				if (price || productinfo) {
					const data = { 
						userid: userId, locationid, 
						productid: productid ? productid : -1, 
						productinfo: productinfo ? productinfo : "", 
						quantity, 
						callfor, 
						options: newOptions, others: newOthers, sizes: newSizes, 
						note: itemNote, 
						receiver 
					}

					addItemtocart(data)
						.then((res) => {
							if (res.status == 200) {
								return res.data
							}
						})
						.then((res) => {
							if (res) {
								socket.emit("socket/addItemtocart", data, () => {
									setOpenfriendscart(false)
									showCart()
								})
							}
						})
						.catch((err) => {
							if (err.response && err.response.status == 400) {
								const { errormsg, status } = err.response.data

								switch (status) {
									case "cardrequired":
										setShowpaymentrequired(true)

										break;
									default:
								}
							} else {
								alert("server error")
							}
						})
				} else {
					setErrormsg("Please choose a size")
				}
			}
		} else {
			setShowauth({ show: true, action: "addcart" })
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
				if (res && isMounted.current == true) {
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
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("server error")
				}
			})
	}
	const getFriendsList = async(username) => {
		const data = { userid: userId, username }

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
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("server error")
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
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("server error")
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
		if (userId) {
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
		} else {
			setShowauth({ show: true, action: "openfriendscart" })
		}
	}
	const initialize = () => {
		getTheNumCartItems()

		if (productid) getTheProductInfo()
	}

	useEffect(() => {
		isMounted.current = true

		initialize()

		return () => {
			isMounted.current = false
		}
	}, [])

	return (
		<SafeAreaView style={styles.itemprofile}>
			<View style={styles.box}>
				<ScrollView style={{ height: '100%' }}>
					<View style={{ alignItems: 'center', marginTop: 20 }}>
						{itemImage ? 
							<View style={styles.imageHolder}>
								<Image source={{ uri: logo_url + itemImage }} style={styles.image}/>
							</View>
						: null }
					</View>
					<Text style={styles.boxHeader}>{itemName ? itemName : productinfo}</Text>
					<Text style={styles.boxHeaderInfo}>{itemInfo}</Text>

					{options.map((option, index) => (
						<View key={option.key} style={{ alignItems: 'center' }}>
							<View style={styles.info}>
								<Text style={styles.infoHeader}>{option.header}:</Text>

								{option.type == "amount" && (
									<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
										<View style={styles.amount}>
											<TouchableOpacity style={styles.amountAction} onPress={() => changeAmount(index, "-")}>
												<Text style={styles.amountActionHeader}>-</Text>
											</TouchableOpacity>
											<Text style={styles.amountHeader}>{option.selected}</Text>
											<TouchableOpacity style={styles.amountAction} onPress={() => changeAmount(index, "+")}>
												<Text style={styles.amountActionHeader}>+</Text>
											</TouchableOpacity>
										</View>
									</View>
								)}

								{option.type == "percentage" && (
									<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
										<View style={styles.percentage}>
											<TouchableOpacity style={styles.percentageAction} onPress={() => changePercentage(index, "-")}>
												<Text style={styles.percentageActionHeader}>-</Text>
											</TouchableOpacity>
											<Text style={styles.percentageHeader}>{option.selected}%</Text>
											<TouchableOpacity style={styles.percentageAction} onPress={() => changePercentage(index, "+")}>
												<Text style={styles.percentageActionHeader}>+</Text>
											</TouchableOpacity>
										</View>
									</View>
								)}
							</View>
						</View>
					))}

					{others.length > 0 && (
						<View style={styles.othersBox}>
							<Text style={styles.othersHeader}>Other options</Text>

							<View style={styles.others}>
								{others.map((other, index) => (
									<View key={other.key} style={{ alignItems: 'center' }}>
										<View style={styles.other}>
											<View style={{ flexDirection: 'row' }}>
												<Text style={styles.otherName}># {other.name}:</Text>
												<Text style={styles.otherInput}>{other.input}</Text>
											</View>
											<View style={{ flexDirection: 'row', marginTop: 10 }}>
												<Text style={styles.otherPrice}>$ {other.price}</Text>

												<View style={styles.otherActions}>
													<TouchableOpacity style={other.selected ? styles.otherActionLeftDisabled : styles.otherActionLeft} onPress={() => selectOther(index)}>
														<Text style={[styles.otherActionHeader, { color: other.selected ? 'white' : 'black' }]}>Yes</Text>
													</TouchableOpacity>
													<TouchableOpacity style={!other.selected ? styles.otherActionRightDisabled : styles.otherActionRight} onPress={() => selectOther(index)}>
														<Text style={[styles.otherActionHeader, { color: !other.selected ? 'white' : 'black' }]}>No</Text>
													</TouchableOpacity>
												</View>
											</View>
										</View>
									</View>
								))}
							</View>
						</View>
					)}

					{sizes.length > 0 && (
						<View style={styles.sizesBox}>
							<Text style={styles.sizesHeader}>Select a Size</Text>

							<View style={styles.sizes}>
								{sizes.map((size, index) => (
									<View key={size.key} style={styles.size}>
										<TouchableOpacity style={size.selected ? styles.sizeTouchDisabled : styles.sizeTouch} onPress={() => selectSize(index)}>
											<Text style={size.selected ? styles.sizeTouchHeaderDisabled : styles.sizeTouchHeader}>{size.name}</Text>
										</TouchableOpacity>
										<Text style={styles.sizePrice}>$ {size.price}</Text>
									</View>
								))}
							</View>
						</View>
					)}

					{!productinfo ? 
						<View style={styles.note}>
							<TextInput 
								style={styles.noteInput} multiline textAlignVertical="top" 
								placeholderTextColor="rgba(127, 127, 127, 0.8)" placeholder="Leave a note if you want" 
								maxLength={100} onChangeText={(note) => setItemnote(note)} 
								autoCorrect={false} autoCapitalize="none"
							/>
						</View>
						:
						<View style={styles.note}>
							<Text style={styles.noteHeader}>Add some instruction if you want ?</Text>
							<TextInput 
								style={styles.noteInput} multiline textAlignVertical="top" 
								placeholderTextColor="rgba(127, 127, 127, 0.8)" placeholder={"example: add 2 cream and 1 sugar"}
								maxLength={100} onChangeText={(note) => setItemnote(note)} 
								autoCorrect={false} autoCapitalize="none"
							/>
						</View>
					}

					<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
						<View style={styles.quantity}>
              <View style={styles.column}>
                <Text style={styles.quantityHeader}>Quantity:</Text>
              </View>
              <View style={styles.column}>
                <TouchableOpacity style={styles.quantityAction} onPress={() => changeQuantity("-")}>
                  <Text style={styles.quantityActionHeader}>-</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.column}>
                <Text style={styles.quantityHeader}>{quantity}</Text>
              </View>
              <View style={styles.column}>
                <TouchableOpacity style={styles.quantityAction} onPress={() => changeQuantity("+")}>
                  <Text style={styles.quantityActionHeader}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
					</View>

					{!productinfo ? <Text style={styles.price}>Cost: $ {cost.toFixed(2)}</Text> : null}

					{errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}

					<View style={styles.itemActions}>
						<View style={{ flexDirection: 'row' }}>
							<TouchableOpacity style={styles.itemAction} onPress={() => addCart()}>
								<Text style={styles.itemActionHeader}>Add to{'\n'}your cart</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.itemAction} onPress={() => openFriendsCart()}>
								<Text style={styles.itemActionHeader}>Call for{'\n'}friend(s)</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>

				<View style={styles.bottomNavs}>
					<View style={styles.bottomNavsRow}>
						{userId && (
							<TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.navigate("account")}>
								<FontAwesome5 name="user-circle" size={30}/>
							</TouchableOpacity>
						)}

						{userId && (
							<TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.navigate("recent")}>
								<FontAwesome name="history" size={30}/>
							</TouchableOpacity>
						)}

						{userId && (
							<TouchableOpacity style={styles.bottomNav} onPress={() => setOpencart(true)}>
								<Entypo name="shopping-cart" size={30}/>
								{numCartItems > 0 && <Text style={styles.numCartItemsHeader}>{numCartItems}</Text>}
							</TouchableOpacity>
						)}

						<TouchableOpacity style={styles.bottomNav} onPress={() => {
							props.navigation.dispatch(
								CommonActions.reset({
									index: 0,
									routes: [{ name: "main" }]
								})
							)
						}}>
							<Entypo name="home" size={30}/>
						</TouchableOpacity>

						<TouchableOpacity style={styles.bottomNav} onPress={() => {
							if (userId) {
								AsyncStorage.clear()

								setUserid(null)
							} else {
								setShowauth({ show: true, action: false })
							}
						}}>
							<Text style={styles.bottomNavHeader}>{userId ? 'Log-Out' : 'Log-In'}</Text>
						</TouchableOpacity>
					</View>
				</View>

				{openCart && <Modal><Cart showNotif={() => {
					setOpencart(false)
					setTimeout(function () {
						props.navigation.dispatch(
							CommonActions.reset({
								index: 0,
								routes: [{ name: "main", params: { showNotif: true } }]
							})
						)
					}, 1000)
				}} close={() => {
					getTheNumCartItems()
					setOpencart(false)
				}}/></Modal>}
				{openFriendscart && (
					<Modal>
						<SafeAreaView style={styles.usersList}>
							<View style={styles.userNameContainer}>
								<TextInput 
									style={styles.userNameInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Search friend to order for" 
									onChangeText={(username) => getFriendsList(username)} autoCorrect={false} autoCapitalize="none"
								/>
							</View>

							<View style={styles.usersListContainer}>
								<View style={{ height: '50%', overflow: 'hidden' }}>
									<Text style={styles.usersHeader}>{numFriends} Searched Friend(s)</Text>

									<FlatList
										data={friends}
										renderItem={({ item, index }) => 
											<View key={item.key} style={styles.row}>
												{item.row.map(friend => (
													friend.username ? 
														<TouchableOpacity key={friend.key} style={styles.user} onPress={() => selectFriend(friend.id)}>
															<View style={styles.userProfileHolder}>
																<Image source={{ uri: logo_url + friend.profile }} style={{ height: 60, width: 60 }}/>
															</View>
															<Text style={styles.userName}>{friend.username}</Text>
														</TouchableOpacity>
														:
														<View key={friend.key} style={styles.user}></View>
												))}
											</View>
										}
									/>
								</View>

								<View style={{ height: '50%', overflow: 'hidden' }}>
									{selectedFriends.length > 0 && (
										<>
											<Text style={styles.selectedUsersHeader}>{numSelectedFriends} Selected Friend(s) to order this item</Text>

											<FlatList
												data={selectedFriends}
												renderItem={({ item, index }) => 
													<View key={item.key} style={styles.row}>
														{item.row.map(friend => (
															friend.username ? 
																<View key={friend.key} style={styles.user}>
																	<TouchableOpacity style={styles.userDelete} onPress={() => deselectFriend(friend.id)}>
																		<AntDesign name="closecircleo" size={15}/>
																	</TouchableOpacity>
																	<View style={styles.userProfileHolder}>
																		<Image source={{ uri: logo_url + friend.profile }} style={{ height: 60, width: 60 }}/>
																	</View>
																	<Text style={styles.userName}>{friend.username}</Text>
																</View>
																:
																<View key={friend.key} style={styles.user}></View>
														))}
													</View>
												}
											/>
										</>
									)}
								</View>
							</View>

							<View style={styles.itemContainer}>
								<View style={styles.orderingItemImageHolder}>
									<Image style={{ height: 100, width: 100 }} source={{ uri: logo_url + orderingItem.image }}/>
								</View>
								<View style={styles.itemInfos}>
									<Text style={styles.orderingItemName}>{orderingItem.name}</Text>
									
									{orderingItem.options.map((info, infoindex) => (
										<Text key={info.key} style={styles.itemInfo}>
											<Text style={{ fontWeight: 'bold' }}>{info.header}: </Text> 
											{info.selected}
											{info.type == 'percentage' && '%'}
										</Text>
									))}

									{orderingItem.others.map((info, infoindex) => (
										<Text key={info.key} style={styles.itemInfo}>
											<Text style={{ fontWeight: 'bold' }}>{info.name}: </Text> 
											<Text>{info.input}</Text>
										</Text>
									))}

									{orderingItem.sizes.map((info, infoindex) => (
										info.selected ? 
											<Text key={info.key} style={styles.itemInfo}>
												<Text style={{ fontWeight: 'bold' }}>Size: </Text> 
												<Text>{info.name}</Text>
											</Text>
										: null
									))}
								</View>
								<View>
									<Text style={styles.itemHeader}><Text style={{ fontWeight: 'bold' }}>quantity:</Text> {orderingItem.quantity}</Text>
									<Text style={styles.itemHeader}><Text style={{ fontWeight: 'bold' }}>cost:</Text> $ {orderingItem.cost}</Text>
								</View>
							</View>

							<View style={styles.usersListActionContainer}>
								<Text style={styles.errorMsg}>{errorMsg}</Text>

								<View style={styles.usersListActions}>
									<TouchableOpacity style={styles.usersListAction} onPress={() => {
										setOpenfriendscart(false)
										setSelectedFriends([])
										setNumSelectedFriends(0)
										setErrormsg('')
									}}>
										<Text style={styles.usersListActionHeader}>Close</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.usersListAction} onPress={() => addCart()}>
										<Text style={styles.usersListActionHeader}>Add</Text>
									</TouchableOpacity>
								</View>
							</View>
						</SafeAreaView>

						{showNotifyUser.show && (
							<Modal transparent={true}>
								<SafeAreaView style={styles.notifyUserBox}>
									<View style={styles.notifyUserContainer}>
										<Text style={styles.notifyUserHeader}>
											{showNotifyUser.username} haven't provided a payment method.
											Notify {showNotifyUser.username} to add a payment method
										</Text>

										<View style={styles.notifyUserActions}>
											<TouchableOpacity style={styles.notifyUserAction} onPress={() => setShownotifyuser({ show: false, userid: 0, username: "" })}>
												<Text style={styles.notifyUserActionHeader}>Close</Text>
											</TouchableOpacity>
											<TouchableOpacity style={styles.notifyUserAction} onPress={() => requestTheUserPaymentMethod()}>
												<Text style={styles.notifyUserActionHeader}>Ok</Text>
											</TouchableOpacity>
										</View>
									</View>
								</SafeAreaView>
							</Modal>
						)}
					</Modal>
				)}
				{showPaymentRequired && (
          <Modal transparent={true}>
  					<SafeAreaView style={styles.cardRequiredBox}>
              <View style={styles.cardRequiredContainer}>
                <Text style={styles.cardRequiredHeader}>
                  You need to provide a payment method 
                  to add items to your cart
                </Text>

                <View style={styles.cardRequiredActions}>
                  <TouchableOpacity style={styles.cardRequiredAction} onPress={() => setShowpaymentrequired(false)}>
                    <Text style={styles.cardRequiredActionHeader}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cardRequiredAction} onPress={() => {
                    setShowpaymentrequired(false)
                    props.navigation.navigate("account", { required: "card" })
                  }}>
                    <Text style={styles.cardRequiredActionHeader}>Ok</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </Modal>
				)}
				{showAuth.show && (
					<Modal transparent={true}>
						<Userauth close={() => setShowauth({ show: false, action: "" })} done={(id, msg) => {
							if (msg == "setup") {
								props.navigation.dispatch(
									CommonActions.reset({
										index: 1,
										routes: [{ name: "setup" }]
									})
								);
							} else {
								socket.emit("socket/user/login", "user" + id, () => {
									setUserid(id)

									if (showAuth.action == "addcart") {
										addCart()
									} else if (showAuth.action == "openfriendscart") {
										openFriendsCart()
									}
								})
							}

							setShowauth({ show: false, action: false })
						}} navigate={props.navigation.navigate}/>
					</Modal>
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	itemprofile: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },

	imageHolder: { borderRadius: wsize(40) / 2, height: wsize(40), overflow: 'hidden', width: wsize(40) },
	image: { height: 200, width: 200 },
	boxHeader: { fontSize: wsize(7), fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	boxHeaderInfo: { fontSize: wsize(4), fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },

	info: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30, paddingHorizontal: 5 },
	infoHeader: { fontWeight: 'bold', marginVertical: 7, marginRight: 20 },

	// amount
	amount: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	amountAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	amountHeader: { fontSize: wsize(4), fontWeight: 'bold', padding: 10 },

	// percentage
	percentage: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	percentageAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	percentageHeader: { fontSize: wsize(4), fontWeight: 'bold', padding: 10 },

	// others
	othersBox: { alignItems: 'center', marginVertical: 20 },
	othersHeader: { fontWeight: 'bold' },
	others: { marginVertical: 20, width: '100%' },
	other: {  },
	otherName: { fontSize: wsize(5), fontWeight: 'bold' },
	otherInput: { fontSize: wsize(5) },
	otherPrice: { fontWeight: 'bold', marginRight: 10, marginTop: 5 },
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
	noteHeader: { fontSize: wsize(5), fontWeight: 'bold' },
	note: { alignItems: 'center', marginBottom: 20 },
	noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), height: 100, padding: 5, width: '80%' },

	// quantity
	quantity: { flexDirection: 'row', justifyContent: 'space-around' },
	quantityAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, padding: 10 },
  quantityActionHeader: { fontSize: wsize(5) },
	quantityHeader: { fontSize: wsize(5), fontWeight: 'bold', padding: 5 },

	price: { fontSize: wsize(5), fontWeight: 'bold', marginTop: 20, textAlign: 'center' },

	itemActions: { flexDirection: 'row', justifyContent: 'space-around' },
	itemAction: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, marginVertical: 30, padding: 10, width: wsize(30) },
	itemActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },

	// users list
	usersList: { flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	userNameContainer: { height: '10%' },
	userNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, marginHorizontal: 20, padding: 10 },
	usersListContainer: { flexDirection: 'column', height: '60%', justifyContent: 'space-between' },
	usersHeader: { fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
	user: { alignItems: 'center', height: width * 0.2, margin: 5, width: width * 0.2 },
	userDelete: { marginBottom: -5, marginLeft: 60 },
	userProfileHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 30, height: 60, overflow: 'hidden', width: 60 },
	userName: { textAlign: 'center' },
	selectedUsersHeader: { fontWeight: 'bold', textAlign: 'center' },
	itemContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 10, flexDirection: 'row', height: '20%', justifyContent: 'space-between', marginHorizontal: 10, padding: 10 },
	orderingItemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	orderingItemName: { fontWeight: 'bold', marginBottom: 20 },
	itemInfo: { fontSize: wsize(4) },
	itemHeader: { fontSize: wsize(4) },
	usersListActionContainer: { alignItems: 'center', height: '10%' },
	usersListActions: { flexDirection: 'row', justifyContent: 'space-around' },
	usersListAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 60 },
	usersListActionHeader: { textAlign: 'center' },

	// search friends
	searchFriendsHidden: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	searchFriendsBox: { backgroundColor: 'white', height: '90%', width: '90%' },
	searchFriendNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, margin: 10, padding: 10 },

	cardRequiredBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	cardRequiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	cardRequiredHeader: { fontFamily: 'appFont', fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	cardRequiredActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cardRequiredAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	cardRequiredActionHeader: { },

	notifyUserBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	notifyUserContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	notifyUserHeader: { fontFamily: 'appFont', fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	notifyUserActions: { flexDirection: 'row', justifyContent: 'space-around' },
	notifyUserAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	notifyUserActionHeader: { },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
	errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },
})
