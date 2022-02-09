import React, { useState, useEffect, useRef } from 'react';
import { 
  SafeAreaView, ActivityIndicator, Dimensions, View, FlatList, Text, 
  TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { socket, url, logo_url, displayTime, stripeFee } from '../../assets/info'
import { getNotifications, getTrialInfo } from '../apis/users'
import { getWorkers, searchWorkers } from '../apis/owners'
import { cancelCartOrder, confirmCartOrder } from '../apis/products'
import { acceptRequest, closeSchedule, confirmRequest, cancelReservationJoining, acceptReservationJoining, cancelRequest, allowPayment, sendDiningPayment, sendServicePayment, cancelDiningOrder, confirmDiningOrder } from '../apis/schedules'

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
	const [closeServiceRequest, setCloseservicerequest] = useState({ show: false, id: -1, location: "", service: "", time: 0, index: -1 })
	const [cancelSchedule, setCancelschedule] = useState({ show: false, id: -1, location: "", type: "", service: "", time: 0, index: -1 })
	const [showDiningPaymentRequired, setShowdiningpaymentrequired] = useState(false)
	const [showServicePaymentRequired, setShowservicepaymentrequired] = useState(false)
	const [showChargeuser, setShowchargeuser] = useState({ show: false, trialstatus: { days: 30, status: "" }, locationid: 0, scheduleid: 0, index: -1, cost: 0.00, pst: 0.00, hst: 0.00, fee: 0.00, total: 0.00, loading: false })
	const [showPaymentdetail, setShowpaymentdetail] = useState({ show: false, type: '', service: "", workerInfo: {}, showTip: false, confirm: false, scheduleid: 0, index: 0, cost: 0.00, tip: 0.00, pst: 0.00, hst: 0.00, fee: 0.00, total: 0.00, loading: false })
	const [showOwners, setShowowners] = useState({ show: false, showworkers: false, showTip: false, scheduleid: 0, index: -1, owners: [], workerid: 0, cost: 0.00, tip: 0.00, pst: 0.00, hst: 0.00, fee: 0.00, total: 0.00, loading: false })
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

				} else {
					alert("an error has occurred in server")
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

				} else {
					alert("an error has occurred in server")
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
					socket.emit("socket/confirmDiningOrder", data, () => {
            setConfirm({ ...confirm, show: true, type: "dining", index, name, quantity, price })

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

				} else {
					alert("an error has occurred in server")
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

				} else {
					alert("an error has occurred in server")
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
						data = { ...data, receivers: res.receivers }
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

					} else {
						alert("an error has occurred in server")
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

      setShowchargeuser({ ...showChargeuser, loading: true })

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
              newItems[index].time = parseInt(res.time)
							newItems[index].nextTime = 0
							newItems[index].confirm = true
							newItems[index].chargedUser = true

							setItems(newItems)
              setShowchargeuser({ ...showChargeuser, loading: false })
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
					} else {
						alert("an error has occurred in server")
					}
				})
		}
	}
	const cancelTheReservationJoining = async(scheduleid) => {
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
	const acceptTheReservationJoining = async(index) => {
		let locationid, scheduleid

		const newItems = [...items]
		const item = index != null ? newItems[index] : newItems[showChargeuser.index]

		locationid = item.locationid
		scheduleid = item.id

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
            setShowchargeuser({ ...showChargeuser, type: 'restaurant', show: true })

            const newItems = [...items]

            newItems.forEach(function (item) {
              if (item.id == scheduleid) {
                item.confirm = true
              }
            })

            setItems(newItems)

            setTimeout(function () {
              setShowchargeuser({ ...showChargeuser, show: false })
            }, 2000)
          })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          
        } else {
          alert("an error has occurred in server")
        }
      })
	}
	const allowThePayment = async(info, index) => {
		if (!showOwners.show) {
			const { id, locationid, serviceprice } = items[index]
			const scheduleid = id

			let date = new Date()
			let currDate = date.getDate()
			let day = date.getDay()
			let month = date.getMonth() + 1
			let year = date.getFullYear()

			let hour = date.getHours()
			let minute = date.getMinutes()
			let second = date.getSeconds()
			let dateStr = "", timeStr = ""

			currDate = currDate < 10 ? '0' + currDate : currDate
			month = month < 10 ? '0' + month : month

			hour = hour < 10 ? '0' + hour : hour
			minute = minute < 10 ? '0' + minute : minute
			second = second < 10 ? '0' + second : second

			dateStr = currDate + "." + month + "." + year + " "
			timeStr = hour + ":" + minute + ":" + second

			const data = { locationid, dateStr, timeStr, day }

      setShowowners({ ...showOwners, loading: true })

			getWorkers(data)
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
							fee: fee.toFixed(2), total: total.toFixed(2), loading: false
						})
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {

					} else {
						alert("an error has occurred in server")
					}
				})
		} else {
			const { scheduleid, index, workerid, tip } = showOwners
			let data = { scheduleid, workerid, tip, type: "allowPayment", receiver: "owner" + workerid }

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

					} else {
						alert("an error has occurred in server")
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

				} else {
					alert("an error has occurred in server")
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
		let data = { scheduleid, userid }
		let getinfo = false // show payment details

		if (!showPaymentdetail.show) { // get payment details first
			getinfo = true
			data = { ...data, getinfo }
		} else {
			const { scheduleid, tip } = showPaymentdetail
			data = { ...data, scheduleid, tip: tip ? tip : 0 }
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
						const cost = res.cost
						const pst = cost * 0.08
						const hst = cost * 0.05
						const total = stripeFee(cost + pst + hst)
						const nofee = cost + pst + hst
						const fee = total - nofee

						setShowpaymentdetail({ 
							show: true, type: 'dine', scheduleid, index, 
							cost: cost.toFixed(2), pst: pst.toFixed(2), 
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
				if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data

          switch (status) {
            case "cardrequired":
              setShowdiningpaymentrequired(true)

              break;
            default:
          }
				} else {

        }
			})
	}
	const sendTheServicePayment = async(scheduleid, index) => {
		if (!showPaymentdetail.show) {
			const { service, workerInfo } = items[index]
			const cost = parseFloat(workerInfo["requestprice"])
			const pst = cost * 0.08
			const hst = cost * 0.05
			const total = stripeFee(cost + pst + hst)
			const nofee = cost + pst + hst
			const fee = total - nofee

			setShowpaymentdetail({
				...showPaymentdetail, show: true, type: 'service', service, workerInfo, scheduleid, index, 
				cost: cost.toFixed(2), pst: pst.toFixed(2), 
				hst: hst.toFixed(2), fee: fee.toFixed(2), 
				total: total.toFixed(2)
			})
		} else if (!showPaymentdetail.confirm) {
			const newItems = [...items]
			const { service, workerInfo, scheduleid, index } = showPaymentdetail
			const data = { scheduleid, userid, service, workerInfo }

      setShowpaymentdetail({ ...showPaymentdetail, loading: true })

			sendServicePayment(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						data["receiver"] = "owner" + workerInfo.id
						data["type"] = "confirmPayment"
						data["price"] = parseFloat(workerInfo["requestprice"])
            data["tip"] = parseFloat(workerInfo["tip"])

						socket.emit("socket/confirmPayment", data, () => {
              setShowpaymentdetail({ ...showPaymentdetail, confirm: true, loading: false })

              setTimeout(function () {
                const { workerInfo, scheduleid, index } = showPaymentdetail

                newItems.splice(index, 1)

                setItems(newItems)
                setShowpaymentdetail({ ...showPaymentdetail, show: false, confirm: false })
              }, 3000)
            })
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data

						switch (status) {
							case "cardrequired":
								setShowpaymentdetail({ ...showPaymentdetail, show: false })
								setShowservicepaymentrequired(true)

								break;
							default:

						}
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

				} else {
					alert("an error has occurred in server")
				}
			})
	}

	// websockets
	const startWebsocket = async() => {
		socket.on("updateNotifications", data => {
			if (data.type == "acceptRequest") {
        const newItems = [...items]
				const { tablenum, receivers, worker } = data

        newItems.forEach(function (item) {
          if (item.id == data.scheduleid) {
            if (data.ownerid) {
              if (receivers.booker[0].replace("user", "") == userId) {
                item.action = "accepted"
                item.table = tablenum
                item.confirm = true
                item.worker = worker
              } else {
                item.action = "accepted"
                item.table = tablenum
                item.worker = worker
              }
            } else {
              item.action = "accepted"
              item.table = tablenum
            }
          }
        })

        setItems(newItems)
			} else if (data.type == "cancelReservation") {
        const newItems = [...items]

        newItems.forEach(function (item, index) {
          if (item.id == data.id) {
            item.action = "cancel"

            if (data.reason) {
              item.reason = data.reason
            }
          }
        })

				setItems(newItems)
			} else if (data.type == "cancelAppointment") {
        const newItems = [...items]

        newItems.forEach(function (item, index) {
          if (item.id == data.id) {
            newItems.splice(index, 1)
          }
        })

				setItems(newItems)
			} else if (data.type == "requestPayment") {
        const newItems = [...items]

        newItems.forEach(function(item, index) {
          if (item.id == data.id) {
            item.requestPayment = true
            item.workerInfo = data.workerInfo
            item.action = "confirmed"
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
			} else if (data.type == "confirmRequest") {
        const newItems = [...items]

        newItems.forEach(function (item) {
          if (item.id == data.scheduleid) {
            item.action = "confirmed"
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
          if (item.id == data.scheduleid) {
            newItems.splice(index, 1)
          }
        })

				setItems(newItems)
			} else if (data.type == "cancelRequest") {
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
			} else if (data.type == "addItemtoorder" || data.type == "addDiners") {
				setNumunreaded(numUnreaded + 1)
			} else if (data.type == "orderReady") {
        const newItems = [...items]
				const { ordernumber } = data

        newItems.forEach(function (item) {
          if (item.orderNumber == ordernumber) {
            item.status = "ready"
          }
        })

				setItems(newItems)
			} else if (data.type == "makeReservation") {
        const newItems = [...items]
				const { scheduleid, time, table } = data

        newItems.forEach(function (item) {
          if (item.id == scheduleid) {
            item.action = "requested"
            item.nextTime = parseInt(time)
            item.table = table
          }
        })

				setItems(newItems)
			} else if (data.type == "rescheduleReservation") {
        const newItems = [...items]
				const { scheduleid, time, table } = data

        newItems.forEach(function (item) {
          if (item.id == scheduleid) {
            item.action = "rebook"
            item.nextTime = parseInt(time)
            item.table = table
          }
        })

				setItems(newItems)
			} else if (data.type == "canServeDiners") {
        const newItems = [...items]

        newItems.forEach(function (item) {
          if (item.id == data.id) {
            item.confirm = true
            item.seated = true
          }
        })

				setItems(newItems)
			} else if (data.type == "deleteReservation") {
        const newItems = [...items]
				const { id } = data

        newItems.forEach(function (item, index) {
          if (item.id == id) {
            newItems.splice(index, 1)
          }
        })

				setItems(newItems)
			} else if (data.type == "getDinersPayments") {
        const newItems = [...items]

        newItems.forEach(function (item, index) {
          if (item.id == data.scheduleid) {
            newItems.splice(index, 1)
          }
        })

				setItems(newItems)
			} else if (data.type == "receivePayment") {
        const newItems = [...items]

        newItems.forEach(function (item, index) {
          if (item.id == data.scheduleid) {
            newItems.splice(index, 1)
          }
        })

				setItems(newItems)
			} else if (data.type == "productPurchased") {
        const newItems = [...items]

        newItems.forEach(function (item, index) {
          if (item.orderNumber == data.ordernumber) {
            newItems.splice(index, 1)
          }
        })

				setItems(newItems)
			} else if (data.type == "deleteOrder") {
        const newItems = [...items]

        newItems.forEach(function (item, index) {
          if (item.orderid == data.orderid) {
            newItems.splice(index, 1)
          }
        })

				setItems(newItems)
			} else if (data.type == "setProductPrice") {
        const newItems = [...items]

        newItems.forEach(function (item) {
          if (item.id == data.cartid) {
            item.status = "checkout"
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
		isMounted.current = true

		startWebsocket()

		if (Constants.isDevice) {
			Notifications.addNotificationResponseReceivedListener(res => {
				const { data } = res.notification.request.content
				const newItems = [...items]

				if (data.type == "acceptRequest") {
          const newItems = [...items]
					const { scheduleid, tablenum, receivers } = data

          newItems.forEach(function (item) {
            if (item.id == scheduleid) {
              item.action = "accepted"

              if (receivers.booker.replace("user", "") == userId) {
                item.table = tablenum
                item.confirm = true
              }
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
				} else if (data.type == "cancelRequest") {
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
					const { ordernumber } = data

          newItems.forEach(function (item) {
            if (item.orderNumber == ordernumber) {
              item.status = "ready"
            }
          })

					setItems(newItems)
				} else if (data.type == "canServeDiners") {
          const newItems = [...items]

          newItems.forEach(function (item) {
            if (item.id == data.id) {
              item.seated = true
            }
          })

					setItems(newItems)
				} else if (data.type == "addDiners") {
					setNumunreaded(numUnreaded + 1)
				} else if (data.type == "addItemtoorder") {
					setNumunreaded(numUnreaded + 1)
				}
			});
		}

		return () => {
			socket.off("updateNotifications")
			isMounted.current = false
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
								showsVerticalScrollIndicator={false}
								data={items}
								renderItem={({ item, index }) => 
									<View style={styles.item} key={item.key}>
										{(item.type == "cart-order-other" || item.type == "dining-order" || item.type == "paymentrequested") && (
											<>
												<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
													{item.image && (
														<View style={styles.itemImageHolder}>
															<Image source={{ uri: logo_url + item.image }} style={{ height: '100%', width: '100%' }}/>
														</View>
													)}

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
													<View>
														<Text style={styles.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>Quantity:</Text> {item.quantity}</Text>
														<Text style={styles.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>E-pay fee:</Text> ${item.fee.toFixed(2)}</Text>
														<Text style={styles.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>PST:</Text> ${item.pst.toFixed(2)}</Text>
														<Text style={styles.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>HST fee:</Text> ${item.hst.toFixed(2)}</Text>
														<Text style={styles.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>Total cost:</Text> ${item.total.toFixed(2)}</Text>
													</View>
												</View>

												{(item.status == "checkout" || item.status == "ready") && (
													<>
														<Text style={styles.itemOrderNumber}>Your order#: {item.orderNumber}</Text>
														<Text style={styles.itemHeader}>
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
																<View style={styles.adderInfo}>
																	<View style={styles.adderInfoProfile}>
																		<Image source={{ uri: logo_url + item.adder.profile }} style={{ height: 40, width: 40 }}/>
																	</View>
																	<Text style={styles.adderInfoUsername}>{item.adder.username}</Text>
																</View>
																<Text style={styles.adderInfoHeader}> added this item to your {item.type.includes("dining") ? "dining order" : "cart"}.</Text>
															</View>
														</View>
														<Text style={styles.itemHeader}>
															{item.type == "cart-order-other" && 'Want to purchase this?'}
															{item.type == "dining-order" && 'Want to order this?'}
															{item.type == "paymentrequested" && 'Please provide a payment method to purchase this'}
														</Text>
														<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
															<View style={styles.actions}>
																<TouchableOpacity style={styles.action} onPress={() => {
																	if (item.type.includes("cart")) {
																		cancelTheCartOrder(item.id, index)
																	} else {
																		cancelTheDiningOrder(item.orderid, index)
																	}
																}}>
																	<Text style={styles.actionHeader}>No</Text>
																</TouchableOpacity>
																<TouchableOpacity style={styles.action} onPress={() => {
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
																	<Text style={styles.actionHeader}>Yes</Text>
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
													{item.image && (
														<View style={styles.itemImageHolder}>
															<Image source={{ uri: logo_url + item.image }} style={{ height: 100, width: 100 }}/>
														</View>
													)}
														
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
													<View>
														<Text style={styles.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>Quantity:</Text> {item.quantity}</Text>

														{item.productid ? 
															<>
																<Text style={styles.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>E-pay fee:</Text> ${item.fee.toFixed(2)}</Text>
																<Text style={styles.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>PST:</Text> ${item.pst.toFixed(2)}</Text>
																<Text style={styles.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>HST fee:</Text> ${item.hst.toFixed(2)}</Text>
																<Text style={styles.itemInfoHeader}><Text style={{ fontWeight: 'bold' }}>Total cost:</Text> ${item.total.toFixed(2)}</Text>
															</>
														: null }	
													</View>
												</View>
												<Text style={styles.itemOrderNumber}>Your order#: {item.orderNumber}</Text>

												<Text style={styles.itemHeader}>
													{item.status == 'checkout' && 'Order ready soon'}
													<Text style={{ color: 'grey', fontStyle: 'italic' }}>{item.status == 'requested' && 'waiting for price'}</Text>
													{item.status == 'ready' && 'Order ready for pickup'}
												</Text>
											</>
										)}
										{item.type == "service" && (
											<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
												<View style={styles.itemImageHolders}>
													<View style={styles.itemLocationImageHolder}>
														<Image source={{ uri: logo_url + item.locationimage }} style={{ height: '100%', width: '100%' }}/>
													</View>
													{item.serviceimage != '' ? 
														<View style={styles.itemServiceImageHolder}>
															<Image source={{ uri: logo_url + item.serviceimage }} style={{ height: '100%', width: '100%' }}/>
														</View>
													: null }
												</View>
												<View style={{ flexDirection: 'column', width: wsize(70) }}>
													{item.locationtype == "restaurant" ? 
														item.booker ? 
															<Text style={styles.itemServiceHeader}>
																Reservation requested

                                <Text style={{ fontSize: wsize(4.5) }}>
  																{'\n\n' + ((item.diners) > 0 && ((item.diners) + ' ' + ((item.diners) == 1 ? 'person' : 'people')))}
  																{'\nat ' + item.location}
  																{'\n' + displayTime(item.time)}
                                </Text>
															</Text>
															:
															<Text style={styles.itemServiceHeader}>
																Reservation {item.action == "accepted" ? 'made' : 'requested'}

                                <Text style={{ fontSize: wsize(4.5) }}>
                                  {'\n\nby ' + item.bookerName}
  																{item.diners > 0 ? 
  																	<>
  																		{'\n'}and{' '}
  																		{
  																			item.diners - 1 == 0 ? 
  																				item.bookerName
  																				:
  																				(item.diners - 1) + " other " + ((item.diners - 1) <= 1 ? "person" : "people") + " " 
  																		}
  																	</>
  																: null}
  																{'\nat ' + item.location}
                                  {'\n' + displayTime(item.time)}
                                </Text>
															</Text>
														:
														<Text style={styles.itemServiceHeader}>
															Appointment booking 
															{'\n\nfor ' + item.service}
														  {'\nat ' + item.location}
															{'\n' + displayTime(item.time)}
                              {'\n' + (item.worker != null && '\nwith worker: ' + item.worker.username)}
														</Text>
													}

													{(item.action == "requested" || item.action == "change") && 
														<Text style={styles.itemHeader}>
															waiting for the {item.locationtype == 'restaurant' ? 'restaurant' : 'salon'}'s response
														</Text>
													}

													{item.action == "accepted" && (
														<>
															<Text style={styles.itemHeader}>
																{item.locationtype == 'restaurant' ? 
																	item.booker ? "Reservation accepted" : ""
																	:
																	"Appointment accepted."
																}
																{'\n\n'}
																{item.locationtype == 'restaurant' && "Table #" + item.table}
															</Text>
															
															<View style={{ alignItems: 'center' }}>
																{item.locationtype == "restaurant" ? 
																	item.booker ? 
																		<View style={{ alignItems: 'center' }}>
																			<TouchableOpacity style={styles.action} onPress={() => cancelTheRequest(item, index)}>
                                        <Text style={styles.actionHeader}>Cancel</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity style={styles.action} onPress={() => confirmTheRequest(index)}>
                                        <Text style={styles.actionHeader}>Accept</Text>
                                      </TouchableOpacity>
																		</View>
																		:
																		item.confirm ? 
																			<View style={{ alignItems: 'center' }}>
																				<TouchableOpacity style={styles.action} onPress={() => {
																					props.close()
																					props.navigation.navigate("order", { locationid: item.locationid, scheduleid: item.id })
																				}}>
																					<Text style={styles.actionHeader}>See the menu</Text>
																				</TouchableOpacity>
																				<TouchableOpacity style={styles.action} onPress={() => {
																					props.close()
																					props.navigation.navigate("makereservation", { locationid: item.locationid, scheduleid: item.id })
																				}}>
																					<Text style={styles.actionHeader}>Rebook</Text>
																				</TouchableOpacity>
																				<View style={[styles.action, { opacity: 0.5 }]}>
																					<Text style={styles.actionHeader}>
																						Awaits seating{'\n'}
																						<Text>........</Text>
																					</Text>
																				</View>
																			</View>
																			:
																			<View style={{ alignItems: 'center' }}>
																				<TouchableOpacity style={styles.action} onPress={() => cancelTheReservationJoining(item.id)}>
                                          <Text style={styles.actionHeader}>Not Coming</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.action} onPress={() => acceptTheReservationJoining(index)}>
                                          <Text style={styles.actionHeader}>Accept</Text>
                                        </TouchableOpacity>
																			</View>
																	:
																	<View style={{ alignItems: 'center' }}>
																		<TouchableOpacity style={styles.action} onPress={() => cancelTheRequest(item, index)}>
                                      <Text style={styles.actionHeader}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.action} onPress={() => confirmTheRequest(index)}>
                                      <Text style={styles.actionHeader}>Confirm</Text>
                                    </TouchableOpacity>
																	</View>
																}
															</View>
														</>
													)}

													{item.action == "confirmed" && (
														<>
															<Text style={styles.itemServiceHeader}>
																{item.locationtype == 'restaurant' ? "Reservation" : "Appointment"}
																{' accepted\n'}
																{item.locationtype == 'restaurant' && "Table #" + item.table}
															</Text>

															{item.locationtype == "restaurant" ?
																item.confirm ? 
																	<View style={{ alignItems: 'center' }}>
																		{item.seated ?
																			<View style={{ alignItems: 'center' }}>
																				<TouchableOpacity style={styles.action} onPress={() => {
																					props.close()
																					props.navigation.navigate("order", { locationid: item.locationid, scheduleid: item.id })
																				}}>
																					<Text style={styles.actionHeader}>See menu</Text>
																				</TouchableOpacity>
																				<TouchableOpacity style={styles.action} onPress={() => sendTheDiningPayment(item.id, index)}>
																					<Text style={styles.actionHeader}>Send payment{item.allowPayment ? " again" : ""}</Text>
																				</TouchableOpacity>
																			</View>
																			:
																			<View style={{ alignItems: 'center' }}>
																				<TouchableOpacity style={styles.action} onPress={() => {
																					props.close()
																					props.navigation.navigate("order", { locationid: item.locationid, scheduleid: item.id })
																				}}>
																					<Text style={styles.actionHeader}>See the menu</Text>
																				</TouchableOpacity>
																				<TouchableOpacity style={styles.action} onPress={() => {
																					props.close()
																					props.navigation.navigate("makereservation", { locationid: item.locationid, scheduleid: item.id })
																				}}>
																					<Text style={styles.actionHeader}>Rebook</Text>
																				</TouchableOpacity>
																				<View style={[styles.action, { opacity: 0.5 }]}>
																					<Text style={styles.actionHeader}>
																						Awaits seating{'\n'}
																						<Text>........</Text>
																					</Text>
																				</View>
																			</View>
																		}
																	</View>
																	:
																	item.booker ? 
																		<View style={{ alignItems: 'center' }}>
																			<TouchableOpacity style={styles.action} onPress={() => cancelTheRequest(item, index)}>
                                        <Text style={styles.actionHeader}>Cancel</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity style={styles.action} onPress={() => confirmTheRequest(index)}>
                                        <Text style={styles.actionHeader}>Accept</Text>
                                      </TouchableOpacity>
																		</View>
																		:
																		<View style={{ alignItems: 'center' }}>
																			<TouchableOpacity style={styles.action} onPress={() => cancelTheReservationJoining(item.id)}>
                                        <Text style={styles.actionHeader}>Not Coming</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity style={styles.action} onPress={() => acceptTheReservationJoining(index)}>
                                        <Text style={styles.actionHeader}>Accept</Text>
                                      </TouchableOpacity>
																		</View>
																:
																<View style={{ alignItems: 'center' }}>
																	{item.serviceid ? 
																		<View style={{ alignItems: 'center' }}>
																			<TouchableOpacity style={styles.action} onPress={() => cancelTheRequest(item, index)}>
																				<Text style={styles.actionHeader}>Cancel Service</Text>
																			</TouchableOpacity>
																			<TouchableOpacity style={styles.action} onPress={() => allowThePayment(item, index)}>
																				<Text style={styles.actionHeader}>Allow Payment{item.allowPayment ? ' Again' : ''}</Text>
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
																			{!item.requestPayment ? 
                                        <View style={{ alignItems: 'center' }}>
                                          <TouchableOpacity style={styles.action} onPress={() => cancelTheRequest(item, index)}>
                                            <Text style={styles.actionHeader}>Cancel Service</Text>
                                          </TouchableOpacity>
                                          <View style={[styles.action, { opacity: 0.5 }]}>
                                            <Text style={styles.actionHeader}>
                                              Awaits payment detail{'\n'}
                                              <Text>........</Text>
                                            </Text>
                                          </View>
                                          <TouchableOpacity style={styles.action} onPress={() => {
                                            props.close()
                                            props.navigation.navigate("booktime", { locationid: item.locationid, serviceid: item.serviceid, scheduleid: item.id, serviceinfo: item.service })
                                          }}>
                                            <Text style={styles.actionHeader}>Rebook</Text>
                                          </TouchableOpacity>
                                        </View>
																				:
																				<TouchableOpacity style={styles.action} onPress={() => sendTheServicePayment(item.id, index)}>
																					<Text style={styles.actionHeader}>See payment details{'\n&\n'}Pay</Text>
																				</TouchableOpacity>
																			}
																		</View>
																	}
																</View>
															}
														</>
													)}

													{item.action == "cancel" || item.action == "rebook" ? 
														<View style={styles.storeRequested}>
															<Text style={styles.itemServiceHeader}>
																{item.action == "cancel" ? 
																	item.locationtype == 'restaurant' ? "Reservation cancelled" : "Appointment cancelled"
																	:
																	"Time taken"
																}
                                {item.reason && <Text>Reason: <Text style={{ fontWeight: '500' }}>{item.reason}</Text></Text>}
															</Text>
															{item.action == "cancel" && (
																<View style={{ alignItems: 'center' }}>
																	<TouchableOpacity style={styles.action} onPress={() => closeTheSchedule(index)}>
																		<Text style={styles.actionHeader}>Ok</Text>
																	</TouchableOpacity>
																</View>
															)}
															{(item.action == "rebook" && item.nextTime > 0) && (
																<>
																	<Text style={styles.itemHeader}>
																		<Text>New requested time</Text>
																		{'\n'}
																		<Text style={styles.itemServiceHeader}>{displayTime(item.nextTime)}</Text>
																		{'\n\nWant this time?'}
																	</Text>
																	<View style={{ alignItems: 'center' }}>
																    <TouchableOpacity style={styles.action} onPress={() => cancelTheRequest(item, index)}>
                                      <Text style={styles.actionHeader}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.action} onPress={() => {
                                      props.close()
                                      
                                      if (item.locationtype == "restaurant") {
                                        props.navigation.navigate("makereservation", { locationid: item.locationid, scheduleid: item.id })
                                      } else {
                                        props.navigation.navigate("booktime", { locationid: item.locationid, scheduleid: item.id, serviceid: item.serviceid, serviceinfo: item.service })
                                      }
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
													: null }
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
				<View style={{ flexDirection: 'column', height: '100%', justifyContent: 'space-around' }}>
					<ActivityIndicator color="black" size="large"/>
				</View>
			}

			{confirm.show && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.hiddenBox}>
						<View style={styles.confirmBox}>
							<View style={styles.confirmContainer}>
								<Text style={styles.confirmHeader}>
									Confirmed {confirm.type == "cart" ? "Cart" : "Dining"} Order: 
									{'\n\n Quantity: ' + confirm.quantity + '\n\n'}
                  {confirm.name + '\n\n'} 
                  at ${confirm.price}
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
									<Text style={{ fontFamily: 'Arial'}}>
										Are you sure you want to cancel the 

										{cancelSchedule.type != 'restaurant' ? ' service appointment of' : ' reservation'}
									</Text>
									{cancelSchedule.service ? '\n\n' + cancelSchedule.service + '\n' : '\n\n'}
									{'\nat ' + cancelSchedule.location + '\n'}
									{displayTime(cancelSchedule.time)}
								</Text>

								<View style={styles.confirmOptions}>
									<TouchableOpacity style={styles.confirmOption} onPress={() => setCancelschedule({ show: false, service: "", time: 0, index: -1 })}>
										<Text style={styles.confirmOptionHeader}>No</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.confirmOption} onPress={() => cancelTheRequest()}>
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
			{showDiningPaymentRequired && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.hiddenBox}>
						<View style={styles.popBox}>
							<View style={styles.popContainer}>
								<Text style={styles.popHeader}>
									You need to provide a payment method
								</Text>

								<View style={styles.popActions}>
									<TouchableOpacity style={styles.popAction} onPress={() => setShowdiningpaymentrequired(false)}>
										<Text style={styles.popActionHeader}>Close</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.popAction} onPress={() => {
										props.close()
										props.navigation.navigate("account", { required: "card" })
									}}>
										<Text style={styles.popActionHeader}>Ok</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{showServicePaymentRequired && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.hiddenBox}>
						<View style={styles.popBox}>
							<View style={styles.popContainer}>
								<Text style={styles.popHeader}>
									You need to provide a payment method to continue
								</Text>

								<View style={styles.popActions}>
									<TouchableOpacity style={styles.popAction} onPress={() => setShowservicepaymentrequired(false)}>
										<Text style={styles.popActionHeader}>Close</Text>
									</TouchableOpacity>
									<TouchableOpacity style={styles.popAction} onPress={() => {
										props.close()
										props.navigation.navigate("account", { required: "card" })
									}}>
										<Text style={styles.popActionHeader}>Ok</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{showChargeuser.show && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.hiddenBox}>
						<View style={styles.popBox}>
							{showChargeuser.trialstatus.days > 0 ? 
								<View style={styles.popBox}>
									<View style={styles.popContainer}>
										<Text style={styles.popHeader}>{showChargeuser.type == 'restaurant' ? 'Reservation Confirmed' : 'Appointment Confirmed'}</Text>
									</View>
								</View>
								:
								<View style={styles.popContainer}>
									<Text style={styles.popHeader}>
										Trial over
										{'\n'}
										A charge of $ 0.50 will be applied
										to your credit card to proceed with
										confirmation
									</Text>

									<Text style={{ fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
										App fee: ${showChargeuser.cost}
										{'\n'}E-pay fee: ${showChargeuser.fee}
										{'\n'}PST: ${showChargeuser.pst}
										{'\n'}HST: ${showChargeuser.hst}
										{'\n'}Total: ${showChargeuser.total}
									</Text>

									<View style={styles.popActions}>
										<TouchableOpacity style={styles.popAction} onPress={() => setShowchargeuser({ ...showChargeuser, show: false, showworkers: false, showTip: false, tip: 0, trialstatus: { days: 30, status: "" }})}>
											<Text style={styles.popActionHeader}>Close</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.popAction} onPress={() => {
											if (showChargeuser.type == "salon") {
												confirmTheRequest()
											} else {
												acceptTheReservationJoining()
											}
										}}>
											<Text style={styles.popActionHeader}>Ok</Text>
										</TouchableOpacity>
									</View>

                  {showChargeuser.loading && (
                    <View style={{ alignItems: 'center' }}>
                      <ActivityIndicator color="black" size="small"/>
                    </View>
                  )}
								</View>
							}
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{showPaymentdetail.show && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.hiddenBox}>
						<View style={styles.popBox}>
							{!showPaymentdetail.confirm ? 
								<View style={styles.popContainer}>
									<Text style={styles.popHeader}>Payment detail</Text>

									<Text style={{ fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
										Amount: ${showPaymentdetail.cost}
										{'\n'}E-pay fee: ${showPaymentdetail.fee}

                    {showPaymentdetail.type == 'dine' ? 
                      showPaymentdetail.tip > 0 && '\nTip amount: $' + parseFloat(showPaymentdetail.tip).toFixed(2)
                      :
                      showPaymentdetail.workerInfo["tip"] > 0 && '\nTip amount: $' + parseFloat(showPaymentdetail.workerInfo["tip"]).toFixed(2)
                    }

										{'\n'}PST: ${showPaymentdetail.pst}
										{'\n'}HST: ${showPaymentdetail.hst}
										{'\n'}Total: ${showPaymentdetail.total}
									</Text>

									<View style={styles.popActions}>
										<TouchableOpacity style={[styles.popAction, { opacity: showPaymentdetail.loading ? 0.3 : 1 }]} disabled={showPaymentdetail.loading} onPress={() => setShowpaymentdetail({ ...showPaymentdetail, show: false })}>
											<Text style={styles.popActionHeader}>Close</Text>
										</TouchableOpacity>
                    <TouchableOpacity style={[styles.popAction, { opacity: showPaymentdetail.loading ? 0.3 : 1 }]} disabled={showPaymentdetail.loading} onPress={() => setShowpaymentdetail({ ...showPaymentdetail, showTip: true })}>
                      <Text style={styles.popActionHeader}>
                        {showPaymentdetail.type == 'dine' ? 
                          showPaymentdetail.tip > 0 ? 'Change' : 'Give'
                          :
                          showPaymentdetail.workerInfo["tip"] > 0 ? 'Change' : 'Give'
                        }
                        {' '}tip
                      </Text>
                    </TouchableOpacity>
										<TouchableOpacity style={[styles.popAction, { opacity: showPaymentdetail.loading ? 0.3 : 1 }]} disabled={showPaymentdetail.loading} onPress={() => {
											if (showPaymentdetail.type == 'dine') {
												sendTheDiningPayment()
											} else {
												sendTheServicePayment()
											}
										}}>
											<Text style={styles.popActionHeader}>Ok</Text>
										</TouchableOpacity>
									</View>

                  {showPaymentdetail.loading && (
                    <View style={{ alignItems: 'center' }}>
                      <ActivityIndicator color="black" size="small"/>
                    </View>
                  )}
								</View>
								:
								<View style={styles.popContainer}>
									<Text style={styles.popHeader}>Payment confirmed</Text>
								</View>
							}

              {showPaymentdetail.showTip && (
                <Modal transparent={true}>
                  <SafeAreaView style={styles.popBox}>
                    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                      <View style={styles.popContainer}>
                        <Text style={styles.popHeader}>Enter the amount you want to tip?</Text>

                        <View style={{ alignItems: 'center' }}>
                          <TextInput
                            style={styles.popInput}
                            maxLength={10}
                            keyboardType="numeric"
                            onChangeText={(tip) => {
                              if (showPaymentdetail.type == 'dine') {
                                setShowpaymentdetail({ ...showPaymentdetail, tip: tip ? tip : 0 })
                              } else {
                                const { workerInfo } = showPaymentdetail

                                workerInfo["tip"] = tip ? tip : 0
                                setShowpaymentdetail({ ...showPaymentdetail, workerInfo })
                              }
                            }}
                            placeholder="example: 5"
                            placeholderTextColor="grey"
                            value={
                              showPaymentdetail.type == 'dine' ? 
                                (showPaymentdetail.tip > 0) ? showPaymentdetail.tip.toString() : ""
                                :
                                (showPaymentdetail.workerInfo["tip"] > 0) ? showPaymentdetail.workerInfo["tip"].toString() : ""
                            }
                          />
                        </View>

                        <View style={styles.popActions}>
                          <TouchableOpacity style={styles.popAction} onPress={() => {
                            let tip = 0.00

                            if (showPaymentdetail.type == 'dine') {
                              tip = parseFloat(showPaymentdetail.tip)
                            } else {
                              const { workerInfo } = showPaymentdetail

                              tip = parseFloat(workerInfo["tip"])
                            }

                            const cost = parseFloat(showPaymentdetail.cost)
                            const pst = parseFloat(cost * 0.08)
                            const hst = parseFloat(cost * 0.05)
                            const total = stripeFee(parseFloat(cost + pst + hst + tip)).toFixed(2)

                            setShowpaymentdetail({ ...showPaymentdetail, showTip: false, total })
                          }}>
                            <Text style={styles.popActionHeader}>Done</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  </SafeAreaView>
                </Modal>
              )}
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{showOwners.show && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.hiddenBox}>
						{showOwners.showworkers ? 
							<View style={styles.payworkerBox}>
								<View style={styles.payworkerContainer}>
									<TextInput style={styles.payworkerSearchInput} placeholder="Search worker" placeholderTextColor="rgba(0, 0, 0, 0.5)" onChangeText={username => searchTheWorkers(username)}/>

									<Text style={styles.payworkerWorkersListHeader}>Select worker to send payment</Text>

									<View style={styles.payworkerWorkersList}>
										<FlatList
											data={showOwners.owners}
											renderItem={({ item, index }) => 
												<View key={item.key} style={styles.payworkerWorkersRow}>
													{item.row.map(info => (
														info.username ? 
															<TouchableOpacity key={info.key} style={!info.selected ? styles.payworkerWorker : styles.payworkerWorkerDisabled} onPress={() => selectWorker(info.id)}>
																<View style={styles.payworkerWorkerProfile}>
																	<Image source={{ uri: logo_url + info.profile }} style={{ height: wsize(15), width: wsize(15) }}/>
																</View>
																<Text style={styles.payworkerWorkerHeader}>{info.username}</Text>
															</TouchableOpacity>
															:
															<View key={info.key} style={styles.payworkerWorkerEmpty}>
															</View>
													))}
												</View>
											}
										/>
									</View>

									<View style={styles.payworkerActions}>
										<TouchableOpacity style={styles.payworkerAction} onPress={() => setShowowners({ ...showOwners, show: false, owners: [], trialstatus: { days: 30, status: "" } })}>
											<Text style={styles.payworkerActionHeader}>Close</Text>
										</TouchableOpacity>
										<TouchableOpacity style={showOwners.workerid > 0 ? styles.payworkerAction : styles.payworkerActionDisabled} disabled={showOwners.workerid == 0} onPress={() => setShowowners({ ...showOwners, showworkers: false })}>
											<Text style={styles.payworkerActionHeader}>Send</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
							:
							<View style={styles.popBox}>
								<View style={styles.popContainer}>
									<Text style={styles.popHeader}>Payment Detail</Text>

									<Text style={{ fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
										Service cost: ${showOwners.cost}
										{'\n'}E-pay fee: ${showOwners.fee}
                    {showOwners.tip > 0 && '\nTip amount: $' + parseFloat(showOwners.tip).toFixed(2)}
										{'\n'}PST: ${showOwners.pst}
										{'\n'}HST: ${showOwners.hst}
										{'\n'}Total: ${showOwners.total}
									</Text>

									<View style={styles.popActions}>
										<TouchableOpacity style={styles.popAction} onPress={() => setShowowners({ ...showOwners, show: false, showTip: false, tip: 0, trialstatus: { days: 30, status: "" } })}>
											<Text style={styles.popActionHeader}>Close</Text>
										</TouchableOpacity>
                    <TouchableOpacity style={styles.popAction} onPress={() => setShowowners({ ...showOwners, showTip: true })}>
                      <Text style={styles.popActionHeader}>Give tip</Text>
                    </TouchableOpacity>
										<TouchableOpacity style={styles.popAction} onPress={() => allowThePayment()}>
											<Text style={styles.popActionHeader}>Ok</Text>
										</TouchableOpacity>
									</View>

                  {showOwners.loading && (
                    <View style={{ alignItems: 'center' }}>
                      <ActivityIndicator color="black" size="small"/>
                    </View>
                  )}
								</View>
							</View>
						}

            {showOwners.showTip && (
              <Modal transparent={true}>
                <SafeAreaView style={styles.popBox}>
                  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View style={styles.popContainer}>
                      <Text style={styles.popHeader}>Enter the amount you want to tip?</Text>

                      <View style={{ alignItems: 'center' }}>
                        <TextInput
                          style={styles.popInput}
                          maxLength={10}
                          keyboardType="numeric"
                          onChangeText={(tip) => setShowowners({ ...showOwners, tip: tip ? tip : 0 })}
                          placeholder="example: 5"
                          placeholderTextColor="grey"
                          value={(showOwners.tip > 0) ? showOwners.tip.toString() : ""}
                        />
                      </View>

                      <View style={styles.popActions}>
                        <TouchableOpacity style={styles.popAction} onPress={() => {
                          const cost = parseFloat(showOwners.cost)
                          const tip = parseFloat(showOwners.tip)
                          const pst = parseFloat(cost * 0.08)
                          const hst = parseFloat(cost * 0.05)
                          const total = stripeFee(parseFloat(cost + pst + hst + tip)).toFixed(2)

                          setShowowners({ ...showOwners, showTip: false, total })
                        }}>
                          <Text style={styles.popActionHeader}>Done</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </SafeAreaView>
              </Modal>
            )}
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
	notifications: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	box: { height: '100%', width: '100%' },
	close: { marginTop: 20, marginHorizontal: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: wsize(7), fontWeight: 'bold', marginTop: 10, textAlign: 'center' },

	refresh: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	refreshHeader: { fontSize: wsize(4), textAlign: 'center' },

	body: { flexDirection: 'column', height: '80%', justifyContent: 'space-around' },
	item: { borderStyle: 'solid', borderBottomWidth: 0.5, borderTopWidth: 0.5, paddingHorizontal: 10, paddingVertical: 30 },
	itemImageHolders: { alignItems: 'center', width: wsize(30) },
  itemImageHolder: { borderRadius: wsize(30) / 2, height: wsize(30), overflow: 'hidden', width: wsize(30) },
	itemLocationImageHolder: { borderRadius: (wsize(30) - 5) / 2, height: wsize(30) - 5, overflow: 'hidden', width: wsize(30) - 5 },
	itemServiceImageHolder: { borderRadius: (wsize(30) - 10) / 2, height: wsize(30) - 10, overflow: 'hidden', width: wsize(30) - 10 },

	// service
	itemServiceHeader: { fontSize: wsize(5), fontWeight: 'bold', margin: 10, textAlign: 'center' },
	itemServiceResponseTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 60 },
	itemServiceResponseTouchHeader: { fontWeight: 'bold', textAlign: 'center' },
	storeRequested: { backgroundColor: 'rgba(127, 127, 127, 0.3)', borderRadius: 3, padding: 5 },

	// order
	itemName: { fontSize: wsize(5), marginBottom: 10 },
	itemInfo: { fontSize: wsize(4) },
	itemInfoHeader: { fontSize: wsize(4) },
	adderInfo: { alignItems: 'center' },
	adderInfoProfile: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 20, height: 40, overflow: 'hidden', width: 40 },
	adderInfoHeader: { padding: 10 },
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
	confirmHeader: { fontFamily: 'appFont', fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmOptions: { flexDirection: 'row', justifyContent: 'space-around' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmOptionHeader: { },

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

	payworkerBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	payworkerContainer: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', width: '80%' },
	payworkerSearchInput: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, height: 40, paddingHorizontal: 10, width: '90%' },
	payworkerWorkersList: { height: '70%' },
	payworkerWorkersListHeader: { fontWeight: 'bold', textAlign: 'center' },
	payworkerWorkersRow: { flexDirection: 'row', justifyContent: 'space-between' },
	payworkerWorker: { alignItems: 'center', marginHorizontal: 5, padding: 5 },
	payworkerWorkerDisabled: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 5, marginHorizontal: 5, padding: 5, width: wsize(18) },
	payworkerWorkerEmpty: { alignItems: 'center', borderRadius: 5, marginHorizontal: 5, padding: 5, width: wsize(18) },
	payworkerWorkerProfile: { borderRadius: wsize(15) / 2, height: wsize(15), overflow: 'hidden', width: wsize(15) },
	payworkerWorkerHeader: {  },
	payworkerActions: { flexDirection: 'row', justifyContent: 'space-around' },
	payworkerAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	payworkerActionDisabled: { alignItems: 'center', backgroundColor: 'grey', borderColor: 'grey', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	payworkerActionHeader: { },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
	disabledContainer: { alignItems: 'center', width: '100%' },
	disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
	disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
})
