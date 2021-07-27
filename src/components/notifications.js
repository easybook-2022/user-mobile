import React, { useState, useEffect } from 'react';
import { AsyncStorage, ActivityIndicator, Dimensions, View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { logo_url } from '../../assets/info'
import { getNotifications } from '../apis/users'
import { cancelOrder, confirmOrder } from '../apis/products'
import { acceptRequest, closeRequest } from '../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - offsetPadding

export default function notifications(props) {
	const [items, setItems] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [confirm, setConfirm] = useState({ show: false, index: 0, name: "", price: "", quality: "" })

	const displayDateStr = (unixtime) => {
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

		let datestr = day + ", " + month + " " + date + ", " + year + " at " + hour + ":" + minute + " " + period;

		return datestr
	}

	const cancelTheOrder = (cartid, index) => {
		cancelOrder(cartid)
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
	const confirmTheOrder = async(info, index) => {
		const userid = await AsyncStorage.getItem("userid")
		const { id, name, quantity, price } = info
		const data = { userid, id }

		confirmOrder(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) setConfirm({ ...confirm, show: true, index: index, name: name, quantity: quantity, price: price })
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
	const acceptTheRequest = (id, index) => {
		acceptRequest(id)
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
						<FlatList
							showsVerticalScrollIndicator={false}
							data={items}
							renderItem={({ item, index }) => 
								<View style={style.item} key={item.key}>
									{item.type == "order" && (
										<>
											<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
												<View style={style.itemImageHolder}>
													<Image source={{ uri: logo_url + item.image }} style={{ height: 100, width: 100 }}/>
												</View>
												<View style={style.itemInfos}>
													<Text style={style.itemName}>{item.name}</Text>
													{item.options.map((option, infoindex) => (
														<Text key={infoindex.toString()} style={style.itemInfo}>
															<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
															{option.selected}
															{option.type == 'percentage' && '%'}
														</Text>
													))}
												</View>
												<Text style={style.quantity}><Text style={{ fontWeight: 'bold' }}>quantity:</Text> {item.quantity}</Text>
											</View>
											<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 }}>
												<View style={{ flexDirection: 'row' }}>
													<View style={style.adderInfo}>
														<View style={style.adderInfoProfile}>
															<Image source={{ uri: logo_url + item.adder.profile }} style={{ height: 40, width: 40 }}/>
														</View>
														<Text style={style.adderInfoUsername}>{item.adder.username}</Text>
													</View>
													<Text style={style.adderInfoHeader}> added this item to your cart.</Text>
												</View>
											</View>
											
											<Text style={style.itemHeader}>Want to purchase this?</Text>
											<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
												<View style={style.actions}>
													<TouchableOpacity style={style.action} onPress={() => cancelTheOrder(item.id, index)}>
														<Text style={style.actionHeader}>No</Text>
													</TouchableOpacity>
													<TouchableOpacity style={style.action} onPress={() => confirmTheOrder(item, index)}>
														<Text style={style.actionHeader}>Yes</Text>
													</TouchableOpacity>
												</View>
											</View>
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
													<Text style={style.itemServiceHeader}>You requested a reservation for 
														{'\n'}
														<Text style={{ fontFamily: 'appFont' }}>{item.location}</Text>
														{'\n'}on{'\n'}
														<Text style={{ fontFamily: 'appFont' }}>{displayDateStr(item.time)}</Text>
													</Text>
													:
													<Text style={style.itemServiceHeader}>You requested an appointment for {' '}
														<Text style={{ fontFamily: 'appFont' }}>{item.service}</Text>
														{'\n'}at{'\n'}
														<Text style={{ fontFamily: 'appFont' }}>{item.location}</Text>
														{'\n'}on{'\n'}
														<Text style={{ fontFamily: 'appFont' }}>{displayDateStr(item.time)}</Text>
													</Text>
												}
												{item.action == "accepted" && (
													<Text style={style.itemServiceResponseHeader}>
														{item.locationtype == 'restaurant' ? 
															"Your reservation has been accepted"
															:
															"Your requested appointment has been accepted."
														}
													</Text>
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

														{item.reason != "" ? 
															<>
																<Text style={style.itemServiceResponseHeader}>Reason: <Text style={{ fontWeight: '500' }}>{item.reason}</Text></Text>
																<View style={{ alignItems: 'center' }}>
																	<TouchableOpacity style={style.itemServiceResponseTouch} onPress={() => deleteTheRequest(item.id, index)}>
																		<Text style={style.itemServiceResponseTouchHeader}>Ok</Text>
																	</TouchableOpacity>
																</View>
															</>
														: null }
														{item.nextTime > 0 && (
															<>
																<Text style={style.itemHeader}>
																	<Text>The store requested this time for you.</Text>
																	{'\n'}
																	<Text style={style.itemServiceResponseHeader}>{displayDateStr(item.nextTime)}</Text>
																	{'\n\n'}
																	<Text>Will you be available?</Text>
																</Text>
																<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
																	<View style={style.actions}>
																		<TouchableOpacity style={style.action} onPress={() => deleteTheRequest(item.id, index)}>
																			<Text style={style.actionHeader}>Cancel</Text>
																		</TouchableOpacity>
																		<TouchableOpacity style={style.action} onPress={() => {
																			props.close()
																			
																			if (item.locationtype == "restaurant") {
																				props.navigation.navigate("makereservation", { locationid: item.locationid })
																			} else {
																				props.navigation.navigate("booktime", { locationid: item.locationid, menuid: item.menuid, serviceid: item.serviceid })
																			}
																		}}>
																			<Text style={style.actionHeader}>Reschedule</Text>
																		</TouchableOpacity>
																		<TouchableOpacity style={style.action} onPress={() => acceptTheRequest(item.id, index)}>
																			<Text style={style.actionHeader}>Yes</Text>
																		</TouchableOpacity>
																	</View>
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
						<ActivityIndicator size="small"/>
					}
				</View>
			</View>

			{confirm.show && (
				<Modal transparent={true}>
					<View style={{ paddingTop: offsetPadding }}>
						<View style={style.confirmBox}>
							<View style={style.confirmContainer}>
								<Text style={style.confirmHeader}>
									Confirmed Order: 
									{'\n\n Quantity: ' + confirm.quantity + '\n\n'} {confirm.name + '\n\n'} at ${confirm.price}
								</Text>

								<View style={style.confirmOptions}>
									<TouchableOpacity style={style.confirmOption} onPress={() => {
										const newItems = [...items]

										newItems.splice(confirm.index, 1)

										setItems(newItems)

										setConfirm({ ...confirm, show: false, index: 0, name: "", quantity: "", price: "" })
									}}>
										<Text style={style.confirmOptionHeader}>Ok</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</View>
				</Modal>
			)}
		</View>
	);
}

const style = StyleSheet.create({
	box: { height: '100%', width: '100%' },
	close: { margin: 20 },
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
	adderInfoHeader: { paddingVertical: 20 },

	itemHeader: { textAlign: 'center' },
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
})
