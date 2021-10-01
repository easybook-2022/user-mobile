import React, { useState, useEffect } from 'react';
import { AsyncStorage, ActivityIndicator, Dimensions, View, FlatList, Text, TextInput, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { logo_url, displayTime } from '../../assets/info'
import { getNotifications } from '../apis/users'
import { getWorkers } from '../apis/locations'
import { cancelCartOrder, confirmCartOrder } from '../apis/products'
import { acceptReservation, closeRequest, cancelReservationJoining, acceptReservationJoining, cancelService, sendServicePayment, sendDiningPayment, cancelDiningOrder, confirmDiningOrder } from '../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const workerImage = 80

export default function notifications(props) {
	const [items, setItems] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [confirm, setConfirm] = useState({ show: false, type: "", index: 0, name: "", price: "", quality: "" })
	const [cancelServiceRequest, setCancelservicerequest] = useState({ show: false, id: -1, location: "", service: "", time: 0, index: -1 })
	const [showPaymentRequired, setShowpaymentrequired] = useState(false)
	const [showOwners, setShowowners] = useState({ show: false, scheduleid: 0, index: -1, owners: [], workerid: 0 })

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
			.catch((err) => {
				if (err.response.status == 400) {

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
			.catch((err) => {
				if (err.response.status == 400) {

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
			.catch((err) => {
				if (err.response.status == 400) {

				}
			})
	}
	const acceptTheReservation = (index) => {
		const newItems = [...items]
		const { id, table } = newItems[index]
		const data = { requestid: id, tablenum: table }

		acceptReservation(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newItems = [...items]

					newItems[index].action = "accepted"
					newItems[index].nextTime = 0
					newItems[index].confirm = true

					setItems(newItems)
				}
			})
			.catch((err) => {
				if (err.response.status == 400) {

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
					const status = err.response.data.status

					switch (status) {
						case "cardrequired":
							setShowpaymentrequired(true)

							break;
						default:
					}
				}
			})
	}
	const cancelTheService = (info, index) => {
		if (!cancelServiceRequest.show) {
			const { id, location, service, time } = info

			setCancelservicerequest({ show: true, id, location, service, time, index })
		} else {
			const { id, index } = cancelServiceRequest

			cancelService(id)
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

						setCancelservicerequest({ show: false, location: "", service: "", time: 0, index: -1 })
					}
				})
				.catch((err) => {
					if (err.response.status == 400) {

					}
				})
		}
	}
	const sendTheServicePayment = (scheduleid, index) => {
		if (!showOwners.show) {
			getWorkers(scheduleid)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const { owners } = res

						setShowowners({ ...showOwners, show: true, scheduleid, index, owners })
					}
				})
				.catch((err) => {
					if (err.response.status == 400) {

					}
				})
		} else {
			const { scheduleid, index, owners, workerid } = showOwners
			const data = { scheduleid, workerid }

			sendServicePayment(data)
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
						setShowowners({ show: false, scheduleid: 0, index: -1, owners: [], workerid: 0 })
					}
				})
				.catch((err) => {
					if (err.response.status == 400) {

					}
				})
		}
	}
	const selectWorker = id => {
		const { owners } = showOwners
		let workerid

		owners.forEach(function (info) {
			info.row.forEach(function (worker) {
				worker.selected = false

				if (worker.id == id) {
					worker.selected = true
					workerid = worker.id
				}
			})
		})

		setShowowners({ ...showOwners, owners, workerid })
	}
	const sendTheDiningPayment = async(scheduleid, index) => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { scheduleid, userid }

		sendDiningPayment(data)
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
			.catch((err) => {
				if (res.response.status == 400) {

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
			.catch((err) => {
				if (err.response.status == 400) {

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
																	{'\n'}
																	<Text style={{ fontFamily: 'appFont', fontSize: 20 }}>{displayTime(item.time)}</Text>
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
																	{'\n'}
																	<Text style={{ fontFamily: 'appFont', fontSize: 20 }}>{displayTime(item.time)}</Text>
																</Text>
															:
															<Text style={style.itemServiceHeader}>You requested an appointment for {' '}
																<Text style={{ fontFamily: 'appFont', fontSize: 20 }}>{item.service}</Text>
																{'\n'}at{'\n'}
																<Text style={{ fontFamily: 'appFont', fontSize: 20 }}>{item.location}</Text>
																{'\n'}
																<Text style={{ fontFamily: 'appFont', fontSize: 20 }}>{displayTime(item.time)}</Text>
															</Text>
														}
														{(item.action == "requested" || item.action == "change") && <Text style={{ fontWeight: '100' }}>waiting for the {item.locationtype == 'restaurant' ? 'restaurant' : 'salon'}'s response</Text>}
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
																				{item.seated && (
																					<>
																						<TouchableOpacity style={style.itemServiceOrderTouch} onPress={() => {
																							props.close()
																							props.navigation.navigate("order", { locationid: item.locationid, scheduleid: item.id })
																						}}>
																							<Text style={style.itemServiceOrderTouchHeader}>Start Ordering your meal(s)</Text>
																						</TouchableOpacity>
																						<TouchableOpacity style={style.itemServiceOrderTouch} onPress={() => sendTheDiningPayment(item.id, index)}>
																							<Text style={style.itemServiceOrderTouchHeader}>Send payment{item.paymentSent ? " again" : ""}</Text>
																						</TouchableOpacity>
																					</>
																				)}
																			</View>

																			{!item.seated && (
																				<>
																					<TouchableOpacity style={style.itemServiceOrderTouch} onPress={() => {
																						props.close()
																						props.navigation.navigate("order", { locationid: item.locationid, scheduleid: item.id })
																					}}>
																						<Text style={style.itemServiceOrderTouchHeader}>See the menu</Text>
																					</TouchableOpacity>
																					<TouchableOpacity style={style.itemServiceOrderTouch} onPress={() => {
																						props.close()
																						props.navigation.navigate("makereservation", { locationid: item.locationid, scheduleid: item.id })
																					}}>
																						<Text style={style.itemServiceOrderTouchHeader}>Reschedule</Text>
																					</TouchableOpacity>
																					<View style={style.itemServiceOrderTouchDisabled} onPress={() => {}}>
																						<Text style={style.itemServiceOrderTouchHeader}>
																							Awaits seating{'\n'}
																							<Text>........</Text>
																						</Text>
																					</View>
																				</>
																			)}
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
																			<TouchableOpacity style={style.action} onPress={() => cancelTheService(item, index)}>
																				<Text style={style.actionHeader}>Cancel Service</Text>
																			</TouchableOpacity>
																			<TouchableOpacity style={style.action} onPress={() => sendTheServicePayment(item.id, index)}>
																				<Text style={style.actionHeader}>Send Payment{item.paymentSent ? ' Again' : ''}</Text>
																			</TouchableOpacity>
																			<TouchableOpacity style={style.action} onPress={() => {
																				props.close()
																				props.navigation.navigate("booktime", { locationid: item.locationid, serviceid: item.serviceid, scheduleid: item.id })
																			}}>
																				<Text style={style.actionHeader}>Reschedule</Text>
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
																			<Text style={style.itemServiceResponseHeader}>{displayTime(item.nextTime)}</Text>
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
																			<TouchableOpacity style={style.action} onPress={() => acceptTheReservation(index)}>
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
				{cancelServiceRequest.show && (
					<Modal transparent={true}>
						<View style={{ paddingTop: offsetPadding }}>
							<View style={style.confirmBox}>
								<View style={style.confirmContainer}>
									<Text style={style.confirmHeader}>
										<Text style={{ fontFamily: 'arial'}}>Are you sure you want to cancel the service appointment of</Text>
										{'\n\n' + cancelServiceRequest.service + '\n'}
										{'\nat ' + cancelServiceRequest.location + '\n'}
										{displayTime(cancelServiceRequest.time)}
									</Text>

									<View style={style.confirmOptions}>
										<TouchableOpacity style={style.confirmOption} onPress={() => setCancelservicerequest({ show: false, service: "", time: 0, index: -1 })}>
											<Text style={style.confirmOptionHeader}>No</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.confirmOption} onPress={() => cancelTheService()}>
											<Text style={style.confirmOptionHeader}>Yes</Text>
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
				{showOwners.show && (
					<Modal transparent={true}>
						<View style={{ paddingVertical: offsetPadding }}>
							<View style={style.payworkerBox}>
								<View style={style.payworkerContainer}>
									<TextInput style={style.payworkerSearchInput} placeholder="Search worker" placeholderTextColor="rgba(0, 0, 0, 0.5)"/>

									<Text style={style.payworkerWorkersListHeader}>Select worker to send payment</Text>

									<View style={style.payworkerWorkersList}>
										<FlatList
											data={showOwners.owners}
											renderItem={({ item, index }) => 
												<View key={item.key} style={style.payworkerWorkersRow}>
													{item.row.map(info => (
														<TouchableOpacity key={info.key} style={!info.selected ? style.payworkerWorker : style.payworkerWorkerDisabled} onPress={() => selectWorker(info.id)}>
															<View style={style.payworkerWorkerProfile}>
																<Image source={{ uri: logo_url + info.profile }} style={{ height: workerImage, width: workerImage }}/>
															</View>
															<Text style={style.payworkerWorkerHeader}>{info.username}</Text>
														</TouchableOpacity>
													))}
												</View>
											}
										/>
									</View>

									<View style={style.payworkerActions}>
										<TouchableOpacity style={style.payworkerAction} onPress={() => setShowowners({ show: false, owners: [] })}>
											<Text style={style.payworkerActionHeader}>Close</Text>
										</TouchableOpacity>
										<TouchableOpacity style={showOwners.workerid > 0 ? style.payworkerAction : style.payworkerActionDisabled} disabled={showOwners.workerid == 0} onPress={() => sendTheServicePayment()}>
											<Text style={style.payworkerActionHeader}>Send</Text>
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

	body: { flexDirection: 'column', height: screenHeight - 94, justifyContent: 'space-around' },
	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
	itemImageHolders: { width: 100 },
	itemLocationImageHolder: { borderRadius: 50, height: 80, overflow: 'hidden', width: 80 },
	itemServiceImageHolder: { borderRadius: 50, height: 100, overflow: 'hidden', width: 100 },

	// service
	itemServiceHeader: { fontWeight: 'bold', margin: 10, textAlign: 'center' },
	itemServiceResponseHeader: { fontWeight: 'bold', margin: 10 },
	itemServiceResponseTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 60 },
	itemServiceResponseTouchHeader: { fontWeight: 'bold', textAlign: 'center' },
	itemServiceOrder: { flexDirection: 'row', justifyContent: 'space-between', width: 250 },
	itemServiceOrderTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 2, padding: 5, width: 120 },
	itemServiceOrderTouchDisabled: { backgroundColor: 'grey', borderColor: 'grey', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 2, padding: 5, width: 120 },
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
	cardRequiredActionHeader: { },

	payworkerBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	payworkerContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '80%' },
	payworkerSearchInput: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, height: 40, width: '90%' },
	payworkerWorkersList: { height: '70%' },
	payworkerWorkersListHeader: { fontWeight: 'bold', textAlign: 'center' },
	payworkerWorkersRow: { flexDirection: 'row', justifyContent: 'space-between' },
	payworkerWorker: { alignItems: 'center', marginHorizontal: 5, padding: 5 },
	payworkerWorkerDisabled: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 5, marginHorizontal: 5, padding: 5 },
	payworkerWorkerProfile: { borderRadius: workerImage / 2, height: workerImage, overflow: 'hidden', width: workerImage },
	payworkerWorkerHeader: {  },
	payworkerActions: { flexDirection: 'row', justifyContent: 'space-around' },
	payworkerAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	payworkerActionDisabled: { alignItems: 'center', backgroundColor: 'grey', borderColor: 'grey', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	payworkerActionHeader: { },
})
