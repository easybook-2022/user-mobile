import React, { useState, useEffect, useRef } from 'react'
import { 
	SafeAreaView, ActivityIndicator, Dimensions, ScrollView, View, FlatList, 
	Text, TextInput, Image, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { socket, logo_url, stripeFee } from '../../../assets/info'
import { searchFriends, searchDiners } from '../../apis/users'
import { getLocationProfile } from '../../apis/locations'
import { getMenus } from '../../apis/menus'
import { getProducts, getProductInfo } from '../../apis/products'
import { getScheduleInfo, addItemtoorder, sendDiningPayment, seeDiningOrders, editDiners, sendOrders, editOrder, deleteOrder, updateOrder, addDiners, editOrderCallfor, dinerIsRemovable, dinerIsSelectable, confirmDiningOrder, updateOrderCallfor } from '../../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}
const itemSize = (width / 2) - 50
const imageSize = 100
const orderImageSize = 130

export default function Order(props) {
	const { locationid, scheduleid, numOrders, allowPayment } = props.route.params

	const [userId, setUserid] = useState(null)
	const [timeStr, setTimestr] = useState('')
	const [name, setName] = useState('')
	const [totalDiners, setTotaldiners] = useState(0)
	const [seated, setSeated] = useState(false)
	const [menuId, setMenuid] = useState('')
	const [menuName, setMenuname] = useState('')
	const [menuInfo, setMenuinfo] = useState('')

	const [itemInfo, setIteminfo] = useState({ 
		show: false, productid: -1, orderid: "", name: "", info: "", note: "", 
		image: "", price: 0, cost: 0, options: [], others: [], sizes: [], quantity: 1, 
		errorMsg: ""
	})
	const [deleteRequestInfo, setDeleterequestinfo] = useState({
		show: false, orderid: "", name: "", info: "", note: "", 
		image: "", cost: 0, options: [], others: [], sizes: [], quantity: 1, 
		numorderers: 0
	})

	const [locationInfo, setLocationinfo] = useState({ name: "", logo: "" })
	const [errorMsg, setErrormsg] = useState('')

	const [productName, setProductname] = useState('')
	const [menuInfos, setMenuinfos] = useState({ type: '', items: [] })

	const [loaded, setLoaded] = useState(false)
	const [showPaymentRequired, setShowpaymentrequired] = useState({ show: false, username: "" })
	const [showUnconfirmeddiner, setShowunconfirmeddiner] = useState({ show: false, username: "" })
	const [showUnconfirmedorders, setShowunconfirmedorders] = useState(false)
	const [showActiveDiner, setShowactivediner] = useState({ show: false, username: "" })

	const [openRounds, setOpenrounds] = useState(false)
	const [rounds, setRounds] = useState([])

	const [openEditdiners, setOpeneditdiners] = useState({ show: false, changes: 0 })
	const [searchedFriends, setSearchedfriends] = useState([])
	const [numSearchedfriends, setNumsearchedfriends] = useState(0)
	const [selectedDiners, setSelecteddiners] = useState([])
	const [numSelecteddiners, setNumselecteddiners] = useState([])
	const [dinersErrormsg, setDinerserrormsg] = useState('')

	const [openEditcallfor, setOpeneditcallfor] = useState(false)
	const [diners, setDiners] = useState([])
	const [numDiners, setNumdiners] = useState(0)
	const [selectedCallfor, setSelectedcallfor] = useState([])
	const [numSelectedcallfor, setNumselectedcallfor] = useState(0)
	const [orderingItem, setOrderingitem] = useState({ name: "", info: "", image: "", note: "", options: [], others: [], sizes: [], quantity: 1, cost: 0, errorMsg: "" })
	const [showDisabledScreen, setShowdisabledscreen] = useState(false)
  const [showPaymentdetail, setShowpaymentdetail] = useState({ show: false, service: "", workerInfo: {}, showTip: false, confirm: false, cost: 0.00, tip: 0.00, pst: 0.00, hst: 0.00, fee: 0.00, total: 0.00, loading: false })
  const [showDiningPaymentRequired, setShowdiningpaymentrequired] = useState(false)

	const isMounted = useRef(null)

	const getTheScheduleInfo = async() => {
		const userid = await AsyncStorage.getItem("userid")

		getScheduleInfo(scheduleid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					socket.emit("socket/user/login", userid, () => {
						const { scheduleInfo } = res
						const unix = parseInt(scheduleInfo.time)

						setUserid(userid)
						setName(scheduleInfo.name)
						setTotaldiners(scheduleInfo.numdiners)
						setSeated(scheduleInfo.seated)

						let date = new Date(unix)
						let hour = date.getHours()
						let minute = date.getMinutes()
						let period = hour > 12 ? "pm" : "am"

						hour = hour > 12 ? hour - 12 : hour
						hour = parseInt(hour)
						minute = minute < 10 ? "0" + minute : minute

						setTimestr(hour + ":" + minute + " " + period)
						getTheLocationProfile()
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const getTheLocationProfile = async() => {
		const data = { locationid, longitude: null, latitude: null }

		setLoaded(false)

		getLocationProfile(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { name, logo } = res.info

					setLocationinfo({ name, logo })
					getAllMenus()
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const getAllMenus = () => {
		getMenus(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { type, menus } = res

					setMenuinfos({ type, items: menus })
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const getTheProductInfo = async(productid) => {
		getProductInfo(productid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { image, info, name, options, others, sizes, price, cost } = res.productInfo

					setIteminfo({
						...itemInfo,
						show: true, productid, name, info, image, price, options, others, sizes, cost
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const seeTheDiningOrders = async() => {
		seeDiningOrders(scheduleid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setRounds(res.rounds)
					setOpenrounds(true)
					setSeated(res.dinersseated)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const sendTheOrders = async() => {
		let data = { scheduleid, type: "sendOrders" }

		sendOrders(scheduleid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { receiverLocations, receiverDiners } = res
						
					data = { ...data, receiverLocations, receiverDiners }
					socket.emit("socket/sendOrders", data, () => {
						const newRounds = [...rounds]

						newRounds[0].status = "making"

						setRounds(newRounds)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					switch (status) {
						case "unconfirmedorders":
							setShowunconfirmedorders(true)
					}
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const editTheOrder = async(orderid) => {
		const data = { scheduleid, orderid }

		editOrder(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { name, info, image, quantity, options, others, sizes, note, price, cost } = res.orderInfo

					setIteminfo({
						...itemInfo,
						show: true,
						orderid,
						name, info, image,
						quantity, note, 
						options, others, sizes, 
						price, cost
					})
					setOpenrounds(false)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const deleteTheOrder = async(orderid) => {
		if (!deleteRequestInfo.show) {
			rounds.forEach(function (round) {
				round.round.forEach(function (orders) {
					orders.orders.forEach(function (order) {
						if (order.id == orderid) {
							const { cost, image, name, note, options, others, sizes, orderers } = order
							let numorderers = 0

							orderers.forEach(function (info) {
								info.row.forEach(function (orderer) {
									numorderers += orderer.username ? 1 : 0
								})
							})

							setDeleterequestinfo({
								...deleteRequestInfo,
								show: true, 
								orderid, cost, image, name, 
								note, options, others, sizes, 
								numorderers
							})
						}
					})
				}) 
			})
		} else {
			const { orderid } = deleteRequestInfo
			let data = { scheduleid, orderid, type: "deleteOrder" }

			deleteOrder(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						data = { ...data, receiver: res.receiver }
						socket.emit("socket/deleteOrder", data, () => {
							setDeleterequestinfo({ ...deleteRequestInfo, show: false })
							seeTheDiningOrders()
						})
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					} else {
						setErrormsg("an error has occurred in server")
					}
				})
		}
	}
	const updateTheOrder = async() => {
		const { orderid, quantity, options, others, sizes, note } = itemInfo
		const newOptions = JSON.parse(JSON.stringify(options))
		const newOthers = JSON.parse(JSON.stringify(others))
		const newSizes = JSON.parse(JSON.stringify(sizes))
		const data = { scheduleid, orderid, quantity, note }

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

		updateOrder(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setIteminfo({ ...itemInfo, show: false })
					seeTheDiningOrders()
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
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
		let { sizes, others, quantity } = itemInfo
		let newSizes = [...sizes]
		let newCost = 0

		newSizes.forEach(function (size) {
			if (size.selected) {
				size.selected = false
			}
		})

		newCost = quantity * parseFloat(newSizes[index].price)

		others.forEach(function (other) {
			if (other.selected) {
				newCost += parseFloat(other.price)
			}
		})

		newSizes[index].selected = true
		
		setIteminfo({ ...itemInfo, sizes: newSizes, cost: newCost })
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

		setIteminfo({ ...itemInfo, others: newOthers, cost: newCost })
	}
	const changeQuantity = (action) => {
		let { quantity, price, sizes, others } = itemInfo
		let newQuantity = quantity
		let newCost = 0

		newQuantity = action == "+" ? newQuantity + 1 : newQuantity - 1
		newQuantity = newQuantity == 0 ? 1 : newQuantity

		if (sizes.length > 0) {
			sizes.forEach(function (size) {
				if (size.selected) {
					newCost = newQuantity * parseFloat(size.price)
				}
			})
		} else {
			newCost = newQuantity * parseFloat(price)
		}

		others.forEach(function (other) {
			if (other.selected) {
				newCost += parseFloat(other.price)
			}
		})

		setIteminfo({ ...itemInfo, quantity: newQuantity, cost: newCost })
	}
	const addOrder = async() => {
		let { productid, name, info, note, image, price, options, others, sizes, quantity } = itemInfo
		let newOptions = JSON.parse(JSON.stringify(options))
		let newOthers = JSON.parse(JSON.stringify(others))
		let newSizes = JSON.parse(JSON.stringify(sizes))
		let callfor = []

		if (openEditcallfor && selectedCallfor.length == 0) {
			setOrderingitem({ ...orderingItem, errorMsg: "You didn't select anyone" })
		} else {
			selectedCallfor.forEach(function (info) {
				info.row.forEach(function (diner) {
					if (diner.username) {
						callfor.push({ userid: diner.id.toString(), status: "confirmawaits" })
					}
				})
			})

			newOptions.forEach(function (option) {
				delete option['key']
			})

			newOthers.forEach(function (other) {
				delete other['key']
			})

			newSizes.forEach(function (size) {
				delete size['key']
			})

			let data = { 
				userid: userId, scheduleid, productid, name, quantity, 
				callfor, options: newOptions, others: newOthers, 
				sizes: newSizes, note,
				type: "addItemtoorder"
			}

			addItemtoorder(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const { receiver } = res

						if (receiver.length > 0) {
							data = { ...data, receiver: res.receiver }
							socket.emit("socket/addItemtoorder", data, () => {
								setOpeneditcallfor(false)
								setIteminfo({ ...itemInfo, show: false, quantity: 1, errorMsg: "" })
								closeEditTheDiners()
								closeEditTheCallfor()
								seeTheDiningOrders()
							})
						} else {
							setOpeneditcallfor(false)
							setIteminfo({ ...itemInfo, show: false, quantity: 1, errorMsg: "" })
							closeEditTheDiners()
							closeEditTheCallfor()
							seeTheDiningOrders()
						}
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data

						setIteminfo({ ...itemInfo, errorMsg: errormsg })
					} else {
						setErrormsg("an error has occurred in server")
					}
				})
		}
	}
	const addToDinersOrder = async() => {
		let newOrderingItem = {...orderingItem}
		let { name, info, note, image, price, quantity, options, others, sizes } = itemInfo
		let newOptions = JSON.parse(JSON.stringify(options))
		let newOthers = JSON.parse(JSON.stringify(others))
		let newSizes = JSON.parse(JSON.stringify(sizes))
		let totalprice = 0

		if (sizes.length > 0) {
			sizes.forEach(function (size) {
				if (size.selected) {
					totalprice += parseFloat(size.price) * quantity
				}
			})
		} else {
			totalprice += price * quantity
		}

		others.forEach(function (other) {
			if (other.selected) {
				totalprice += parseFloat(other.price)
			}
		})

		if (totalprice) {
			newOrderingItem.name = name
			newOrderingItem.info = info
			newOrderingItem.note = note
			newOrderingItem.image = image
			newOrderingItem.options = newOptions
			newOrderingItem.others = newOthers
			newOrderingItem.sizes = newSizes
			newOrderingItem.quantity = quantity
			newOrderingItem.cost = totalprice.toFixed(2)
			newOrderingItem.errorMsg = ""

			setOpeneditcallfor(true)
			setIteminfo({ ...itemInfo, show: false, errorMsg: "" })
			setOrderingitem(newOrderingItem)
		} else {
			setIteminfo({ ...itemInfo, errorMsg: "Please choose a size" })
		}

		setOrderingitem(newOrderingItem)
	}

	// edit diners
	const editTheDiners = async() => {
		editDiners(scheduleid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setSelecteddiners(res.diners)
					setNumselecteddiners(res.numdiners)
					setOpeneditdiners({ show: true, changes: 0 })
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
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
					setSearchedfriends(res.searchedFriends)
					setNumsearchedfriends(res.numSearchedFriends)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const selectFriend = (userid) => {
		let newSelectedDiners = [...selectedDiners]
		let selected = { id: "", key: "", profile: "", username: "", status: "new" }
		let last_row = null, next_key = null, unfill = false

		if (JSON.stringify(newSelectedDiners).includes("\"id\":" + userid + ",")) {
			return
		}

		// get last selected friend
		searchedFriends.forEach(function (info) {
			info.row.forEach(function (friend) {
				if (friend.id == userid) {
					selected.id = userid
					selected.profile = friend.profile
					selected.username = friend.username
				}
			})
		})

		if (newSelectedDiners.length > 0) {
			last_row = newSelectedDiners[newSelectedDiners.length - 1].row

			for (k in last_row) {
				if (last_row[k].id) {
					next_key = parseInt(last_row[k].key.split("-").pop()) + 1
				} else {
					unfill = true
					selected.key = "selected-diner-" + next_key
					last_row[k] = selected
					next_key += 1

					break
				}
			}

			if (unfill) {
				newSelectedDiners[newSelectedDiners.length - 1].row = last_row
				setNumselecteddiners(numSelecteddiners + 1)
			} else {
				selected.key = "selected-diner-" + next_key
				newSelectedDiners.push({
					key: "selected-diner-row-" + (newSelectedDiners.length),
					row: [
						selected,
						{ key: "selected-diner-" + (next_key + 1) },
						{ key: "selected-diner-" + (next_key + 2) },
						{ key: "selected-diner-" + (next_key + 3) }
					]
				})
			}

			setNumselecteddiners(numSelecteddiners + 1)
		} else {
			selected.key = "selected-diner-0"
			newSelectedDiners = [{
				key: "selected-diner-row-0",
				row: [
					selected,
					{ key: "selected-diner-1" },
					{ key: "selected-diner-2" },
					{ key: "selected-diner-3" }
				]
			}]
			setNumselecteddiners(1)
		}

		setSelecteddiners(newSelectedDiners)
	}
	const deselectTheFriend = (userid) => {
		let list = [...selectedDiners]
		let last_row = list[list.length - 1].row
		let newList = [], row = [], info, num = 0

		const data = { scheduleid, userid }

		dinerIsRemovable(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { removable } = res

					if (removable) {
						list.forEach(function (listitem) {
							listitem.row.forEach(function (info) {
								if (info.id && info.id != userid) {
									row.push({
										key: "selected-diner-" + num,
										id: info.id,
										profile: info.profile,
										username: info.username,
										status: info.status
									})
									num++

									if (row.length == 4) {
										newList.push({ key: "selected-diner-row-" + (newList.length), row })
										row = []
									}
								}
							})
						})

						if (row.length > 0) {
							while (row.length < 4) {
								row.push({ key: "selected-diner-" + num })
								num++
							}

							newList.push({ key: "selected-diner-row-" + (newList.length), row })
						}

						setSelecteddiners(newList)
						setNumselecteddiners(numSelecteddiners - 1)
					} else {
						setShowactivediner({ show: true, username: res.username })
					}
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					switch (status) {
						case "activediner":
							setShowunconfirmedorders(true)
					}
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const closeEditTheDiners = () => {
		setOpeneditdiners({ show: false, changes: 0 })
		setSearchedfriends([])
		setNumsearchedfriends(0)
		setSelecteddiners([])
		setNumselecteddiners(0)
	}
	const addFriendsToDining = () => {
		const diners = []

		selectedDiners.forEach(function (info) {
			info.row.forEach(function (friend) {
				if (friend.username) {
					diners.push({ "userid": friend.id.toString(), "status": friend.status == "confirmed" ? "confirmed" : "waiting" })
				}
			})
		})

		let data = { scheduleid, diners, type: "addDiners" }

		addDiners(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					data = { ...data, receiver: res.receiver }
					socket.emit("socket/addDiners", data, () => {
						setTotaldiners(diners.length)
						closeEditTheDiners()
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
  const sendThePayment = () => {
    let data = { scheduleid, userid: userId }
    let getinfo = false // show payment details

    if (!showPaymentdetail.show) { // get payment details first
      getinfo = true
      data = { ...data, getinfo }
    } else {
      const { scheduleid, tip } = showPaymentdetail
      data = { ...data, tip: tip ? tip : 0 }
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
              show: true, 
              cost: cost.toFixed(2), pst: pst.toFixed(2), 
              hst: hst.toFixed(2), fee: fee.toFixed(2), 
              total: total.toFixed(2)
            })
          } else {
            const { index } = showPaymentdetail

            data = { ...data, receiver: res.receiver }
            socket.emit("socket/sendDiningPayment", data, () => {
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
          alert("server error")
        }
      })
  }

	const editTheOrderCallfor = async(orderid) => {
		const data = { scheduleid, orderid }

		editOrderCallfor(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setSelectedcallfor(res.searchedDiners)
					setNumselectedcallfor(res.numSearchedDiners)
					setOrderingitem(res.orderingItem)
					setOpeneditcallfor(true)
					setIteminfo({ ...itemInfo, orderid })
					setOpenrounds(false)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const confirmTheDiningOrder = (orderid, ordererid) => {
		let data = { orderid, ordererid, type: "confirmDiningOrder" }
		const newRounds = [...rounds]

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
						newRounds.forEach(function (round) {
							round.round.forEach(function (orders) {
								orders.orders.forEach(function (order) {
									order.orderers.forEach(function (info) {
										info.row.forEach(function (item) {
											if (order.id == orderid && item.id == ordererid) {
												item.status = "confirmed"
											}
										})
									})
								})
							})
						})

						setRounds(newRounds)
					})
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const updateTheOrderCallfor = async() => {
		let { orderid } = itemInfo
		let callfor = []

		selectedCallfor.forEach(function (info) {
			info.row.forEach(function (diner) {
				if (diner.username) {
					callfor.push({ userid: diner.id.toString(), status: diner.status == "confirmed" ? "confirmed" : "confirmawaits" })
				}
			})
		})

		const data = { scheduleid, orderid, callfor }

		updateOrderCallfor(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					seeTheDiningOrders()
					setOpeneditcallfor(false)
					closeEditTheDiners()
					closeEditTheCallfor()
					setIteminfo({ ...itemInfo, orderid: "" })
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data

					setOrderingitem({ ...orderingItem, errorMsg: errormsg })
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const getDinersList = async(username) => {
		const data = { userid: userId, scheduleid, username }

		searchDiners(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setDiners(res.searchedDiners)
					setNumdiners(res.numSearchedDiners)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const selectDiner = (userid) => {
		let newDiners = [...diners]
		let newSelectedcallfor = [...selectedCallfor]
		let selected = { id: "", key: "", profile: "", username: "" }
		let last_row = null, next_key = null, unfill = false

		if (JSON.stringify(newSelectedcallfor).includes("\"id\":" + userid + ",")) {
			return
		}

		const data = { scheduleid, userid }

		dinerIsSelectable(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { selectable } = res

					newDiners.forEach(function (info) {
						info.row.forEach(function (diner) {
							if (diner.id == userid) {
								selected.id = userid
								selected.profile = diner.profile
								selected.username = diner.username
							}
						})
					})

					if (newSelectedcallfor.length > 0) {
						last_row = newSelectedcallfor[newSelectedcallfor.length - 1].row

						for (k in last_row) {
							if (last_row[k].id) {
								next_key = parseInt(last_row[k].key.split("-").pop()) + 1
							} else {
								unfill = true
								selected.key = "selected-callfor-" + next_key
								last_row[k] = selected
								next_key += 1

								break
							}
						}

						if (unfill) {
							newSelectedcallfor[newSelectedcallfor.length - 1].row = last_row
							setNumselectedcallfor(numSelectedcallfor + 1)
						} else {
							selected.key = "selected-callfor-" + next_key
							newSelectedcallfor.push({
								key: "selected-callfor-row-" + (newSelectedcallfor.length),
								row: [
									selected,
									{ key: "selected-callfor-" + (next_key + 1) },
									{ key: "selected-callfor-" + (next_key + 2) },
									{ key: "selected-callfor-" + (next_key + 3) }
								]
							})
						}

						setNumselectedcallfor(numSelectedcallfor + 1)
					} else {
						selected.key = "selected-callfor-0"
						newSelectedcallfor = [{
							key: "selected-callfor-row-0",
							row: [
								selected,
								{ key: "selected-callfor-1" },
								{ key: "selected-callfor-2" },
								{ key: "selected-callfor-3" }
							]
						}]
						setNumselectedcallfor(1)
					}

					setSelectedcallfor(newSelectedcallfor)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { status, info } = err.response.data
					const { username } = info

					switch (status) {
						case "required":
							setShowpaymentrequired({ show: true, username })

							break
						case "filled":
							setShowunconfirmeddiner({ show: true, username })

							break
						default:
					}
				} else {
					setErrormsg("an error has occurred in server")
				}
			})
	}
	const deselectDiner = (userid) => {
		let list = [...selectedCallfor]
		let last_row = list[list.length - 1].row
		let newList = [], row = [], info, num = 0

		list.forEach(function (listitem) {
			listitem.row.forEach(function (info) {
				if (info.id && info.id != userid) {
					row.push({
						key: "callfor-" + num,
						id: info.id,
						profile: info.profile,
						username: info.username
					})
					num++

					if (row.length == 4) {
						newList.push({ key: "callfor-row-" + (newList.length), row })
						row = []
					}
				}
			})
		})

		if (row.length > 0) {
			while (row.length < 4) {
				row.push({ key: "callfor-" + num })
				num++
			}

			newList.push({ key: "callfor-row-" + (newList.length), row })
		}

		setSelectedcallfor(newList)
		setNumselectedcallfor(numSelectedcallfor - 1)
	}
	const closeEditTheCallfor = () => {
		setOpeneditcallfor(false)
		setDiners([])
		setNumdiners(0)
		setSelectedcallfor([])
		setNumselectedcallfor(0)
	}

	const displayList = info => {
		let { id, image, name, list, listType, left } = info
		let add = name ? true : false

		return (
			<View style={{ marginLeft: left }}>
				{name ?
					<View style={styles.menu}>
						<View style={{ flexDirection: 'row' }}>
							<View style={styles.menuImageHolder}>
								<Image style={styles.menuImage} source={{ uri: logo_url + image }}/>
							</View>
							<Text style={styles.menuName}>{name} (Menu)</Text>
						</View>
						{info.info ? <Text style={styles.menuItemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
						{list.length > 0 && list.map((info, index) => (
							<View key={"list-" + index} style={{ marginBottom: (list.length - 1 == index && info.listType != "list") ? 50 : 0 }}>
								{info.listType == "list" ? 
									displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left + 10 })
									:
									<View style={styles.item}>
										<View style={{ flexDirection: 'row', }}>
											<View style={styles.itemImageHolder}>
												<Image style={styles.itemImage} source={{ uri: logo_url + info.image }}/>
											</View>
											<Text style={styles.menuItemHeader}>{info.name}</Text>
											<Text style={styles.menuItemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text>
											{info.listType == "service" && <Text style={styles.menuItemHeader}>{info.duration}</Text>}
										</View>
										{info.info ? <Text style={styles.itemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
										<View style={styles.menuItemActions}>
											<TouchableOpacity style={styles.menuItemAction} onPress={() => getTheProductInfo(info.id)}>
												<Text style={styles.menuItemActionHeader}>See / Buy</Text>
											</TouchableOpacity>
										</View>
									</View>
								}
							</View>
						))}
					</View>
					:
					list.map((info, index) => (
						<View key={"list-" + index} style={{ marginBottom: (list.length - 1 == index && info.listType != "list") ? 50 : 0 }}>
							{info.listType == "list" ? 
								displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left + 10 })
								:
								<View style={styles.item}>
									<View style={{ flexDirection: 'row', }}>
										<View style={styles.itemImageHolder}>
											<Image style={styles.itemImage} source={{ uri: logo_url + info.image }}/>
										</View>
										<Text style={styles.menuItemHeader}>{info.name}</Text>
										<Text style={styles.menuItemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text>
										{info.listType == "service" && <Text style={styles.menuItemHeader}>{info.duration}</Text>}
									</View>
									{info.info ? <Text style={styles.itemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
									<View style={styles.menuItemActions}>
										<TouchableOpacity style={styles.menuItemAction} onPress={() => getTheProductInfo(info.id)}>
											<Text style={styles.menuItemActionHeader}>See / Buy</Text>
										</TouchableOpacity>
									</View>
								</View>
							}
						</View>
					))
				}
			</View>
		)
	}

	const startWebsocket = () => {
    socket.on("updateOrder", data => {
      if (data.type == "receiveDinersPayments") props.navigation.goBack()
    })
		socket.on("updateDiners", data => {
			if (data.type == "acceptReservationJoining") {
				const newSelectedDiners = [...selectedDiners]

				newSelectedDiners.forEach(function (item) {
					item.row.forEach(function (item) {
						if (item.id == data.userid) {
							item.status = "confirmed"
						}
					})
				})

				setSelecteddiners(newSelectedDiners)
			}
		})
		socket.on("updateRounds", data => {
			if (data.type == "sendOrders") {
        const newRounds = [...rounds]

				if (newRounds.length > 0) {
					newRounds[0].status = "making"

					setRounds(newRounds)
				}
			} else if (data.type == "confirmDiningOrder") {
        const newRounds = [...rounds]
				const { orderid, ordererid } = data

				newRounds.forEach(function (round) {
					round.round.forEach(function (orders) {
						orders.orders.forEach(function (order) {
							order.orderers.forEach(function (info) {
								info.row.forEach(function (item) {
									if (order.id == orderid && item.id == ordererid) {
										item.status = "confirmed"
									}
								})
							})
						})
					})
				})

				setRounds(newRounds)
			} else if (data.type == "cancelDiningOrder") {
        const newRounds = [...rounds]
				const { orderid, ordererid, numCallfor } = data
				let collects = [], callfor = [], row = []

				newRounds.forEach(function (round, roundindex) {
					round.round.forEach(function (orders) {
						orders.orders.forEach(function (order, orderindex) {
							if (numCallfor == 0) {
								if (order.id == orderid) {
									orders.orders.splice(orderindex, 1)

									if (orders.orders.length == 0) {
										newRounds.splice(roundindex, 1)
									}
								}
							} else {
								order.orderers.forEach(function (info) {
									info.row.forEach(function (item) {
										if (item.id != ordererid) {
											collects.push(item)
										}
									})
								})

								collects.forEach(function (collect) {
									row.push(collect)

									if (row.length == 4) {
										callfor.push(row)
										row = []
									}
								})

								if (row.length > 0) {
									callfor.push(row)
								}

								order.orderers = callfor
							}
						})
					})
				})

				setRounds(newRounds)
			} else if (data.type == "serveRound") {
        const newRounds = [...rounds]

        newRounds.forEach(function (item) {
          if (item.id == data.roundid) {
            item.status = "served"
          }
        })

				setRounds(newRounds)
			} else if (data.type == "setOrderPrice") {
        const { price, indexes } = data
        const newRounds = [...rounds]

        newRounds.forEach(function (round, roundIndex) {
          round.round.forEach(function (orders, ordersIndex) {
            orders.orders.forEach(function (order, orderIndex) {
              if (indexes.roundIndex == roundIndex && indexes.ordersIndex == ordersIndex && indexes.orderIndex == orderIndex) {
                order.priceUnset = false
                order.cost = parseFloat(price)
              }
            })
          })
        })

        setRounds(newRounds)
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
		isMounted.current = true

		getTheScheduleInfo()

		return () => isMounted.current = false
	}, [])

	useEffect(() => {
		startWebsocket()

		return () => {
      socket.off("updateOrder")
			socket.off("updateDiners")
			socket.off("updateRounds")
		}
	}, [searchedFriends.length, selectedDiners.length, rounds.length])

	return (
		<SafeAreaView style={styles.order}>
			{loaded ? 
				<View style={styles.box}>
					<View style={styles.headers}>
						<Text style={styles.boxHeader}>
							Order your meals {'\n'} for your {''}
							<Text style={{ fontWeight: 'bold' }}>{timeStr}</Text> 
							{''} feast {'\n'} at <Text style={{ fontWeight: 'bold' }}>{name}</Text>
						</Text>

						<View style={styles.orderActions}>
							<TouchableOpacity style={styles.orderAction} onPress={() => seeTheDiningOrders()}>
								<Text style={styles.orderActionHeader}>See Order(s)</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.orderAction} onPress={() => editTheDiners()}>
								<Text style={styles.orderActionHeader}>{totalDiners == 0 ? 'Add' : 'Edit'} Diner {totalDiners > 0 ? '(' + totalDiners + ')' : ''}</Text>
							</TouchableOpacity>

              {numOrders && numOrders > 0 && (
                <TouchableOpacity style={styles.orderAction} onPress={() => sendThePayment()}>
                  <Text style={styles.orderActionHeader}>Send payment{allowPayment ? " again" : ""}</Text>
                </TouchableOpacity>
              )}
						</View>
					</View>

					<View style={styles.body}>
						{(menuInfos.type && menuInfos.type == "photos") && (
							<View style={styles.menuInputBox}>
								<TextInput style={styles.menuInput} type="text" placeholder="Enter product # or name" onChangeText={(info) => setProductname(info)}/>
								<TouchableOpacity style={styles.menuInputTouch} onPress={() => setIteminfo({ ...itemInfo, show: true, name: productName })}>
									<Text style={styles.menuInputTouchHeader}>Order{'\n'}item</Text>
								</TouchableOpacity>
							</View>
						)}

						<ScrollView style={{ height: '90%', width: '100%' }}>
							{menuInfos.type ? 
								menuInfos.type == "photos" ? 
									menuInfos.items.map(info => (
										info.row.map(item => (
											item.photo ? 
												<View key={item.key} style={styles.menuPhoto}>
													<Image style={{ height: '100%', width: '100%' }} source={{ uri: logo_url + item.photo }}/>
												</View>
											: null
										))
									))
									:
									displayList({ name: "", image: "", list: menuInfos.list, listType: "list", left: 0 })
							: null }
						</ScrollView>
					</View>
				</View>
				:
				<View style={{ alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around' }}>
					<ActivityIndicator color="black" size="large"/>
				</View>
			}

			{itemInfo.show && (
				<Modal>
					<SafeAreaView style={styles.itemInfoBox}>
						<View style={styles.itemInfoHeader}>
							<TouchableOpacity style={styles.itemClose} onPress={() => setIteminfo({ ...itemInfo, show: false, orderid: "" })}>
								<AntDesign name="close" size={20}/>
							</TouchableOpacity>
						</View>
						<ScrollView style={{ height: '90%' }}>
							<View style={{ alignItems: 'center', marginBottom: 20 }}>
								{itemInfo.image ? 
									<View style={styles.imageHolder}>
										<Image source={{ uri: logo_url + itemInfo.image }} style={styles.image}/>
									</View>
								: null }
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
									style={styles.noteInput} multiline textAlignVertical="top" placeholderTextColor="rgba(127, 127, 127, 0.5)" 
									placeholder="Leave a note if you want" maxLength={100} 
									onChangeText={(note) => setIteminfo({ ...itemInfo, note })} value={itemInfo.note} 
									autoCorrect={false} autoCapitalize="none"
								/>
							</View>

							<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
								<View style={{ flexDirection: 'row' }}>
									<Text style={styles.quantityHeader}>Quantity</Text>
									<View style={styles.quantity}>
										<TouchableOpacity style={styles.quantityAction} onPress={() => changeQuantity("-")}>
											<Text style={styles.quantityActionHeader}>-</Text>
										</TouchableOpacity>
										<Text style={styles.quantityHeader}>{itemInfo.quantity}</Text>
										<TouchableOpacity style={styles.quantityAction} onPress={() => changeQuantity("+")}>
											<Text style={styles.quantityActionHeader}>+</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>

							{itemInfo.cost > 0 && <Text style={styles.price}>Cost: $ {(itemInfo.cost).toFixed(2)}</Text>}
							<Text style={styles.errorMsg}>{itemInfo.errorMsg}</Text>

							<View style={styles.itemActions}>
								<View style={{ flexDirection: 'row' }}>
									{itemInfo.orderid ? 
										<TouchableOpacity style={styles.itemAction} onPress={() => updateTheOrder()}>
											<Text style={styles.itemActionHeader}>Update{'\n'}to your order</Text>
										</TouchableOpacity>
										:
										<TouchableOpacity style={styles.itemAction} onPress={() => addOrder()}>
											<Text style={styles.itemActionHeader}>Add{'\n'}to your order</Text>
										</TouchableOpacity>
									}

									{(!itemInfo.orderid && totalDiners > 0) && (
										<TouchableOpacity style={styles.itemAction} onPress={() => addToDinersOrder()}>
											<Text style={styles.itemActionHeader}>Add{'\n'}to a diner's order</Text>
										</TouchableOpacity>
									)}
								</View>
							</View>
						</ScrollView>
					</SafeAreaView>
				</Modal>
			)}
			{openRounds && (
				<Modal>
          <SafeAreaView>
  					<View style={styles.roundsBox}>
  						<View style={styles.roundsHeader}>
  							<TouchableOpacity style={styles.closeRounds} onPress={() => setOpenrounds(false)}>
  								<AntDesign name="close" size={20}/>
  							</TouchableOpacity>

  							<Text style={styles.boxHeader}>Order(s)</Text>
  						</View>
  						{rounds.length > 0 ? 
  							<ScrollView style={styles.roundList}>
  								{rounds.map((round, roundIndex) => (
  									<View style={styles.round} key={round.key}>
  										{round.status == "ordering" ? 
  											<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
  												{seated ? 
  													<View style={{ alignItems: 'center', flexDirection: 'row' }}>
  														<Text>Ready ?</Text>
  														<TouchableOpacity style={styles.roundTouch} onPress={() => sendTheOrders()}>
  															<Text>Send to Kitchen</Text>
  														</TouchableOpacity>
  													</View>
  													:
  													<View style={{ alignItems: 'center' }}>
  														<Text style={{ marginVertical: 5 }}>You need to be seated first to submit your order(s)</Text>
  														<View style={styles.roundTouchDisabled} disabled={true}>
  															<Text>Send to Kitchen</Text>
  														</View>
  													</View>
  												}
  											</View>
  											:
  											<Text style={styles.roundHeader}>This round {round.status == 'making' ? 'is already sent' : 'has been served'}</Text>
  										}
  										{round.round.map((orders, ordersIndex) => (
  											orders.orders.map((order, orderIndex) => (
  												<View style={styles.roundOrder} key={order.key}>
  													<View style={{ alignItems: 'center' }}>
  														<View style={styles.orderItem} key={order.key}>
  															<Text style={styles.orderInfo}>Orderer: {order.orderer.username}</Text>

  															{order.image && (
  																<View style={styles.orderItemImageHolder}>
  																	<Image source={{ uri: logo_url + order.image }} style={styles.orderItemImage}/>
  																</View>
  															)}

  															<View style={styles.orderItemInfos}>
  																<Text style={styles.orderItemInfo}>{order.name}</Text>

  																{order.options.map((option, infoindex) => (
  																	<Text key={option.key} style={styles.itemInfo}>
  																		<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
  																		{option.selected}
  																		{option.type == 'percentage' && '%'}
  																	</Text>
  																))}

  																{order.others.map((other, otherindex) => (
  																	other.selected ? 
  																		<Text key={other.key} style={styles.itemInfo}>
  																			<Text style={{ fontWeight: 'bold' }}>{other.name}: </Text>
  																			<Text>{other.input}</Text>
  																		</Text>
  																	: null
  																))}

  																{order.sizes.map((size, sizeindex) => (
  																	size.selected ? 
  																		<Text key={size.key} style={styles.itemInfo}>
  																			<Text style={{ fontWeight: 'bold' }}>Size: </Text>
  																			<Text>{size.name}</Text>
  																		</Text>
  																	: null
  																))}

  																<Text style={styles.orderItemInfo}><Text style={{ fontWeight: 'bold' }}>Quantity: </Text>{order.quantity}</Text>
  																<Text style={styles.orderItemInfo}>
                                    <Text style={{ fontWeight: 'bold' }}>Cost: 
                                      {order.priceUnset == true ? 
                                        <Text style={{ color: 'grey', fontSize: wsize(4), fontStyle: 'italic' }}>restaurant will respond</Text> 
                                        : 
                                        '$ ' + order.cost.toFixed(2)
                                      }
                                    </Text>
                                  </Text>
  															</View>
  														</View>
  													</View>

  													{(round.status == "ordering" && order.orderer.id == userId) && (
  														<View style={{ alignItems: 'center' }}>
  															<View style={{ flexDirection: 'row' }}>
  																<TouchableOpacity style={styles.orderItemAction} onPress={() => editTheOrder(order.id)}>
  																	<Text style={styles.orderItemActionHeader}>Edit Order</Text>
  																</TouchableOpacity>
  																<TouchableOpacity style={styles.orderItemAction} onPress={() => deleteTheOrder(order.id)}>
  																	<Text style={styles.orderItemActionHeader}>Delete Order</Text>
  																</TouchableOpacity>
  															</View>
  														</View>
  													)}

  													<View style={{ alignItems: 'center', marginVertical: 10 }}>
  														<View style={styles.orderersEdit}>
  															<Text style={styles.orderersEditHeader}>Calling for {order.numorderers} {order.numorderers > 1 ? 'people' : 'person'}</Text>
  															{(round.status == "ordering" && order.orderer.id == userId) && (
  																<TouchableOpacity style={styles.orderersEditTouch} onPress={() => editTheOrderCallfor(order.id)}>
  																	<Text style={styles.orderersEditTouchHeader}>{order.orderers.length > 0 ? 'Edit' : 'Add'}</Text>
  																</TouchableOpacity>
  															)}
  														</View>
  													</View>

  													{order.orderers.length > 0 ? 
  														order.orderers.map((info, infoIndex) => (
  															<View style={styles.orderCallfor} key={info.key}>
  																{info.row.map((orderer, ordererIndex) => (
  																	orderer.username ?
  																		<View style={styles.orderer} key={orderer.key}>
  																			<View style={styles.ordererProfile}>
  																				<Image source={{ uri: logo_url + orderer.profile }} style={{ height: 50, width: 50 }}/>
  																			</View>
  																			<Text style={styles.ordererUsername}>{orderer.username}</Text>

  																			{round.status == "ordering" ?
  																				userId == orderer.id ? 
  																					orderer.status == "confirmawaits" ?
  																						<TouchableOpacity style={styles.ordererConfirm} onPress={() => confirmTheDiningOrder(order.id, orderer.id)}>
  																							<Text style={styles.ordererConfirmHeader}>Confirm Order</Text>
  																						</TouchableOpacity>
  																						:
  																						<Text style={styles.ordererStatus}>confirmed</Text>
  																					:
  																					orderer.status == "confirmawaits" ? 
  																						<Text style={styles.ordererStatus}>confirm awaits</Text>
  																						:
  																						<Text style={styles.ordererStatus}>confirmed</Text>
  																				:
  																				null
  																			}
  																		</View>
  																		:
  																		<View style={styles.orderer} key={orderer.key}></View>
  																))}
  															</View>
  														))
  														:
  														<Text style={styles.orderCallforHeader}>{order.orderer.id == userId ? "Your" : "Self"} order</Text>
  													}
  												</View>
  											))
  										))}
  									</View>
  								))}
  							</ScrollView>
  							:
  							<View style={{ alignItems: 'center', flexDirection: 'column', height: '90%', justifyContent: 'space-around' }}>
  								<Text>No rounds yet</Text>
  							</View>
  						}
  					</View>
          </SafeAreaView>

					{deleteRequestInfo.show && (
						<Modal transparent={true}>
							<SafeAreaView style={styles.deleteOrderContainer}>
								<View style={styles.deleteOrderBox}>
									<Text style={styles.deleteOrderBoxHeader}>Delete order confirmation</Text>

									<View style={styles.deleteOrderImageHolder}>
										<Image source={{ uri: logo_url + deleteRequestInfo.image }} style={styles.deleteOrderImage}/>
									</View>
									<Text style={styles.deleteOrderName}>{deleteRequestInfo.name}</Text>

									<View>
										{deleteRequestInfo.options.map((option, infoindex) => (
											<Text key={option.key} style={styles.itemInfo}>
												<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
												{option.selected}
												{option.type == 'percentage' && '%'}
											</Text>
										))}

										{deleteRequestInfo.others.map((other, otherindex) => (
											other.selected ? 
												<Text key={other.key} style={styles.itemInfo}>
													<Text style={{ fontWeight: 'bold' }}>{other.name}: </Text>
													<Text>{other.input}</Text>
													<Text> ($ {other.price.toFixed(2)})</Text>
												</Text>
											: null
										))}

										{deleteRequestInfo.sizes.map((size, sizeindex) => (
											size.selected ? 
												<Text key={size.key} style={styles.itemInfo}>
													<Text style={{ fontWeight: 'bold' }}>Size: </Text>
													<Text>{size.name}</Text>
												</Text>
											: null
										))}
									</View>

									<View>
										<Text style={styles.deleteOrderQuantity}><Text style={{ fontWeight: 'bold' }}>Quantity: </Text>{deleteRequestInfo.quantity}</Text>
										<Text style={styles.deleteOrderPrice}><Text style={{ fontWeight: 'bold' }}>Cost: </Text>$ {(deleteRequestInfo.cost).toFixed(2)}</Text>
									</View>

									{deleteRequestInfo.numorderers > 0 && <Text style={styles.deleteOrderOrderers}>Calling for {deleteRequestInfo.numorderers} {deleteRequestInfo.numorderers == 1 ? 'person' : 'people'}</Text>}

									<Text style={styles.deleteOrderHeader}>Are you sure you want to delete this order</Text>

									<View style={styles.deleteOrderActions}>
										<TouchableOpacity style={styles.deleteOrderAction} onPress={() => setDeleterequestinfo({ ...deleteRequestInfo, show: false })}>
											<Text style={styles.deleteOrderActionHeader}>Cancel</Text>
										</TouchableOpacity>
										<TouchableOpacity style={styles.deleteOrderAction} onPress={() => deleteTheOrder()}>
											<Text style={styles.deleteOrderActionHeader}>Yes</Text>
										</TouchableOpacity>
									</View>
								</View>
							</SafeAreaView>
						</Modal>
					)}
					{showUnconfirmedorders && (
						<Modal transparent={true}>
							<SafeAreaView style={styles.errorBox}>
                <View style={styles.errorContainer}>
                  <Text style={styles.errorHeader}>
                    There is one or more unconfirmed orders.
                    {'\n\n'}
                    Please tell your diners to confirm their order before it
                    {'\n'}
                    can be sent to the kitchen
                  </Text>

                  <View style={styles.errorActions}>
                    <TouchableOpacity style={styles.errorAction} onPress={() => setShowunconfirmedorders(false)}>
                      <Text style={styles.errorActionHeader}>Ok</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
						</Modal>
					)}
				</Modal>
			)}
			{openEditdiners.show && (
				<Modal>
          <SafeAreaView>
  					<View style={styles.usersList}>
  						<View style={styles.userNameContainer}>
  							<TextInput 
  								style={styles.userNameInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Search friends to add" 
  								onChangeText={(username) => getFriendsList(username)} autoCorrect={false} autoCapitalize="none"
  							/>
  						</View>

  						<View style={styles.usersListContainer}>
  							<View style={styles.usersListSearched}>
  								<Text style={styles.usersHeader}>{numSearchedfriends} Searched Friend(s)</Text>

  								<FlatList
  									data={searchedFriends}
  									renderItem={({ item, index }) => 
  										<View key={item.key} style={styles.userRow}>
  											{item.row.map(friend => (
  												friend.username ? 
  													<TouchableOpacity key={friend.key} style={styles.user} onPress={() => selectFriend(friend.id)}>
  														<View style={styles.userProfileHolder}>
  															<Image source={{ uri: logo_url + friend.profile }} style={{ height: wsize(15), width: wsize(15) }}/>
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
  						
  							<View style={styles.usersListSelected}>
  								{numSelecteddiners > 0 && (
  									<>
  										<Text style={styles.selectedUsersHeader}>{numSelecteddiners} Selected Diner(s)</Text>

  										{openEditdiners.changes > 0 && (
  											<TouchableOpacity onPress={() => editTheDiners()}>
  												<Text>Refresh {openEditdiners.changes > 1 ? "(" + openEditdiners.changes + ")" : null}</Text>
  											</TouchableOpacity>
  										)}

  										<FlatList
  											data={selectedDiners}
  											renderItem={({ item, index }) => 
  												<View key={item.key} style={styles.userRow}>
  													{item.row.map(friend => (
  														friend.username ? 
  															<View key={friend.key} style={styles.user}>
  																<TouchableOpacity style={styles.userDelete} onPress={() => deselectTheFriend(friend.id)}>
  																	<AntDesign name="closecircleo" size={15}/>
  																</TouchableOpacity>
  																<View style={styles.userProfileHolder}>
  																	<Image source={{ uri: logo_url + friend.profile }} style={{ height: wsize(15), width: wsize(15) }}/>
  																</View>
  																<Text style={styles.userName}>{friend.username}</Text>
  																{friend.status && <Text style={styles.userStatus}>{friend.status}</Text>}
  																{(userId == friend.id) && <Text style={styles.userStatus}>(you)</Text>}
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
  							<View style={styles.locationImageHolder}>
  								<Image style={{ height: 80, width: 80 }} source={{ uri: logo_url + locationInfo.logo }}/>
  							</View>
  							<Text style={styles.locationName}>{locationInfo.name}</Text>
  						</View>

  						<View style={styles.usersListActionContainer}>
  							<Text style={styles.errorMsg}>{dinersErrormsg}</Text>

  							<View style={styles.usersListActions}>
  								<TouchableOpacity style={styles.usersListAction} onPress={() => closeEditTheDiners()}>
  									<Text style={styles.usersListActionHeader}>Close</Text>
  								</TouchableOpacity>
  								<TouchableOpacity style={styles.usersListAction} onPress={() => addFriendsToDining()}>
  									<Text style={styles.usersListActionHeader}>Done</Text>
  								</TouchableOpacity>
  							</View>
  						</View>
  					</View>

  					{showActiveDiner.show && (
  						<Modal transparent={true}>
  							<View style={styles.errorBox}>
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorHeader}>
                      {showActiveDiner.username} has made some orders
                      {'\n\n'}
                      Therefore cannot be removed as diner
                    </Text>

                    <View style={styles.errorActions}>
                      <TouchableOpacity style={styles.errorAction} onPress={() => setShowactivediner({ show: false, username: "" })}>
                        <Text style={styles.errorActionHeader}>Close</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
  						</Modal>
  					)}
          </SafeAreaView>
				</Modal>
			)}
			{openEditcallfor && (
				<Modal>
          <SafeAreaView>
  					<View style={styles.usersList}>
  						<View style={styles.userNameContainer}>
  							<TextInput 
  								style={styles.userNameInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Search diner to order for" 
  								onChangeText={(username) => getDinersList(username)} autoCorrect={false} autoCapitalize="none"
  							/>
  						</View>

  						<View style={styles.usersListContainer}>
  							<View style={styles.usersListSearched}>
  								<Text style={styles.usersHeader}>{numDiners} Searched Diner(s)</Text>

  								<FlatList
  									data={diners}
  									renderItem={({ item, index }) => 
  										<View key={item.key} style={styles.userRow}>
  											{item.row.map(diner => (
  												diner.username ? 
  													<TouchableOpacity key={diner.key} style={styles.user} onPress={() => selectDiner(diner.id)}>
  														<View style={styles.userProfileHolder}>
  															<Image source={{ uri: logo_url + diner.profile }} style={{ height: wsize(15), width: wsize(15) }}/>
  														</View>
  														<Text style={styles.userName}>{diner.username}</Text>
  													</TouchableOpacity>
  													:
  													<View key={diner.key} style={styles.user}></View>
  											))}
  										</View>
  									}
  								/>
  							</View>

  							<View style={styles.usersListSelected}>
  								{selectedCallfor.length > 0 && (
  									<>
  										<Text style={styles.selectedUsersHeader}>{numSelectedcallfor} Selected Diner(s) to order this item</Text>

  										<FlatList
  											data={selectedCallfor}
  											renderItem={({ item, index }) => 
  												<View key={item.key} style={styles.userRow}>
  													{item.row.map(diner => (
  														diner.username ? 
  															<View key={diner.key} style={styles.user}>
  																<TouchableOpacity style={styles.userDelete} onPress={() => deselectDiner(diner.id)}>
  																	<AntDesign name="closecircleo" size={15}/>
  																</TouchableOpacity>
  																<View style={styles.userProfileHolder}>
  																	<Image source={{ uri: logo_url + diner.profile }} style={{ height: wsize(15), width: wsize(15) }}/>
  																</View>
  																<Text style={styles.userName}>{diner.username}</Text>
  															</View>
  															:
  															<View key={diner.key} style={styles.user}></View>
  													))}
  												</View>
  											}
  										/>
  									</>
  								)}
  							</View>
  						</View>

  						<View style={styles.itemContainer}>
                {orderingItem.image ? 
                  <View style={styles.orderingItemImageHolder}>
                    <Image style={{ height: 100, width: 100 }} source={{ uri: logo_url + orderingItem.image }}/>
                  </View>
                : null }

  							<View style={styles.itemInfos}>
  								<Text style={styles.orderingItemName}>{orderingItem.name}</Text>

  								{orderingItem.options.map((option, infoindex) => (
  									<Text key={option.key} style={styles.itemInfo}>
  										<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
  										{option.selected}
  										{option.type == 'percentage' && '%'}
  									</Text>
  								))}

  								{orderingItem.others.map((other, otherindex) => (
  									other.selected ? 
  										<Text key={other.key} style={styles.itemInfo}>
  											<Text style={{ fontWeight: 'bold' }}>{other.name}: </Text>
  											<Text>{other.input}</Text>
  										</Text>
  									: null
  								))}

  								{orderingItem.sizes.map((size, sizeindex) => (
  									size.selected ? 
  										<Text key={size.key} style={styles.itemInfo}>
  											<Text style={{ fontWeight: 'bold' }}>Size: </Text>
  											<Text>{size.name}</Text>
  										</Text>
  									: null
  								))}
  							</View>
  							<View>
  								<Text style={styles.itemHeader}><Text style={{ fontWeight: 'bold' }}>Quantity:</Text> {orderingItem.quantity}</Text>
  								<Text style={styles.itemHeader}><Text style={{ fontWeight: 'bold' }}>Cost:</Text> $ {orderingItem.cost}</Text>
  							</View>
  						</View>

  						<View style={styles.usersListActionContainer}>
  							<Text style={styles.errorMsg}>{orderingItem.errorMsg}</Text>

  							<View style={styles.usersListActions}>
  								<TouchableOpacity style={styles.usersListAction} onPress={() => closeEditTheCallfor()}>
  									<Text style={styles.usersListActionHeader}>Close</Text>
  								</TouchableOpacity>
  								{itemInfo.orderid ? 
  									<TouchableOpacity style={styles.usersListAction} onPress={() => updateTheOrderCallfor()}>
  										<Text style={styles.usersListActionHeader}>Update</Text>
  									</TouchableOpacity>
  									:
  									<TouchableOpacity style={styles.usersListAction} onPress={() => addOrder()}>
  										<Text style={styles.usersListActionHeader}>Add to Order</Text>
  									</TouchableOpacity>
  								}
  							</View>
  						</View>
  					</View>
          </SafeAreaView>

					{showPaymentRequired.show && (
						<Modal transparent={true}>
							<SafeAreaView style={styles.errorBox}>
                <View style={styles.errorContainer}>
                  <Text style={styles.errorHeader}>
                    {showPaymentRequired.username} hasn't provided a payment method yet.
                  </Text>

                  <View style={styles.errorActions}>
                    <TouchableOpacity style={styles.errorAction} onPress={() => setShowpaymentrequired({ show: false, username: "" })}>
                      <Text style={styles.errorActionHeader}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
						</Modal>
					)}

					{showUnconfirmeddiner.show && (
						<Modal transparent={true}>
							<SafeAreaView style={styles.errorBox}>
                <View style={styles.errorContainer}>
                  <Text style={styles.errorHeader}>
                    {showUnconfirmeddiner.username} hasn't accepted the reservation.
                    {'\n\n'}
                    Please tell {showUnconfirmeddiner.username} to accept it so that you
                    can continue your order
                  </Text>

                  <View style={styles.errorActions}>
                    <TouchableOpacity style={styles.errorAction} onPress={() => setShowunconfirmeddiner({ show: false, username: "" })}>
                      <Text style={styles.errorActionHeader}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
						</Modal>
					)}
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

							<ActivityIndicator color="black" size="large"/>
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

                    {showPaymentdetail.tip > 0 && '\nTip amount: $' + parseFloat(showPaymentdetail.tip).toFixed(2)}

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
                        {showPaymentdetail.tip > 0 ? 'Change' : 'Give'}
                        {' '}tip
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.popAction, { opacity: showPaymentdetail.loading ? 0.3 : 1 }]} disabled={showPaymentdetail.loading} onPress={() => sendThePayment()}>
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
                            onChangeText={(tip) => setShowpaymentdetail({ ...showPaymentdetail, tip: tip ? tip : 0 })}
                            placeholder="example: 5"
                            placeholderTextColor="grey"
                            value={(showPaymentdetail.tip > 0) ? showPaymentdetail.tip.toString() : ""}
                          />
                        </View>

                        <View style={styles.popActions}>
                          <TouchableOpacity style={styles.popAction} onPress={() => {
                            let tip = 0.00

                            tip = parseFloat(showPaymentdetail.tip)

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
      {showDiningPaymentRequired && (
        <Modal transparent={true}>
          <SafeAreaView style={styles.hiddenBox}>
            <View style={styles.popBox}>
              <View style={styles.popContainer}>
                <Text style={styles.popHeader}>
                  You need to provide a credit card to continue
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
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	order: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	headers: { alignItems: 'center', flexDirection: 'column', height: '20%', justifyContent: 'space-around' },
	boxHeader: { fontSize: wsize(5), textAlign: 'center' },

	orderActions: { flexDirection: 'row', justifyContent: 'space-around' },
	orderAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: wsize(30) },
	orderActionHeader: { textAlign: 'center' },

	body: { height: '80%' },

	// menu
	menuInputBox: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 5, marginHorizontal: 10 },
	menuInput: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), padding: 5, width: '70%' },
	menuInputTouch: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), marginLeft: 2, padding: 5, width: '30%' },
	menuInputTouchHeader: { textAlign: 'center' },
	menuRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 5 },
	menuPhoto: { height, margin: width * 0.025, width: width * 0.95 },

	menu: { backgroundColor: 'white', borderTopLeftRadius: 3, borderTopRightRadius: 3, padding: 3, width: '98%' },
	menuImageHolder: { borderRadius: wsize(10) / 2, height: wsize(10), overflow: 'hidden', width: wsize(10) },
	menuImage: { height: wsize(10), width: wsize(10) },
	menuName: { fontSize: wsize(5), fontWeight: 'bold', marginLeft: 5, marginTop: wsize(4) / 2, textDecorationLine: 'underline' },
	menuItemActions: { flexDirection: 'row', marginTop: 0 },
	menuItemAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5 },
	menuItemActionHeader: { fontSize: wsize(4), textAlign: 'center' },
	item: { backgroundColor: 'white', paddingHorizontal: 3, paddingBottom: 30, width: '98%' },
	itemImageHolder: { borderRadius: wsize(10) / 2, height: wsize(10), margin: 5, overflow: 'hidden', width: wsize(10) },
	itemImage: { height: wsize(10), width: wsize(10) },
	menuItemHeader: { fontSize: wsize(5), fontWeight: 'bold', marginRight: 20, paddingTop: wsize(4), textDecorationStyle: 'solid' },
	menuItemInfo: { fontSize: wsize(5), marginLeft: 10, marginVertical: 10 },

	// hidden boxes
	row: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10, width: '100%' },

	// item info
	itemInfoBox: { flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	itemInfoHeader: { alignItems: 'center', flexDirection: 'column', height: '10%', justifyContent: 'space-around' },
	itemClose: { alignItems: 'center', borderRadius: 15, borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', height: 28, justifyContent: 'space-around', marginVertical: 10, padding: 2 },
	imageHolder: { borderRadius: 100, height: 200, overflow: 'hidden', width: 200 },
	image: { height: 200, width: 200 },
	boxItemHeader: { fontFamily: 'appFont', fontSize: wsize(7), fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	boxItemHeaderInfo: {  fontSize: wsize(4), fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },

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
	other: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 5, width: '100%' },
	otherName: { fontSize: wsize(5), fontWeight: 'bold' },
	otherInput: { fontSize: wsize(5) },
	otherPrice: { margin: 5 },
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
	noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(5), height: 100, padding: 5, width: '80%' },

	// quantity
	quantity: { flexDirection: 'row', justifyContent: 'space-around' },
	quantityAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, marginHorizontal: 10, paddingTop: 8, width: 35 },
	quantityHeader: { fontSize: wsize(5), fontWeight: 'bold', padding: 5 },

	price: { fontSize: wsize(5), fontWeight: 'bold', marginTop: 20, textAlign: 'center' },

	itemActions: { flexDirection: 'row', justifyContent: 'space-around' },
	itemAction: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, marginVertical: 30, padding: 10 },
	itemActionHeader: { fontSize: wsize(4), textAlign: 'center' },

	// rounds
	roundsBox: { height: '100%', width: '100%' },
	roundsHeader: { alignItems: 'center', flexDirection: 'column', height: '15%' },
	closeRounds: { alignItems: 'center', borderRadius: 15, borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', height: 28, justifyContent: 'space-around', marginVertical: 10, padding: 2 },
	roundList: { height: '85%' },
	roundTouch: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5, width: 120 },
	roundTouchDisabled: { alignItems: 'center', backgroundColor: 'grey', borderColor: 'grey', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5, width: 120 },
	roundTouchHeader: {  },
	round: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
	roundHeader: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
	roundOrder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, margin: 5 },
	orderItem: { alignItems: 'center', marginTop: 20 },
	orderInfo: { fontSize: wsize(5), fontWeight: 'bold', marginBottom: 20 },
	orderItemImageHolder: { borderRadius: orderImageSize / 2, height: orderImageSize, overflow: 'hidden', width: orderImageSize },
	orderItemImage: { height: orderImageSize, width: orderImageSize },
	orderItemInfos: { flexDirection: 'column', height: 100, justifyContent: 'space-between' },
	orderItemInfo: { fontSize: wsize(5), fontWeight: 'bold', textAlign: 'center' },
	orderItemActions: { flexDirection: 'row', justifyContent: 'space-around' },
	orderItemAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 110 },
	orderItemActionHeader: { fontSize: 13, textAlign: 'center' },
	orderersEdit: { flexDirection: 'row' },
	orderersEditHeader: { fontSize: wsize(5), fontWeight: 'bold', marginRight: 10, textAlign: 'center' },
	orderersEditTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	orderersEditTouchHeader: { },
	orderCallfor: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, width: '100%' },
	orderCallforHeader: { fontSize: wsize(5), fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
	orderer: { alignItems: 'center', height: 80, marginHorizontal: 10, width: (width / 4) - 30 },
	ordererProfile: { borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	ordererUsername: { textAlign: 'center' },
	ordererConfirm: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 3, width: 70 },
	ordererConfirmHeader: { fontSize: wsize(2), textAlign: 'center' },
	ordererStatus: { fontSize: wsize(2), textAlign: 'center' },

	// delete order
	deleteOrderContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	deleteOrderBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', padding: 10, width: '80%' },
	deleteOrderBoxHeader: { fontSize: wsize(5) },
	deleteOrderImageHolder: { borderRadius: 40, height: 80, overflow: 'hidden', width: 80 },
	deleteOrderImage: { height: 80, width: 80 },
	deleteOrderName: { fontWeight: 'bold' },
	deleteOrderQuantity: {  },
	deleteOrderPrice: {  },
	deleteOrderOrderers: { fontWeight: 'bold' },
	deleteOrderHeader: { fontSize: wsize(4), paddingHorizontal: 10, textAlign: 'center' },
	deleteOrderActions: { flexDirection: 'row', justifyContent: 'space-around' },
	deleteOrderAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: 70 },
	deleteOrderActionHeader: { textAlign: 'center' },

	// users list
	usersList: { flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	userName: { height: '10%' },
	userNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, marginHorizontal: 20, padding: 10 },
	usersListContainer: { flexDirection: 'column', height: '60%', justifyContent: 'space-between' },
	usersListSearched: { height: '50%', overflow: 'hidden' },
	usersListSelected: { height: '50%', overflow: 'hidden' },
	selectedUsersHeader: { fontWeight: 'bold', textAlign: 'center' },
	usersHeader: { fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
	userRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
	user: { alignItems: 'center', width: wsize(20) },
	userDisabled: { alignItems: 'center', marginHorizontal: 5, opacity: 0.3, width: wsize(20) },
	userDelete: { marginBottom: -5, marginLeft: wsize(15) },
	userProfileHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: wsize(15) / 2, height: wsize(15), overflow: 'hidden', width: wsize(15) },
	userName: { fontSize: wsize(3), fontWeight: 'bold', textAlign: 'center' },
	userStatus: { fontSize: wsize(3) },
	itemContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 10, flexDirection: 'row', height: '20%', justifyContent: 'space-between', marginHorizontal: 10, padding: 10 },
	orderingItemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	orderingItemName: { fontWeight: 'bold', marginBottom: 20 },
	itemInfo: { fontSize: wsize(4), flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
	itemHeader: { fontSize: wsize(4) },
	usersListActionContainer: { alignItems: 'center', height: '10%' },
	locationImageHolder: { borderRadius: 40, height: 80, overflow: 'hidden', width: 80 },
	locationName: { fontSize: wsize(5), marginVertical: 30, textAlign: 'center' },
	errorMsg: { color: 'darkred', fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },
	usersListActions: { flexDirection: 'row', justifyContent: 'space-around' },
	usersListAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 100 },
	usersListActionHeader: { fontSize: wsize(5), textAlign: 'center' },

	errorBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	errorContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	errorHeader: { fontFamily: 'appFont', fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	errorActions: { flexDirection: 'row', justifyContent: 'space-around' },
	errorAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	errorActionHeader: { },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
	disabledContainer: { alignItems: 'center', width: '100%' },
	disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
	disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },
	disabledCloseHeader: {  },

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
})
