import React, { useState } from 'react';
import { SafeAreaView, Dimensions, View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { cancelPurchase, confirmPurchase, cancelRequest, reschedule, confirmRequest } from '../apis/services'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')

export default function notifications(props) {
	const [items, setItems] = useState([
		{
			key: "0", 
			type: "order",
			id: "1-x900d0d0d-0",
			name: "Roasted milk tea", 
			image: { photo: require('../../assets/product-image.png'), width: 0, height: 0 },
			info: [
				{ header: 'Size', selected: 'small' },
				{ header: 'Sugar', selected: 3 },
				{ header: 'Cream', selected: 3 }
			], 
			quantity: 10, price: 5.49,
			orderers: [
				{ key: "0-0", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "0-1", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "0-2", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "0-3", username: "good girl", profile: { photo: "", width: 0, height: 0 }}
			],
			adder: { username: "good girl", profile: { photo: '', width: 0, height: 0 }}
		},
		{
			key: "1", 
			type: "order",
			id: "1-x900d0d0d-1",
			name: "Roasted milk tea", 
			image: { photo: require('../../assets/product-image.png'), width: 0, height: 0 },
			info: [
				{ header: 'Size', selected: 'small' },
				{ header: 'Sugar', selected: 3 },
				{ header: 'Cream', selected: 3 }
			], 
			quantity: 4, price: 5.49,
			orderers: [
				{ key: "0-0", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "0-1", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "0-2", username: "good girl", profile: { photo: "", width: 0, height: 0 }},
				{ key: "0-3", username: "good girl", profile: { photo: "", width: 0, height: 0 }}
			],
			adder: { username: "good girl", profile: { photo: '', width: 0, height: 0 }}
		},
		{
			key: "2",
			type: "service",
			id: "1-x900d0d0d-2",
			location: "The One - Nail Salon",
			service: "Foot Care",
			locationimage: { photo: require("../../assets/nail-salon-logo.png"), width: 0, height: 0 },
			serviceimage: { photo: require("../../assets/nailsalon/footcare.jpeg"), width: 0, height: 0 },
			time: "5:40 pm",
			action: "taken", // rejected, taken,

			nexttime: 1624540847504, // '1624540847504', only if action = 'taken' or (sometimes 'rejected'),
			reason: "", // 'Our store doesn't provide that service anymore. Sorry', only if action == 'rejected'
		}
	])
	let [confirm, setConfirm] = useState({ show: false, name: "", price: "", quality: "" })

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

		hour = hour > 11 ? hour - 11 : hour

		let datestr = day + ", " + month + " " + date + ", " + year + " at " + hour + ":" + minute + " " + period;

		return datestr
	}

	const cancelThePurchase = (orderid) => {
		const data = { orderid }

		cancelPurchase(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					alert(JSON.stringify(res))
				}
			})
	}

	const confirmThePurchase = (data) => {
		const { id, name, quantity, price } = data
		const newItems = items.filter((item) => {
			return item.id != id
		})

		confirmPurchase(id)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setConfirm({
						...confirm,
						show: true,
						name: name,
						quantity: quantity,
						price: price
					})

					setTimeout(function () {
						setConfirm({
							...confirm,
							show: false,
							name: "",
							quantity: "",
							price: ""
						})

						setItems(newItems)
					}, 2000)
				}
			})
	}

	const cancelTheRequest = (serviceid) => {
		const data = { serviceid }

		cancelRequest(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					alert(JSON.stringify(res))
				}
			})
	}

	const confirmTheRequest = (serviceid) => {
		const data = { serviceid }

		confirmRequest(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					alert(JSON.stringify(res))
				}
			})
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<View style={{ alignItems: 'center', width: '100%' }}>
					<TouchableOpacity style={style.close} onPress={() => props.close()}>
						<AntDesign name="closecircleo" size={30}/>
					</TouchableOpacity>
				</View>
				<Text style={style.boxHeader}>{items.length} Notification(s)</Text>

				<FlatList
					showsVerticalScrollIndicator={false}
					data={items}
					renderItem={({ item, index }) => 
						<View style={style.item} key={item.key}>
							{item.type == "order" && (
								<>
									<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
										<View style={style.itemImageHolder}>
											<Image source={item.image.photo} style={{ height: 100, width: 100 }}/>
										</View>
										<View style={style.itemInfos}>
											{item.info.map((info, infoindex) => (
												<Text key={infoindex.toString()} style={style.itemInfo}><Text style={{ fontWeight: 'bold' }}>{info.header}:</Text> {info.selected}</Text>
											))}
										</View>
										<Text style={style.quantity}><Text style={{ fontWeight: 'bold' }}>quantity:</Text> {item.quantity}</Text>
									</View>
									<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 }}>
										<View style={{ flexDirection: 'row' }}>
											<View style={style.adderInfo}>
												<View style={style.adderInfoProfile}>
													<Image source={require('../../assets/profile.jpeg')} style={{ height: 40, width: 40 }}/>
												</View>
												<Text style={style.adderInfoUsername}>{item.adder.username}</Text>
											</View>
											<Text style={style.adderInfoHeader}> added this item to your cart.</Text>
										</View>
									</View>
									
									<Text style={style.itemHeader}>Want to purchase this?</Text>
									<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
										<View style={style.actions}>
											<TouchableOpacity style={style.action} onPress={() => cancelThePurchase(item.id)}>
												<Text style={style.actionHeader}>No</Text>
											</TouchableOpacity>
											<TouchableOpacity style={style.action} onPress={() => confirmThePurchase(item)}>
												<Text style={style.actionHeader}>Yes</Text>
											</TouchableOpacity>
										</View>
									</View>
								</>
							)}

							{item.type == "service" && (
								<>
									<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
										<View style={style.itemImageHolders}>
											<View style={style.itemLocationImageHolder}>
												<Image source={item.locationimage.photo} style={{ height: 80, width: 80 }}/>
											</View>
											<View style={style.itemServiceImageHolder}>
												<Image source={item.serviceimage.photo} style={{ height: 100, width: 100 }}/>
											</View>
										</View>
										<View style={{ flexDirection: 'column', justifyContent: 'space-between', width: width - 130 }}>
											<Text style={style.itemServiceHeader}>You requested an appointment for{' '}
												<Text style={{ fontFamily: 'appFont' }}>{item.service}</Text> at{' '}
												<Text style={{ fontFamily: 'appFont' }}>{item.time}</Text> at{' '}
												<Text style={{ fontFamily: 'appFont' }}>{item.location}</Text>
											</Text>
											{item.action == "accepted" ? 
												<Text style={style.itemServiceResponseHeader}>Your requested appointment has been accepted. Please show up 2-3 minutes earlier</Text>
											: null }
											{item.action == "rejected" || item.action == "taken" ? 
												<View style={style.storeRequested}>
													<Text style={style.itemServiceResponseHeader}>
														{item.action == "rejected" ? 
															"Your requested appointment has been rejected"
															:
															"Unfortunately, this time has been taken."
														}								
													</Text>

													{item.reason ? <Text style={style.itemServiceResponseHeader}>{item.reason}</Text> : null }
													{item.nexttime > 0 && (
														<View>
															<Text style={style.itemHeader}>
																<Text>The store requested this time for you.</Text>
																{'\n'}
																<Text style={style.itemServiceResponseHeader}>{displayDateStr(item.nexttime)}</Text>
																{'\n\n'}
																<Text>Will you be available?</Text>
															</Text>
															<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
																<View style={style.actions}>
																	<TouchableOpacity style={style.action} onPress={() => cancelTheRequest(item.id)}>
																		<Text style={style.actionHeader}>Cancel</Text>
																	</TouchableOpacity>
																	<TouchableOpacity style={style.action} onPress={() => {
																		props.close()
																		props.navigation.navigate("booktime", { name: item.service })
																	}}>
																		<Text style={style.actionHeader}>Reschedule</Text>
																	</TouchableOpacity>
																	<TouchableOpacity style={style.action} onPress={() => confirmTheRequest(item.id)}>
																		<Text style={style.actionHeader}>Yes</Text>
																	</TouchableOpacity>
																</View>
															</View>
														</View>
													)}
												</View>
											: null }
										</View>
									</View>
								</>
							)}
						</View>
					}
				/>
			</View>

			<Modal visible={confirm.show} transparent={true}>
				<SafeAreaView style={{ flex: 1 }}>
					<View style={style.confirmBox}>
						<View style={style.confirmContainer}>
							<Text style={style.confirmHeader}>Purchased {confirm.name} at ${confirm.price}</Text>
						</View>
					</View>
				</SafeAreaView>
			</Modal>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	box: { height: '100%', width: '100%' },
	close: { margin: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },

	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
	itemImageHolders: { height: 220, width: 100 },
	itemLocationImageHolder: { borderRadius: 50, height: 80, overflow: 'hidden', width: 80 },
	itemServiceImageHolder: { borderRadius: 50, height: 100, overflow: 'hidden', width: 100 },

	// service
	itemServiceHeader: { fontWeight: 'bold', margin: 10 },
	itemServiceResponseHeader: { fontWeight: 'bold', margin: 10 },
	storeRequested: { backgroundColor: 'rgba(127, 127, 127, 0.3)', borderRadius: 3, padding: 5 },
	itemServiceNewTimeHeader: {  },
	itemServiceNewTimeActions: { flexDirection: 'row' },
	itemServiceNewTimeAction: { borderRadius: 5, margin: 10 },
	itemServiceNewTimeActionHeader: { },

	// order
	itemInfos: {  },
	itemInfo: { fontSize: 15 },
	quantity: { fontSize: 15 },
	adderInfo: { alignItems: 'center' },
	adderInfoProfile: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 20, height: 40, overflow: 'hidden', width: 40 },
	adderInfoHeader: { paddingVertical: 20 },

	itemHeader: { textAlign: 'center' },
	actions: { flexDirection: 'row', justifyContent: 'space-around' },
	action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 5, padding: 5, width: 80 },
	actionHeader: { fontSize: 10, textAlign: 'center' },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmOptions: { flexDirection: 'row' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmOptionHeader: { },
})
