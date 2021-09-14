import React, { useState, useEffect } from 'react';
import { AsyncStorage, ActivityIndicator, Dimensions, View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { logo_url } from '../../assets/info'
import { getNotifications } from '../apis/users'
import { cancelCartOrder, confirmCartOrder } from '../apis/products'
import { acceptReservation, closeRequest, cancelReservationJoining, acceptReservationJoining, cancelService, sendPayment, cancelDiningOrder, confirmDiningOrder } from '../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function notifications(props) {
	const [items, setItems] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [confirm, setConfirm] = useState({ show: false, type: "", index: 0, name: "", price: "", quality: "" })
	const [showPaymentRequired, setShowpaymentrequired] = useState(false)

	const displayTimeStr = (unixtime) => {
		let weekdays = { "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday", "Sun": "Sunday" }
		let months = { 
			"Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April", "May": "May", "Jun": "June", 
			"Jul": "July", "Aug": "August", "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December" 
		}
		let d = new Date(unixtime).toString().split(" ")
		let day = weekdays[d[0]]
		let month = months[d[1]]
		let date = d[2]
		let year = d[3]

		let time = d[4].split(":")
		let hour = parseInt(time[0])
		let minute = time[1]
		let period = hour > 11 ? "pm" : "am"

		hour = hour > 12 ? hour - 12 : hour

		//day + ", " + month + " " + date + ", " + year + " at " + 

		let timestr = hour + ":" + minute + " " + period;

		return timestr
	}

	const cancelTheCartOrder = async(cartid, index) => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, cartid }

		cancelCartOrder(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newItems = [...items]

					newItems.splice(index, 1)

					setItems(newItems)
				}
			})
	}
	const cancelTheDiningOrder = async(orderid, index) => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { orderid, ordererid: userid }

		cancelDiningOrder(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newItems = [...items]

					newItems.splice(index, 1)

					setItems(newItems)
				}
			})
	}
	const confirmTheCartOrder = async(info, index) => {
		const userid = await AsyncStorage.getItem("userid")
		const { id, name, quantity, price } = info
		const data = { userid, id }

		confirmCartOrder(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) setConfirm({ ...confirm, show: true, type: "cart", index: index, name: name, quantity: quantity, price: price })
			})
	}
	const confirmTheDiningOrder = async(info, index) => {
		const userid = await AsyncStorage.getItem("userid")
		const { orderid, name, quantity, price } = info
		const data = { orderid, ordererid: userid }

		confirmDiningOrder(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) setConfirm({ ...confirm, show: true, type: "dining", index: index, name: name, quantity: quantity, price: price })
			})
	}
	const deleteTheRequest = (appointmentid, index) => {
		closeRequest(appointmentid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newItems = [...items]

					newItems.splice(index, 1)

					setItems(newItems)
				}
			})
	}
	const acceptTheReservation = (id, index) => {
		acceptReservation(id)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newItems = [...items]

					newItems.splice(index, 1)

					setItems(newItems)
				}
			})
	}
	const cancelTheReservationJoining = async(scheduleid) => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, scheduleid }

		cancelReservationJoining(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) getTheNotifications()
			})
	}
	const acceptTheReservationJoining = async(locationid, scheduleid) => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, scheduleid }

		acceptReservationJoining(data)
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
					props.close()
					props.navigation.navigate("order", { locationid, scheduleid: scheduleid })
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
	const cancelTheService = (scheduleid, index) => {
		const data = { scheduleid, type: "customer" }

		cancelService(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					if (res.delete) {
						const newItems = [...items]

						newItems.splice(index, 1)

						setItems(newItems)
					}
				}
			})
	}
	const sendThePayment = (scheduleid, index) => {
		sendPayment(scheduleid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newItems = [...items]

					newItems[index].paymentSent = true

					setItems(newItems)
				}
			})
	}

	const getTheNotifications = async() => {
		const userid = await AsyncStorage.getItem("userid")

		getNotifications(userid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setItems(res.notifications)
					setLoaded(true)
				}
			})
	}

	useEffect(() => {
		getTheNotifications()
	}, [])

	return (
		<View style={style.notifications}>
			<View style={{ paddingTop: offsetPadding }}>
				<View style={style.box}>
					<View style={{ alignItems: 'center', width: '100%' }}>
						<TouchableOpacity style={style.close} onPress={() => props.close()}>
							<AntDesign name="closecircleo" size={30}/>
						</TouchableOpacity>
					</View>
					<Text style={style.boxHeader}>{items.length} Notification(s)</Text>

					<View style={style.body}>
						{loaded ? 
							items.length > 0 ?
								<FlatList
									showsVerticalScrollIndicator={false}
									data={items}
									renderItem={({ item, index }) => 
										<View style={style.item} key={item.key}>
											{(item.type == "cart-order-other" || item.type == "dining-order" || item.type == "paymentrequested") && (
												<>
													<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
														<View style={style.itemImageHolder}>
															<Image source={{ uri: logo_url + item.image }} style={{ height: 100, width: 100 }}/>
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
														<Text style={style.quantity}><Text style={{ fontWeight: 'bold' }}>quantity:</Text> {item.quantity}</Text>
													</View>
													<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
														<View style={{ flexDirection: 'row' }}>
															<View style={style.adderInfo}>
																<View style={style.adderInfoProfile}>
																	<Image source={{ uri: logo_url + item.adder.profile }} style={{ height: 40, width: 40 }}/>
																</View>
																<Text style={style.adderInfoUsername}>{item.adder.username}</Text>
															</View>
															<Text style={style.adderInfoHeader}> added this item to your {item.type.includes("dining") ? "dining order" : "cart"}.</Text>
														</View>
													</View>
													<Text style={style.itemHeader}>
														{item.type == "cart-order" && 'Want to purchase this?'}
														{item.type == "dining-order" && 'Want to order this?'}
														{item.type == "paymentrequested" && 'Please provide a payment method to purchase this'}
													</Text>
													<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
														<View style={style.actions}>
															<TouchableOpacity style={style.action} onPress={() => {
																if (item.type.includes("cart")) {
																	cancelTheCartOrder(item.id, index)
																} else {
																	cancelTheDiningOrder(item.orderid, index)
																}
															}}>
																<Text style={style.actionHeader}>No</Text>
															</TouchableOpacity>
															<TouchableOpacity style={style.action} onPress={() => {
																if (item.type.includes("order")) {
																	if (item.type.includes("cart")) {
																		confirmTheCartOrder(item, index)
																	} else {
																		confirmTheDiningOrder(item, index)
																	}
																} else {
																	props.close()
																	props.navigation.navigate("account", { required: "card" })
																}
															}}>
																<Text style={style.actionHeader}>Yes</Text>
															</TouchableOpacity>
														</View>
													</View>
												</>
											)}

											{item.type == "cart-order-self" && (
												<>
													<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
														<View style={style.itemImageHolder}>
															<Image source={{ uri: logo_url + item.image }} style={{ height: 100, width: 100 }}/>
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
														<Text style={style.quantity}><Text style={{ fontWeight: 'bold' }}>quantity:</Text> {item.quantity}</Text>
													</View>
													<Text style={style.itemOrderNumber}>Your order#: {item.orderNumber}</Text>
													<Text style={style.itemHeader}>
														{item.status == 'checkout' ? 
															'Your order will be ready soon'
															:
															'Your order is ready. You can pick up now'
														}
													</Text>
												</>
											)}

											{item.type == "service" && (
												<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
													<View style={style.itemImageHolders}>
														<View style={style.itemLocationImageHolder}>
															<Image source={{ uri: logo_url + item.locationimage }} style={{ height: 80, width: 80 }}/>
														</View>
														{item.serviceimage != '' ? 
															<View style={style.itemServiceImageHolder}>
																<Image source={{ uri: logo_url + item.serviceimage }} style={{ height: 100, width: 100 }}/>
															</View>
														: null }
													</View>
													<View style={{ flexDirection: 'column', width: width - 130 }}>
														{item.locationtype == "restaurant" ? 
															item.booker ? 
																<Text style={style.itemServiceHeader}>
																	You requested a reservation
																	{(item.diners + 1) > 0 ? ' for ' + (item.diners + 1) + ' ' + ((item.diners + 1) == 1 ? 'person' : 'people') : null }
																	{'\n'}at{'\n'}
																	<Text style={{ fontFamily: 'appFont', fontSize: 20 }}>{item.location}</Text>
																	{'\n'}at{'\n'}
																	<Text style={{ fontFamily: 'appFont', fontSize: 20 }}>{displayTimeStr(item.time)}</Text>
																	{'\n'}
																</Text>
																:
																<Text style={style.itemServiceHeader}>
																	{item.bookerName} {item.action == "accepted" ? "made" : "requested"} a reservation for you
																	{item.diners > 0 ? 
																		" and " + (item.diners - 1) + " other " + ((item.diners - 1) == 1 ? "person" : "people") + " " 
																		: 
																		""
																	}
																	{'\n'}at
																	<Text style={{ fontFamily: 'appFont', fontSize: 20 }}>{'\n' + item.location}</Text>
																	{'\n'}at{'\n'} 
																	<Text style={{ fontFamily: 'appFont', fontSize: 20 }}>{displayTimeStr(item.time)}</Text>
																</Text>
															:
															<Text style={style.itemServiceHeader}>You requested an appointment for {' '}
																<Text style={{ fontFamily: 'appFont', fontSize: 20 }}>{item.service}</Text>
																{'\n'}at{'\n'}
																<Text style={{ fontFamily: 'appFont', fontSize: 20 }}>{item.location}</Text>
																{'\n'}at{'\n'}
																<Text style={{ fontFamily: 'appFont', fontSize: 20 }}>{displayTimeStr(item.time)}</Text>
															</Text>
														}
														{item.action == "requested" && <Text style={{ fontWeight: '100' }}>waiting for the {item.locationtype == 'restaurant' ? 'restaurant' : 'salon'}'s response</Text>}
														{item.action == "accepted" && (
															<>
																<Text style={style.itemServiceResponseHeader}>
																	{item.locationtype == 'restaurant' ? 
																		item.booker ? "Your reservation has been accepted" : ""
																		:
																		"Your requested appointment has been accepted."
																	}
																	{'\n\n'}
																	{item.locationtype == 'restaurant' && "Your table is #" + item.table}
																</Text>

																{item.locationtype == 'restaurant' ?
																	item.confirm ? 
																		<View style={{ alignItems: 'center' }}>
																			<View style={style.itemServiceOrder}>
																				<TouchableOpacity style={style.itemServiceOrderTouch} onPress={() => {
																					props.close()
																					props.navigation.navigate("order", { locationid: item.locationid, scheduleid: item.id })
																				}}>
																					<Text style={style.itemServiceOrderTouchHeader}>Start Ordering your meal(s)</Text>
																				</TouchableOpacity>
																			</View>
																		</View>
																		:
																		item.booker ? 
																			<View style={{ alignItems: 'center' }}>
																				<View style={style.actions}>
																					<TouchableOpacity style={style.action} onPress={() => canceTheReservation(item.id)}>
																						<Text style={style.actionHeader}>Cancel</Text>
																					</TouchableOpacity>
																					<TouchableOpacity style={style.action} onPress={() => acceptTheReservation(item.id)}>
																						<Text style={style.actionHeader}>Accept</Text>
																					</TouchableOpacity>
																				</View>
																			</View>
																			:
																			<View style={{ alignItems: 'center' }}>
																				<View style={style.actions}>
																					<TouchableOpacity style={style.action} onPress={() => cancelTheReservationJoining(item.id)}>
																						<Text style={style.actionHeader}>Not Coming</Text>
																					</TouchableOpacity>
																					<TouchableOpacity style={style.action} onPress={() => acceptTheReservationJoining(item.locationid, item.id)}>
																						<Text style={style.actionHeader}>Accept</Text>
																					</TouchableOpacity>
																				</View>
																			</View>
																	:
																	<View style={{ alignItems: 'center' }}>
																		<View style={style.actions}>
																			<TouchableOpacity style={style.action} onPress={() => cancelTheService(item.id, index)}>
																				<Text style={style.actionHeader}>Cancel Service</Text>
																			</TouchableOpacity>
																			<TouchableOpacity style={style.action} onPress={() => sendThePayment(item.id, index)}>
																				<Text style={style.actionHeader}>Send Payment{item.paymentSent ? ' Again' : ''}</Text>
																			</TouchableOpacity>
																		</View>
																	</View>
																}
															</>
														)}
														{item.action == "cancel" || item.action == "rebook" ? 
															<View style={style.storeRequested}>
																<Text style={style.itemServiceResponseHeader}>
																	{item.action == "cancel" ? 
																		item.locationtype == 'restaurant' ? 
																			"Your reservation has been cancelled"
																			:
																			"Your requested appointment has been cancelled"
																		:
																		"Unfortunately, this time has been taken."
																	}								
																</Text>
																{item.reason != "" && <Text style={style.itemServiceResponseHeader}>Reason: <Text style={{ fontWeight: '500' }}>{item.reason}</Text></Text>}
																{item.action == "cancel" && (
																	<View style={{ alignItems: 'center' }}>
																		<TouchableOpacity style={style.itemServiceResponseTouch} onPress={() => deleteTheRequest(item.id, index)}>
																			<Text style={style.itemServiceResponseTouchHeader}>Ok</Text>
																		</TouchableOpacity>
																	</View>
																)}
																{item.nextTime > 0 && (
																	<>
																		<Text style={style.itemHeader}>
																			<Text>The {item.locationtype == "restaurant" ? "restaurant" : "salon"} requested this time for you.</Text>
																			{'\n'}
																			<Text style={style.itemServiceResponseHeader}>{displayTimeStr(item.nextTime)}</Text>
																			{'\n\n'}
																			<Text>Will you be available?</Text>
																		</Text>
																		<View style={style.actions}>
																			<TouchableOpacity style={style.action} onPress={() => deleteTheRequest(item.id, index)}>
																				<Text style={style.actionHeader}>Cancel</Text>
																			</TouchableOpacity>
																			<TouchableOpacity style={style.action} onPress={() => {
																				props.close()
																				
																				if (item.locationtype == "restaurant") {
																					props.navigation.navigate("makereservation", { locationid: item.locationid, scheduleid: item.id })
																				} else {
																					props.navigation.navigate("booktime", { locationid: item.locationid, scheduleid: item.id, serviceid: item.serviceid })
																				}
																			}}>
																				<Text style={style.actionHeader}>Reschedule</Text>
																			</TouchableOpacity>
																			<TouchableOpacity style={style.action} onPress={() => acceptTheReservation(item.id, index)}>
																				<Text style={style.actionHeader}>Yes</Text>
																			</TouchableOpacity>
																		</View>
																	</>
																)}
															</View>
														: null }
													</View>
												</View>
											)}
										</View>
									}
								/>
								:
								<View style={{ alignItems: 'center', flexDirection: 'column', height: screenHeight - 114, justifyContent: 'space-around' }}>
									<Text>No Notification(s) Yet</Text>
								</View>
							:
							<View style={{ flexDirection: 'column', height: screenHeight - 114, justifyContent: 'space-around' }}>
								<ActivityIndicator size="small"/>
							</View>
						}
					</View>
				</View>

				{confirm.show && (
					<Modal transparent={true}>
						<View style={{ paddingTop: offsetPadding }}>
							<View style={style.confirmBox}>
								<View style={style.confirmContainer}>
									<Text style={style.confirmHeader}>
										Confirmed {confirm.type == "cart" ? "Cart" : "Dining"} Order: 
										{'\n\n Quantity: ' + confirm.quantity + '\n\n'} {confirm.name + '\n\n'} at ${confirm.price}
									</Text>

									<View style={style.confirmOptions}>
										<TouchableOpacity style={style.confirmOption} onPress={() => {
											const newItems = [...items]

											newItems.splice(confirm.index, 1)

											setItems(newItems)

											setConfirm({ ...confirm, show: false, type: "", index: 0, name: "", quantity: "", price: "" })
										}}>
											<Text style={style.confirmOptionHeader}>Ok</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
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
											props.close()
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
	notifications: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', height: screenHeight, width: '100%' },
	close: { marginTop: 20, marginHorizontal: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },

	body: { flexDirection: 'column', height: screenHeight - 112, justifyContent: 'space-around' },
	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
	itemImageHolders: { width: 100 },
	itemLocationImageHolder: { borderRadius: 50, height: 80, overflow: 'hidden', width: 80 },
	itemServiceImageHolder: { borderRadius: 50, height: 100, overflow: 'hidden', width: 100 },

	// service
	itemServiceHeader: { fontWeight: 'bold', margin: 10, textAlign: 'center' },
	itemServiceResponseHeader: { fontWeight: 'bold', margin: 10 },
	itemServiceResponseTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 60 },
	itemServiceResponseTouchHeader: { fontWeight: 'bold', textAlign: 'center' },
	itemServiceOrderTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 2, padding: 5, width: 120 },
	itemServiceOrderTouchHeader: { fontSize: 13, textAlign: 'center' },
	storeRequested: { backgroundColor: 'rgba(127, 127, 127, 0.3)', borderRadius: 3, padding: 5 },
	itemServiceNewTimeHeader: {  },
	itemServiceNewTimeActions: { flexDirection: 'row' },
	itemServiceNewTimeAction: { borderRadius: 5, margin: 10 },
	itemServiceNewTimeActionHeader: { },

	// order
	itemInfos: {  },
	itemName: { fontSize: 20, marginBottom: 10 },
	itemInfo: { fontSize: 15 },
	quantity: { fontSize: 15 },
	adderInfo: { alignItems: 'center' },
	adderInfoProfile: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 20, height: 40, overflow: 'hidden', width: 40 },
	adderInfoHeader: { padding: 10 },
	itemOrderNumber: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
	itemHeader: { marginTop: 20, textAlign: 'center' },
	actions: { flexDirection: 'row', justifyContent: 'space-around' },
	action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 5, padding: 5, width: 75 },
	actionHeader: { fontSize: 10, textAlign: 'center' },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmOptions: { flexDirection: 'row', justifyContent: 'space-around' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmOptionHeader: { },

	cardRequiredBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	cardRequiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	cardRequiredHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	cardRequiredActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cardRequiredAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	cardRequiredActionHeader: { }
})
