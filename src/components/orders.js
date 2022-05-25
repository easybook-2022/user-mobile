import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, ActivityIndicator, Dimensions, ScrollView, View, FlatList, Image, 
  Text, TextInput, TouchableOpacity, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { resizePhoto } from 'geottuse-tools'
import { socket, logo_url } from '../../assets/info'
import { searchFriends, selectUser, requestUserPaymentMethod } from '../apis/users'
import { getCartItems, getCartItemsTotal, editCartItem, updateCartItem, removeFromCart, changeCartItem, checkoutCart } from '../apis/carts'

import Loadingprogress from '../widgets/loadingprogress'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Orders(props) {
	const [userId, setUserid] = useState(null)
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
	const [errorMsg, setErrormsg] = useState('')
	const [showDisabledScreen, setShowdisabledscreen] = useState(false)
	
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
					socket.emit("socket/user/login", userid, () => {
						setUserid(userid)
						setItems(res.cartItems)
						setActivecheckout(res.activeCheckout)
						setLoaded(true)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
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
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
				}
			})
	}
	const updateTheCartItem = () => {
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

    setLoaded(false)

		updateCartItem(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
          getTheCartItems()
					setIteminfo({ ...itemInfo, show: false })
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
				}
			})
	}
	const removeTheCartItem = id => {
		removeFromCart(id)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
          const newItems = [...items]

          newItems.forEach(function (item, index) {
            if (item.id == id) {
              newItems.splice(index, 1)
            }
          })

					setItems(newItems)
				}
			})
	}

	const checkout = () => {
		const time = Date.now()
		let data = { userid: userId, time, type: "checkout" }

		checkoutCart(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					data = { ...data, receiver: res.receiver, speak: res.speak }
					socket.emit("socket/checkoutCart", data, () => {
						setActivecheckout(false)
						setShowconfirm(true)

            setTimeout(function () {
              setLoading(false)

              setShowconfirm(false)
              props.showNotif()

              getTheCartItems()
            }, 2000)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
				}
			})
	}

	const startWebsocket = () => {
		socket.on("updateOrderers", data => {
			if (data.type == "cancelCartOrder") {
				const { userid, cartid } = data
				const newItems = [...items]
				const orderers = [], row = []

				setActivecheckout(true)

				newItems.forEach(function (item) {
					item.orderers.forEach(function (info) {
						info.row.forEach(function (orderer) {
							if (orderer.id != userid) {
								row.push(orderer)

								if (row.length == 4) {
									orderers.push(row)
									row = []
								}

								if (orderer.status && (orderer.status != "confirmed" && orderer.status != "rejected")) {
									setActivecheckout(false)
								}
							}
						})
					})
				})

        newItems.forEach(function (item, index) {
          if (item.id == cartid) {
            if (orderers.length > 0) {
              item.orderers = orderers
            }
          }
        })

				setItems(newItems)
			} else if (data.type == "confirmCartOrder") {
				const { userid, id } = data
				const newItems = [...items]

				setActivecheckout(true)

				newItems.forEach(function (item) {
					item.orderers.forEach(function (info) {
						info.row.forEach(function (orderer) {
							if (item.id == id && orderer.id == userid) {
								orderer.status = "confirmed"
							}

							if (orderer.status && (orderer.status != "confirmed" && orderer.status != "rejected")) {
								setActivecheckout(false)
							}
						})
					})
				})

				setItems(newItems)
			}
		})
		socket.io.on("open", () => {
			if (userId != null) {
				socket.emit("socket/user/login", userId, () => setShowdisabledscreen(false))
			}
		})
		socket.io.on("close", () => userId != null ? setShowdisabledscreen(true) : {})
	}

	useEffect(() => {
		getTheCartItems()
	}, [])

	useEffect(() => {
		startWebsocket()

		return () => {
			socket.off("updateOrderers")
		}
	}, [items.length])

	return (
    <SafeAreaView style={[styles.orders, { opacity: loading ? 0.5 : 1 }]}>
      {loaded ? 
  			<View style={styles.box}>
  				<View style={styles.headers}>
  					<View style={{ alignItems: 'center', width: '100%' }}>
  						<TouchableOpacity onPress={() => props.close()}>
  							<AntDesign name="closecircleo" size={wsize(7)}/>
  						</TouchableOpacity>
  					</View>
  					<Text style={styles.boxHeader}>Order(s)</Text>
  				</View>

  				<View style={styles.body}>
  					{loaded ? 
  						items.length > 0 ?
  							<>
  								<FlatList
  									showsVerticalScrollIndicator={false}
  									data={items}
  									renderItem={({ item, index }) => 
                      <>
    										<View style={styles.item} key={item.key}>
    											<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
    												<TouchableOpacity disabled={item.status == "checkout"} onPress={() => removeTheCartItem(item.id)}>
    													<AntDesign name="closecircleo" size={wsize(7)}/>
    												</TouchableOpacity>
    												<View style={styles.itemImageHolder}>
                              <Image 
                                source={item.image.name ? { uri: logo_url + item.image.name } : require("../../assets/noimage.jpeg")} 
                                style={resizePhoto(item.image, 70)}
                              />
                            </View>
    												<View style={styles.itemInfos}>
    													<Text style={styles.itemName}>{item.name}</Text>

    													{item.options.map((option, infoindex) => (
    														<Text key={option.key} style={styles.itemInfo}>
    															<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
    															{option.selected}
    															{option.type == 'percentage' && '%'}
    														</Text>
    													))}

    													{item.others.map((other, otherindex) => (
    														other.selected ? 
    															<Text key={other.key} style={styles.itemInfo}>
    																<Text style={{ fontWeight: 'bold' }}>{other.name}: </Text>
    																<Text>{other.input}</Text>
    																<Text>($ {other.price})</Text>
    															</Text>
    														: null
    													))}

    													{item.sizes.map((size, sizeindex) => (
    														size.selected ? 
    															<Text key={size.key} style={styles.itemInfo}>
    																<Text style={{ fontWeight: 'bold' }}>Size: </Text>
    																<Text>{size.name}</Text>
    															</Text>
    														: null
    													))}
    												</View>
    												<Text style={styles.header}><Text style={{ fontWeight: 'bold' }}>Quantity:</Text> {item.quantity}</Text>
    											</View>

    											<View style={{ alignItems: 'center' }}>
    												<TouchableOpacity style={styles.itemChange} disabled={item.status == "checkout"} onPress={() => editTheCartItem(item.id)}>
    													<Text style={styles.itemChangeHeader}>Edit Order</Text>
    												</TouchableOpacity>
    											</View>

    											{item.note ? 
    												<View style={styles.note}>
    													<Text style={styles.noteHeader}><Text style={{ fontWeight: 'bold' }}>Customer's note:</Text> {'\n' + item.note}</Text>
    												</View>
    											: null }
    										</View>

                        {index == items.length - 1 && (
                          <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity style={styles.sendAction} onPress={() => props.close()}>
                              <Text style={styles.sendActionHeader}>Add more item +</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
  									}
  								/>

  								<View style={{ alignItems: 'center' }}>
  									<View style={styles.cartActions}>
  										<TouchableOpacity style={[styles.cartAction, { opacity: activeCheckout && !loading ? 1 : 0.3 }]} disabled={!activeCheckout || loading} onPress={() => checkout()}>
  											<Text style={styles.cartActionHeader}>Send Order</Text>
  										</TouchableOpacity>
  									</View>

  									{loading && <ActivityIndicator color="black" size="small"/>}
  								</View>
  							</>
  							:
  							<View style={{ alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around' }}>
  								<Text style={{ fontSize: wsize(5) }}>You don't have order(s)</Text>
  							</View>
  						:
  						<View style={{ flexDirection: 'column', height: '100%', justifyContent: 'space-around' }}>
  							<ActivityIndicator color="black" size="large"/>
  						</View>
  					}
  				</View>
        </View>
        :
        <Loadingprogress/>
      }

			{showConfirm && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.confirmBox}>
						<View style={styles.confirmContainer}>
							<Text style={styles.confirmHeader}>Orders sent</Text>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{itemInfo.show && (
				<Modal>
					<SafeAreaView style={styles.itemInfoBox}>
						<View style={styles.itemInfoHeader}>
							<TouchableOpacity style={styles.itemClose} onPress={() => setIteminfo({ ...itemInfo, show: false })}>
								<AntDesign name="close" size={wsize(7)}/>
							</TouchableOpacity>
						</View>
						<ScrollView style={styles.itemInfoContainer}>
  						<View style={{ alignItems: 'center', marginBottom: 20 }}>
                <View style={styles.imageHolder}>
                  <Image 
                    source={itemInfo.image.name ? { uri: logo_url + itemInfo.image.name } : require("../../assets/noimage.jpeg")} 
                    style={styles.image}
                  />
                </View>
              </View>

							<Text style={styles.boxItemHeader}>{itemInfo.name}</Text>
							<Text style={styles.boxItemHeaderInfo}>{itemInfo.info}</Text>

							{itemInfo.options.map((option, index) => (
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

							{itemInfo.others.length > 0 && (
								<View style={styles.othersBox}>
									<Text style={styles.othersHeader}>Other options</Text>

									<View style={styles.others}>
										{itemInfo.others.map((other, index) => (
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

							{itemInfo.sizes.length > 0 && (
								<View style={styles.sizesBox}>
									<Text style={styles.sizesHeader}>Select a Size</Text>

									<View style={styles.sizes}>
										{itemInfo.sizes.map((size, index) => (
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

							<View style={styles.note}>
								<TextInput 
                  style={styles.noteInput} multiline textAlignVertical="top" 
                  placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Leave a note if you want" 
                  maxLength={100} onChangeText={(note) => setIteminfo({ ...itemInfo, note })} 
                  value={itemInfo.note} autoCorrect={false} autoCapitalize="none"
                />
							</View>

							<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
								<View style={styles.quantity}>
                  <View style={styles.column}>
                    <Text style={styles.quantityHeader}>Quantity</Text>
                  </View>
                  <View style={styles.column}>
  									<TouchableOpacity style={styles.quantityAction} onPress={() => changeQuantity("-")}>
  										<Text style={styles.quantityActionHeader}>-</Text>
  									</TouchableOpacity>
                  </View>
                  <View style={styles.column}>
  									<Text style={styles.quantityHeader}>{itemInfo.quantity}</Text>
                  </View>
                  <View style={styles.column}>
  									<TouchableOpacity style={styles.quantityAction} onPress={() => changeQuantity("+")}>
  										<Text style={styles.quantityActionHeader}>+</Text>
  									</TouchableOpacity>
                  </View>
								</View>
							</View>

							{itemInfo.errorMsg ? <Text style={styles.errorMsg}>{itemInfo.errorMsg}</Text> : null}

							<View style={styles.itemActions}>
								<View style={{ flexDirection: 'row' }}>
									<TouchableOpacity style={styles.itemAction} onPress={() => updateTheCartItem()}>
										<Text style={styles.itemActionHeader}>Update{'\n'}order</Text>
									</TouchableOpacity>
								</View>
							</View>
						</ScrollView>
					</SafeAreaView>
				</Modal>
			)}
			{showDisabledScreen && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.disabled}>
						<ActivityIndicator color="black" size="large"/>
					</SafeAreaView>
				</Modal>
			)}
    </SafeAreaView>
	);
}

const styles = StyleSheet.create({
	orders: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
  
	headers: { flexDirection: 'column', height: '15%', justifyContent: 'space-around' },
	boxHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(7), fontWeight: 'bold', textAlign: 'center' },

	body: { height: '85%' },
	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
	itemImageHolder: { borderRadius: 35, overflow: 'hidden', width: 70 },
	itemInfos: {  },
	itemName: { fontSize: wsize(5), marginBottom: 10 },
	itemInfo: { fontSize: wsize(4) },
	header: { fontSize: wsize(4) },
	itemChange: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 5 },
	itemChangeHeader: { fontSize: wsize(4), textAlign: 'center' },

  sendAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 10, padding: 5, width: wsize(30) },
  sendActionHeader: { fontSize: wsize(5), textAlign: 'center' },

	cartActions: { flexDirection: 'row', marginBottom: 5 },
	cartAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 5, padding: 5, width: wsize(40) },
	cartActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	// confirm & requested box
	confirm: { backgroundColor: 'white' },
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmOptions: { flexDirection: 'row', justifyContent: 'space-around' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },

	// item info
	itemInfoBox: { flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	itemInfoHeader: { alignItems: 'center', flexDirection: 'column', height: '10%', justifyContent: 'space-around' },
	itemClose: { alignItems: 'center', borderRadius: 15, borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', justifyContent: 'space-around', padding: 2 },
	itemInfoContainer: { height: '90%' },
	imageHolder: { borderRadius: 100, height: 200, overflow: 'hidden' },
	image: { height: 200, width: 200 },
	boxItemHeader: { fontSize: wsize(6), fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	boxItemHeaderInfo: { fontSize: wsize(4), fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },
	info: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30, paddingHorizontal: 5 },
	infoHeader: { fontWeight: 'bold', marginVertical: 7, marginRight: 20 },
	itemActions: { flexDirection: 'row', justifyContent: 'space-around' },
	itemAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, marginVertical: 30, padding: 10, width: wsize(30) },
	itemActionHeader: { fontSize: wsize(4), textAlign: 'center' },

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
	other: { alignItems: 'center', marginVertical: 5, width: '100%' },
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
	note: { alignItems: 'center', marginBottom: 20 },
  noteHeader: { textAlign: 'center' },
	noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(4), height: 100, padding: 5, width: '80%' },

	// quantity
	quantity: { flexDirection: 'row', justifyContent: 'space-around' },
	quantityAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, margin: 10, padding: 15 },
  quantityActionHeader: { fontSize: wsize(4) },
	quantityHeader: { fontSize: wsize(5), fontWeight: 'bold' },

	disabled: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.1)', flexDirection: 'column', justifyContent: 'space-around', height: '100%', width: '100%' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },
})
