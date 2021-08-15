import React, { useState, useEffect } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, FlatList, Text, TextInput, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { logo_url } from '../../../assets/info'
import { searchFriends, searchDiners } from '../../apis/users'
import { getLocationProfile, getInfo } from '../../apis/locations'
import { getMenus } from '../../apis/menus'
import { getProducts, getProductInfo } from '../../apis/products'
import { getScheduleInfo, addItemtoorder, seeOrders, sendOrders, editOrder, updateOrder, addDiners, editOrderCallfor, updateOrderCallfor } from '../../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - offsetPadding
const itemSize = (width * 0.3) - 10
const imageSize = (width * 0.3) - 50

export default function order(props) {
	const { scheduleid } = props.route.params
	const [locationId, setLocationid] = useState('')
	const [timeStr, setTimestr] = useState('')
	const [name, setName] = useState('')
	const [menuTrack, setMenutrack] = useState([])
	const [menuId, setMenuid] = useState('')

	const [itemInfo, setIteminfo] = useState({ 
		show: false, productid: "", orderid: "", name: "", info: "", note: "", 
		image: "", price: "", options: [], quantity: 1, 
		errorMsg: ""
	})
	const [rounds, setRounds] = useState([])

	const [openRounds, setOpenrounds] = useState(false)
	const [numOrders, setNumorders] = useState(2)
	const [orderingItem, setOrderingItem] = useState({ name: "", info: "", image: "", note: "", options: [], quantity: 1, price: 0, errorMsg: "" })

	// diners list to order for
	const [openDiners, setOpendiners] = useState(false)
	const [diners, setDiners] = useState([])
	const [numDiners, setNumdiners] = useState(0)
	const [selectedDiners, setSelectedDiners] = useState([])
	const [numSelectedDiners, setNumSelectedDiners] = useState(0)

	// friends list to add
	const [openFriends, setOpenfriends] = useState(false)
	const [friends, setFriends] = useState([])
	const [numFriends, setNumfriends] = useState(0)
	const [selectedFriends, setSelectedfriends] = useState([])
	const [numSelectedfriends, setNumselectedfriends] = useState(0)
	const [locationInfo, setLocationinfo] = useState({ name: "", logo: "" })
	const [errorMsg, setErrormsg] = useState('')

	const [showMenus, setShowmenus] = useState(true)
	const [menus, setMenus] = useState([])
	const [numMenus, setNummenus] = useState(0)

	const [showProducts, setShowproducts] = useState(false)
	const [products, setProducts] = useState([])
	const [numProducts, setNumproducts] = useState(0)

	const [loaded, setLoaded] = useState(false)

	const getTheScheduleInfo = async() => {
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

					setLocationid(scheduleInfo.locationId)
					setName(scheduleInfo.name)

					let date = new Date(unix).toString().split(" ")
					let time = date[4].split(":")

					let hour = time[0]
					let minute = time[1]
					let period = hour > 12 ? "PM" : "AM"

					hour = hour > 12 ? hour - 12 : hour

					setTimestr(hour + ":" + minute + " " + period)
					getTheLocationProfile(scheduleInfo.locationId)
				}
			})
	}
	const getTheLocationProfile = async(id) => {
		const data = { locationid: id, longitude: null, latitude: null }

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
						getAllMenus(id)
					} else if (msg == "products") {
						getAllProducts(id)
					}

					setLoaded(true)
				}
			})
	}
	const getTheInfo = async() => {
		const lasttrack = menuTrack[menuTrack.length - 1]
		const { locationid, menuid } = lasttrack
		const data = { locationid, menuid }

		getInfo(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { msg, menuName, menuInfo } = res

					setMenuname(menuName)
					setMenuinfo(menuInfo)

					if (msg == "menus") {
						getAllMenus()
					} else if (msg == "services") {
						getAllServices()
					} else if (msg == "products") {
						getAllProducts()
					}
				}
			})
	}
	const getAllMenus = async(id) => {
		const data = { locationid: id, parentmenuid: "" }

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
				}
			})
	}
	const getAllProducts = async(id) => {
		const data = { locationid: id, menuid: "" }

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
					const { image, info, name, options, price } = res.productInfo

					setIteminfo({
						...itemInfo,
						show: true, productid, name, info, image, price, options
					})
				}
			})
	}

	const seeOrders = async() => {
		seeOrders(scheduleid)
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
					const { name, info, image, quantity, options, note, price } = res.orderInfo

					setIteminfo({
						...itemInfo,
						show: true,
						orderid,
						name, info, image,
						quantity, note, options,
						price
					})
					setOpenrounds(false)
				}
			})
	}
	const updateTheOrder = async() => {
		const { orderid, quantity, options, note } = itemInfo
		const newOptions = JSON.parse(JSON.stringify(options))
		const data = { scheduleid, orderid, quantity, note }

		newOptions.forEach(function (option) {
			delete option['key']

			if (option['options']) {
				delete option['options']
			}
		})

		data['options'] = newOptions

		updateOrder(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setIteminfo({ ...itemInfo, show: false })
					seeOrders()
				}
			})
	}

	const changeOption = (index, selected) => {
		let { options } = itemInfo
		let newOptions = [...options]

		newOptions[index].selected = selected

		setIteminfo({ ...itemInfo, options: newOptions })
	}
	const changeQuantity = (index, action) => {
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

	const addOrder = async() => {
		const userid = await AsyncStorage.getItem("userid")
		let { productid, name, info, note, image, price, options, quantity } = itemInfo
		let callfor = [], newOptions = JSON.parse(JSON.stringify(options))

		if (openDiners && selectedDiners.length == 0) {
			setOrderingItem({ ...orderingItem, errorMsg: "You didn't select anyone" })
		} else {
			selectedDiners.forEach(function (info) {
				info.row.forEach(function (diner) {
					if (diner.username) {
						callfor.push(diner.id.toString())
					}
				})
			})

			newOptions.forEach(function (option) {
				delete option['key']

				if (option['options']) {
					delete option['options']
				}
			})

			const data = { userid, scheduleid, productid, quantity, callfor, options: newOptions, note }

			addItemtoorder(data)
				.then((res) => {
					if (res.status == 200) {
						if (!res.data.errormsg) {
							return res.data
						} else {
							setOrderingItem({ ...orderingItem, errorMsg: res.data.errormsg })
						}
					}
				})
				.then((res) => {
					if (res) {
						setOpendiners(false)
						setIteminfo({ ...itemInfo, show: false })
						seeOrders()
					}
				})
		}
	}
	const showOrders = () => {
		setOpendiners(false)
		setSelectedDiners([])
		setNumSelectedDiners(0)
		setOpenrounds(true)
		setNumorders(numOrders + 1)
	}

	const getDinersList = async(username) => {
		const data = { scheduleid, username }

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
	const selectDiner = (userid) => {
		let newDiners = [...diners]
		let newSelectedDiners = [...selectedDiners]
		let selected = { id: "", key: "", profile: "", username: "" }
		let last_row = null, next_key = null, unfill = false

		if (JSON.stringify(newSelectedDiners).includes("\"id\":" + userid + ",")) {
			return
		}

		// get last selected diner
		newDiners.forEach(function (info) {
			info.row.forEach(function (diner) {
				if (diner.id == userid) {
					selected.id = userid
					selected.profile = diner.profile
					selected.username = diner.username
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
				setNumSelectedDiners(numSelectedDiners + 1)
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

			setNumSelectedDiners(numSelectedDiners + 1)
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
			setNumSelectedDiners(1)
		}

		setSelectedDiners(newSelectedDiners)
	}
	const deselectDiner = (userid) => {
		let list = [...selectedDiners]
		let last_row = list[list.length - 1].row
		let newList = [], row = [], info, num = 0

		list.forEach(function (listitem) {
			listitem.row.forEach(function (info) {
				if (info.id && info.id != userid) {
					row.push({
						key: "selected-diner-" + num,
						id: info.id,
						profile: info.profile,
						username: info.username
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

		setSelectedDiners(newList)
		setNumSelectedDiners(numSelectedDiners - 1)
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
					setFriends(res.searchedFriends)
					setNumfriends(res.numSearchedFriends)
				}
			})
	}
	const selectFriend = (userid) => {
		let newFriends = [...friends]
		let newSelectedFriends = [...selectedFriends]
		let selected = { id: "", key: "", profile: "", username: "" }
		let last_row = null, next_key = null, unfill = false

		if (JSON.stringify(newSelectedFriends).includes("\"id\":" + userid + ",")) {
			return
		}

		// get last selected friend
		newFriends.forEach(function (info) {
			info.row.forEach(function (friend) {
				if (friend.id == userid) {
					selected.id = userid
					selected.profile = friend.profile
					selected.username = friend.username
				}
			})
		})

		if (newSelectedFriends.length > 0) {
			last_row = newSelectedFriends[newSelectedFriends.length - 1].row

			for (k in last_row) {
				if (last_row[k].id) {
					next_key = parseInt(last_row[k].key.split("-").pop()) + 1
				} else {
					unfill = true
					selected.key = "selected-friend-" + next_key
					last_row[k] = selected
					next_key += 1

					break
				}
			}

			if (unfill) {
				newSelectedFriends[newSelectedFriends.length - 1].row = last_row
				setNumselectedfriends(numSelectedfriends + 1)
			} else {
				selected.key = "selected-friend-" + next_key
				newSelectedFriends.push({
					key: "selected-friend-row-" + (newSelectedFriends.length),
					row: [
						selected,
						{ key: "selected-friend-" + (next_key + 1) },
						{ key: "selected-friend-" + (next_key + 2) },
						{ key: "selected-friend-" + (next_key + 3) }
					]
				})
			}

			setNumselectedfriends(numSelectedfriends + 1)
		} else {
			selected.key = "selected-friend-0"
			newSelectedFriends = [{
				key: "selected-friend-row-0",
				row: [
					selected,
					{ key: "selected-friend-1" },
					{ key: "selected-friend-2" },
					{ key: "selected-friend-3" }
				]
			}]
			setNumselectedfriends(1)
		}

		setSelectedfriends(newSelectedFriends)
	}
	const deselectFriend = (userid) => {
		let list = [...selectedFriends]
		let last_row = list[list.length - 1].row
		let newList = [], row = [], info, num = 0

		list.forEach(function (listitem) {
			listitem.row.forEach(function (info) {
				if (info.id && info.id != userid) {
					row.push({
						key: "selected-friend-" + num,
						id: info.id,
						profile: info.profile,
						username: info.username
					})
					num++

					if (row.length == 4) {
						newList.push({ key: "selected-friend-row-" + (newList.length), row })
						row = []
					}
				}
			})
		})

		if (row.length > 0) {
			while (row.length < 4) {
				row.push({ key: "selected-friend-" + num })
				num++
			}

			newList.push({ key: "selected-friend-row-" + (newList.length), row })
		}

		setSelectedfriends(newList)
		setNumselectedfriends(numSelectedfriends - 1)
	}
	const addTheDiners = () => {
		const diners = []

		selectedFriends.forEach(function (info) {
			info.row.forEach(function (friend) {
				if (friend.username) {
					diners.push({ "userid": friend.id.toString(), "status": "waiting" })
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
					setOpenfriends(false)
					setSelectedfriends([])
					setNumselectedfriends(0)
					setErrormsg('')
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
					setSelectedDiners(res.searchedDiners)
					setNumSelectedDiners(res.numSearchedDiners)
					setOrderingItem(res.orderingItem)
					setOpendiners(true)
					setIteminfo({ ...itemInfo, orderid })
					setOpenrounds(false)
				}
			})
	}
	const updateTheOrderCallfor = async() => {
		let { orderid } = itemInfo
		let callfor = []

		if (openDiners && selectedDiners.length == 0) {
			setErrormsg("You didn't select anyone")
		} else {	
			selectedDiners.forEach(function (info) {
				info.row.forEach(function (diner) {
					if (diner.username) {
						callfor.push(diner.id.toString())
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
							setErrormsg(res.data.errormsg)
						}
					}
				})
				.then((res) => {
					if (res) {
						seeOrders()
						setOpendiners(false)
						setIteminfo({ ...itemInfo, orderid: "" })
					}
				})
		}
	}
	const removeTheOrderCallfor = async(cartid, callforid) => {
		const data = { cartid, callforid }

		removeOrderCallfor(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) getTheCartItems()
			})
	}
	const openDinersOrder = async() => {
		let newOrderingItem = {...orderingItem}
		let { name, info, note, image, price, quantity, options } = itemInfo
		let newOptions = JSON.parse(JSON.stringify(options))
		let empty = false

		newOptions.forEach(function (option) {
			if (option["type"] == "size" && option["selected"] == "") {
				empty = true
			}

			if (option["options"]) {
				delete option["options"]
			}
		})

		if (!empty) {
			newOrderingItem.name = name
			newOrderingItem.info = info
			newOrderingItem.note = note
			newOrderingItem.image = image
			newOrderingItem.options = newOptions
			newOrderingItem.quantity = quantity
			newOrderingItem.price = (price * quantity).toFixed(2)
			newOrderingItem.errorMsg = ""

			setOpendiners(true)
			setIteminfo({ ...itemInfo, show: false })
			setOrderingItem(newOrderingItem)
		} else {
			setIteminfo({ ...itemInfo, errorMsg: "Please choose a size" })
		}

		setOrderingItem(newOrderingItem)
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

				newRounds[0].status = "sent"

				setRounds(newRounds)
			})
	}

	useEffect(() => {
		getTheScheduleInfo()
	}, [])

	return (
		<View style={{ paddingVertical: offsetPadding }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>

				<Text style={style.boxHeader}>
					Order your meals {'\n\n'} 
					for your {''}
					<Text style={{ fontWeight: 'bold' }}>{timeStr}</Text> 
					{''} reservation {'\n\n'} at <Text style={{ fontWeight: 'bold' }}>{name}</Text>
				</Text>

				<View style={{ alignItems: 'center', marginTop: 20 }}>
					<View style={style.orderActions}>
						<TouchableOpacity style={style.orderAction} onPress={() => seeOrders()}>
							<Text style={style.orderActionHeader}>See Order(s)</Text>
						</TouchableOpacity>
						<TouchableOpacity style={style.orderAction} onPress={() => setOpenfriends(true)}>
							<Text style={style.orderActionHeader}>Add Diner</Text>
						</TouchableOpacity>
					</View>
				</View>

				<View style={style.body}>
					{loaded ? 
						<>
							{showMenus && (
								<FlatList
									showsVerticalScrollIndicator={false}
									style={{ marginHorizontal: 20, marginTop: 20 }}
									data={menus}
									renderItem={({ item, index }) => 
										<View key={item.key} style={style.row}>
											{item.row.map(( menu, index ) => (
												menu.name ? 
													<TouchableOpacity key={menu.key} style={style.item} onPress={() => {
														setMenuid(menu.id)
														setMenutrack([...menuTrack, { locationid: locationId, menuid: menu.id }])

														getTheInfo()
													}}>
														<View style={style.itemImageHolder}>
															<Image source={{ uri: logo_url + menu.image }} style={{ height: imageSize, width: imageSize }}/>
														</View>
														<Text style={style.itemName}>{menu.name}</Text>
													</TouchableOpacity>
													:
													<View key={menu.key} style={style.itemDisabled}></View>
											))}
										</View>
									}i
								/>
							)}

							{showProducts && (
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
								setIteminfo({ ...itemInfo, show: false })
								setOpenrounds(true)
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
								<View key={option.key} style={style.info}>
									<Text style={style.infoHeader}>{option.header}:</Text>

									{option.type == "size" && (
										<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
											<View style={style.options}>
												{option.options.map((info, optindex) => (
													<TouchableOpacity key={info.key} style={option.selected == info.header ? style.optionSelected : style.option} onPress={() => changeOption(index, info.header)}>
														<Text style={option.selected == info.header ? style.optionSelectedHeader : style.optionHeader}>{info.header}</Text>
													</TouchableOpacity>
												))}
											</View>
										</View>
									)}

									{option.type == "quantity" && (
										<View style={{ flexDirection: 'row', justifyContent: 'space-around', width: width - 100 }}>
											<View style={style.quantity}>
												<TouchableOpacity style={style.quantityAction} onPress={() => changeQuantity(index, "-")}>
													<Text style={style.quantityActionHeader}>-</Text>
												</TouchableOpacity>
												<Text style={style.quantityHeader}>{option.selected}</Text>
												<TouchableOpacity style={style.quantityAction} onPress={() => changeQuantity(index, "+")}>
													<Text style={style.quantityActionHeader}>+</Text>
												</TouchableOpacity>
											</View>
										</View>
									)}

									{option.type == "percentage" && (
										<View style={{ flexDirection: 'row', justifyContent: 'space-around', width: width - 100 }}>
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
							))}

							<View style={style.note}>
								<TextInput style={style.noteInput} multiline={true} placeholder="Leave a note if you want" maxLength={100} onChangeText={(note) => setIteminfo({ ...itemInfo, note })} value={itemInfo.note} autoCorrect={false}/>
							</View>

							<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
								<View style={{ flexDirection: 'row' }}>
									<Text style={style.quantityHeader}>Quantity</Text>
									<View style={style.quantity}>
										<TouchableOpacity style={style.quantityAction} onPress={() => setIteminfo({ ...itemInfo, quantity: itemInfo.quantity > 1 ? itemInfo.quantity - 1 : itemInfo.quantity })}>
											<Text style={style.quantityActionHeader}>-</Text>
										</TouchableOpacity>
										<Text style={style.quantityHeader}>{itemInfo.quantity}</Text>
										<TouchableOpacity style={style.quantityAction} onPress={() => setIteminfo({ ...itemInfo, quantity: itemInfo.quantity + 1 })}>
											<Text style={style.quantityActionHeader}>+</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>

							<Text style={style.price}>Cost: $ {(itemInfo.price * itemInfo.quantity).toFixed(2)}</Text>

							{itemInfo.errorMsg ? <Text style={style.errorMsg}>{itemInfo.errorMsg}</Text> : null}

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

									{!itemInfo.orderid && (
										<TouchableOpacity style={style.itemAction} onPress={() => openDinersOrder()}>
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
						<View style={{ alignItems: 'center', marginVertical: 20 }}>
							<TouchableOpacity style={style.itemClose} onPress={() => setOpenrounds(false)}>
								<AntDesign name="close" size={20}/>
							</TouchableOpacity>
						</View>
						<Text style={style.boxHeader}>Order(s)</Text>

						<ScrollView style={{ height: screenHeight - 86 }}>
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
										<Text style={style.roundHeader}>This round is already sent</Text>
									}
									{round.round.map(orders => (
										orders.orders.map(order => (
											<View style={style.order} key={order.key}>
												<View style={{ alignItems: 'center' }}>
													<View style={style.orderItem} key={order.key}>
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

														<Text style={style.orderItemQuantity}>Quantity: {order.quantity}</Text>
														<Text style={style.orderItemPrice}>Cost: $ {(order.price * order.quantity).toFixed(2)}</Text>
													</View>
												</View>

												{!round.sent && (
													<View style={{ alignItems: 'center' }}>
														<TouchableOpacity style={style.itemChange} onPress={() => editTheOrder(order.id)}>
															<Text style={style.itemChangeHeader}>Edit Order</Text>
														</TouchableOpacity>
													</View>
												)}

												<View style={{ alignItems: 'center' }}>
													<View style={style.orderersEdit}>
														<Text style={style.orderersEditHeader}>Calling for {order.numorderers} {order.numorderers > 1 ? 'people' : 'person'}</Text>
														{!round.sent && (
															<TouchableOpacity style={style.orderersEditTouch} onPress={() => editTheOrderCallfor(order.id)}>
																<Text style={style.orderersEditTouchHeader}>{order.orderers.length > 0 ? 'Edit' : 'Add'}</Text>
															</TouchableOpacity>
														)}
													</View>
												</View>

												{order.orderers.length > 0 ? 
													order.orderers.map(info => (
														<View style={style.orderCallfor} key={info.key}>
															{info.row.map(order => (
																<View style={style.orderer} key={order.key}>
																	<View style={style.ordererProfile}>
																		<Image source={{ uri: logo_url + order.profile }} style={{ height: 50, width: 50 }}/>
																	</View>
																	<Text style={style.ordererUsername}>{order.username}</Text>
																</View>
															))}
														</View>
													))
													:
													<Text style={style.orderCallforHeader}>Your order</Text>
												}
											</View>
										))
									))}
								</View>
							))}
						</ScrollView>
					</View>
				</Modal>
			)}

			{openDiners && (
				<Modal>
					<View style={{ paddingVertical: offsetPadding }}>
						<View style={style.dinersList}>
							<TextInput style={style.dinerNameInput} placeholder="Search diner to order for" onChangeText={(username) => getDinersList(username)} autoCorrect={false}/>

							<View style={style.dinersListContainer}>
								<View style={{ height: '50%', overflow: 'hidden' }}>
									<Text style={style.dinersHeader}>{numDiners} Searched Diner(s)</Text>

									<View>
										<FlatList
											data={diners}
											renderItem={({ item, index }) => 
												<View key={item.key} style={style.row}>
													{item.row.map(diner => (
														diner.username ? 
															<TouchableOpacity key={diner.key} style={style.diner} onPress={() => selectDiner(diner.id)}>
																<View style={style.dinerProfileHolder}>
																	<Image source={{ uri: logo_url + diner.profile }} style={{ height: 60, width: 60 }}/>
																</View>
																<Text style={style.dinerName}>{diner.username}</Text>
															</TouchableOpacity>
															:
															<View key={diner.key} style={style.diner}></View>
													))}
												</View>
											}
										/>
									</View>
								</View>
							
								<View style={{ height: '50%', overflow: 'hidden' }}>
									{selectedDiners.length > 0 && (
										<>
											<Text style={style.selectedDinersHeader}>{numSelectedDiners} Selected Diner(s) to order this item</Text>

											<View>
												<FlatList
													data={selectedDiners}
													renderItem={({ item, index }) => 
														<View key={item.key} style={style.row}>
															{item.row.map(diner => (
																diner.username ? 
																	<View key={diner.key} style={style.diner}>
																		<TouchableOpacity style={style.dinerDelete} onPress={() => deselectDiner(diner.id)}>
																			<AntDesign name="closecircleo" size={15}/>
																		</TouchableOpacity>
																		<View style={style.dinerProfileHolder}>
																			<Image source={{ uri: logo_url + diner.profile }} style={{ height: 60, width: 60 }}/>
																		</View>
																		<Text style={style.dinerName}>{diner.username}</Text>
																	</View>
																	:
																	<View key={diner.key} style={style.diner}></View>
															))}
														</View>
													}
												/>
											</View>
										</>
									)}
								</View>
							</View>

							<View style={style.itemContainer}>
								<View style={style.itemImageHolder}>
									<Image style={{ height: 100, width: 100 }} source={{ uri: logo_url + orderingItem.image }}/>
								</View>
								<View style={style.itemInfos}>
									<Text style={style.itemName}>{orderingItem.name}</Text>
									{orderingItem.options.map((info, infoindex) => (
										<Text key={info.key} style={style.itemInfo}>
											<Text style={{ fontWeight: 'bold' }}>{info.header}: </Text> 
											{info.selected}
											{info.type == 'percentage' && '%'}
										</Text>
									))}
								</View>
								<View>
									<Text style={style.itemHeader}><Text style={{ fontWeight: 'bold' }}>quantity:</Text> {orderingItem.quantity}</Text>
									<Text style={style.itemHeader}><Text style={{ fontWeight: 'bold' }}>cost:</Text> $ {orderingItem.price}</Text>
								</View>
							</View>

							<Text style={style.errorMsg}>{orderingItem.errorMsg}</Text>

							<View style={{ alignItems: 'center' }}>
								<View style={style.actions}>
									<TouchableOpacity style={style.action} onPress={() => {
										setOpendiners(false)
										setOpenrounds(true)
										setDiners([])
										setSelectedDiners([])
										setNumdiners(0)
										setNumSelectedDiners(0)

										setOrderingItem({...orderingItem, errorMsg: '' })
										setIteminfo({ ...itemInfo, orderid: "" })
									}}>
										<Text style={style.actionHeader}>Close</Text>
									</TouchableOpacity>
									{!itemInfo.orderid ? 
										<TouchableOpacity style={style.action} onPress={() => addOrder()}>
											<Text style={style.actionHeader}>Add to Order</Text>
										</TouchableOpacity>
										:
										<TouchableOpacity style={style.action} onPress={() => updateTheOrderCallfor()}>
											<Text style={style.actionHeader}>Done</Text>
										</TouchableOpacity>
									}
								</View>
							</View>
						</View>
					</View>
				</Modal>
			)}

			{openFriends && (
				<Modal>
					<View style={{ paddingVertical: offsetPadding }}>
						<View style={style.friendsList}>
							<TextInput style={style.friendNameInput} placeholder="Search friends to add" onChangeText={(username) => getFriendsList(username)} autoCorrect={false}/>

							<View style={style.friendsListContainer}>
								<View style={{ height: '50%', overflow: 'hidden' }}>
									<Text style={style.friendsHeader}>{numDiners} Searched Friend(s)</Text>

									<FlatList
										data={friends}
										renderItem={({ item, index }) => 
											<View key={item.key} style={style.row}>
												{item.row.map(friend => (
													friend.username ? 
														<TouchableOpacity key={friend.key} style={style.friend} onPress={() => selectFriend(friend.id)}>
															<View style={style.friendProfileHolder}>
																<Image source={{ uri: logo_url + friend.profile }} style={{ height: 60, width: 60 }}/>
															</View>
															<Text style={style.friendName}>{friend.username}</Text>
														</TouchableOpacity>
														:
														<View key={friend.key} style={style.friend}></View>
												))}
											</View>
										}
									/>
								</View>
							
								<View style={{ height: '50%', overflow: 'hidden' }}>
									{selectedFriends.length > 0 && (
										<>
											<Text style={style.selectedFriendsHeader}>{numSelectedfriends} Selected Friend(s)</Text>

											<View>
												<FlatList
													data={selectedFriends}
													renderItem={({ item, index }) => 
														<View key={item.key} style={style.row}>
															{item.row.map(friend => (
																friend.username ? 
																	<View key={friend.key} style={style.friend}>
																		<TouchableOpacity style={style.friendDelete} onPress={() => deselectFriend(friend.id)}>
																			<AntDesign name="closecircleo" size={15}/>
																		</TouchableOpacity>
																		<View style={style.friendProfileHolder}>
																			<Image source={{ uri: logo_url + friend.profile }} style={{ height: 60, width: 60 }}/>
																		</View>
																		<Text style={style.friendName}>{friend.username}</Text>
																	</View>
																	:
																	<View key={friend.key} style={style.friend}></View>
															))}
														</View>
													}
												/>
											</View>
										</>
									)}
								</View>
							</View>

							<View style={style.itemContainer}>
								<View style={style.itemImageHolder}>
									<Image style={{ height: 100, width: 100 }} source={{ uri: logo_url + locationInfo.logo }}/>
								</View>
								<Text style={style.itemName}>{locationInfo.name}</Text>
							</View>

							<Text style={style.errorMsg}>{errorMsg}</Text>

							<View style={{ alignItems: 'center' }}>
								<View style={style.actions}>
									<TouchableOpacity style={style.action} onPress={() => {
										setOpenfriends(false)
										setSelectedfriends([])
										setNumselectedfriends(0)
										setErrormsg('')
									}}>
										<Text style={style.actionHeader}>Close</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.action} onPress={() => addTheDiners()}>
										<Text style={style.actionHeader}>Add</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</View>
				</Modal>
			)}
		</View>
	)
}

const style = StyleSheet.create({
	box: { height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 34, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	boxHeader: { fontSize: 15, marginHorizontal: 20, textAlign: 'center' },

	orderActions: { flexDirection: 'row', justifyContent: 'space-around' },
	orderAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 100 },
	orderActionHeader: { textAlign: 'center' },

	body: { flexDirection: 'column', height: screenHeight - 215, justifyContent: 'space-around' },
	row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, width: '100%' },
	item: { alignItems: 'center', backgroundColor: 'white', borderRadius: 5, flexDirection: 'column', height: itemSize, justifyContent: 'space-between', padding: 2, width: itemSize },
	itemDisabled: { height: itemSize, width: itemSize },
	itemImageHolder: { alignItems: 'center', borderRadius: imageSize / 2, flexDirection: 'column', height: imageSize, justifyContent: 'space-around', overflow: 'hidden', width: imageSize },
	itemName: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },

	// product
	product: { alignItems: 'center', marginBottom: 50, marginHorizontal: 10 },
	productImage: { borderRadius: imageSize / 2, height: imageSize, width: imageSize },
	productName: { fontSize: 20, fontWeight: 'bold' },
	productInfo: { fontSize: 15 },
	productDetail: { fontSize: 15, marginHorizontal: 10, marginVertical: 5 },
	productBuy: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 50 },
	productBuyHeader: { textAlign: 'center' },

	// item info
	itemClose: { alignItems: 'center', borderRadius: 15, borderStyle: 'solid', borderWidth: 2, flexDirection: 'column', justifyContent: 'space-around', padding: 2 },
	imageHolder: { borderRadius: 100, height: 200, overflow: 'hidden', width: 200 },
	image: { height: 200, width: 200 },
	boxItemHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
	boxItemHeaderInfo: {  fontSize: 15, fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },
	info: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, paddingHorizontal: 5, width: '100%' },
	infoHeader: { fontWeight: 'bold', margin: 5 },
	itemActions: { flexDirection: 'row', justifyContent: 'space-around' },
	itemAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 10, marginVertical: 30, padding: 10, width: 120 },
	itemActionHeader: { textAlign: 'center' },

	// options
	options: { flexDirection: 'row', justifyContent: 'space-between' },
	optionSelected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 2, padding: 8 },
	optionSelectedHeader: { color: 'white', fontSize: 15 },
	option: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, marginHorizontal: 2, padding: 8 },
	optionHeader: { color: 'black', fontSize: 15 },

	// quantity
	quantity: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	quantityAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	quantityHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	// percentage
	percentage: { flexDirection: 'row', justifyContent: 'space-between', width: 100 },
	percentageAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	percentageHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	// note
	note: { alignItems: 'center', marginBottom: 20 },
	noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, height: 100, padding: 5, width: '80%' },

	// quantity
	quantity: { flexDirection: 'row', justifyContent: 'space-around' },
	quantityAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 0.5, height: 35, paddingTop: 8, width: 35 },
	quantityHeader: { fontSize: 15, fontWeight: 'bold', padding: 10 },

	price: { fontWeight: 'bold', marginTop: 20, textAlign: 'center' },
	errorMsg: { color: 'red', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },

	// rounds list
	roundTouch: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginLeft: 10, padding: 5, width: 120 },
	roundTouchHeader: {  },
	round: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
	order: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, margin: 5 },
	orderItems: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, overflow: 'hidden' },
	orderItem: { alignItems: 'center', marginVertical: 20, width: 100 },
	orderItemImageHolder: { borderRadius: 40, height: 80, overflow: 'hidden', width: 80 },
	orderItemImage: { height: 80, width: 80 },
	orderItemName: { fontWeight: 'bold' },
	orderItemQuantity: {  },
	orderItemPrice: {  },
	itemChange: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 20, padding: 5, width: 80 },
	itemChangeHeader: { fontSize: 13, textAlign: 'center' },
	orderersEdit: { flexDirection: 'row' },
	orderersEditHeader: { fontWeight: 'bold', marginRight: 10, marginTop: 7, textAlign: 'center' },
	orderersEditTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	orderersEditTouchHeader: { },
	orderCallfor: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, width: '100%' },
	orderCallforHeader: { fontSize: 20, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	orderer: { alignItems: 'center', marginHorizontal: 10 },
	ordererProfile: { borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	ordererUsername: { textAlign: 'center' },

	// diners list
	dinersList: { flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	dinerNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, marginHorizontal: 20, padding: 10 },
	dinersListContainer: { flexDirection: 'column', height: '70%', justifyContent: 'space-between' },
	selectedDinersHeader: { fontWeight: 'bold', textAlign: 'center' },
	dinersHeader: { fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
	diner: { alignItems: 'center', height: width * 0.2, margin: 5, width: width * 0.2 },
	dinerDelete: { marginBottom: -5, marginLeft: 60 },
	dinerProfileHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 30, height: 60, overflow: 'hidden', width: 60 },
	dinerName: { textAlign: 'center' },

	// friends list
	friendsList: { flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	friendNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, marginHorizontal: 20, padding: 10 },
	friendsListContainer: { flexDirection: 'column', height: '70%', justifyContent: 'space-between' },
	selectedFriendsHeader: { fontWeight: 'bold', textAlign: 'center' },
	friendsHeader: { fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
	friend: { alignItems: 'center', height: width * 0.2, margin: 5, width: width * 0.2 },
	friendDelete: { marginBottom: -5, marginLeft: 60 },
	friendProfileHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 30, height: 60, overflow: 'hidden', width: 60 },
	friendName: { textAlign: 'center' },

	// location info
	itemContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 10, flexDirection: 'row', marginHorizontal: 10, padding: 10 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	itemName: { fontWeight: 'bold', marginVertical: 15, marginLeft: 50, textAlign: 'center' },

	actions: { flexDirection: 'row', justifyContent: 'space-around' },
	action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 60 },
	actionHeader: { textAlign: 'center' },
})
