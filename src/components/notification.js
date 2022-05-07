import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, Platform, ActivityIndicator, Dimensions, View, FlatList, Text, 
  TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { socket, url, logo_url } from '../../assets/info'
import { displayTime, resizePhoto } from 'geottuse-tools'
import { getNotifications } from '../apis/users'
import { getWorkers, searchWorkers } from '../apis/owners'
import { cancelCartOrder, confirmCartOrder } from '../apis/products'
import { acceptRequest, closeSchedule, cancelRequest } from '../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Notification(props) {
  const [userId, setUserid] = useState(null)
	const [items, setItems] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [numUnreaded, setNumunreaded] = useState(0)
	const [confirm, setConfirm] = useState({ show: false, type: "", index: 0, name: "", price: "", quantity: 0 })
	const [cancelSchedule, setCancelschedule] = useState({ show: false, id: -1, location: "", type: "", service: "", time: 0, index: -1, loading: false })
	const [showDisabledScreen, setShowdisabledscreen] = useState(false)

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
          const { errormsg, status } = err.response.data
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
					socket.emit("socket/confirmCartOrder", data, () => {
            setConfirm({ ...confirm, show: true, type: "cart", index, name, quantity, price })

            setTimeout(function () {
              setConfirm({ ...confirm, show: false })
            }, 3000)
          })
				}
			})
	}
	const closeTheSchedule = index => {
		const { id } = items[index]
		let data = { scheduleid: id, type: "closeSchedule" }

		closeSchedule(id)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					data = { ...data, receiver: res.receiver }
					socket.emit("socket/closeSchedule", data, () => {
						const newItems = [...items]

						newItems.splice(index, 1)

						setItems(newItems)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
				}
			})
	}
	const cancelTheRequest = async(info, index) => {
		if (!cancelSchedule.show) {
			const { id, location, locationtype, service, time } = info

			setCancelschedule({ show: true, id, location, type: locationtype, service, time, index })
		} else {
			const { id, index } = cancelSchedule
			let data = { userid: userId, scheduleid: id, type: "cancelRequest" }

      setCancelschedule({ ...cancelSchedule, loading: true })

			cancelRequest(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						data = { ...data, receivers: res.receivers, locationType: res.type }
						socket.emit("socket/cancelRequest", data, () => {
							const newItems = [...items]

							newItems.splice(index, 1)

							setItems(newItems)

							setCancelschedule({ ...cancelSchedule, show: false, loading: false })
						})
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data
					}
				})
		}
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
          const { errormsg, status } = err.response.data
				}
			})
	}

	// websockets
	const startWebsocket = async() => {
		socket.on("updateNotifications", data => {
			if (data.type == "cancelAppointment") {
        const newItems = [...items]

        newItems.forEach(function (item, index) {
          if (item.id == data.id) {
            newItems.splice(index, 1)
          }
        })

				setItems(newItems)
			} else if (data.type == "closeSchedule") {
        const newItems = [...items]

        newItems.forEach(function (item, index) {
          if (item.id == data.scheduleid) {
            newItems.splice(index, 1)
          }
        })

				setItems(newItems)
			} else if (data.type == "rescheduleAppointment") {
        const newItems = [...items]
				const { appointmentid, time, worker } = data

        newItems.forEach(function (item) {
          if (item.id == appointmentid) {
            item.action = "rebook"
            item.nextTime = parseInt(time)
            item.worker = worker
          }
        })

				setItems(newItems)
			} else if (data.type == "doneService") {
        const newItems = [...items]

        newItems.forEach(function (item, index) {
          if (item.id == data.id) {
            newItems.splice(index, 1)
          }
        })

				setItems(newItems)
			} else if (data.type == "cancelSchedule") {
        const newItems = [...items]

        newItems.forEach(function (item) {
          if (item.id == data.scheduleid) {
            item.action = "cancel"

            if (data.reason) {
              item.reason = data.reason
            }
          }
        })

				setItems(newItems)
			} else if (data.type == "orderReady") {
        const newItems = [...items]
				const { ordernumber } = data

        newItems.forEach(function (item) {
          if (item.orderNumber == ordernumber) {
            item.status = "ready"
          }
        })

				setItems(newItems)
			} else if (data.type == "orderDone") {
        const newItems = [...items]
        const numItems = newItems.length

        for (let k = 0; k < numItems; k++) {
          newItems.forEach(function (item, index) {
            if (item.orderNumber == data.ordernumber) {
              newItems.splice(index, 1)
            }
          })
        }

        setItems(newItems)
			} else if (data.type == "setWaitTime") {
        const newItems = [...items]

        newItems.forEach(function (item) {
          if (item.orderNumber == data.ordernumber) {
            item.status = 'inprogress'
            item.waitTime = data.waitTime
          }
        })

        setItems(newItems)
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
		startWebsocket()

		if (Constants.isDevice) {
			Notifications.addNotificationResponseReceivedListener(res => {
				const { data } = res.notification.request.content

				if (data.type == "cancelAppointment") {
          const newItems = [...items]

          newItems.forEach(function (item, index) {
            if (item.id == data.id) {
              newItems.splice(index, 1)
            }
          })

          setItems(newItems)
        } else if (data.type == "closeSchedule") {
          const newItems = [...items]

          newItems.forEach(function (item, index) {
            if (item.id == data.scheduleid) {
              newItems.splice(index, 1)
            }
          })

          setItems(newItems)
        } else if (data.type == "rescheduleAppointment") {
          const newItems = [...items]
					const { appointmentid, time } = data

          newItems.forEach(function (item) {
            if (item.id == appointmentid) {
              item.action = "rebook"
              item.nextTime = parseInt(time)
            }
          })

					setItems(newItems)
				} else if (data.type == "doneService") {
          const newItems = [...items]

          newItems.forEach(function (item, index) {
            if (item.id == data.scheduleid) {
              newItems.splice(index, 1)
            }
          })

					setItems(newItems)
				} else if (data.type == "cancelSchedule") {
          const newItems = [...items]
					const { id, reason } = data

          newItems.forEach(function (item) {
            if (item.id == id) {
              item.action = "cancel"

              if (reason) {
                item.reason = reason
              }
            }
          })

					setItems(newItems)
				} else if (data.type == "orderReady") {
          const newItems = [...items]

          newItems.forEach(function (item) {
            if (item.orderNumber == data.ordernumber) {
              item.status = "ready"
            }
          })

					setItems(newItems)
				} else if (data.type == "orderDone") {
          const newItems = [...items]
          const numItems = newItems.length

          for (let k = 0; k < numItems; k++) {
            newItems.forEach(function (item, index) {
              if (item.orderNumber == data.ordernumber) {
                newItems.splice(index, 1)
              }
            })
          }

          setItems(newItems)
        } else if (data.type == "setWaitTime") {
          const newItems = [...items]

          newItems.forEach(function (item) {
            if (item.orderNumber == data.ordernumber) {
              item.status = 'inprogress'
              item.waitTime = data.waitTime
            }
          })

          setItems(newItems)
        }
			});
		}

		return () => {
			socket.off("updateNotifications")
		}
	}, [items.length])

	return (
		<SafeAreaView style={styles.notifications}>
			{loaded ? 
				<View style={styles.box}>
					<View style={{ alignItems: 'center', height: '20%', width: '100%' }}>
						<View style={{ alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' }}>
							<TouchableOpacity style={styles.close} onPress={() => props.close()}>
								<AntDesign name="closecircleo" size={wsize(7)}/>
							</TouchableOpacity>

							<Text style={styles.boxHeader}>{items.length} Notification(s)</Text>

							<TouchableOpacity style={styles.refresh} onPress={() => getTheNotifications()}>
								<Text style={styles.refreshHeader}>Refresh {numUnreaded > 0 ? <Text style={{ fontWeight: 'bold' }}>({numUnreaded})</Text> : null}</Text>
							</TouchableOpacity>
						</View>
					</View>
					
					<View style={styles.body}>
						{items.length > 0 ?
							<FlatList
                style={{ height: '80%', width: '100%' }}
								showsVerticalScrollIndicator={false}
								data={items}
								renderItem={({ item, index }) => 
									<View style={styles.item} key={item.key}>
										{item.type == "cart-order-self" && (
											<>
												<Text style={styles.itemOrderNumber}>Your order#: {item.orderNumber}</Text>

												<Text style={styles.itemHeader}>
                          {item.status == 'checkout' ? 
                            item.locationType == "restaurant" ? 
                              'The restaurant will respond\nyou with wait time'
                              :
                              ''
                            :
                            'The order will be ready for pickup in ' + item.waitTime + ' minutes'
                          }
                        </Text>

                        <View style={{ alignItems: 'center' }}>
                          <TouchableOpacity style={styles.action} onPress={() => {
                            props.close()

                            props.navigation.navigate("seeorders", { ordernumber: item.orderNumber })
                          }}>
                            <Text style={styles.actionHeader}>See order ({item.numOrders})</Text>
                          </TouchableOpacity>
                        </View>
											</>
										)}
										{item.type == "service" && (
											<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
												<View style={styles.itemImageHolders}>
													<View style={styles.itemLocationImageHolder}>
														<Image source={{ uri: logo_url + item.locationimage.name }} style={{ height: '100%', width: '100%' }}/>
													</View>
													{item.serviceimage.name != '' ? 
														<View style={styles.itemServiceImageHolder}>
															<Image source={{ uri: logo_url + item.serviceimage.name }} style={{ height: '100%', width: '100%' }}/>
														</View>
													: null }
												</View>
												<View style={{ flexDirection: 'column', width: wsize(70) }}>
													<Text style={styles.itemServiceHeader}>
                            Appointment booking 
                            {'\n\nfor ' + item.service}
                            {'\nat ' + item.location}
                            {'\n' + displayTime(item.time)}
                            {'\n' + (item.worker != null && '\nwith stylist: ' + item.worker.username)}
                          </Text>

													{(item.action == "requested" || item.action == "change") && 
														<Text style={styles.itemHeader}>waiting for the restaurant's response</Text>
													}

													{item.action == "confirmed" && (
														<View style={{ alignItems: 'center' }}>
                              {item.serviceid ? 
                                <View style={{ alignItems: 'center' }}>
                                  <TouchableOpacity style={styles.action} onPress={() => cancelTheRequest(item, index)}>
                                    <Text style={styles.actionHeader}>Cancel</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity style={styles.action} onPress={() => {
                                    props.close()
                                    props.navigation.navigate("booktime", { locationid: item.locationid, serviceid: item.serviceid, scheduleid: item.id })
                                  }}>
                                    <Text style={styles.actionHeader}>Rebook</Text>
                                  </TouchableOpacity>
                                </View>
                                :
                                <View style={{ alignItems: 'center' }}>
                                  <View style={{ alignItems: 'center' }}>
                                    <TouchableOpacity style={styles.action} onPress={() => cancelTheRequest(item, index)}>
                                      <Text style={styles.actionHeader}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.action} onPress={() => {
                                      props.close()
                                      props.navigation.navigate("booktime", { locationid: item.locationid, serviceid: item.serviceid, scheduleid: item.id, serviceinfo: item.service })
                                    }}>
                                      <Text style={styles.actionHeader}>Rebook</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              }
                            </View>
													)}

													{(item.action == "cancel" || item.action == "rebook") && 
														<View style={styles.storeRequested}>
															<Text style={styles.itemServiceHeader}>
																{item.action == "cancel" ? "Appointment cancelled" : "Time taken"}
                                {'\n'}
                                {item.reason && <Text>Reason: <Text style={{ fontWeight: '500' }}>{item.reason}</Text></Text>}
															</Text>
															{item.action == "cancel" && (
																<View style={{ alignItems: 'center' }}>
																	<TouchableOpacity style={styles.action} onPress={() => closeTheSchedule(index)}>
																		<Text style={styles.actionHeader}>Cancel</Text>
																	</TouchableOpacity>
                                  <TouchableOpacity style={styles.action} onPress={() => {
                                    props.close()
                                    props.navigation.navigate("booktime", { locationid: item.locationid, scheduleid: item.id, serviceid: item.serviceid, serviceinfo: item.service })
                                  }}>
                                    <Text style={styles.actionHeader}>Rebook</Text>
                                  </TouchableOpacity>
																</View>
															)}
															{(item.action == "rebook" && item.nextTime > 0) && (
																<>
																	<Text style={styles.itemHeader}>
																		<Text>New requested time</Text>
																		{'\n'}
																		<Text style={styles.itemServiceHeader}>{displayTime(item.nextTime)}</Text>
																	</Text>
																	<View style={{ alignItems: 'center' }}>
																    <TouchableOpacity style={styles.action} onPress={() => cancelTheRequest(item, index)}>
                                      <Text style={styles.actionHeader}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.action} onPress={() => {
                                      props.close()
                                      props.navigation.navigate("booktime", { locationid: item.locationid, scheduleid: item.id, serviceid: item.serviceid, serviceinfo: item.service })
                                    }}>
                                      <Text style={styles.actionHeader}>Rebook</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.action} onPress={() => confirmTheRequest(index)}>
                                      <Text style={styles.actionHeader}>Yes</Text>
                                    </TouchableOpacity>
																	</View>
																</>
															)}
														</View>
													}
												</View>
											</View>
										)}
									</View>
								}
							/>
							:
							<View style={styles.noResult}>
								<Text style={styles.noResultHeader}>No Notification(s) Yet</Text>
							</View>
						}
					</View>
				</View>
				:
				<View style={styles.loading}>
					<ActivityIndicator color="black" size="large"/>
				</View>
			}

			{confirm.show && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.hiddenBox}>
						<View style={styles.confirmBox}>
							<View style={styles.confirmContainer}>
								<Text style={styles.confirmHeader}>
									Confirmed Cart Order: 
									{'\n\n Quantity: ' + confirm.quantity + '\n\n'}
                  {confirm.name + '\n\n'}
								</Text>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{cancelSchedule.show && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.hiddenBox}>
						<View style={styles.confirmBox}>
							<View style={styles.confirmContainer}>
								<Text style={styles.confirmHeader}>
									<Text style={{ fontWeight: 'bold' }}>Cancel Appointment</Text>
									{cancelSchedule.service ? '\n\nfor ' + cancelSchedule.service : '\n'}
									{'\nat ' + cancelSchedule.location + '\n'}
									{displayTime(cancelSchedule.time)}
								</Text>

								<View style={styles.confirmOptions}>
									<TouchableOpacity style={[styles.confirmOption, { opacity: cancelSchedule.loading ? 0.5 : 1 }]} disabled={cancelSchedule.loading} onPress={() => setCancelschedule({ show: false, service: "", time: 0, index: -1 })}>
										<Text style={styles.confirmOptionHeader}>No</Text>
									</TouchableOpacity>
									<TouchableOpacity style={[styles.confirmOption, { opacity: cancelSchedule.loading ? 0.5 : 1 }]} disabled={cancelSchedule.loading} onPress={() => cancelTheRequest()}>
										<Text style={styles.confirmOptionHeader}>Yes</Text>
									</TouchableOpacity>
								</View>

                {cancelSchedule.loading && (
                  <View style={{ alignItems: 'center' }}>
                    <ActivityIndicator color="black" size="small"/>
                  </View>
                )}
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{showDisabledScreen && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.disabled}>
						<View style={styles.disabledContainer}>
							<Text style={styles.disabledHeader}>
								There is an update to the app{'\n\n'}
								Please wait a moment{'\n\n'}
								or tap 'Close'
							</Text>

							<TouchableOpacity style={styles.disabledClose} onPress={() => socket.emit("socket/user/login", userId, () => setShowdisabledscreen(false))}>
								<Text style={styles.disabledCloseHeader}>Close</Text>
							</TouchableOpacity>

							<ActivityIndicator size="large"/>
						</View>
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	notifications: { backgroundColor: '#EAEAEA', height: '100%', paddingTop: Platform.OS == "ios" ? 0 : Constants.statusBarHeight, width: '100%' },
	box: { height: '100%', width: '100%' },
	close: { marginTop: 20, marginHorizontal: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: wsize(7), fontWeight: 'bold', marginTop: 10, textAlign: 'center' },

	refresh: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	refreshHeader: { fontSize: wsize(4), textAlign: 'center' },

	body: { flexDirection: 'column', height: '80%', justifyContent: 'space-around' },
	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, paddingHorizontal: 10, paddingVertical: 30 },
	itemImageHolders: { alignItems: 'center', width: wsize(30) },
  itemLocationImageHolder: { borderRadius: (wsize(30) - 5) / 2, height: wsize(30) - 5, overflow: 'hidden', width: wsize(30) - 5 },
	itemServiceImageHolder: { borderRadius: (wsize(30) - 10) / 2, height: wsize(30) - 10, overflow: 'hidden', width: wsize(30) - 10 },

	// service
	itemServiceHeader: { fontSize: wsize(5), fontWeight: 'bold', margin: 10, textAlign: 'center' },
	storeRequested: { backgroundColor: 'rgba(127, 127, 127, 0.3)', borderRadius: 3, padding: 5 },

	// order
	itemOrderNumber: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
	itemHeader: { fontSize: wsize(5), textAlign: 'center' },
	
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
	action: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 5, padding: 5, width: wsize(40) },
	actionHeader: { fontSize: wsize(5), textAlign: 'center' },

  noResult: { flexDirection: 'column', height: '100%', justifyContent: 'space-around' },
  noResultHeader: { fontSize: wsize(4), textAlign: 'center' },

	// confirm & requested box
  hiddenBox: {  },

	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontSize: wsize(6), paddingHorizontal: 20, textAlign: 'center' },
	confirmOptions: { flexDirection: 'row', justifyContent: 'space-around' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	confirmOptionHeader: { fontSize: wsize(4) },

	popBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	popContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	popHeader: { fontFamily: 'appFont', fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
  popInput: { borderColor: 'lightblue', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 10, width: '80%' },
	list: { flexDirection: 'row', justifyContent: 'space-around' },
  touch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, padding: 5 },
  touchHeader: { fontSize: wsize(7), textAlign: 'center' },
  popActions: { flexDirection: 'row', justifyContent: 'space-around' },
	popAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(20) },
	popActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
	disabledContainer: { alignItems: 'center', width: '100%' },
	disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
	disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },

  loading: { flexDirection: 'column', height: '100%', justifyContent: 'space-around' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
