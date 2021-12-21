import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Dimensions, View, FlatList, Text, TextInput, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { socket, url, logo_url, displayTime, stripeFee } from '../../assets/info'
import { getNotifications, getTrialInfo } from '../apis/users'
import { getWorkers, searchWorkers } from '../apis/owners'
import { cancelCartOrder, confirmCartOrder } from '../apis/products'
import { acceptRequest, closeRequest, confirmRequest, cancelReservationJoining, acceptReservationJoining, cancelService, allowPayment, sendDiningPayment, cancelDiningOrder, confirmDiningOrder } from '../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const workerImage = (width / 3) - 40

const fsize = p => {
	return width * p
}

export default function notifications(props) {
	const [userId, setUserid] = useState(null)
	const [items, setItems] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [numUnreaded, setNumunreaded] = useState(0)
	const [confirm, setConfirm] = useState({ show: false, type: "", index: 0, name: "", price: "", quality: "" })
	const [closeServiceRequest, setCloseservicerequest] = useState({ show: false, id: -1, location: "", service: "", time: 0, index: -1 })
	const [cancelRequest, setCancelrequest] = useState({ show: false, id: -1, location: "", type: "", service: "", time: 0, index: -1 })
	const [showDiningPaymentRequired, setShowdiningpaymentrequired] = useState(false)
	const [showServicePaymentRequired, setShowservicepaymentrequired] = useState(false)
	const [showChargeuser, setShowchargeuser] = useState({ show: false, trialstatus: { days: 30, status: "" }, locationid: 0, scheduleid: 0, index: -1, cost: 0.00, pst: 0.00, hst: 0.00, fee: 0.00, total: 0.00 })
	const [showPaymentdetail, setShowpaymentdetail] = useState({ show: false, scheduleid: 0, index: 0, amount: 0.00, pst: 0.00, hst: 0.00, fee: 0.00, total: 0.00 })
	const [showOwners, setShowowners] = useState({ show: false, showworkers: false, scheduleid: 0, index: -1, owners: [], workerid: 0, cost: 0.00, pst: 0.00, hst: 0.00, fee: 0.00, total: 0.00 })
	const [showDisabledScreen, setShowdisabledscreen] = useState(false)

	const isMounted = useRef(null)

	const cancelTheCartOrder = async(cartid, index) => {
		let data = { userid: userId, cartid, type: "cancelCartOrder" }

		cancelCartOrder(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					data = { ...data, receiver: res.receiver }
					socket.emit("socket/cancelCartOrder", data, () => {
						const newItems = [...items]

						newItems.splice(index, 1)

						setItems(newItems)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				}
			})
	}
	const cancelTheDiningOrder = async(orderid, index) => {
		let data = { orderid, ordererid: userId, type: "cancelDiningOrder" }

		cancelDiningOrder(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { receiver, numCallfor } = res

					data = { ...data, receiver, numCallfor }
					socket.emit("socket/cancelDiningorder", data, () => {
						const newItems = [...items]

						newItems.splice(index, 1)

						setItems(newItems)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				}
			})
	}
	const confirmTheCartOrder = async(index) => {
		const info = items[index]
		const { id, name, quantity, price } = info
		let data = { userid: userId, id, type: "confirmCartOrder" }

		confirmCartOrder(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					data = { ...data, receiver: res.receiver }
					socket.emit("socket/confirmCartOrder", data, () => setConfirm({ ...confirm, show: true, type: "cart", index, name, quantity, price }))
				}
			})
	}
	const confirmTheDiningOrder = async(index) => {
		const info = items[index]
		const { orderid, name, quantity, sizes, others } = info
		let data = { orderid, ordererid: userId, type: "confirmDiningOrder" }
		let price = 0

		if (info.price) {
			price = info.price
		} else {
			sizes.forEach(function (size) {
				if (size.selected) {
					price += size.price
				}
			})

			others.forEach(function (other) {
				price += other.price
			})
		}

		confirmDiningOrder(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					data = { ...data, receiver: res.receiver }
					socket.emit("socket/confirmDiningOrder", data, () => setConfirm({ ...confirm, show: true, type: "dining", index, name, quantity, price }))
				}
			})
	}
	const closeTheRequest = (index) => {
		const { id } = items[index]
		let data = { scheduleid: id, type: "closeRequest" }

		closeRequest(id)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					data = { ...data, receiver: res.receiver }
					socket.emit("socket/closeRequest", data, () => {
						const newItems = [...items]

						newItems.splice(index, 1)

						setItems(newItems)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				}
			})
	}
	const acceptTheRequest = index => {
		const newItems = [...items]
		const { id, table } = newItems[index]
		let data = { scheduleid: id, tablenum: table, type: "acceptRequest" }

		acceptRequest(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					data = { ...data, receivers: res.receivers }
					socket.emit("socket/acceptRequest", data, () => {
						newItems[index].action = "accepted"
						newItems[index].nextTime = 0
						newItems[index].confirm = true

						setItems(newItems)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				}
			})
	}
	const cancelTheRequest = (info, index) => {
		if (!cancelRequest.show) {
			const { id, location, locationtype, service, time } = info

			setCancelrequest({ show: true, id, location, type: locationtype, service, time, index })
		} else {
			const { id, index } = cancelRequest
			let data = { scheduleid: id, type: "cancelService" }

			cancelService(id)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						data = { ...data, receiver: res.receiver }
						socket.emit("socket/cancelService", data, () => {
							const newItems = [...items]

							newItems.splice(index, 1)

							setItems(newItems)

							setCancelrequest({ ...cancelRequest, show: false })
						})
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {

					}
				})
		}
	}
	const confirmTheRequest = async(index) => {
		const newItems = [...items]
		let chargedUser, scheduleid, type
		let data = { userid: userId, time: Date.now() }
		let confirm = false

		if (index != null) {
			let item = items[index]

			chargedUser = item.chargedUser
			scheduleid = item.id
			type = item.locationtype == "restaurant" ? "restaurant" : "salon"

			if (!chargedUser) {
				const cost = 0.16
				const pst = cost * 0.08
				const hst = cost * 0.05
				const total = stripeFee(cost + pst + hst)
				const nofee = cost + pst + hst
				const fee = total - nofee

				let res = await getTrialInfo(data)

				if (res.status == 200) {
					let { days, status } = res.data

					if (status == "notover") {
						confirm = true
					}

					setShowchargeuser({ 
						...showChargeuser, show: true, trialstatus: { days, status }, scheduleid, index, type,
						cost: cost.toFixed(2), pst: pst.toFixed(2), hst: hst.toFixed(2), 
						fee: fee.toFixed(2), total: total.toFixed(2)
					})
				}
			} else {
				confirm = true
			}
		} else {
			let { index, trialstatus } = showChargeuser
			let item = items[index]

			scheduleid = item.id
			type = item.locationtype == "restaurant" ? "restaurant" : "salon"

			if (trialstatus.status == "trialover") {
				confirm = true
			} else if (trialstatus.status == "cardrequired") {
				setShowchargeuser({ ...showChargeuser, show: false })
				setShowservicepaymentrequired(true)
			}
		}

		if (confirm) {
			data = { userid: userId, scheduleid, type: "confirmRequest", socketType: type, time: Date.now() }
			index = index != null ? index : showChargeuser.index

			confirmRequest(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						data = { ...data, receivers: res.receivers, worker: items[index].worker }
						socket.emit("socket/confirmRequest", data, () => {
							newItems[index].action = "confirmed"
							newItems[index].nextTime = 0
							newItems[index].confirm = true
							newItems[index].chargedUser = true

							setItems(newItems)
						})
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data

						switch (status) {
							case "cardrequired":
								setShowchargeuser({ ...showChargeuser, show: false })
								showServicePaymentRequired(true)

								break
							default:
						}
					}
				})
		}
	}
	const cancelTheReservationJoining = scheduleid => {
		const data = { userid: userId, scheduleid }

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
	const acceptTheReservationJoining = index => {
		let locationid, scheduleid

		const newItems = [...items]
		const item = index != null ? newItems[index] : newItems[showChargeuser.index]

		locationid = item.locationid
		scheduleid = item.id

		if (!showChargeuser.show) {
			const cost = 0.17
			const pst = cost * 0.08
			const hst = cost * 0.05
			const total = stripeFee(cost + pst + hst)
			const nofee = cost + pst + hst
			const fee = total - nofee

			setShowchargeuser({ 
				...showChargeuser, show: true, locationid, scheduleid, type: "restaurant", index, 
				cost: cost.toFixed(2), pst: pst.toFixed(2), 
				hst: hst.toFixed(2), fee: fee.toFixed(2), 
				total: total.toFixed(2)
			})
		} else {
			const { locationid, scheduleid, index } = showChargeuser
			let data = { userid: userId, scheduleid, type: "acceptReservationJoining" }

			acceptReservationJoining(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						data = { ...data, receiver: res.receiver }
						socket.emit("socket/acceptReservationJoining", data, () => {
							setShowchargeuser({ ...showChargeuser, show: false })

							setItems(newItems.filter(item => {
								if (item.id == scheduleid) {
									return item.confirm = true
								} else {
									return item
								}
							}))
						})
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data

						switch (status) {
							case "cardrequired":
								setShowchargeuser({ ...showChargeuser, show: false })
								setShowdiningpaymentrequired(true)

								break;
							default:
						}
					}
				})
		}
	}
	const allowThePayment = async(info, index) => {
		if (!showOwners.show) {
			const { id, locationid, serviceprice } = items[index]
			const scheduleid = id

			getWorkers(locationid)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const { owners } = res
						const cost = serviceprice
						const pst = cost * 0.08
						const hst = cost * 0.05
						const total = stripeFee(cost + pst + hst)
						const nofee = cost + pst + hst
						const fee = total - nofee

						setShowowners({ 
							...showOwners, show: true, showworkers: true, scheduleid, index, owners, 
							cost: cost.toFixed(2), pst: pst.toFixed(2), hst: hst.toFixed(2), 
							fee: fee.toFixed(2), total: total.toFixed(2)
						})
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {

					}
				})
		} else {
			const { scheduleid, index, workerid } = showOwners
			let data = { scheduleid, workerid, type: "allowPayment", receiver: "owner" + workerid }

			allowPayment(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const { msg, days } = res

						socket.emit("socket/allowPayment", data, () => {
							const newItems = [...items]

							newItems[index].allowPayment = true

							setItems(newItems)
							setShowowners({ ...showOwners, show: false, showworkers: false })
						})
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {

					}
				})
		}
	}
	const searchTheWorkers = username => {
		const { scheduleid } = showOwners
		const data = { scheduleid, username }

		searchWorkers(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { owners } = res

					setShowowners({ ...showOwners, owners })
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				}
			})
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
		let data = { scheduleid, userid: userId }
		let getinfo = false

		if (!showPaymentdetail.show) {
			getinfo = true
			data = { ...data, getinfo }
		} else {
			const { scheduleid } = showPaymentdetail
			data = { ...data, scheduleid }
		}

		sendDiningPayment(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					if (getinfo == true) {
						const amount = res.amount
						const pst = amount * 0.08
						const hst = amount * 0.05
						const total = stripeFee(amount + pst + hst)
						const nofee = amount + pst + hst
						const fee = total - nofee

						setShowpaymentdetail({ 
							show: true, scheduleid, index, 
							amount: amount.toFixed(2), pst: pst.toFixed(2), 
							hst: hst.toFixed(2), fee: fee.toFixed(2), 
							total: total.toFixed(2)
						})
					} else {
						const { index } = showPaymentdetail
						const newItems = [...items]

						data = { ...data, receiver: res.receiver }
						socket.emit("socket/sendDiningPayment", data, () => {
							newItems[index].allowPayment = true

							setItems(newItems)
							setShowpaymentdetail({ ...showPaymentdetail, show: false })
						})
					}
				}
			})
			.catch((err) => {
				if (res.response && res.response.status == 400) {

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
				if (res && isMounted.current == true) {
					socket.emit("socket/user/login", userid, () => {
						setUserid(userid)
						setItems(res.notifications)
						setLoaded(true)
						setNumunreaded(0)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				}
			})
	}

	// websockets
	const startWebsocket = async() => {
		socket.on("addToNotifications", data => {
			const newItems = [...items]

			if (data.type == "acceptRequest") {
				const { tablenum, receivers, worker } = data

				setItems(newItems.filter(item => {
					if (item.id == data.scheduleid) {
						if (data.ownerid) { // salons
							if (receivers.booker[0].replace("user", "") == userId) {
								return item.action = "accepted", item.table = tablenum, item.confirm = true, item.worker = worker
							} else {
								return item.action = "accepted", item.table = tablenum, item.worker = worker
							}
						} else {
							return item.action = "accepted", item.table = tablenum
						}
					} else {
						return item
					}
				}))
			} else if (data.type == "cancelReservation") {
				const { id } = data

				setItems(newItems.filter(item => {
					if (item.id != data.id) {
						return item
					}
				}))
			} else if (data.type == "closeRequest") {
				setItems(newItems.filter(item => {
					if (item.id != data.scheduleid) {
						return item
					}
				}))
			} else if (data.type == "confirmRequest") {
				setItems(newItems.filter(item => {
					if (item.id == data.scheduleid) {
						return item.action = "confirmed"
					} else {
						return item
					}
				}))
			} else if (data.type == "rescheduleAppointment") {
				const { appointmentid, time, worker } = data

				setItems(newItems.filter(item => {
					if (item.id == appointmentid) {
						return item.action = "rebook", item.nextTime = parseInt(time), item.worker = worker
					} else {
						return item
					}
				}))
			} else if (data.type == "doneService") {
				setItems(newItems.filter(item => {
					if (item.id != data.scheduleid) {
						return item
					}
				}))
			} else if (data.type == "cancelRequest") {
				const { id, reason } = data

				setItems(newItems.filter(item => {
					if (item.id == id) {
						if (reason != "") {
							return item.action = "cancel", item.reason = reason
						} else {
							return item.action = "cancel"
						}
					} else {
						return item
					}
				}))
			} else if (data.type == "addItemtoorder") {
				setNumunreaded(numUnreaded + 1)
			} else if (data.type == "addDiners") {
				setNumunreaded(numUnreaded + 1)
			} else if (data.type == "orderReady") {
				const { ordernumber } = data

				setItems(newItems.filter(item => {
					if (item.orderNumber == ordernumber) {
						return item.status = "ready"
					} else {
						return item
					}
				}))
			} else if (data.type == "makeReservation") {
				const { scheduleid, time, table } = data

				setItems(newItems.filter(item => {
					if (item.id == scheduleid) {
						return item.action = "requested", item.nextTime = parseInt(time), item.table = table
					} else {
						return item
					}
				}))
			} else if (data.type == "rescheduleReservation") {
				const { scheduleid, time, table } = data

				setItems(newItems.filter(item => {
					if (item.id == scheduleid) {
						return item.action = "rebook", item.nextTime = parseInt(time), item.table = table
					} else {
						return item
					}
				}))
			} else if (data.type == "canServeDiners") {
				setItems(newItems.filter(item => {
					if (item.id == data.id) {
						return item.confirm = true, item.seated = true
					} else {
						return item
					}
				}))
			} else if (data.type == "deleteReservation") {
				const { id } = data

				setItems(newItems.filter(item => {
					if (item.id != id) {
						return item
					}
				}))
			} else if (data.type == "getDinersPayments") {
				setItems(newItems.filter(item => {
					if (item.id != data.scheduleid) {
						return item
					}
				}))
			} else if (data.type == "receivePayment") {
				setItems(newItems.filter(item => {
					if (item.id != data.scheduleid) {
						return item
					}
				}))
			} else if (data.type == "productPurchased") {
				setItems(newItems.filter(item => {
					if (item.orderNumber != data.ordernumber) {
						return item
					}
				}))
			} else if (data.type == "deleteOrder") {
				setItems(newItems.filter(item => {
					if (item.orderid != data.orderid) {
						return item
					}
				}))
			} else {
				setNumunreaded(numUnreaded + 1)
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
		getTheNotifications()
	}, [])

	useEffect(() => {
		isMounted.current = true

		startWebsocket()

		if (Constants.isDevice) {
			Notifications.addNotificationResponseReceivedListener(res => {
				const { data } = res.notification.request.content
				const newItems = [...items]

				if (data.type == "acceptRequest") {
					const { scheduleid, tablenum, receivers } = data

					setItems(newItems.filter(item => {
						if (item.id == scheduleid) {
							if (receivers.booker.replace("user", "") == userId) {
								return item.action = "accepted", item.table = tablenum, item.confirm = true
							} else {
								return item.action = "accepted"
							}
						} else {
							return item
						}
					}))
				} else if (data.type == "rescheduleAppointment") {
					const { appointmentid, time } = data

					setItems(newItems.filter(item => {
						if (item.id == appointmentid) {
							return item.action = "rebook", item.nextTime = parseInt(time)
						} else {
							return item
						}
					}))
				} else if (data.type == "doneService") {
					setItems(newItems.filter(item => {
						if (item.id != data.scheduleid) {
							return item
						}
					}))
				} else if (data.type == "cancelRequest") {
					const { id, reason } = data

					setItems(newItems.filter(item => {
						if (item.id == id) {
							if (reason != "") {
								return item.action = "cancel", item.reason = reason
							} else {
								return item.action = "cancel"
							}
						} else {
							return item
						}
					}))
				} else if (data.type == "orderReady") {
					const { ordernumber } = data

					setItems(newItems.filter(item => {
						if (item.orderNumber == ordernumber) {
							return item.status = "ready"
						} else {
							return item
						}
					}))
				} else if (data.type == "canServeDiners") {
					setItems(newItems.filter(item => {
						if (item.id == data.id) {
							return item.seated = true
						} else {
							return item
						}
					}))
				} else if (data.type == "addDiners") {
					setNumunreaded(numUnreaded + 1)
				} else if (data.type == "addItemtoorder") {
					setNumunreaded(numUnreaded + 1)
				}
			});
		}

		return () => {
			socket.off("addToNotifications")
			isMounted.current = false
		}
	}, [items.length])

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

					<View style={{ alignItems: 'center' }}>
						<TouchableOpacity style={style.refresh} onPress={() => getTheNotifications()}>
							<Text style={style.refreshHeader}>Refresh {numUnreaded > 0 ? <Text style={{ fontWeight: 'bold' }}>({numUnreaded})</Text> : null}</Text>
						</TouchableOpacity>
					</View>
					
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
														<View>
															<Text style={style.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>Quantity:</Text> {item.quantity}</Text>
															<Text style={style.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>E-pay fee:</Text> ${item.fee.toFixed(2)}</Text>
															<Text style={style.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>PST:</Text> ${item.pst.toFixed(2)}</Text>
															<Text style={style.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>HST fee:</Text> ${item.hst.toFixed(2)}</Text>
															<Text style={style.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>Total cost:</Text> ${item.total.toFixed(2)}</Text>
														</View>
													</View>

													{(item.status == "checkout" || item.status == "ready") && (
														<>
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
													{item.status == "unlisted" && (
														<>
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
																{item.type == "cart-order-other" && 'Want to purchase this?'}
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
																				confirmTheCartOrder(index)
																			} else {
																				confirmTheDiningOrder(index)
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
														<View>
															<Text style={style.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>Quantity:</Text> {item.quantity}</Text>
															<Text style={style.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>E-pay fee:</Text> ${item.fee.toFixed(2)}</Text>
															<Text style={style.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>PST:</Text> ${item.pst.toFixed(2)}</Text>
															<Text style={style.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>HST fee:</Text> ${item.hst.toFixed(2)}</Text>
															<Text style={style.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>Total cost:</Text> ${item.total.toFixed(2)}</Text>
														</View>
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
																	{(item.diners) > 0 ? ' for ' + (item.diners) + ' ' + ((item.diners) == 1 ? 'person' : 'people') : null }
																	{'\n'}at{'\n'}
																	<Text style={{ fontFamily: 'appFont', fontSize: fsize(0.05) }}>{item.location}</Text>
																	{'\n'}
																	<Text style={{ fontFamily: 'appFont', fontSize: fsize(0.05) }}>{displayTime(item.time)}</Text>
																	{'\n'}
																</Text>
																:
																<Text style={style.itemServiceHeader}>
																	{item.bookerName} {item.action == "accepted" ? "made" : "requested"} a reservation for you
																	{item.diners > 0 ? 
																		<>
																			{' '}and{' '}
																			{
																				item.diners - 1 == 0 ? 
																					item.bookerName
																					:
																					(item.diners - 1) + " other " + ((item.diners - 1) <= 1 ? "person" : "people") + " " 
																			}
																		</>
																	: null}
																	{'\n'}at
																	<Text style={{ fontFamily: 'appFont', fontSize: fsize(0.05) }}>{'\n' + item.location}</Text>
																	{'\n'}
																	<Text style={{ fontFamily: 'appFont', fontSize: fsize(0.05) }}>{displayTime(item.time)}</Text>
																</Text>
															:
															<Text style={style.itemServiceHeader}>
																You requested an appointment for {' '}
																<Text style={{ fontFamily: 'appFont', fontSize: fsize(0.05) }}>{item.service}</Text>
																{'\n'}at{'\n'}
																<Text style={{ fontFamily: 'appFont', fontSize: fsize(0.05) }}>{item.location}</Text>
																{'\n'}
																<Text style={{ fontFamily: 'appFont', fontSize: fsize(0.05) }}>{displayTime(item.time)}</Text>

																{item.worker != null && <Text style={{ fontSize: fsize(0.05) }}>{'\nwith worker: ' + item.worker.username}</Text>}
															</Text>
														}

														{(item.action == "requested" || item.action == "change") && 
															<Text style={{ fontWeight: '100' }}>waiting for the {item.locationtype == 'restaurant' ? 'restaurant' : 'salon'}'s response</Text>
														}

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
																
																<View style={{ alignItems: 'center' }}>
																	{item.locationtype == "restaurant" ? 
																		item.booker ? 
																			<View style={{ alignItems: 'center' }}>
																				<View style={style.actions}>
																					<TouchableOpacity style={style.action} onPress={() => cancelTheRequest(item, index)}>
																						<Text style={style.actionHeader}>Cancel</Text>
																					</TouchableOpacity>
																					<TouchableOpacity style={style.action} onPress={() => confirmTheRequest(index)}>
																						<Text style={style.actionHeader}>Accept</Text>
																					</TouchableOpacity>
																				</View>
																			</View>
																			:
																			item.confirm ? 
																				<>
																					<TouchableOpacity style={style.itemServiceOrderAction} onPress={() => {
																						props.close()
																						props.navigation.navigate("order", { locationid: item.locationid, scheduleid: item.id })
																					}}>
																						<Text style={style.itemServiceOrderActionHeader}>See the menu</Text>
																					</TouchableOpacity>
																					<TouchableOpacity style={style.itemServiceOrderAction} onPress={() => {
																						props.close()
																						props.navigation.navigate("makereservation", { locationid: item.locationid, scheduleid: item.id })
																					}}>
																						<Text style={style.itemServiceOrderActionHeader}>Reschedule</Text>
																					</TouchableOpacity>
																					<View style={style.itemServiceOrderTouchDisabled} onPress={() => {}}>
																						<Text style={style.itemServiceOrderActionHeader}>
																							Awaits seating{'\n'}
																							<Text>........</Text>
																						</Text>
																					</View>
																				</>
																				:
																				<View style={{ alignItems: 'center' }}>
																					<View style={style.actions}>
																						<TouchableOpacity style={style.action} onPress={() => cancelTheReservationJoining(item.id)}>
																							<Text style={style.actionHeader}>Not Coming</Text>
																						</TouchableOpacity>
																						<TouchableOpacity style={style.action} onPress={() => acceptTheReservationJoining(index)}>
																							<Text style={style.actionHeader}>Accept</Text>
																						</TouchableOpacity>
																					</View>
																				</View>
																		:
																		<View style={style.actions}>
																			<TouchableOpacity style={style.action} onPress={() => cancelTheRequest(item, index)}>
																				<Text style={style.actionHeader}>Cancel</Text>
																			</TouchableOpacity>
																			<TouchableOpacity style={style.action} onPress={() => confirmTheRequest(index)}>
																				<Text style={style.actionHeader}>Confirm</Text>
																			</TouchableOpacity>
																		</View>
																	}
																</View>
															</>
														)}

														{item.action == "confirmed" && (
															<>
																<Text style={style.itemServiceResponseHeader}>
																	{item.locationtype == 'restaurant' ? 
																		(item.booker ? "Your" : "The") + " reservation has been accepted"
																		:
																		"Your requested appointment has been accepted."
																	}
																	{'\n\n'}
																	{item.locationtype == 'restaurant' && "Your table is #" + item.table}
																</Text>

																{item.locationtype == "restaurant" ?
																	item.confirm ? 
																		<View style={{ alignItems: 'center' }}>
																			{item.seated ?
																				<View style={style.itemServiceOrderActions}>
																					<TouchableOpacity style={style.itemServiceOrderAction} onPress={() => {
																						props.close()
																						props.navigation.navigate("order", { locationid: item.locationid, scheduleid: item.id })
																					}}>
																						<Text style={style.itemServiceOrderActionHeader}>See menu</Text>
																					</TouchableOpacity>
																					<TouchableOpacity style={style.itemServiceOrderAction} onPress={() => sendTheDiningPayment(item.id, index)}>
																						<Text style={style.itemServiceOrderActionHeader}>Send payment{item.allowPayment ? " again" : ""}</Text>
																					</TouchableOpacity>
																				</View>
																				:
																				<>
																					<TouchableOpacity style={style.itemServiceOrderAction} onPress={() => {
																						props.close()
																						props.navigation.navigate("order", { locationid: item.locationid, scheduleid: item.id })
																					}}>
																						<Text style={style.itemServiceOrderActionHeader}>See the menu</Text>
																					</TouchableOpacity>
																					<TouchableOpacity style={style.itemServiceOrderAction} onPress={() => {
																						props.close()
																						props.navigation.navigate("makereservation", { locationid: item.locationid, scheduleid: item.id })
																					}}>
																						<Text style={style.itemServiceOrderActionHeader}>Reschedule</Text>
																					</TouchableOpacity>
																					<View style={style.itemServiceOrderTouchDisabled} onPress={() => {}}>
																						<Text style={style.itemServiceOrderActionHeader}>
																							Awaits seating{'\n'}
																							<Text>........</Text>
																						</Text>
																					</View>
																				</>
																			}
																		</View>
																		:
																		item.booker ? 
																			<View style={{ alignItems: 'center' }}>
																				<View style={style.actions}>
																					<TouchableOpacity style={style.action} onPress={() => cancelTheRequest(item, index)}>
																						<Text style={style.actionHeader}>Cancel</Text>
																					</TouchableOpacity>
																					<TouchableOpacity style={style.action} onPress={() => confirmTheRequest(index)}>
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
																					<TouchableOpacity style={style.action} onPress={() => acceptTheReservationJoining(index)}>
																						<Text style={style.actionHeader}>Accept</Text>
																					</TouchableOpacity>
																				</View>
																			</View>
																	:
																	<View style={{ alignItems: 'center' }}>
																		<View style={style.actions}>
																			<TouchableOpacity style={style.action} onPress={() => cancelTheRequest(item, index)}>
																				<Text style={style.actionHeader}>Cancel Service</Text>
																			</TouchableOpacity>
																			<TouchableOpacity style={style.action} onPress={() => allowThePayment(item, index)}>
																				<Text style={style.actionHeader}>Allow Payment{item.allowPayment ? ' Again' : ''}</Text>
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
																		<TouchableOpacity style={style.itemServiceResponseTouch} onPress={() => closeTheRequest(index)}>
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
																			<TouchableOpacity style={style.action} onPress={() => closeTheRequest(index)}>
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
																			<TouchableOpacity style={style.action} onPress={() => confirmTheRequest(index)}>
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
									<Text style={{ fontSize: fsize(0.05) }}>No Notification(s) Yet</Text>
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
				{cancelRequest.show && (
					<Modal transparent={true}>
						<View style={{ paddingTop: offsetPadding }}>
							<View style={style.confirmBox}>
								<View style={style.confirmContainer}>
									<Text style={style.confirmHeader}>
										<Text style={{ fontFamily: 'Arial'}}>
											Are you sure you want to cancel the 

											{cancelRequest.type != 'restaurant' ? ' service appointment of' : ' reservation'}
										</Text>
										{cancelRequest.service ? '\n\n' + cancelRequest.service + '\n' : '\n\n'}
										{'\nat ' + cancelRequest.location + '\n'}
										{displayTime(cancelRequest.time)}
									</Text>

									<View style={style.confirmOptions}>
										<TouchableOpacity style={style.confirmOption} onPress={() => setCancelrequest({ show: false, service: "", time: 0, index: -1 })}>
											<Text style={style.confirmOptionHeader}>No</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.confirmOption} onPress={() => cancelTheRequest()}>
											<Text style={style.confirmOptionHeader}>Yes</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}
				{showDiningPaymentRequired && (
					<Modal transparent={true}>
						<View style={{ paddingVertical: offsetPadding }}>
							<View style={style.popBox}>
								<View style={style.popContainer}>
									<Text style={style.popHeader}>
										You need to provide a payment method to accept
										a reservation
									</Text>

									<View style={style.popActions}>
										<TouchableOpacity style={style.popAction} onPress={() => setShowdiningpaymentrequired(false)}>
											<Text style={style.popActionHeader}>Close</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.popAction} onPress={() => {
											props.close()
											props.navigation.navigate("account", { required: "card" })
										}}>
											<Text style={style.popActionHeader}>Ok</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}
				{showServicePaymentRequired && (
					<Modal transparent={true}>
						<View style={{ paddingVertical: offsetPadding }}>
							<View style={style.popBox}>
								<View style={style.popContainer}>
									<Text style={style.popHeader}>
										You need to provide a payment method to continue
									</Text>

									<View style={style.popActions}>
										<TouchableOpacity style={style.popAction} onPress={() => setShowservicepaymentrequired(false)}>
											<Text style={style.popActionHeader}>Close</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.popAction} onPress={() => {
											props.close()
											props.navigation.navigate("account", { required: "card" })
										}}>
											<Text style={style.popActionHeader}>Ok</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</Modal>
				)}
				{showChargeuser.show && (
					<Modal transparent={true}>
						<View style={{ paddingVertical: offsetPadding }}>
							<View style={style.popBox}>
								{showChargeuser.trialstatus.days > 0 ? 
									<View style={style.popBox}>
										<View style={style.popContainer}>
											<Text style={style.popHeader}>Appointment Confirmed</Text>

											<View style={style.popActions}>
												<TouchableOpacity style={style.popAction} onPress={() => {
													if (showChargeuser.type == "restaurant") {
														acceptTheReservationJoining()
													} else {
														setShowchargeuser({ ...showChargeuser, show: false })
													}
												}}>
													<Text style={style.popActionHeader}>Ok</Text>
												</TouchableOpacity>
											</View>
										</View>
									</View>
									:
									<View style={style.popContainer}>
										<Text style={style.popHeader}>
											Trial over
											{'\n'}
											A charge of $ 0.50 will be applied
											to your credit card to proceed with
											confirmation
										</Text>

										<Text style={{ fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
											App fee: ${showChargeuser.cost}
											{'\n'}E-pay fee: ${showChargeuser.fee}
											{'\n'}PST: ${showChargeuser.pst}
											{'\n'}HST: ${showChargeuser.hst}
											{'\n'}Total: ${showChargeuser.total}
										</Text>

										<View style={style.popActions}>
											<TouchableOpacity style={style.popAction} onPress={() => setShowchargeuser({ ...showChargeuser, show: false, showworkers: false, trialstatus: { days: 30, status: "" }})}>
												<Text style={style.popActionHeader}>Close</Text>
											</TouchableOpacity>
											<TouchableOpacity style={style.popAction} onPress={() => {
												if (showChargeuser.type == "salon") {
													confirmTheRequest()
												} else {
													acceptTheReservationJoining()
												}
											}}>
												<Text style={style.popActionHeader}>Ok</Text>
											</TouchableOpacity>
										</View>
									</View>
								}
							</View>
						</View>
					</Modal>
				)}
				{showPaymentdetail.show && (
					<Modal transparent={true}>
						<View style={{ paddingVertical: offsetPadding }}>
							<View style={style.popBox}>
								<View style={style.popContainer}>
									<Text style={style.popHeader}>Payment detail</Text>

									<Text style={{ fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
										Amount: ${showPaymentdetail.amount}
										{'\n'}E-pay fee: ${showPaymentdetail.fee}
										{'\n'}PST: ${showPaymentdetail.pst}
										{'\n'}HST: ${showPaymentdetail.hst}
										{'\n'}Total: ${showPaymentdetail.total}
									</Text>

									<View style={style.popActions}>
										<TouchableOpacity style={style.popAction} onPress={() => setShowpaymentdetail({ ...showPaymentdetail, show: false })}>
											<Text style={style.popActionHeader}>Close</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.popAction} onPress={() => sendTheDiningPayment()}>
											<Text style={style.popActionHeader}>Ok</Text>
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
							{showOwners.showworkers ? 
								<View style={style.payworkerBox}>
									<View style={style.payworkerContainer}>
										<TextInput style={style.payworkerSearchInput} placeholder="Search worker" placeholderTextColor="rgba(0, 0, 0, 0.5)" onChangeText={username => searchTheWorkers(username)}/>

										<Text style={style.payworkerWorkersListHeader}>Select worker to send payment</Text>

										<View style={style.payworkerWorkersList}>
											<FlatList
												data={showOwners.owners}
												renderItem={({ item, index }) => 
													<View key={item.key} style={style.payworkerWorkersRow}>
														{item.row.map(info => (
															info.username ? 
																<TouchableOpacity key={info.key} style={!info.selected ? style.payworkerWorker : style.payworkerWorkerDisabled} onPress={() => selectWorker(info.id)}>
																	<View style={style.payworkerWorkerProfile}>
																		<Image source={{ uri: logo_url + info.profile }} style={{ height: workerImage, width: workerImage }}/>
																	</View>
																	<Text style={style.payworkerWorkerHeader}>{info.username}</Text>
																</TouchableOpacity>
																:
																<View key={info.key} style={style.payworkerWorkerEmpty}>
																</View>
														))}
													</View>
												}
											/>
										</View>

										<View style={style.payworkerActions}>
											<TouchableOpacity style={style.payworkerAction} onPress={() => setShowowners({ ...showOwners, show: false, owners: [], trialstatus: { days: 30, status: "" } })}>
												<Text style={style.payworkerActionHeader}>Close</Text>
											</TouchableOpacity>
											<TouchableOpacity style={showOwners.workerid > 0 ? style.payworkerAction : style.payworkerActionDisabled} disabled={showOwners.workerid == 0} onPress={() => setShowowners({ ...showOwners, showworkers: false })}>
												<Text style={style.payworkerActionHeader}>Send</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
								:
								<View style={style.popBox}>
									<View style={style.popContainer}>
										<Text style={style.popHeader}>Payment Detail</Text>

										<Text style={{ fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
											Service cost: ${showOwners.cost}
											{'\n'}E-pay fee: ${showOwners.fee}
											{'\n'}PST: ${showOwners.pst}
											{'\n'}HST: ${showOwners.hst}
											{'\n'}Total: ${showOwners.total}
										</Text>

										<View style={style.popActions}>
											<TouchableOpacity style={style.popAction} onPress={() => setShowowners({ ...showOwners, show: false, trialstatus: { days: 30, status: "" } })}>
												<Text style={style.popActionHeader}>Close</Text>
											</TouchableOpacity>
											<TouchableOpacity style={style.popAction} onPress={() => allowThePayment()}>
												<Text style={style.popActionHeader}>Ok</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							}
						</View>
					</Modal>
				)}
			</View>

			{showDisabledScreen && (
				<Modal transparent={true}>
					<View style={style.disabled}>
						<View style={style.disabledContainer}>
							<Text style={style.disabledHeader}>
								There is an update to the app{'\n\n'}
								Please wait a moment{'\n\n'}
								or tap 'Close'
							</Text>

							<TouchableOpacity style={style.disabledClose} onPress={() => socket.emit("socket/user/login", userId, () => setShowdisabledscreen(false))}>
								<Text style={style.disabledCloseHeader}>Close</Text>
							</TouchableOpacity>

							<ActivityIndicator size="large"/>
						</View>
					</View>
				</Modal>
			)}
		</View>
	);
}

const style = StyleSheet.create({
	notifications: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', height: screenHeight, width: '100%' },
	close: { marginTop: 20, marginHorizontal: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: fsize(0.07), fontWeight: 'bold', marginTop: 10, textAlign: 'center' },

	refresh: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5 },
	refreshHeader: { fontSize: fsize(0.04) },

	body: { flexDirection: 'column', height: screenHeight - 114, justifyContent: 'space-around' },
	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, padding: 10 },
	itemImageHolders: { width: 100 },
	itemLocationImageHolder: { borderRadius: 50, height: 80, overflow: 'hidden', width: 80 },
	itemServiceImageHolder: { borderRadius: 50, height: 100, overflow: 'hidden', width: 100 },

	// service
	itemServiceHeader: { fontWeight: 'bold', margin: 10, textAlign: 'center' },
	itemServiceResponseHeader: { fontWeight: 'bold', margin: 10 },
	itemServiceResponseTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 60 },
	itemServiceResponseTouchHeader: { fontWeight: 'bold', textAlign: 'center' },
	itemServiceOrderActions: { flexDirection: 'row', justifyContent: 'space-between' },
	itemServiceOrderAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5, width: fsize(0.3) },
	itemServiceOrderTouchDisabled: { backgroundColor: 'grey', borderColor: 'grey', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5, width: fsize(0.3) },
	itemServiceOrderActionHeader: { fontSize: fsize(0.035), textAlign: 'center' },
	storeRequested: { backgroundColor: 'rgba(127, 127, 127, 0.3)', borderRadius: 3, padding: 5 },
	itemServiceNewTimeHeader: {  },
	itemServiceNewTimeActions: { flexDirection: 'row' },
	itemServiceNewTimeAction: { borderRadius: 5, margin: 10 },
	itemServiceNewTimeActionHeader: { },

	// order
	itemInfos: {  },
	itemName: { fontSize: fsize(0.05), marginBottom: 10 },
	itemInfo: { fontSize: fsize(0.04) },
	itemInfoHeader: { fontSize: fsize(0.04) },
	adderInfo: { alignItems: 'center' },
	adderInfoProfile: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 20, height: 40, overflow: 'hidden', width: 40 },
	adderInfoHeader: { padding: 10 },
	itemOrderNumber: { fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' },
	itemHeader: { fontSize: fsize(0.04), fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
	actions: { flexDirection: 'row', justifyContent: 'space-around' },
	action: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 5, padding: 5, width: 75 },
	actionHeader: { fontSize: fsize(0.03), textAlign: 'center' },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmOptions: { flexDirection: 'row', justifyContent: 'space-around' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmOptionHeader: { },

	popBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	popContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	popHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	popActions: { flexDirection: 'row', justifyContent: 'space-around' },
	popAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	popActionHeader: { },

	payworkerBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	payworkerContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '80%' },
	payworkerSearchInput: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, height: 40, paddingHorizontal: 10, width: '90%' },
	payworkerWorkersList: { height: '70%' },
	payworkerWorkersListHeader: { fontWeight: 'bold', textAlign: 'center' },
	payworkerWorkersRow: { flexDirection: 'row', justifyContent: 'space-between' },
	payworkerWorker: { alignItems: 'center', marginHorizontal: 5, padding: 5 },
	payworkerWorkerDisabled: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 5, marginHorizontal: 5, padding: 5, width: workerImage },
	payworkerWorkerEmpty: { alignItems: 'center', borderRadius: 5, marginHorizontal: 5, padding: 5, width: workerImage },
	payworkerWorkerProfile: { borderRadius: (workerImage - 10) / 2, height: (workerImage - 10), overflow: 'hidden', width: (workerImage - 10) },
	payworkerWorkerHeader: {  },
	payworkerActions: { flexDirection: 'row', justifyContent: 'space-around' },
	payworkerAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	payworkerActionDisabled: { alignItems: 'center', backgroundColor: 'grey', borderColor: 'grey', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	payworkerActionHeader: { },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
	disabledContainer: { alignItems: 'center', width: '100%' },
	disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
	disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },
	disabledCloseHeader: {  }
})
