import React, { useState, useEffect } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, FlatList, Text, TextInput, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { logo_url } from '../../../assets/info'
import { searchFriends, searchDiners } from '../../apis/users'
import { getLocationProfile, getInfo } from '../../apis/locations'
import { getMenus } from '../../apis/menus'
import { getProducts, getProductInfo } from '../../apis/products'
import { getScheduleInfo, addItemtoorder, seeDiningOrders, editDiners, sendOrders, editOrder, deleteOrder, updateOrder, addDiners, editOrderCallfor, dinerIsRemovable, confirmDiningOrder, updateOrderCallfor } from '../../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const itemSize = (width / 3) - 20
const imageSize = itemSize - 30

export default function order(props) {
	const { locationid, scheduleid } = props.route.params

	const [userId, setUserid] = useState(0)
	const [timeStr, setTimestr] = useState('')
	const [name, setName] = useState('')
	const [totalDiners, setTotaldiners] = useState(0)
	const [menuTrack, setMenutrack] = useState([""])
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
	const [numMenus, setNummenus] = useState(0)

	const [showProducts, setShowproducts] = useState(false)
	const [products, setProducts] = useState([])
	const [numProducts, setNumproducts] = useState(0)

	const [viewType, setViewtype] = useState('')
	const [loaded, setLoaded] = useState(false)
	const [showPaymentRequired, setShowpaymentrequired] = useState({ show: false, username: "" })
	const [showUnconfirmedorders, setShowunconfirmedorders] = useState(false)
	const [showActiveDiner, setShowactivediner] = useState({ show: false, username: "" })

	const [openRounds, setOpenrounds] = useState(false)
	const [rounds, setRounds] = useState([])

	const [openEditdiners, setOpeneditdiners] = useState(false)
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

	const getTheScheduleInfo = async() => {
		const userId = await AsyncStorage.getItem("userid")

		getScheduleInfo(scheduleid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { scheduleInfo } = res
					const unix = parseInt(scheduleInfo.time)

					setName(scheduleInfo.name)
					setTotaldiners(scheduleInfo.numdiners)

					let date = new Date(unix).toString().split(" ")
					let time = date[4].split(":")

					let hour = time[0]
					let minute = time[1]
					let period = hour > 12 ? "PM" : "AM"

					hour = hour > 12 ? hour - 12 : hour
					hour = parseInt(hour)

					setUserid(userId)
					setTimestr(hour + ":" + minute + " " + period)
					getTheLocationProfile()
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
					const { msg, locationInfo } = res
					const { name, logo } = locationInfo

					setLocationinfo({ name, logo })

					if (msg == "menus") {
						getAllMenus("")
					} else if (msg == "products") {
						getAllProducts("")
					}

					setLoaded(true)
				}
			})
			.catch((err) => {

			})
	}
	const getTheInfo = async(menuid) => {
		const data = { locationid, menuid }

		setLoaded(false)
		setViewtype('')

		getInfo(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { msg, menuName, menuInfo } = res

					setMenuid(menuid)
					setMenuname(menuName)
					setMenuinfo(menuInfo)
					setMenutrack([...menuTrack, menuid.toString()])

					if (msg == "menus") {
						getAllMenus(menuid)
					} else if (msg == "products") {
						getAllProducts(menuid)
					}

					setLoaded(true)
				}
			})
	}
	const goBack = () => {
		let newMenutrack = [...menuTrack]

		newMenutrack.pop()
		setMenutrack(newMenutrack)

		if (newMenutrack.length == 1) {
			getTheLocationProfile()
		} else {
			getTheInfo(newMenutrack[newMenutrack.length - 1])
		}
	}
	const getAllMenus = async(parentmenuid) => {
		const data = { locationid, parentmenuid }

		getMenus(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					let data = res.menus
					let row = [], column = []
					let rownum = 0, key = ""

					data.forEach(function (menu, index) {
						row.push(menu)
						key = parseInt(menu.key.replace("menu-", ""))

						if (row.length == 3 || (data.length - 1 == index && row.length > 0)) {
							if (data.length - 1 == index && row.length > 0) {
								let leftover = 3 - row.length

								for (let k = 0; k < leftover; k++) {
									key++
									row.push({ key: "menu-" + key })
								}
							}

							column.push({ key: "row-" + rownum, row: row })
						}
					})

					setMenus(column)
					setNummenus(data.length)
					setShowmenus(true)
					setViewtype('menus')
				}
			})
			.catch((err) => {

			})
	}
	const getAllProducts = async(menuid) => {
		const data = { locationid, menuid }

		getProducts(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setProducts(res.products)
					setNumproducts(res.numproducts)
					setShowproducts(true)
					setViewtype('products')
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
				}
			})
	}
	const sendTheOrders = async() => {
		sendOrders(scheduleid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				const newRounds = [...rounds]

				newRounds[0].status = "making"

				setRounds(newRounds)
			})
			.catch((err) => {
				if (err.response.status == 400) {
					if (err.response.data.status) {
						const status = err.response.data.status

						switch (status) {
							case "unconfirmedorders":
								setShowunconfirmedorders(true)
						}
					}
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
			const data = { scheduleid, orderid }

			deleteOrder(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						setDeleterequestinfo({ ...deleteRequestInfo, show: false })
						seeTheDiningOrders()
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
		const userid = await AsyncStorage.getItem("userid")
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

			const data = { userid, scheduleid, productid, quantity, callfor, options: newOptions, others: newOthers, sizes: newSizes, note }

			addItemtoorder(data)
				.then((res) => {
					if (res.status == 200) {
						if (!res.data.errormsg) {
							return res.data
						} else {
							setIteminfo({ ...itemInfo, errorMsg: res.data.errormsg })
						}
					}
				})
				.then((res) => {
					if (res) {
						setOpeneditcallfor(false)
						setIteminfo({ ...itemInfo, show: false, errorMsg: "" })
						closeEditTheDiners()
						closeEditTheCallfor()
						seeTheDiningOrders()
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
					setSearchedfriends([])
					setNumsearchedfriends(0)
					setSelecteddiners(res.diners)
					setNumselecteddiners(res.numdiners)
					setOpeneditdiners(true)
				}
			})
	}
	const getFriendsList = async(username) => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, username }

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
				if (err.response.status == 400) {
					if (err.response.data.status) {
						const status = err.response.data.status

						switch (status) {
							case "activediner":
								setShowunconfirmedorders(true)
						}
					}
				}
			})
	}
	const closeEditTheDiners = () => {
		setOpeneditdiners(false)
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

		const data = { scheduleid, diners }

		addDiners(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setTotaldiners(diners.length)
					closeEditTheDiners()
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
	}
	const confirmTheDiningOrder = (orderid, ordererid) => {
		const data = { orderid, ordererid }

		confirmDiningOrder(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				} 
			})
			.then((res) => {
				if (res) seeTheDiningOrders()
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
					if (!res.data.errormsg) {
						return res.data
					} else {
						setOrderingitem({ ...orderingItem, errorMsg: res.data.errormsg })
					}
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
	}
	const getDinersList = async(username) => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, scheduleid, username }

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
	}
	const selectDiner = (userid, status) => {
		let newDiners = [...diners]
		let newSelectedcallfor = [...selectedCallfor]
		let selected = { id: "", key: "", profile: "", username: "" }
		let last_row = null, next_key = null, unfill = false

		if (JSON.stringify(newSelectedcallfor).includes("\"id\":" + userid + ",")) {
			return
		}

		newDiners.forEach(function (info) {
			info.row.forEach(function (diner) {
				if (diner.id == userid) {
					selected.id = userid
					selected.profile = diner.profile
					selected.username = diner.username
				}
			})
		})

		if (status == "filled") {
			// get last selected diner

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
		} else {
			setShowpaymentrequired({ show: true, username: selected.username })
		}
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

	useEffect(() => {
		getTheScheduleInfo()
	}, [])

	return (
		<View style={style.boxContainer}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
						<Text style={style.backHeader}>Back</Text>
					</TouchableOpacity>

					<Text style={style.boxHeader}>
						Order your meals {'\n'} 
						for your {''}
						<Text style={{ fontWeight: 'bold' }}>{timeStr}</Text> 
						{''} feast {'\n'} at <Text style={{ fontWeight: 'bold' }}>{name}</Text>
					</Text>

					<View style={{ alignItems: 'center', marginTop: 20 }}>
						<View style={style.orderActions}>
							<TouchableOpacity style={style.orderAction} onPress={() => seeTheDiningOrders()}>
								<Text style={style.orderActionHeader}>See Order(s)</Text>
							</TouchableOpacity>
							<TouchableOpacity style={style.orderAction} onPress={() => editTheDiners()}>
								<Text style={style.orderActionHeader}>{(totalDiners + 1) == 0 ? 'Add' : 'Edit'} Diner {(totalDiners + 1) > 0 ? '(' + (totalDiners + 1) + ')' : ''}</Text>
							</TouchableOpacity>
						</View>
					</View>

					<View style={style.body}>
						{loaded ? 
							<>
								{menuTrack.length > 1 && (
									<View style={{ alignItems: 'center', marginTop: 20 }}>
										<TouchableOpacity style={style.goBack} onPress={() => goBack()}>
											<Text>Back</Text>
										</TouchableOpacity>
									</View>
								)}

								{(showMenus && viewType == "menus") && (
									<FlatList
										showsVerticalScrollIndicator={false}
										style={{ marginHorizontal: 20, marginTop: 20 }}
										data={menus}
										renderItem={({ item, index }) => 
											<View key={item.key} style={style.row}>
												{item.row.map(( menu, index ) => (
													menu.name ? 
														<TouchableOpacity key={menu.key} style={style.menu} onPress={() => getTheInfo(menu.id)}>
															<View style={style.menuImageHolder}>
																<Image source={{ uri: logo_url + menu.image }} style={{ height: imageSize, width: imageSize }}/>
															</View>
															<Text style={style.menuName}>{menu.name}</Text>
														</TouchableOpacity>
														:
														<View key={menu.key} style={style.menuDisabled}></View>
												))}
											</View>
										}i
									/>
								)}

								{(showProducts && viewType == "products") && (
									<FlatList
										showsVerticalScrollIndicator={false}
										data={products}
										style={{ height: height - 386 }}
										renderItem={({ item, index }) => 
											<View key={item.key} style={style.row}>
												{item.row.map(product => (
													product.name ? 
														<TouchableOpacity key={product.key} style={style.product} onPress={() => getTheProductInfo(product.id)}>
															<Image style={style.productImage} source={{ uri: logo_url + product.image }}/>
															<Text style={style.productName}>{product.name}</Text>
															{product.info && <Text style={style.productInfo}>{product.info}</Text>}

															<View style={{ flexDirection: 'row' }}>
																<Text style={style.productDetail}>{product.price}</Text>
															</View>

															<TouchableOpacity style={style.productBuy} onPress={() => getTheProductInfo(product.id)}>
																<Text style={style.productBuyHeader}>Get</Text>
															</TouchableOpacity>
														</TouchableOpacity>
														:
														<View key={product.key} style={style.product}></View>
												))}
											</View>
										}
									/>
								)}
							</>
							:
							<ActivityIndicator size="small"/>
						}
					</View>
				</View>

				{itemInfo.show && (
					<Modal>
						<View style={{ paddingVertical: offsetPadding }}>
							<View style={{ alignItems: 'center', marginVertical: 20 }}>
								<TouchableOpacity style={style.itemClose} onPress={() => {
									setIteminfo({ ...itemInfo, show: false, orderid: "" })
								}}>
									<AntDesign name="close" size={20}/>
								</TouchableOpacity>
							</View>
							<ScrollView style={{ height: screenHeight - 68 }}>
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
									<TextInput style={style.noteInput} multiline={true} placeholder="Leave a note if you want" maxLength={100} onChangeText={(note) => setIteminfo({ ...itemInfo, note })} value={itemInfo.note} autoCorrect={false}/>
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
												<Text style={style.itemActionHeader}>Update to your order</Text>
											</TouchableOpacity>
											:
											<TouchableOpacity style={style.itemAction} onPress={() => addOrder()}>
												<Text style={style.itemActionHeader}>Add to your order</Text>
											</TouchableOpacity>
										}

										{(!itemInfo.orderid && totalDiners > 0) && (
											<TouchableOpacity style={style.itemAction} onPress={() => addToDinersOrder()}>
												<Text style={style.itemActionHeader}>Add to a diner's order</Text>
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
						<View style={{ paddingVertical: offsetPadding }}>
							<View style={{ alignItems: 'center', height: 75 }}>
								<TouchableOpacity style={style.closeRounds} onPress={() => setOpenrounds(false)}>
									<AntDesign name="close" size={20}/>
								</TouchableOpacity>

								<Text style={style.boxHeader}>Order(s)</Text>
							</View>
							{rounds.length > 0 ? 
								<ScrollView style={style.roundList}>
									{rounds.map(round => (
										<View style={style.round} key={round.key}>
											{round.status == "ordering" ? 
												<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
													<View style={{ alignItems: 'center', flexDirection: 'row' }}>
														<Text>Ready ?</Text>
														<TouchableOpacity style={style.roundTouch} onPress={() => sendTheOrders()}>
															<Text>Send to Kitchen</Text>
														</TouchableOpacity>
													</View>
												</View>
												:
												<Text style={style.roundHeader}>This round {round.status == 'making' ? 'is already sent' : 'has been served'}</Text>
											}
											{round.round.map(orders => (
												orders.orders.map(order => (
													<View style={style.order} key={order.key}>
														<View style={{ alignItems: 'center' }}>
															<View style={style.orderItem} key={order.key}>
																<Text style={style.orderInfo}>Orderer: {order.orderer.username}</Text>

																<View style={style.orderItemImageHolder}>
																	<Image source={{ uri: logo_url + order.image }} style={style.orderItemImage}/>
																</View>
																<Text style={style.orderItemName}>{order.name}</Text>
																	

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

																<Text style={style.orderItemQuantity}><Text style={{ fontWeight: 'bold' }}>Quantity: </Text>{order.quantity}</Text>
																<Text style={style.orderItemPrice}><Text style={{ fontWeight: 'bold' }}>Cost: </Text>$ {(order.cost).toFixed(2)}</Text>
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

														<View style={{ alignItems: 'center' }}>
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
															order.orderers.map(info => (
																<View style={style.orderCallfor} key={info.key}>
																	{info.row.map(orderer => (
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
								<View style={{ alignItems: 'center', flexDirection: 'column', height: screenHeight - 86, justifyContent: 'space-around' }}>
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

				{openEditdiners && (
					<Modal>
						<View style={{ paddingVertical: offsetPadding }}>
							<View style={style.usersList}>
								<TextInput style={style.userNameInput} placeholder="Search friends to add" onChangeText={(username) => getFriendsList(username)} autoCorrect={false}/>

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
																	<Image source={{ uri: logo_url + friend.profile }} style={{ height: 60, width: 60 }}/>
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
																			<Image source={{ uri: logo_url + friend.profile }} style={{ height: 60, width: 60 }}/>
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

								<Text style={style.errorMsg}>{dinersErrormsg}</Text>

								<View style={{ alignItems: 'center' }}>
									<View style={style.actions}>
										<TouchableOpacity style={style.action} onPress={() => closeEditTheDiners()}>
											<Text style={style.actionHeader}>Close</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.action} onPress={() => addFriendsToDining()}>
											<Text style={style.actionHeader}>Add</Text>
										</TouchableOpacity>
									</View>
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
						<View style={{ paddingVertical: offsetPadding }}>
							<View style={style.usersList}>
								<TextInput style={style.userNameInput} placeholder="Search diner to order for" onChangeText={(username) => getDinersList(username)} autoCorrect={false}/>

								<View style={style.usersListContainer}>
									<View style={style.usersListSearched}>
										<Text style={style.usersHeader}>{numDiners} Searched Diner(s)</Text>

										<FlatList
											data={diners}
											renderItem={({ item, index }) => 
												<View key={item.key} style={style.userRow}>
													{item.row.map(diner => (
														diner.username ? 
															<TouchableOpacity key={diner.key} style={style.user} onPress={() => selectDiner(diner.id, diner.status)}>
																<View style={style.userProfileHolder}>
																	<Image source={{ uri: logo_url + diner.profile }} style={{ height: 60, width: 60 }}/>
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
																			<Image source={{ uri: logo_url + diner.profile }} style={{ height: 60, width: 60 }}/>
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

								<View>
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

									<Text style={style.errorMsg}>{orderingItem.errorMsg}</Text>

									<View style={{ alignItems: 'center' }}>
										<View style={style.actions}>
											<TouchableOpacity style={style.action} onPress={() => closeEditTheCallfor()}>
												<Text style={style.actionHeader}>Close</Text>
											</TouchableOpacity>
											{itemInfo.orderid ? 
												<TouchableOpacity style={style.action} onPress={() => updateTheOrderCallfor()}>
													<Text style={style.actionHeader}>Update</Text>
												</TouchableOpacity>
												:
												<TouchableOpacity style={style.action} onPress={() => addOrder()}>
													<Text style={style.actionHeader}>Add to Order</Text>
												</TouchableOpacity>
											}
										</View>
									</View>
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
					</Modal>
				)}
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	boxContainer: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 30, marginTop: 20, marginHorizontal: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	boxHeader: { fontSize: 15, height: 54, textAlign: 'center' },

	orderActions: { flexDirection: 'row', justifyContent: 'space-around' },
	orderAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 130 },
	orderActionHeader: { textAlign: 'center' },

	body: { flexDirection: 'column', height: screenHeight - 70, justifyContent: 'space-around' },
	goBack: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	row: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10, width: '100%' },

	// menu
	menu: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, flexDirection: 'column', height: itemSize, justifyContent: 'space-between', padding: 2, width: itemSize },
	menuDisabled: { height: itemSize, width: itemSize },
	menuImageHolder: { alignItems: 'center', borderRadius: imageSize / 2, flexDirection: 'column', height: imageSize, justifyContent: 'space-around', overflow: 'hidden', width: imageSize },
	menuName: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },

	// product
	product: { alignItems: 'center', marginBottom: 50, width: itemSize },
	productImage: { borderRadius: imageSize / 2, height: imageSize, width: imageSize },
	productName: { fontSize: 20, fontWeight: 'bold' },
	productInfo: { fontSize: 15 },
	productDetail: { fontSize: 15, marginHorizontal: 10, marginVertical: 5 },
	productBuy: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 50 },
	productBuyHeader: { textAlign: 'center' },

	// hidden boxes
	// item info
	itemClose: { alignItems: 'center', borderRadius: 15, borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', height: 28, justifyContent: 'space-around', marginVertical: 10, padding: 2 },
	imageHolder: { borderRadius: 100, height: 200, overflow: 'hidden', width: 200 },
	image: { height: 200, width: 200 },
	boxItemHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	boxItemHeaderInfo: {  fontSize: 15, fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },

	info: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30, paddingHorizontal: 5 },
	infoHeader: { fontWeight: 'bold', marginVertical: 7, marginRight: 20 },

	// amount
	amount: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	amountAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	amountHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	// percentage
	percentage: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	percentageAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	percentageHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	// others
	othersBox: { alignItems: 'center', marginVertical: 20 },
	othersHeader: { fontWeight: 'bold' },
	others: { marginVertical: 20, width: '100%' },
	other: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 5, width: '100%' },
	otherName: { fontSize: 20, fontWeight: 'bold' },
	otherInput: { fontSize: 20 },
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
	noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, height: 100, padding: 5, width: '80%' },

	// quantity
	quantity: { flexDirection: 'row', justifyContent: 'space-around' },
	quantityAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	quantityHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	price: { fontWeight: 'bold', marginTop: 20, textAlign: 'center' },

	itemActions: { flexDirection: 'row', justifyContent: 'space-around' },
	itemAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, marginVertical: 30, padding: 10, width: 120 },
	itemActionHeader: { textAlign: 'center' },

	// rounds
	closeRounds: { alignItems: 'center', borderRadius: 15, borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', height: 28, justifyContent: 'space-around', marginVertical: 10, padding: 2 },
	roundList: { height: screenHeight - 75 },
	roundTouch: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5, width: 120 },
	roundTouchHeader: {  },
	round: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
	roundHeader: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
	order: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, margin: 5 },
	orderItem: { alignItems: 'center', marginTop: 20 },
	orderInfo: { fontWeight: 'bold', marginBottom: 20 },
	orderItemImageHolder: { borderRadius: 40, height: 80, overflow: 'hidden', width: 80 },
	orderItemImage: { height: 80, width: 80 },
	orderItemName: { fontWeight: 'bold' },
	orderItemQuantity: {  },
	orderItemPrice: {  },
	orderItemActions: { flexDirection: 'row', justifyContent: 'space-around' },
	orderItemAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 110 },
	orderItemActionHeader: { fontSize: 13, textAlign: 'center' },
	orderersEdit: { flexDirection: 'row' },
	orderersEditHeader: { fontWeight: 'bold', marginRight: 10, marginTop: 7, textAlign: 'center' },
	orderersEditTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	orderersEditTouchHeader: { },
	orderCallfor: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, width: '100%' },
	orderCallforHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
	orderer: { alignItems: 'center', height: 80, marginHorizontal: 10, width: (width / 4) - 30 },
	ordererProfile: { borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	ordererUsername: { textAlign: 'center' },
	ordererConfirm: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 3 },
	ordererConfirmHeader: { fontSize: 8, textAlign: 'center' },
	ordererStatus: { fontSize: 8, textAlign: 'center' },

	// delete order
	deleteOrderContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', paddingVertical: offsetPadding, width: '100%' },
	deleteOrderBox: { alignItems: 'center', backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-between', padding: 10, width: '80%' },
	deleteOrderBoxHeader: { fontSize: 20 },
	deleteOrderImageHolder: { borderRadius: 40, height: 80, overflow: 'hidden', width: 80 },
	deleteOrderImage: { height: 80, width: 80 },
	deleteOrderName: { fontWeight: 'bold' },
	deleteOrderQuantity: {  },
	deleteOrderPrice: {  },
	deleteOrderOrderers: { fontWeight: 'bold' },
	deleteOrderHeader: { fontSize: 15, paddingHorizontal: 10, textAlign: 'center' },
	deleteOrderActions: { flexDirection: 'row', justifyContent: 'space-around' },
	deleteOrderAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 10, padding: 5, width: 70 },
	deleteOrderActionHeader: { textAlign: 'center' },

	// users list
	usersList: { flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	userNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, marginHorizontal: 20, padding: 10 },
	usersListContainer: { flexDirection: 'column', height: screenHeight - 230, justifyContent: 'space-between', overflow: 'hidden' },
	usersListSearched: { borderRadius: 5, height: '50%', overflow: 'hidden' },
	usersListSelected: { borderRadius: 5, height: '50%', overflow: 'hidden' },
	selectedUsersHeader: { fontWeight: 'bold', textAlign: 'center' },
	usersHeader: { fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
	userRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
	user: { alignItems: 'center', marginHorizontal: 5, width: width * 0.2 },
	userDisabled: { alignItems: 'center', marginHorizontal: 5, opacity: 0.3, width: width * 0.2 },
	userDelete: { marginBottom: -5, marginLeft: 60 },
	userProfileHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 30, height: 60, overflow: 'hidden', width: 60 },
	userName: { fontWeight: 'bold', textAlign: 'center' },

	itemContainer: { backgroundColor: 'rgba(127, 127, 127, 0.1)', borderRadius: 10, flexDirection: 'row', height: 100, justifyContent: 'space-between', marginHorizontal: 10, padding: 10 },
	orderingItemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	orderingItemName: { fontWeight: 'bold', marginBottom: 20 },
	itemInfo: { fontSize: 15, flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
	itemHeader: { fontSize: 15 },
	locationImageHolder: { borderRadius: 40, height: 80, overflow: 'hidden', width: 80 },
	locationName: { fontSize: 20, marginVertical: 30, textAlign: 'center' },

	errorMsg: { color: 'darkred', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },

	actions: { flexDirection: 'row', justifyContent: 'space-around' },
	action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 100 },
	actionHeader: { textAlign: 'center' },

	errorBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	errorContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	errorHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	errorActions: { flexDirection: 'row', justifyContent: 'space-around' },
	errorAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	errorActionHeader: { },
})
