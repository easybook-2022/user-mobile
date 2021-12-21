import React, { useEffect, useState, useRef } from 'react'
import { 
	ActivityIndicator, Dimensions, ScrollView, View, FlatList, Image, Text, 
	TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { socket, logo_url, displayTime } from '../../../assets/info'
import { getLocationHours, getLocationProfile, makeReservation, getInfo } from '../../apis/locations'
import { getReservationInfo } from '../../apis/schedules'
import { getNumCartItems } from '../../apis/carts'
import { getUserInfo, searchFriends } from '../../apis/users'

import Cart from '../../components/cart'
import Userauth from '../../components/userauth'

import AntDesign from 'react-native-vector-icons/AntDesign'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const imageSize = 50

const fsize = p => {
	return width * p
}

export default function booktime(props) {
	const months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'October', 'November', 'December']
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const pushtime = 1000 * (60 * 10)
	
	const { locationid } = props.route.params
	const func = props.route.params
	const scheduleid = props.route.params.scheduleid ? props.route.params.scheduleid : null

	const [name, setName] = useState(name)

	const [openList, setOpenlist] = useState(false)
	const [diners, setDiners] = useState([])
	const [numDiners, setNumdiners] = useState(0)
	const [selectedDiners, setSelecteddiners] = useState([])
	const [numSelectedDiners, setNumselecteddiners] = useState(0)
	const [selectedTable, setSelectedtable] = useState('')
	const [locationInfo, setLocationinfo] = useState({ name: "", logo: "" })
	const [errorMsg, setErrormsg] = useState('')
	const [showAuth, setShowauth] = useState({ show: false, action: "" })
	const [userId, setUserid] = useState(null)

	const [scheduledTimes, setScheduledtimes] = useState([])
	const [openTime, setOpentime] = useState({ hour: 0, minute: 0 })
	const [closeTime, setClosetime] = useState({ hour: 0, minute: 0 })
	const [selectedDateInfo, setSelecteddateinfo] = useState({ month: '', year: 0, day: '', date: 0, time: 0 })
	const [calendar, setCalendar] = useState({ firstDay: 0, numDays: 30, data: [
		{ key: "day-row-0", row: [
	    	{ key: "day-0-0", num: 0, passed: false }, { key: "day-0-1", num: 0, passed: false }, { key: "day-0-2", num: 0, passed: false }, 
	    	{ key: "day-0-3", num: 0, passed: false }, { key: "day-0-4", num: 0, passed: false }, { key: "day-0-5", num: 0, passed: false }, 
	    	{ key: "day-0-6", num: 0, passed: false }
    	]}, 
  		{ key: "day-row-1", row: [
	    	{ key: "day-1-0", num: 0, passed: false }, { key: "day-1-1", num: 0, passed: false }, { key: "day-1-2", num: 0, passed: false }, 
	    	{ key: "day-1-3", num: 0, passed: false }, { key: "day-1-4", num: 0, passed: false }, { key: "day-1-5", num: 0, passed: false }, 
	    	{ key: "day-1-6", num: 0, passed: false }
    	]}, 
    	{ key: "day-row-2", row: [
	    	{ key: "day-2-0", num: 0, passed: false }, { key: "day-2-1", num: 0, passed: false }, { key: "day-2-2", num: 0, passed: false }, 
	    	{ key: "day-2-3", num: 0, passed: false }, { key: "day-2-4", num: 0, passed: false }, { key: "day-2-5", num: 0, passed: false }, 
	    	{ key: "day-2-6", num: 0, passed: false }
    	]}, 
	  	{ key: "day-row-3", row: [
	    	{ key: "day-3-0", num: 0, passed: false }, { key: "day-3-1", num: 0, passed: false }, { key: "day-3-2", num: 0, passed: false }, 
	    	{ key: "day-3-3", num: 0, passed: false }, { key: "day-3-4", num: 0, passed: false }, { key: "day-3-5", num: 0, passed: false }, 
	    	{ key: "day-3-6", num: 0, passed: false }
	    ]}, 
	    { key: "day-row-4", row: [
	    	{ key: "day-4-0", num: 0, passed: false }, { key: "day-4-1", num: 0, passed: false }, { key: "day-4-2", num: 0, passed: false }, 
	    	{ key: "day-4-3", num: 0, passed: false }, { key: "day-4-4", num: 0, passed: false }, { key: "day-4-5", num: 0, passed: false }, 
	    	{ key: "day-4-6", num: 0, passed: false }
	    ]}, 
	    { key: "day-row-5", row: [
	    	{ key: "day-5-0", num: 0, passed: false }, { key: "day-5-1", num: 0, passed: false }, { key: "day-5-2", num: 0, passed: false }, 
	    	{ key: "day-5-3", num: 0, passed: false }, { key: "day-5-4", num: 0, passed: false }, { key: "day-5-5", num: 0, passed: false }, 
	    	{ key: "day-5-6", num: 0, passed: false }
	    ]}
	]})
	const [times, setTimes] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [showPaymentRequired, setShowpaymentrequired] = useState(false)

	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(0)
	const [confirmRequest, setConfirmrequest] = useState({ show: false, service: "", oldtime: 0, time: 0, note: "", requested: false, errormsg: "" })
	
	const isMounted = useRef(null)

	const getTheNumCartItems = async() => {
		const userid = await AsyncStorage.getItem("userid")

		if (userid) {
			getNumCartItems(userid)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res && isMounted.current == true) {
						setUserid(userid)
						setNumcartitems(res.numCartItems)
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					}
				})
		}
	}

	const getTheLocationProfile = async() => {
		const longitude = await AsyncStorage.getItem("longitude")
		const latitude = await AsyncStorage.getItem("latitude")
		const data = { locationid, longitude, latitude }

		getLocationProfile(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					const { name } = res.locationInfo

					setName(name)
					getTheLocationHours()
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const dateNavigate = (dir) => {
		setLoaded(false)

		const currTime = new Date(Date.now())
		const currDay = days[currTime.getDay()]
		const currMonth = months[currTime.getMonth()]

		let month = months.indexOf(selectedDateInfo.month), year = selectedDateInfo.year

		month = dir == 'left' ? month - 1 : month + 1

		if (month < 0) {
			month = 11
			year--
		} else if (month > 11) {
			month = 0
			year++
		}

		let firstDay, numDays, daynum = 1, data = calendar.data, datetime
		let datenow = Date.parse(currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear())

		firstDay = (new Date(year, month)).getDay()
		numDays = 32 - new Date(year, month, 32).getDate()
		data.forEach(function (info, rowindex) {
			info.row.forEach(function (day, dayindex) {
				day.num = 0
				day.passed = false

				if (rowindex == 0) {
					if (dayindex >= firstDay) {
						datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

						day.passed = datenow > datetime
						day.num = daynum
						daynum++
					}
				} else if (daynum <= numDays) {
					datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

					day.passed = datenow > datetime
					day.num = daynum
					daynum++
				}
			})
		})

		let date = month == currTime.getMonth() && year == currTime.getFullYear() ? currTime.getDate() : 1
		let openStr = months[month] + " " + date + ", " + year + " " + openTime.hour + ":" + openTime.minute
		let closeStr = months[month] + " " + date + ", " + year + " " + closeTime.hour + ":" + closeTime.minute
		let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), currDateStr = openDateStr
		let currenttime = Date.now(), newTimes = []

		while (currDateStr < (closeDateStr - pushtime)) {
			currDateStr += pushtime

			let timestr = new Date(currDateStr)
			let hour = timestr.getHours()
			let minute = timestr.getMinutes()
			let period = hour < 12 ? "am" : "pm"

			let timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period
			let timepassed = currenttime > currDateStr
			let timetaken = scheduledTimes.indexOf(currDateStr) > -1

			newTimes.push({ 
				key: newTimes.length, header: timedisplay, 
				time: currDateStr, timetaken, timepassed
			})
		}

		setSelecteddateinfo({ ...selectedDateInfo, month: months[month], date: null, year })
		setCalendar({ firstDay, numDays, data })
		setTimes(newTimes)
		setLoaded(true)
	}
	const selectDate = (date) => {
		const { month, year } = selectedDateInfo

		let openStr = month + " " + date + ", " + year + " " + openTime.hour + ":" + openTime.minute
		let closeStr = month + " " + date + ", " + year + " " + closeTime.hour + ":" + closeTime.minute
		let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), currDateStr = openDateStr
		let currenttime = Date.now(), newTimes = []

		while (currDateStr < (closeDateStr - pushtime)) {
			currDateStr += pushtime

			let timestr = new Date(currDateStr)
			let hour = timestr.getHours()
			let minute = timestr.getMinutes()
			let period = hour < 12 ? "am" : "pm"

			let timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period
			let timepassed = currenttime > currDateStr
			let timetaken = scheduledTimes.indexOf(currDateStr) > -1

			newTimes.push({ 
				key: newTimes.length, header: timedisplay, 
				time: currDateStr, timetaken, timepassed
			})
		}

		setSelecteddateinfo({ ...selectedDateInfo, date })
		setTimes(newTimes)
	}
	const selectTime = (name, timeheader, time) => {
		const { month, date, year } = selectedDateInfo

		setSelecteddateinfo({ ...selectedDateInfo, name, time })

		if (selectedDateInfo.date) {
			setConfirmrequest({ ...confirmRequest, show: true, service: name, time })
		}
	}

	const getTheReservationInfo = async() => {
		getReservationInfo(scheduleid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res && isMounted.current == true) {
					const { numdiners, diners, table, note } = res.reservationInfo

					setNumselecteddiners(numdiners)
					setSelecteddiners(diners)
					setSelectedtable(table)
					setConfirmrequest({ ...confirmRequest, note })
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}

	const getTheUserInfo = async() => {
		const userid = await AsyncStorage.getItem("userid")

		if (userid) {
			getUserInfo(userid)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						const { id, username, profile } = res.userInfo

						setNumselecteddiners(1)
						setSelecteddiners([{
							key: "selected-friend-0", 
							row: [
								{ key: "selected-friend-row-0", id, username, profile },
								{ key: "selected-friend-row-1" },
								{ key: "selected-friend-row-2" },
								{ key: "selected-friend-row-3" },
							]
						}])
					}
				})
		}
	}
	const getTheLocationHours = async() => {
		const day = new Date(Date.now()).toString().split(" ")[0]
		const data = { locationid, day }

		getLocationHours(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { openTime, closeTime, scheduled } = res

					let openHour = openTime.hour, openMinute = openTime.minute, openPeriod = openTime.period
					let closeHour = closeTime.hour, closeMinute = closeTime.minute, closePeriod = closeTime.period

					const currTime = new Date(Date.now())
					const currDay = days[currTime.getDay()]
					const currDate = currTime.getDate()
					const currMonth = months[currTime.getMonth()]

					let openStr = currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear() + " " + openHour + ":" + openMinute
					let closeStr = currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear() + " " + closeHour + ":" + closeMinute
					let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr)
					let newTimes = [], currenttime = Date.now(), currDateStr = openDateStr
					let firstDay = (new Date(currTime.getFullYear(), currTime.getMonth())).getDay()
					let numDays = 32 - new Date(currTime.getFullYear(), currTime.getMonth(), 32).getDate()
					let daynum = 1, data = calendar.data, datetime = 0, datenow = Date.parse(currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear())

					data.forEach(function (info, rowindex) {
						info.row.forEach(function (day, dayindex) {
							day.num = 0

							if (rowindex == 0) {
								if (dayindex >= firstDay) {
									datetime = Date.parse(days[dayindex] + " " + currMonth + " " + daynum + " " + currTime.getFullYear())

									day.passed = datenow > datetime
									day.num = daynum
									daynum++
								}
							} else if (daynum <= numDays) {
								datetime = Date.parse(days[dayindex] + " " + currMonth + " " + daynum + " " + currTime.getFullYear())

								day.passed = datenow > datetime
								day.num = daynum
								daynum++
							}
						})
					})

					while (currDateStr < (closeDateStr - pushtime)) {
						currDateStr += pushtime

						let timestr = new Date(currDateStr)
						let hour = timestr.getHours()
						let minute = timestr.getMinutes()
						let period = hour < 12 ? "am" : "pm"

						let timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period
						let timepassed = currenttime > currDateStr
						let timetaken = scheduled.indexOf(currDateStr) > -1

						newTimes.push({ 
							key: newTimes.length, header: timedisplay, 
							time: currDateStr, timetaken, timepassed
						})
					}

					setOpentime({ hour: openHour, minute: openMinute })
					setClosetime({ hour: closeHour, minute: closeMinute })
					setSelecteddateinfo({ month: currMonth, year: currTime.getFullYear(), day: currDay, date: currDate, time: 0 })
					setCalendar({ firstDay, numDays, data })
					setScheduledtimes(scheduled)
					setTimes(newTimes)
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const makeTheReservation = async() => {
		if (userId) {
			const { month, date, year, time } = selectedDateInfo
			const { note, oldtime } = confirmRequest
			const selecteddate = new Date(time)
			const selectedtime = selecteddate.getHours() + ":" + selecteddate.getMinutes()
			const dateInfo = Date.parse(month + " " + date + ", " + year + " " + selectedtime).toString()
			const diners = []

			selectedDiners.forEach(function (info) {
				info.row.forEach(function (diner) {
					if (diner.id) {
						diners.push({ "userid": diner['id'].toString(), "status": "waiting" })
					}
				})
			})

			let data = { 
				userid: userId, locationid, scheduleid, table: selectedTable, 
				oldtime, time: dateInfo, diners, note: note ? note : "",
				type: "makeReservation"
			}

			makeReservation(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						if (res.status == "new" || res.status == "updated" || res.status == "requested") {
							const { receivingUsers, receivingLocations } = res

							data = { ...data, receivingUsers, receivingLocations }
							socket.emit("socket/makeReservation", data, () => setConfirmrequest({ ...confirmRequest, requested: true }))
						} else {
							let { oldtime, note } = res

							setConfirmrequest({ ...confirmRequest, oldtime, note })
						}
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data

						switch (status) {
							case "cardrequired":
								setConfirmrequest({ ...confirmRequest, show: false })
								setShowpaymentrequired(true)

								break;
							default:
								setConfirmrequest({ ...confirmRequest, show: true, errormsg })
						}
					}
				})
		} else {
			setConfirmrequest({ ...confirmRequest, show: false })
			setShowauth({ show: true, action: "makereservation" })
		}
	}
	const finish = async() => {
		setOpenlist(false)
		setErrormsg('')
	}

	const getDinersList = async(username) => {
		const data = { userid: userId, username }

		searchFriends(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setDiners(res.searchedFriends)
					setNumdiners(res.numSearchedFriends)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
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

		// get last selected friend
		newDiners.forEach(function (info) {
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

			for (let k = 0; k < last_row.length; k++) {
				if (last_row[k].id) {
					next_key = parseInt(last_row[k].key.substr(16)) + 1
				} else {
					unfill = true
					selected.key = "selected-friend-" + next_key
					last_row[k] = selected
					next_key += 1

					break
				}
			}

			if (unfill) {
				newSelectedDiners[newSelectedDiners.length - 1].row = last_row
				setNumselecteddiners(numSelectedDiners + 1)
			} else {
				selected.key = "selected-friend-" + next_key
				newSelectedDiners.push({
					key: "selected-friend-row-" + (newSelectedDiners.length),
					row: [
						selected,
						{ key: "selected-friend-" + (next_key + 1) },
						{ key: "selected-friend-" + (next_key + 2) },
						{ key: "selected-friend-" + (next_key + 3) }
					]
				})
			}

			setNumselecteddiners(numSelectedDiners + 1)
		} else {
			selected.key = "selected-friend-0"
			newSelectedDiners = [{
				key: "selected-friend-row-0",
				row: [
					selected,
					{ key: "selected-friend-1" },
					{ key: "selected-friend-2" },
					{ key: "selected-friend-3" }
				]
			}]
			setNumselecteddiners(1)
		}

		setSelecteddiners(newSelectedDiners)
	}
	const deselectDiner = (userid) => {
		let list = [...selectedDiners]
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

		setSelecteddiners(newList)
		setNumselecteddiners(numSelectedDiners - 1)
	}
	const openDinersList = async() => {
		if (userId) {
			const data = { locationid, menuid: "" }

			getInfo(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						setOpenlist(true)
						setLocationinfo({ name: res.name, logo: res.icon })
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						
					}
				})
		} else {
			setShowauth({ show: true, action: "opendinerslist" })
		}
	}
	const initialize = () => {
		getTheNumCartItems()
		getTheLocationProfile()

		if (scheduleid) {
			getTheReservationInfo()
		} else {
			getTheUserInfo()
		}
	}

	useEffect(() => {
		isMounted.current = true

		initialize()

		return () => isMounted.current = false
	}, [])

	return (
		<View style={style.makereservation}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<TouchableOpacity style={style.back} onPress={() => {
						if (func.initialize) {
							func.initialize()
						}

						props.navigation.goBack()
					}}>
						<Text style={style.backHeader}>Back</Text>
					</TouchableOpacity>

					<View style={style.headers}>
						<Text style={style.boxHeader}>{!scheduleid ? 'Make a' : 'Remake the' } reservation {scheduleid ? 'for ' : 'at '}</Text>

						{scheduleid && <Text style={{ fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' }}>{numSelectedDiners} {numSelectedDiners == 1 ? 'person' : 'people'}</Text>}
						{scheduleid && <Text style={style.boxHeader}>at</Text>}

						<Text style={style.serviceHeader}>{name}</Text>
					</View>

					{!loaded ? 
						<ActivityIndicator size="small"/>
						:
						times.length > 0 ?
							<ScrollView>
								<View style={{ alignItems: 'center', marginBottom: 30, marginTop: 0 }}>
									<View style={style.dinersBox}>
										{!scheduleid && (
											<>
												<TouchableOpacity style={style.dinersAdd} onPress={() => openDinersList()}>
													<Text style={style.dinersAddHeader}>{numSelectedDiners > 0 ? 'Edit' : 'Add Other'} Diner(s)</Text>
												</TouchableOpacity>
												<Text style={style.dinersHeader}>{numSelectedDiners} diner(s) selected</Text>
											</>
										)}

										{(!openList && selectedDiners.length > 0) && (
											selectedDiners.map(item => (
												<View key={item.key} style={style.selectedDinersRow}>
													{item.row.map(diner => (
														diner.id ? 
															<View key={diner.key} style={style.selectedDiner}>
																{diner.id != userId ? 
																	<TouchableOpacity style={style.selectedDinerDelete} onPress={() => deselectDiner(diner.id)}>
																		<AntDesign name="closecircleo" size={15}/>
																	</TouchableOpacity>
																	:
																	<View style={style.selectedDinerDelete}></View>
																}
																<View style={style.dinerProfileHolder}>
																	<Image source={{ uri: logo_url + diner.profile }} style={{ height: 60, width: 60 }}/>
																</View>
															</View>
															:
															<View key={diner.key} style={style.selectedDiner}>
															</View>
													))}
												</View>
											))
										)}
									</View>
								</View>

								<View style={style.dateHeaders}>
									<Text style={style.timesHeader}>Pick a date</Text>

									<View style={style.date}>
										<TouchableOpacity style={style.dateNav} onPress={() => dateNavigate('left')}><AntDesign name="left" size={25}/></TouchableOpacity>
										<Text style={style.dateHeader}>{selectedDateInfo.month}, {selectedDateInfo.year}</Text>
										<TouchableOpacity style={style.dateNav} onPress={() => dateNavigate('right')}><AntDesign name="right" size={25}/></TouchableOpacity>
									</View>

									<View style={style.dateDays}>
										<View style={style.dateDaysRow}>
											{days.map((day, index) => (
												<TouchableOpacity key={"day-header-" + index} style={style.dateDayTouchDisabled}>
													<Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{day.substr(0, 3)}</Text>
												</TouchableOpacity>
											))}
										</View>
										{calendar.data.map((info, rowindex) => (
											<View key={info.key} style={style.dateDaysRow}>
												{info.row.map((day, dayindex) => (
													day.num > 0 ?
														day.passed ? 
															<TouchableOpacity key={day.key} disabled={true} style={style.dateDayTouchPassed}>
																<Text style={style.dateDayTouchHeader}>{day.num}</Text>
															</TouchableOpacity>
															:
															selectedDateInfo.date == day.num ?
																<TouchableOpacity key={day.key} style={style.dateDayTouchSelected} onPress={() => selectDate(day.num)}>
																	<Text style={style.dateDayTouchSelectedHeader}>{day.num}</Text>
																</TouchableOpacity>
																:
																<TouchableOpacity key={day.key} style={style.dateDayTouch} onPress={() => selectDate(day.num)}>
																	<Text style={style.dateDayTouchHeader}>{day.num}</Text>
																</TouchableOpacity>
														:
														<TouchableOpacity key={"calender-header-" + rowindex + "-" + dayindex} style={style.dateDayTouchDisabled}></TouchableOpacity>
												))}
											</View>
										))}
									</View>
								</View>
								<Text style={style.timesHeader}>Pick a time</Text>
								<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 50, width: '100%' }}>
									<View style={style.times}>
										{times.map(info => (
											<View key={info.key}>
												{(!info.timetaken && !info.timepassed) && (
													<TouchableOpacity style={style.unselect} onPress={() => selectTime(name, info.header, info.time)}>
														<Text style={{ color: 'black', fontSize: fsize(0.04) }}>{info.header}</Text>
													</TouchableOpacity>
												)}

												{(info.timetaken && !info.timepassed) && (
													<TouchableOpacity style={style.selected} disabled={true} onPress={() => {}}>
														<Text style={{ color: 'white', fontSize: fsize(0.04) }}>{info.header}</Text>
													</TouchableOpacity>
												)}

												{(!info.timetaken && info.timepassed) && (
													<TouchableOpacity style={style.selectedPassed} disabled={true} onPress={() => {}}>
														<Text style={{ color: 'black', fontSize: fsize(0.04) }}>{info.header}</Text>
													</TouchableOpacity>
												)}
											</View>
										))}
									</View>
								</View>
							</ScrollView>
							:
							<View style={style.noTime}>
								<Text style={style.noTimeHeader}>Currently closed</Text>
							</View>
					}

					<View style={style.bottomNavs}>
						<View style={style.bottomNavsRow}>
							{userId && (
								<TouchableOpacity style={style.bottomNav} onPress={() => props.navigation.navigate("account")}>
									<FontAwesome5 name="user-circle" size={fsize(0.08)}/>
								</TouchableOpacity>
							)}

							{userId && (
								<TouchableOpacity style={style.bottomNav} onPress={() => props.navigation.navigate("recent")}>
									<FontAwesome name="history" size={fsize(0.08)}/>
								</TouchableOpacity>
							)}

							{userId && (
								<TouchableOpacity style={style.bottomNav} onPress={() => setOpencart(true)}>
									<Entypo name="shopping-cart" size={fsize(0.08)}/>
									{numCartItems > 0 && <Text style={style.numCartItemsHeader}>{numCartItems}</Text>}
								</TouchableOpacity>
							)}

							<TouchableOpacity style={style.bottomNav} onPress={() => {
								props.navigation.dispatch(
									CommonActions.reset({
										index: 0,
										routes: [{ name: "main" }]
									})
								)
							}}>
								<Entypo name="home" size={fsize(0.08)}/>
							</TouchableOpacity>

							<TouchableOpacity style={style.bottomNav} onPress={() => {
								if (userId) {
									AsyncStorage.clear()

									setUserid(null)
									setNumselecteddiners(0)
									setSelectediners([])
								} else {
									setShowauth({ show: true, action: "" })
								}
							}}>
								<Text style={style.bottomNavHeader}>{userId ? 'Log-Out' : 'Log-In'}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>

				{confirmRequest.show && (
					<Modal transparent={true}>
						<TouchableWithoutFeedback style={{ paddingVertical: offsetPadding }} onPress={() => Keyboard.dismiss()}>
							<View style={style.confirmBox}>
								<View style={style.confirmContainer}>
									{!confirmRequest.requested ? 
										<>
											{confirmRequest.oldtime == 0 ? 
												<Text style={style.confirmHeader}>
													<Text style={{ fontFamily: 'appFont' }}>{!scheduleid ? 'Request' : 'Re-request'} a reservation for {'\n'}</Text>
													{numSelectedDiners > 0 ? 
														" " + numSelectedDiners + " " + (numSelectedDiners > 1 ? 'people' : 'person') 
														: 
														" yourself"
													}
													<Text style={{ fontFamily: 'appFont' }}>{'\n\nat ' + confirmRequest.service + '\n'}</Text>
													<Text style={{ fontFamily: 'appFont' }}>{'\n' + displayTime(confirmRequest.time)}</Text>
												</Text>
												:
												<Text style={style.confirmHeader}>
													<Text style={{ fontFamily: 'appFont' }}>You already requested a reservation for {'\n'}</Text>
													{numSelectedDiners > 0 ? 
														" " + numSelectedDiners + " " + (numSelectedDiners > 1 ? 'people' : 'person') 
														: 
														" yourself"
													}
													<Text style={{ fontFamily: 'appFont' }}>{'\nat ' + confirmRequest.service + '\n'}</Text>
													{displayTime(confirmRequest.oldtime) + '\n\n'}
													<Text style={{ fontFamily: 'appFont' }}>Are you sure you want to change it to</Text>
													{'\n' + displayTime(confirmRequest.time) + '\n'}
												</Text>
											}

											<View style={style.note}>
												<TextInput style={style.noteInput} multiline={true} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Leave a note if you want" maxLength={100} onChangeText={(note) => setConfirmrequest({...confirmRequest, note })} value={confirmRequest.note} autoCorrect={false} autoCapitalize="none"/>
											</View>

											{confirmRequest.errormsg ? <Text style={style.errorMsg}>You already requested a reservation for this restaurant</Text> : null}

											<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
												<View style={style.confirmOptions}>
													<TouchableOpacity style={style.confirmOption} onPress={() => setConfirmrequest({ show: false, service: "", oldtime: 0, time: 0, note: "", requested: false, errormsg: "" })}>
														<Text style={style.confirmOptionHeader}>No</Text>
													</TouchableOpacity>
													<TouchableOpacity style={style.confirmOption} onPress={() => makeTheReservation()}>
														<Text style={style.confirmOptionHeader}>Yes</Text>
													</TouchableOpacity>
												</View>
											</View>
										</>
										:
										<>
											<View style={style.requestedHeaders}>
												<Text style={style.requestedHeader}>Reservation requested</Text>
												<Text style={style.requestedHeader}>at</Text>
												<Text style={style.requestedHeaderInfos}>
													<Text style={style.requestedHeaderInfo}>{confirmRequest.service} {'\n'}</Text>
													<Text style={style.requestedHeaderInfo}>{displayTime(confirmRequest.time)}</Text>
													<Text style={style.requestedHeaderInfo}>
														{'\n'}for 
														{numSelectedDiners > 0 ? 
															" " + numSelectedDiners + " " + (numSelectedDiners > 1 ? 'people' : 'person') 
															: 
															" yourself"
														}
													</Text>
												</Text>
												<Text style={{ textAlign: 'center' }}>You will get notify by the restaurant in your notification very soon</Text>
												<TouchableOpacity style={style.requestedClose} onPress={() => {
													setConfirmrequest({ ...confirmRequest, show: false, requested: false })

													if (func.initialize) {
														func.initialize()
													}

													props.navigation.dispatch(
														CommonActions.reset({
															index: 0,
															routes: [{ name: "main", params: { showNotif: true } }]
														})
													)
												}}>
													<Text style={style.requestedCloseHeader}>Ok</Text>
												</TouchableOpacity>
											</View>
										</>
									}
								</View>
							</View>
						</TouchableWithoutFeedback>
					</Modal>
				)}
				{openCart && <Modal><Cart navigation={props.navigation} close={() => {
					getTheNumCartItems()
					setOpencart(false)
				}}/></Modal>}
				{openList && (
					<Modal>
						<View style={style.dinersListBox}>
							<View style={{ paddingVertical: offsetPadding }}>
								<View style={style.dinersList}>
									<TextInput style={style.dinerNameInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Search diner(s) to add to reservation" onChangeText={(username) => getDinersList(username)} autoCorrect={false} autoCapitalize="none"/>

									<View style={style.dinersListContainer}>
										<View style={style.dinersListSearched}>
											<Text style={style.dinersHeader}>{numDiners} Searched Diner(s)</Text>

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
									
										<View style={style.dinersListSelected}>
											{selectedDiners.length > 0 && (
												<>
													<Text style={style.selectedDinersHeader}>{numSelectedDiners} Selected Diner(s) to this reservation</Text>

													<FlatList
														data={selectedDiners}
														renderItem={({ item, index }) => 
															<View key={item.key} style={style.row}>
																{item.row.map(diner => (
																	diner.username ? 
																		<View key={diner.key} style={style.diner}>
																			{diner.id != userId ? 
																				<TouchableOpacity style={style.dinerDelete} onPress={() => deselectDiner(diner.id)}>
																					<AntDesign name="closecircleo" size={15}/>
																				</TouchableOpacity>
																				:
																				<View style={style.dinerDelete}></View>
																			}
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
												</>
											)}
										</View>
									</View>

									<View style={style.itemContainer}>
										<View style={style.itemImageHolder}>
											<Image style={{ height: imageSize, width: imageSize }} source={{ uri: logo_url + locationInfo.logo }}/>
										</View>
										<Text style={style.itemName}>{locationInfo.name}</Text>
									</View>

									<Text style={style.errorMsg}>{errorMsg}</Text>

									<View style={{ alignItems: 'center' }}>
										<View style={style.actions}>
											<TouchableOpacity style={style.action} onPress={() => finish()}>
												<Text style={style.actionHeader}>Finish</Text>
											</TouchableOpacity>
										</View>
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
										You need to provide a payment method to request
										a reservation
									</Text>

									<View style={style.cardRequiredActions}>
										<TouchableOpacity style={style.cardRequiredAction} onPress={() => setShowpaymentrequired(false)}>
											<Text style={style.cardRequiredActionHeader}>Close</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.cardRequiredAction} onPress={() => {
											setShowpaymentrequired(false)
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
				{showAuth.show && (
					<Modal transparent={true}>
						<Userauth close={() => setShowauth({ show: false, action: "" })} done={(id, msg) => {
							if (msg == "setup") {
								props.navigation.dispatch(
									CommonActions.reset({
										index: 1,
										routes: [{ name: "setup" }]
									})
								);
							} else {
								socket.emit("socket/user/login", "user" + id, () => {
									setUserid(id)

									if (showAuth.action == "makereservation") {
										makeTheReservation()
									} else if (showAuth.action == "opendinerslist") {
										openDinersList()
									} else {
										if (scheduleid) {
											getTheReservationInfo()
										} else {
											getTheUserInfo()
										}
									}

									setShowauth({ show: false, action: "" })
								})
							}
						}} navigate={props.navigation.navigate}/>
					</Modal>
				)}
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	makereservation: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginTop: 20, marginHorizontal: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: fsize(0.05) },

	headers: { height: 100, marginVertical: 10 },
	boxHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', textAlign: 'center' },
	serviceHeader: { fontSize: fsize(0.06), fontWeight: 'bold', textAlign: 'center' },

	dinersBox: { alignItems: 'center' },
	dinersAdd: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 150 },
	dinersAddHeader: { textAlign: 'center' },
	dinersHeader: { marginVertical: 5, textAlign: 'center' },
	selectedDinersRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 10 },
	selectedDiner: { alignItems: 'center' },
	selectedDinerDelete: { height: 16, marginBottom: -5, marginLeft: 60, width: 16 },
	selectedDinerProfileHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 30, height: 60, overflow: 'hidden', width: 60 },

	dateHeaders: { alignItems: 'center', marginVertical: 50 },
	date: { flexDirection: 'row', margin: 10 },
	dateNav: { marginHorizontal: 20 },
	dateHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), marginVertical: 5, textAlign: 'center', width: fsize(0.5) },
	dateDays: { alignItems: 'center' },
	dateDaysRow: { flexDirection: 'row' },
	
	dateDayTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 3, paddingVertical: 10, width: fsize(0.1) },
	dateDayTouchHeader: { color: 'black', fontSize: fsize(0.038), textAlign: 'center' },

	dateDayTouchSelected: { backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 3, paddingVertical: 10, width: fsize(0.1) },
	dateDayTouchSelectedHeader: { color: 'white', fontSize: fsize(0.038), textAlign: 'center' },

	dateDayTouchPassed: { backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 3, paddingVertical: 10, width: fsize(0.1) },
	dateDayTouchPassedHeader: { color: 'black', fontSize: fsize(0.038), textAlign: 'center' },

	dateDayTouchDisabled: { margin: 3, paddingVertical: 10, width: fsize(0.1) },
	dateDayTouchDisabledHeader: { fontSize: fsize(0.038), fontWeight: 'bold' },

	timesHeader: { fontFamily: 'appFont', fontSize: fsize(0.07), fontWeight: 'bold', textAlign: 'center' },
	times: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', width: fsize(0.79) },
	
	unselect: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, paddingVertical: 10, width: fsize(0.25) },
	unselectHeader: { color: 'black', fontSize: fsize(0.04) },
	
	selected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, paddingVertical: 10, width: fsize(0.25) },
	selectedHeader: { color: 'white', fontSize: fsize(0.04) },
	
	selectedPassed: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, opacity: 0.3, paddingVertical: 10, width: fsize(0.25) },
	selectedPassedHeader: { color: 'black', fontSize: fsize(0.04) },

	noTime: { flexDirection: 'column', height: screenHeight - 191, justifyContent: 'space-around', width: '100%' },
	noTimeHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	cart: { flexDirection: 'row', height: 30, marginVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', paddingVertical: 10, width: '80%' },
	confirmHeader: { fontSize: fsize(0.05), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	note: { alignItems: 'center', marginBottom: 20 },
	noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, height: 80, padding: 5, width: '80%' },
	confirmOptions: { flexDirection: 'row' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmOptionHeader: { },
	requestedHeaders: { alignItems: 'center', paddingHorizontal: 10 },
	requestedClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 10, padding: 5, width: 100 },
	requestedCloseHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), textAlign: 'center' },
	requestedHeader: { fontFamily: 'appFont', fontSize: fsize(0.06) },
	requestedHeaderInfos: { marginBottom: 30 },
	requestedHeaderInfo: { fontSize: fsize(0.048), paddingVertical: 5, textAlign: 'center' },

	// friends list
	dinersListBox: { backgroundColor: 'white' },
	dinersList: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: screenHeight, justifyContent: 'space-between', width: '100%' },
	dinerNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, margin: 10, padding: 10 },
	dinersListContainer: { flexDirection: 'column', height: screenHeight - 180, justifyContent: 'space-between' },
	dinersListSearched: { height: '50%', overflow: 'hidden' },
	dinersHeader: { fontWeight: 'bold', textAlign: 'center' },
	dinersListSelected: { height: '50%', overflow: 'hidden' },
	selectedDinersHeader: { fontWeight: 'bold', textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
	diner: { alignItems: 'center', height: width * 0.2, margin: 5, width: width * 0.2 },
	dinerDelete: { height: 16, marginBottom: -5, marginLeft: 60, width: 16 },
	dinerProfileHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 30, height: 60, overflow: 'hidden', width: 60 },
	dinerName: { textAlign: 'center' },

	// location info
	itemContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 10, flexDirection: 'row', marginHorizontal: 10, padding: 10 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: imageSize / 2, height: imageSize, overflow: 'hidden', width: imageSize },
	itemName: { fontWeight: 'bold', marginVertical: 15, marginLeft: 50, textAlign: 'center' },

	actions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 5 },
	action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 60 },
	actionHeader: { textAlign: 'center' },

	cardRequiredBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	cardRequiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	cardRequiredHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	cardRequiredActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cardRequiredAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	cardRequiredActionHeader: { },

	errorMsg: { color: 'darkred', marginVertical: 0, textAlign: 'center' },
})
