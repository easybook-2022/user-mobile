import React, { useState, useEffect, useRef } from 'react'
import { 
	ActivityIndicator, Dimensions, ScrollView, View, FlatList, 
	Text, TextInput, Image, TouchableOpacity, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { socket, logo_url } from '../../../assets/info'
import { searchFriends, searchDiners } from '../../apis/users'
import { getLocationProfile } from '../../apis/locations'
import { getMenus } from '../../apis/menus'
import { getProducts, getProductInfo } from '../../apis/products'
import { getScheduleInfo, addItemtoorder, seeDiningOrders, editDiners, sendOrders, editOrder, deleteOrder, updateOrder, addDiners, editOrderCallfor, dinerIsRemovable, dinerIsSelectable, confirmDiningOrder, updateOrderCallfor } from '../../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const itemSize = (width / 2) - 50
const imageSize = 100
const orderImageSize = 130

const fsize = p => {
	return width * p
}

export default function order(props) {
	const { locationid, scheduleid } = props.route.params

	const [userId, setUserid] = useState(null)
	const [timeStr, setTimestr] = useState('')
	const [name, setName] = useState('')
	const [totalDiners, setTotaldiners] = useState(0)
	const [seated, setSeated] = useState(false)
	const [menuId, setMenuid] = useState('')
	const [menuName, setMenuname] = useState('')
	const [menuInfo, setMenuinfo] = useState('')

	const [itemInfo, setIteminfo] = useState({ 
		show: false, productid: "", orderid: "", name: "", info: "", note: "", 
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

	const [showMenus, setShowmenus] = useState(true)
	const [menus, setMenus] = useState([])

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
					setMenus(res.menus)
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
				userid: userId, scheduleid, productid, quantity, 
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
					<View style={style.menu}>
						<View style={{ flexDirection: 'row' }}>
							<View style={style.menuImageHolder}>
								<Image style={style.menuImage} source={{ uri: logo_url + image }}/>
							</View>
							<Text style={style.menuName}>{name} (Menu)</Text>
						</View>
						{info.info ? <Text style={style.menuItemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
						{list.length > 0 && list.map((info, index) => (
							<View key={"list-" + index} style={{ marginBottom: (list.length - 1 == index && info.listType != "list") ? 50 : 0 }}>
								{info.listType == "list" ? 
									displayList({ id: info.id, name: info.name, image: info.image, list: info.list, listType: info.listType, left: left + 10 })
									:
									<View style={style.item}>
										<View style={{ flexDirection: 'row', }}>
											<View style={style.itemImageHolder}>
												<Image style={style.itemImage} source={{ uri: logo_url + info.image }}/>
											</View>
											<Text style={style.menuItemHeader}>{info.name}</Text>
											<Text style={style.menuItemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text>
											{info.listType == "service" && <Text style={style.menuItemHeader}>{info.duration}</Text>}
										</View>
										{info.info ? <Text style={style.itemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
										<View style={style.menuItemActions}>
											<TouchableOpacity style={style.menuItemAction} onPress={() => getTheProductInfo(info.id)}>
												<Text style={style.menuItemActionHeader}>See / Buy</Text>
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
								<View style={style.item}>
									<View style={{ flexDirection: 'row', }}>
										<View style={style.itemImageHolder}>
											<Image style={style.itemImage} source={{ uri: logo_url + info.image }}/>
										</View>
										<Text style={style.menuItemHeader}>{info.name}</Text>
										<Text style={style.menuItemHeader}>{info.price ? '$' + info.price : info.sizes.length + ' size(s)'}</Text>
										{info.listType == "service" && <Text style={style.menuItemHeader}>{info.duration}</Text>}
									</View>
									{info.info ? <Text style={style.itemInfo}><Text style={{ fontWeight: 'bold' }}>More Info</Text>: {info.info}</Text> : null}
									<View style={style.menuItemActions}>
										<TouchableOpacity style={style.menuItemAction} onPress={() => getTheProductInfo(info.id)}>
											<Text style={style.menuItemActionHeader}>See / Buy</Text>
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
			const newRounds = [...rounds]

			if (data.type == "sendOrders") {
				if (newRounds.length > 0) {
					newRounds[0].status = "making"

					setRounds(newRounds)
				}
			} else if (data.type == "confirmDiningOrder") {
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
			} else if (data.type == "deliverRound") {
				setRounds(newRounds.filter(item => {
					if (item.id == data.roundid) {
						return item.status = "served"
					} else {
						return item
					}
				}))
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
			socket.off("updateDiners")
			socket.off("updateRounds")
		}
	}, [searchedFriends.length, selectedDiners.length, rounds.length])

	return (
		<View style={style.order}>
			{loaded ? 
				<View style={style.box}>
					<View style={style.headers}>
						<Text style={style.boxHeader}>
							Order your meals {'\n'} for your {''}
							<Text style={{ fontWeight: 'bold' }}>{timeStr}</Text> 
							{''} feast {'\n'} at <Text style={{ fontWeight: 'bold' }}>{name}</Text>
						</Text>

						<View style={style.orderActions}>
							<TouchableOpacity style={style.orderAction} onPress={() => seeTheDiningOrders()}>
								<Text style={style.orderActionHeader}>See Order(s)</Text>
							</TouchableOpacity>
							<TouchableOpacity style={style.orderAction} onPress={() => editTheDiners()}>
								<Text style={style.orderActionHeader}>{totalDiners == 0 ? 'Add' : 'Edit'} Diner {totalDiners > 0 ? '(' + totalDiners + ')' : ''}</Text>
							</TouchableOpacity>
						</View>
					</View>

					<View style={style.body}>
						<ScrollView style={{ height: '100%' }}>
							{displayList({ name: "", list: menus, listType: "list", left: 0 })}
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
					<View style={style.itemInfoBox}>
						<View style={style.itemInfoHeader}>
							<TouchableOpacity style={style.itemClose} onPress={() => setIteminfo({ ...itemInfo, show: false, orderid: "" })}>
								<AntDesign name="close" size={20}/>
							</TouchableOpacity>
						</View>
						<ScrollView style={{ height: '90%' }}>
							<View style={{ alignItems: 'center', marginBottom: 20 }}>
								<View style={style.imageHolder}>
									<Image source={{ uri: logo_url + itemInfo.image }} style={style.image}/>
								</View>
							</View>
							<Text style={style.boxItemHeader}>{itemInfo.name}</Text>
							<Text style={style.boxItemHeaderInfo}>{itemInfo.info}</Text>

							{itemInfo.options.map((option, index) => (
								<View key={option.key} style={{ alignItems: 'center' }}>
									<View style={style.info}>
										<Text style={style.infoHeader}>{option.header}:</Text>

										{option.type == "amount" && (
											<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
												<View style={style.amount}>
													<TouchableOpacity style={style.amountAction} onPress={() => changeAmount(index, "-")}>
														<Text style={style.amountActionHeader}>-</Text>
													</TouchableOpacity>
													<Text style={style.amountHeader}>{option.selected}</Text>
													<TouchableOpacity style={style.amountAction} onPress={() => changeAmount(index, "+")}>
														<Text style={style.amountActionHeader}>+</Text>
													</TouchableOpacity>
												</View>
											</View>
										)}

										{option.type == "percentage" && (
											<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
												<View style={style.percentage}>
													<TouchableOpacity style={style.percentageAction} onPress={() => changePercentage(index, "-")}>
														<Text style={style.percentageActionHeader}>-</Text>
													</TouchableOpacity>
													<Text style={style.percentageHeader}>{option.selected}%</Text>
													<TouchableOpacity style={style.percentageAction} onPress={() => changePercentage(index, "+")}>
														<Text style={style.percentageActionHeader}>+</Text>
													</TouchableOpacity>
												</View>
											</View>
										)}
									</View>
								</View>
							))}

							{itemInfo.others.length > 0 && (
								<View style={style.othersBox}>
									<Text style={style.othersHeader}>Other options</Text>

									<View style={style.others}>
										{itemInfo.others.map((other, index) => (
											<View key={other.key} style={{ alignItems: 'center' }}>
												<View style={style.other}>
													<View style={{ flexDirection: 'row' }}>
														<Text style={style.otherName}># {other.name}:</Text>
														<Text style={style.otherInput}>{other.input}</Text>
													</View>
													<View style={{ flexDirection: 'row', marginTop: 10 }}>
														<Text style={style.otherPrice}>$ {other.price}</Text>

														<View style={style.otherActions}>
															<TouchableOpacity style={other.selected ? style.otherActionLeftDisabled : style.otherActionLeft} onPress={() => selectOther(index)}>
																<Text style={[style.otherActionHeader, { color: other.selected ? 'white' : 'black' }]}>Yes</Text>
															</TouchableOpacity>
															<TouchableOpacity style={!other.selected ? style.otherActionRightDisabled : style.otherActionRight} onPress={() => selectOther(index)}>
																<Text style={[style.otherActionHeader, { color: !other.selected ? 'white' : 'black' }]}>No</Text>
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
								<View style={style.sizesBox}>
									<Text style={style.sizesHeader}>Select a Size</Text>

									<View style={style.sizes}>
										{itemInfo.sizes.map((size, index) => (
											<View key={size.key} style={style.size}>
												<TouchableOpacity style={size.selected ? style.sizeTouchDisabled : style.sizeTouch} onPress={() => selectSize(index)}>
													<Text style={size.selected ? style.sizeTouchHeaderDisabled : style.sizeTouchHeader}>{size.name}</Text>
												</TouchableOpacity>
												<Text style={style.sizePrice}>$ {size.price}</Text>
											</View>
										))}
									</View>
								</View>
							)}

							<View style={style.note}>
								<TextInput 
									style={style.noteInput} multiline textAlignVertical="top" placeholderTextColor="rgba(127, 127, 127, 0.5)" 
									placeholder="Leave a note if you want" maxLength={100} 
									onChangeText={(note) => setIteminfo({ ...itemInfo, note })} value={itemInfo.note} 
									autoCorrect={false} autoCapitalize="none"
								/>
							</View>

							<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
								<View style={{ flexDirection: 'row' }}>
									<Text style={style.quantityHeader}>Quantity</Text>
									<View style={style.quantity}>
										<TouchableOpacity style={style.quantityAction} onPress={() => changeQuantity("-")}>
											<Text style={style.quantityActionHeader}>-</Text>
										</TouchableOpacity>
										<Text style={style.quantityHeader}>{itemInfo.quantity}</Text>
										<TouchableOpacity style={style.quantityAction} onPress={() => changeQuantity("+")}>
											<Text style={style.quantityActionHeader}>+</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>

							<Text style={style.price}>Cost: $ {(itemInfo.cost).toFixed(2)}</Text>
							<Text style={style.errorMsg}>{itemInfo.errorMsg}</Text>

							<View style={style.itemActions}>
								<View style={{ flexDirection: 'row' }}>
									{itemInfo.orderid ? 
										<TouchableOpacity style={style.itemAction} onPress={() => updateTheOrder()}>
											<Text style={style.itemActionHeader}>Update{'\n'}to your order</Text>
										</TouchableOpacity>
										:
										<TouchableOpacity style={style.itemAction} onPress={() => addOrder()}>
											<Text style={style.itemActionHeader}>Add{'\n'}to your order</Text>
										</TouchableOpacity>
									}

									{(!itemInfo.orderid && totalDiners > 0) && (
										<TouchableOpacity style={style.itemAction} onPress={() => addToDinersOrder()}>
											<Text style={style.itemActionHeader}>Add{'\n'}to a diner's order</Text>
										</TouchableOpacity>
									)}
								</View>
							</View>
						</ScrollView>
					</View>
				</Modal>
			)}
			{openRounds && (
				<Modal>
					<View style={style.roundsBox}>
						<View style={style.roundsHeader}>
							<TouchableOpacity style={style.closeRounds} onPress={() => setOpenrounds(false)}>
								<AntDesign name="close" size={20}/>
							</TouchableOpacity>

							<Text style={style.boxHeader}>Order(s)</Text>
						</View>
						{rounds.length > 0 ? 
							<ScrollView style={style.roundList}>
								{rounds.map((round, roundIndex) => (
									<View style={style.round} key={round.key}>
										{round.status == "ordering" ? 
											<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
												{seated ? 
													<View style={{ alignItems: 'center', flexDirection: 'row' }}>
														<Text>Ready ?</Text>
														<TouchableOpacity style={style.roundTouch} onPress={() => sendTheOrders()}>
															<Text>Send to Kitchen</Text>
														</TouchableOpacity>
													</View>
													:
													<View style={{ alignItems: 'center' }}>
														<Text style={{ marginVertical: 5 }}>You need to be seated first to submit your order(s)</Text>
														<TouchableOpacity style={style.roundTouchDisabled} disabled={true} onPress={() => {}}>
															<Text>Send to Kitchen</Text>
														</TouchableOpacity>
													</View>
												}
											</View>
											:
											<Text style={style.roundHeader}>This round {round.status == 'making' ? 'is already sent' : 'has been served'}</Text>
										}
										{round.round.map((orders, ordersIndex) => (
											orders.orders.map((order, orderIndex) => (
												<View style={style.roundOrder} key={order.key}>
													<View style={{ alignItems: 'center' }}>
														<View style={style.orderItem} key={order.key}>
															<Text style={style.orderInfo}>Orderer: {order.orderer.username}</Text>

															<View style={style.orderItemImageHolder}>
																<Image source={{ uri: logo_url + order.image }} style={style.orderItemImage}/>
															</View>

															<View style={style.orderItemInfos}>
																<Text style={style.orderItemInfo}>{order.name}</Text>

																{order.options.map((option, infoindex) => (
																	<Text key={option.key} style={style.itemInfo}>
																		<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
																		{option.selected}
																		{option.type == 'percentage' && '%'}
																	</Text>
																))}

																{order.others.map((other, otherindex) => (
																	other.selected ? 
																		<Text key={other.key} style={style.itemInfo}>
																			<Text style={{ fontWeight: 'bold' }}>{other.name}: </Text>
																			<Text>{other.input}</Text>
																		</Text>
																	: null
																))}

																{order.sizes.map((size, sizeindex) => (
																	size.selected ? 
																		<Text key={size.key} style={style.itemInfo}>
																			<Text style={{ fontWeight: 'bold' }}>Size: </Text>
																			<Text>{size.name}</Text>
																		</Text>
																	: null
																))}

																<Text style={style.orderItemInfo}><Text style={{ fontWeight: 'bold' }}>Quantity: </Text>{order.quantity}</Text>
																<Text style={style.orderItemInfo}><Text style={{ fontWeight: 'bold' }}>Cost: </Text>$ {(order.cost).toFixed(2)}</Text>
															</View>
														</View>
													</View>

													{(round.status == "ordering" && order.orderer.id == userId) && (
														<View style={{ alignItems: 'center' }}>
															<View style={{ flexDirection: 'row' }}>
																<TouchableOpacity style={style.orderItemAction} onPress={() => editTheOrder(order.id)}>
																	<Text style={style.orderItemActionHeader}>Edit Order</Text>
																</TouchableOpacity>
																<TouchableOpacity style={style.orderItemAction} onPress={() => deleteTheOrder(order.id)}>
																	<Text style={style.orderItemActionHeader}>Delete Order</Text>
																</TouchableOpacity>
															</View>
														</View>
													)}

													<View style={{ alignItems: 'center', marginVertical: 10 }}>
														<View style={style.orderersEdit}>
															<Text style={style.orderersEditHeader}>Calling for {order.numorderers} {order.numorderers > 1 ? 'people' : 'person'}</Text>
															{(round.status == "ordering" && order.orderer.id == userId) && (
																<TouchableOpacity style={style.orderersEditTouch} onPress={() => editTheOrderCallfor(order.id)}>
																	<Text style={style.orderersEditTouchHeader}>{order.orderers.length > 0 ? 'Edit' : 'Add'}</Text>
																</TouchableOpacity>
															)}
														</View>
													</View>

													{order.orderers.length > 0 ? 
														order.orderers.map((info, infoIndex) => (
															<View style={style.orderCallfor} key={info.key}>
																{info.row.map((orderer, ordererIndex) => (
																	orderer.username ?
																		<View style={style.orderer} key={orderer.key}>
																			<View style={style.ordererProfile}>
																				<Image source={{ uri: logo_url + orderer.profile }} style={{ height: 50, width: 50 }}/>
																			</View>
																			<Text style={style.ordererUsername}>{orderer.username}</Text>

																			{round.status == "ordering" ?
																				userId == orderer.id ? 
																					orderer.status == "confirmawaits" ?
																						<TouchableOpacity style={style.ordererConfirm} onPress={() => confirmTheDiningOrder(order.id, orderer.id)}>
																							<Text style={style.ordererConfirmHeader}>Confirm Order</Text>
																						</TouchableOpacity>
																						:
																						<Text style={style.ordererStatus}>confirmed</Text>
																					:
																					orderer.status == "confirmawaits" ? 
																						<Text style={style.ordererStatus}>confirm awaits</Text>
																						:
																						<Text style={style.ordererStatus}>confirmed</Text>
																				:
																				null
																			}
																		</View>
																		:
																		<View style={style.orderer} key={orderer.key}></View>
																))}
															</View>
														))
														:
														<Text style={style.orderCallforHeader}>{order.orderer.id == userId ? "Your" : "Self"} order</Text>
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

					{deleteRequestInfo.show && (
						<Modal transparent={true}>
							<View style={style.deleteOrderContainer}>
								<View style={style.deleteOrderBox}>
									<Text style={style.deleteOrderBoxHeader}>Delete order confirmation</Text>

									<View style={style.deleteOrderImageHolder}>
										<Image source={{ uri: logo_url + deleteRequestInfo.image }} style={style.deleteOrderImage}/>
									</View>
									<Text style={style.deleteOrderName}>{deleteRequestInfo.name}</Text>

									<View>
										{deleteRequestInfo.options.map((option, infoindex) => (
											<Text key={option.key} style={style.itemInfo}>
												<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
												{option.selected}
												{option.type == 'percentage' && '%'}
											</Text>
										))}

										{deleteRequestInfo.others.map((other, otherindex) => (
											other.selected ? 
												<Text key={other.key} style={style.itemInfo}>
													<Text style={{ fontWeight: 'bold' }}>{other.name}: </Text>
													<Text>{other.input}</Text>
													<Text> ($ {other.price.toFixed(2)})</Text>
												</Text>
											: null
										))}

										{deleteRequestInfo.sizes.map((size, sizeindex) => (
											size.selected ? 
												<Text key={size.key} style={style.itemInfo}>
													<Text style={{ fontWeight: 'bold' }}>Size: </Text>
													<Text>{size.name}</Text>
												</Text>
											: null
										))}
									</View>

									<View>
										<Text style={style.deleteOrderQuantity}><Text style={{ fontWeight: 'bold' }}>Quantity: </Text>{deleteRequestInfo.quantity}</Text>
										<Text style={style.deleteOrderPrice}><Text style={{ fontWeight: 'bold' }}>Cost: </Text>$ {(deleteRequestInfo.cost).toFixed(2)}</Text>
									</View>

									{deleteRequestInfo.numorderers > 0 && <Text style={style.deleteOrderOrderers}>Calling for {deleteRequestInfo.numorderers} {deleteRequestInfo.numorderers == 1 ? 'person' : 'people'}</Text>}

									<Text style={style.deleteOrderHeader}>Are you sure you want to delete this order</Text>

									<View style={style.deleteOrderActions}>
										<TouchableOpacity style={style.deleteOrderAction} onPress={() => setDeleterequestinfo({ ...deleteRequestInfo, show: false })}>
											<Text style={style.deleteOrderActionHeader}>Cancel</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.deleteOrderAction} onPress={() => deleteTheOrder()}>
											<Text style={style.deleteOrderActionHeader}>Yes</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</Modal>
					)}

					{showUnconfirmedorders && (
						<Modal transparent={true}>
							<View style={{ paddingVertical: offsetPadding }}>
								<View style={style.errorBox}>
									<View style={style.errorContainer}>
										<Text style={style.errorHeader}>
											There is one or more unconfirmed orders.
											{'\n\n'}
											Please tell your diners to confirm their order before it
											{'\n'}
											can be sent to the kitchen
										</Text>

										<View style={style.errorActions}>
											<TouchableOpacity style={style.errorAction} onPress={() => setShowunconfirmedorders(false)}>
												<Text style={style.errorActionHeader}>Ok</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							</View>
						</Modal>
					)}
				</Modal>
			)}
			{openEditdiners.show && (
				<Modal>
					<View style={style.usersList}>
						<View style={style.userNameContainer}>
							<TextInput 
								style={style.userNameInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Search friends to add" 
								onChangeText={(username) => getFriendsList(username)} autoCorrect={false} autoCapitalize="none"
							/>
						</View>

						<View style={style.usersListContainer}>
							<View style={style.usersListSearched}>
								<Text style={style.usersHeader}>{numSearchedfriends} Searched Friend(s)</Text>

								<FlatList
									data={searchedFriends}
									renderItem={({ item, index }) => 
										<View key={item.key} style={style.userRow}>
											{item.row.map(friend => (
												friend.username ? 
													<TouchableOpacity key={friend.key} style={style.user} onPress={() => selectFriend(friend.id)}>
														<View style={style.userProfileHolder}>
															<Image source={{ uri: logo_url + friend.profile }} style={{ height: fsize(0.15), width: fsize(0.15) }}/>
														</View>
														<Text style={style.userName}>{friend.username}</Text>
													</TouchableOpacity>
													:
													<View key={friend.key} style={style.user}></View>
											))}
										</View>
									}
								/>
							</View>
						
							<View style={style.usersListSelected}>
								{numSelecteddiners > 0 && (
									<>
										<Text style={style.selectedUsersHeader}>{numSelecteddiners} Selected Diner(s)</Text>

										{openEditdiners.changes > 0 && (
											<TouchableOpacity onPress={() => editTheDiners()}>
												<Text>Refresh {openEditdiners.changes > 1 ? "(" + openEditdiners.changes + ")" : null}</Text>
											</TouchableOpacity>
										)}

										<FlatList
											data={selectedDiners}
											renderItem={({ item, index }) => 
												<View key={item.key} style={style.userRow}>
													{item.row.map(friend => (
														friend.username ? 
															<View key={friend.key} style={style.user}>
																<TouchableOpacity style={style.userDelete} onPress={() => deselectTheFriend(friend.id)}>
																	<AntDesign name="closecircleo" size={15}/>
																</TouchableOpacity>
																<View style={style.userProfileHolder}>
																	<Image source={{ uri: logo_url + friend.profile }} style={{ height: fsize(0.15), width: fsize(0.15) }}/>
																</View>
																<Text style={style.userName}>{friend.username}</Text>
																{friend.status && <Text style={style.userStatus}>{friend.status}</Text>}
																{(userId == friend.id) && <Text style={style.userStatus}>(you)</Text>}
															</View>
															:
															<View key={friend.key} style={style.user}></View>
													))}
												</View>
											}
										/>
									</>
								)}
							</View>
						</View>

						<View style={style.itemContainer}>
							<View style={style.locationImageHolder}>
								<Image style={{ height: 80, width: 80 }} source={{ uri: logo_url + locationInfo.logo }}/>
							</View>
							<Text style={style.locationName}>{locationInfo.name}</Text>
						</View>

						<View style={style.usersListActionContainer}>
							<Text style={style.errorMsg}>{dinersErrormsg}</Text>

							<View style={style.usersListActions}>
								<TouchableOpacity style={style.usersListAction} onPress={() => closeEditTheDiners()}>
									<Text style={style.usersListActionHeader}>Close</Text>
								</TouchableOpacity>
								<TouchableOpacity style={style.usersListAction} onPress={() => addFriendsToDining()}>
									<Text style={style.usersListActionHeader}>Done</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>

					{showActiveDiner.show && (
						<Modal transparent={true}>
							<View style={{ paddingVertical: offsetPadding }}>
								<View style={style.errorBox}>
									<View style={style.errorContainer}>
										<Text style={style.errorHeader}>
											{showActiveDiner.username} has made some orders
											{'\n\n'}
											Therefore cannot be removed as diner
										</Text>

										<View style={style.errorActions}>
											<TouchableOpacity style={style.errorAction} onPress={() => setShowactivediner({ show: false, username: "" })}>
												<Text style={style.errorActionHeader}>Close</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							</View>
						</Modal>
					)}
				</Modal>
			)}
			{openEditcallfor && (
				<Modal>
					<View style={style.usersList}>
						<View style={style.userNameContainer}>
							<TextInput 
								style={style.userNameInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Search diner to order for" 
								onChangeText={(username) => getDinersList(username)} autoCorrect={false} autoCapitalize="none"
							/>
						</View>

						<View style={style.usersListContainer}>
							<View style={style.usersListSearched}>
								<Text style={style.usersHeader}>{numDiners} Searched Diner(s)</Text>

								<FlatList
									data={diners}
									renderItem={({ item, index }) => 
										<View key={item.key} style={style.userRow}>
											{item.row.map(diner => (
												diner.username ? 
													<TouchableOpacity key={diner.key} style={style.user} onPress={() => selectDiner(diner.id)}>
														<View style={style.userProfileHolder}>
															<Image source={{ uri: logo_url + diner.profile }} style={{ height: fsize(0.15), width: fsize(0.15) }}/>
														</View>
														<Text style={style.userName}>{diner.username}</Text>
													</TouchableOpacity>
													:
													<View key={diner.key} style={style.user}></View>
											))}
										</View>
									}
								/>
							</View>

							<View style={style.usersListSelected}>
								{selectedCallfor.length > 0 && (
									<>
										<Text style={style.selectedUsersHeader}>{numSelectedcallfor} Selected Diner(s) to order this item</Text>

										<FlatList
											data={selectedCallfor}
											renderItem={({ item, index }) => 
												<View key={item.key} style={style.userRow}>
													{item.row.map(diner => (
														diner.username ? 
															<View key={diner.key} style={style.user}>
																<TouchableOpacity style={style.userDelete} onPress={() => deselectDiner(diner.id)}>
																	<AntDesign name="closecircleo" size={15}/>
																</TouchableOpacity>
																<View style={style.userProfileHolder}>
																	<Image source={{ uri: logo_url + diner.profile }} style={{ height: fsize(0.15), width: fsize(0.15) }}/>
																</View>
																<Text style={style.userName}>{diner.username}</Text>
															</View>
															:
															<View key={diner.key} style={style.user}></View>
													))}
												</View>
											}
										/>
									</>
								)}
							</View>
						</View>

						<View style={style.itemContainer}>
							<View style={style.orderingItemImageHolder}>
								<Image style={{ height: 100, width: 100 }} source={{ uri: logo_url + orderingItem.image }}/>
							</View>
							<View style={style.itemInfos}>
								<Text style={style.orderingItemName}>{orderingItem.name}</Text>

								{orderingItem.options.map((option, infoindex) => (
									<Text key={option.key} style={style.itemInfo}>
										<Text style={{ fontWeight: 'bold' }}>{option.header}: </Text> 
										{option.selected}
										{option.type == 'percentage' && '%'}
									</Text>
								))}

								{orderingItem.others.map((other, otherindex) => (
									other.selected ? 
										<Text key={other.key} style={style.itemInfo}>
											<Text style={{ fontWeight: 'bold' }}>{other.name}: </Text>
											<Text>{other.input}</Text>
										</Text>
									: null
								))}

								{orderingItem.sizes.map((size, sizeindex) => (
									size.selected ? 
										<Text key={size.key} style={style.itemInfo}>
											<Text style={{ fontWeight: 'bold' }}>Size: </Text>
											<Text>{size.name}</Text>
										</Text>
									: null
								))}
							</View>
							<View>
								<Text style={style.itemHeader}><Text style={{ fontWeight: 'bold' }}>Quantity:</Text> {orderingItem.quantity}</Text>
								<Text style={style.itemHeader}><Text style={{ fontWeight: 'bold' }}>Cost:</Text> $ {orderingItem.cost}</Text>
							</View>
						</View>

						<View style={style.usersListActionContainer}>
							<Text style={style.errorMsg}>{orderingItem.errorMsg}</Text>

							<View style={style.usersListActions}>
								<TouchableOpacity style={style.usersListAction} onPress={() => closeEditTheCallfor()}>
									<Text style={style.usersListActionHeader}>Close</Text>
								</TouchableOpacity>
								{itemInfo.orderid ? 
									<TouchableOpacity style={style.usersListAction} onPress={() => updateTheOrderCallfor()}>
										<Text style={style.usersListActionHeader}>Update</Text>
									</TouchableOpacity>
									:
									<TouchableOpacity style={style.usersListAction} onPress={() => addOrder()}>
										<Text style={style.usersListActionHeader}>Add to Order</Text>
									</TouchableOpacity>
								}
							</View>
						</View>
					</View>

					{showPaymentRequired.show && (
						<Modal transparent={true}>
							<View style={{ paddingVertical: offsetPadding }}>
								<View style={style.errorBox}>
									<View style={style.errorContainer}>
										<Text style={style.errorHeader}>
											{showPaymentRequired.username} hasn't provided a payment method yet.
										</Text>

										<View style={style.errorActions}>
											<TouchableOpacity style={style.errorAction} onPress={() => setShowpaymentrequired({ show: false, username: "" })}>
												<Text style={style.errorActionHeader}>Close</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							</View>
						</Modal>
					)}

					{showUnconfirmeddiner.show && (
						<Modal transparent={true}>
							<View style={{ paddingVertical: offsetPadding }}>
								<View style={style.errorBox}>
									<View style={style.errorContainer}>
										<Text style={style.errorHeader}>
											{showUnconfirmeddiner.username} hasn't accepted the reservation.
											{'\n\n'}
											Please tell {showUnconfirmeddiner.username} to accept it so that you
											can continue your order
										</Text>

										<View style={style.errorActions}>
											<TouchableOpacity style={style.errorAction} onPress={() => setShowunconfirmeddiner({ show: false, username: "" })}>
												<Text style={style.errorActionHeader}>Close</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							</View>
						</Modal>
					)}
				</Modal>
			)}
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
	)
}

const style = StyleSheet.create({
	order: { backgroundColor: 'white', height: '100%', paddingBottom: offsetPadding, width: '100%' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	headers: { alignItems: 'center', flexDirection: 'column', height: '20%', justifyContent: 'space-around' },
	boxHeader: { fontSize: fsize(0.05), textAlign: 'center' },

	orderActions: { flexDirection: 'row', justifyContent: 'space-around' },
	orderAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 130 },
	orderActionHeader: { textAlign: 'center' },

	body: { height: '80%' },

	// menu
	menu: { backgroundColor: 'white', borderTopLeftRadius: 3, borderTopRightRadius: 3, padding: 3, width: '98%' },
	menuImageHolder: { borderRadius: fsize(0.1) / 2, height: fsize(0.1), overflow: 'hidden', width: fsize(0.1) },
	menuImage: { height: fsize(0.1), width: fsize(0.1) },
	menuName: { fontSize: fsize(0.05), fontWeight: 'bold', marginLeft: 5, marginTop: fsize(0.04) / 2, textDecorationLine: 'underline' },
	menuItemActions: { flexDirection: 'row', marginTop: 0 },
	menuItemAction: { borderRadius: 3, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5 },
	menuItemActionHeader: { fontSize: fsize(0.04), textAlign: 'center' },
	item: { backgroundColor: 'white', paddingHorizontal: 3, paddingBottom: 30, width: '98%' },
	itemImageHolder: { borderRadius: fsize(0.1) / 2, height: fsize(0.1), margin: 5, overflow: 'hidden', width: fsize(0.1) },
	itemImage: { height: fsize(0.1), width: fsize(0.1) },
	menuItemHeader: { fontSize: fsize(0.05), fontWeight: 'bold', marginRight: 20, paddingTop: fsize(0.04), textDecorationStyle: 'solid' },
	menuItemInfo: { fontSize: fsize(0.05), marginLeft: 10, marginVertical: 10 },

	// hidden boxes
	row: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10, width: '100%' },

	// item info
	itemInfoBox: { flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingVertical: offsetPadding, width: '100%' },
	itemInfoHeader: { alignItems: 'center', flexDirection: 'column', height: '10%', justifyContent: 'space-around' },
	itemClose: { alignItems: 'center', borderRadius: 15, borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', height: 28, justifyContent: 'space-around', marginVertical: 10, padding: 2 },
	imageHolder: { borderRadius: 100, height: 200, overflow: 'hidden', width: 200 },
	image: { height: 200, width: 200 },
	boxItemHeader: { fontFamily: 'appFont', fontSize: fsize(0.07), fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	boxItemHeaderInfo: {  fontSize: fsize(0.04), fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },

	info: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30, paddingHorizontal: 5 },
	infoHeader: { fontWeight: 'bold', marginVertical: 7, marginRight: 20 },

	// amount
	amount: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	amountAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	amountHeader: { fontSize: fsize(0.04), fontWeight: 'bold', padding: 10 },

	// percentage
	percentage: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	percentageAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	percentageHeader: { fontSize: fsize(0.04), fontWeight: 'bold', padding: 10 },

	// others
	othersBox: { alignItems: 'center', marginVertical: 20 },
	othersHeader: { fontWeight: 'bold' },
	others: { marginVertical: 20, width: '100%' },
	other: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 5, width: '100%' },
	otherName: { fontSize: fsize(0.05), fontWeight: 'bold' },
	otherInput: { fontSize: fsize(0.05) },
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
	noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.05), height: 100, padding: 5, width: '80%' },

	// quantity
	quantity: { flexDirection: 'row', justifyContent: 'space-around' },
	quantityAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, marginHorizontal: 10, paddingTop: 8, width: 35 },
	quantityHeader: { fontSize: fsize(0.05), fontWeight: 'bold', padding: 5 },

	price: { fontSize: fsize(0.05), fontWeight: 'bold', marginTop: 20, textAlign: 'center' },

	itemActions: { flexDirection: 'row', justifyContent: 'space-around' },
	itemAction: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, marginVertical: 30, padding: 10 },
	itemActionHeader: { fontSize: fsize(0.04), textAlign: 'center' },

	// rounds
	roundsBox: { height: '100%', paddingVertical: offsetPadding, width: '100%' },
	roundsHeader: { alignItems: 'center', flexDirection: 'column', height: '15%' },
	closeRounds: { alignItems: 'center', borderRadius: 15, borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', height: 28, justifyContent: 'space-around', marginVertical: 10, padding: 2 },
	roundList: { height: '85%' },
	roundTouch: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5, width: 120 },
	roundTouchDisabled: { alignItems: 'center', backgroundColor: 'grey', borderColor: 'grey', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5, width: 120 },
	roundTouchHeader: {  },
	round: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
	roundHeader: { fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' },
	roundOrder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, margin: 5 },
	orderItem: { alignItems: 'center', marginTop: 20 },
	orderInfo: { fontSize: fsize(0.05), fontWeight: 'bold', marginBottom: 20 },
	orderItemImageHolder: { borderRadius: orderImageSize / 2, height: orderImageSize, overflow: 'hidden', width: orderImageSize },
	orderItemImage: { height: orderImageSize, width: orderImageSize },
	orderItemInfos: { flexDirection: 'column', height: 100, justifyContent: 'space-between' },
	orderItemInfo: { fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' },
	orderItemActions: { flexDirection: 'row', justifyContent: 'space-around' },
	orderItemAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 110 },
	orderItemActionHeader: { fontSize: 13, textAlign: 'center' },
	orderersEdit: { flexDirection: 'row' },
	orderersEditHeader: { fontSize: fsize(0.05), fontWeight: 'bold', marginRight: 10, textAlign: 'center' },
	orderersEditTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	orderersEditTouchHeader: { },
	orderCallfor: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, width: '100%' },
	orderCallforHeader: { fontSize: fsize(0.05), fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
	orderer: { alignItems: 'center', height: 80, marginHorizontal: 10, width: (width / 4) - 30 },
	ordererProfile: { borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	ordererUsername: { textAlign: 'center' },
	ordererConfirm: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 3, width: 70 },
	ordererConfirmHeader: { fontSize: fsize(0.028), textAlign: 'center' },
	ordererStatus: { fontSize: fsize(0.028), textAlign: 'center' },

	// delete order
	deleteOrderContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	deleteOrderBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', padding: 10, width: '80%' },
	deleteOrderBoxHeader: { fontSize: fsize(0.05) },
	deleteOrderImageHolder: { borderRadius: 40, height: 80, overflow: 'hidden', width: 80 },
	deleteOrderImage: { height: 80, width: 80 },
	deleteOrderName: { fontWeight: 'bold' },
	deleteOrderQuantity: {  },
	deleteOrderPrice: {  },
	deleteOrderOrderers: { fontWeight: 'bold' },
	deleteOrderHeader: { fontSize: fsize(0.04), paddingHorizontal: 10, textAlign: 'center' },
	deleteOrderActions: { flexDirection: 'row', justifyContent: 'space-around' },
	deleteOrderAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: 70 },
	deleteOrderActionHeader: { textAlign: 'center' },

	// users list
	usersList: { flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingVertical: offsetPadding, width: '100%' },
	userName: { height: '10%' },
	userNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, marginHorizontal: 20, padding: 10 },
	usersListContainer: { flexDirection: 'column', height: '60%', justifyContent: 'space-between' },
	usersListSearched: { height: '50%', overflow: 'hidden' },
	usersListSelected: { height: '50%', overflow: 'hidden' },
	selectedUsersHeader: { fontWeight: 'bold', textAlign: 'center' },
	usersHeader: { fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
	userRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
	user: { alignItems: 'center', width: fsize(0.2) },
	userDisabled: { alignItems: 'center', marginHorizontal: 5, opacity: 0.3, width: fsize(0.2) },
	userDelete: { marginBottom: -5, marginLeft: fsize(0.15) },
	userProfileHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: fsize(0.15) / 2, height: fsize(0.15), overflow: 'hidden', width: fsize(0.15) },
	userName: { fontSize: fsize(0.03), fontWeight: 'bold', textAlign: 'center' },
	userStatus: { fontSize: fsize(0.03) },
	itemContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 10, flexDirection: 'row', height: '20%', justifyContent: 'space-between', marginHorizontal: 10, padding: 10 },
	orderingItemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	orderingItemName: { fontWeight: 'bold', marginBottom: 20 },
	itemInfo: { fontSize: fsize(0.04), flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
	itemHeader: { fontSize: fsize(0.04) },
	usersListActionContainer: { alignItems: 'center', height: '10%' },
	locationImageHolder: { borderRadius: 40, height: 80, overflow: 'hidden', width: 80 },
	locationName: { fontSize: fsize(0.05), marginVertical: 30, textAlign: 'center' },
	errorMsg: { color: 'darkred', fontSize: fsize(0.04), fontWeight: 'bold', textAlign: 'center' },
	usersListActions: { flexDirection: 'row', justifyContent: 'space-around' },
	usersListAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 100 },
	usersListActionHeader: { fontSize: fsize(0.05), textAlign: 'center' },

	errorBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	errorContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	errorHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	errorActions: { flexDirection: 'row', justifyContent: 'space-around' },
	errorAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	errorActionHeader: { },

	disabled: { backgroundColor: 'black', flexDirection: 'column', justifyContent: 'space-around', height: '100%', opacity: 0.8, width: '100%' },
	disabledContainer: { alignItems: 'center', width: '100%' },
	disabledHeader: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
	disabledClose: { backgroundColor: 'white', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 50, padding: 10 },
	disabledCloseHeader: {  }
})
