import React, { useEffect, useState, useRef } from 'react'
import { 
	ActivityIndicator, Platform, Dimensions, ScrollView, View, FlatList, Text, Image, TextInput, 
	TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { socket, url, logo_url, displayTime } from '../../../assets/info'
import { getServiceInfo } from '../../apis/services'
import { getLocationHours } from '../../apis/locations'
import { getWorkers, getWorkerInfo } from '../../apis/owners'
import { requestAppointment } from '../../apis/schedules'
import { getNumCartItems } from '../../apis/carts'

import Cart from '../../components/cart'
import Userauth from '../../components/userauth'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const workerImage = (width / 3) - 40

const fsize = p => {
	return width * p
}

export default function booktime(props) {
	const months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'October', 'November', 'December']
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const pushtime = 1000 * (60 * 10)

	const { locationid, serviceid } = props.route.params
	const func = props.route.params
	const scheduleid = props.route.params.scheduleid ? props.route.params.scheduleid : null

	const [name, setName] = useState()
	const [trialStatus, setTrialstatus] = useState()
	const [scheduledTimes, setScheduledtimes] = useState([])
	const [openTime, setOpentime] = useState({ hour: 0, minute: 0 })
	const [closeTime, setClosetime] = useState({ hour: 0, minute: 0 })
	const [selectedDateinfo, setSelecteddateinfo] = useState({ month: '', year: 0, day: '', date: 0, time: 0 })
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
	const [selectedWorkerinfo, setSelectedworkerinfo] = useState({ show: false, worker: null, workers: [], numWorkers: 0 })
	const [loaded, setLoaded] = useState(false)
	const [showPaymentrequired, setShowpaymentrequired] = useState(false)
	const [showTrialover, setShowtrialover] = useState(false)
	const [showAuth, setShowauth] = useState(false)
	const [userId, setUserid] = useState(null)

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
						
					} else {
						alert("an error has occurred in server")
					}
				})
		}
	}

	const getTheServiceInfo = async() => {
		getServiceInfo(serviceid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { name } = res.serviceInfo

					setName(name)
					getTheLocationHours()
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("an error has occurred in server")
				}
			})
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
						let working = true

						newTimes.push({ 
							key: newTimes.length, header: timedisplay, 
							time: currDateStr, timetaken, timepassed, working
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
					
				} else {
					alert("an error has occurred in server")
				}
			})
	}
	const getTheWorkers = async() => {
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

		getWorkers(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setSelectedworkerinfo({ show: true, worker: null, workers: res.owners, numWorkers: res.numWorkers })
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {

				} else {

				}
			})
	}
	const selectWorker = id => {
		let workerinfo

		getWorkerInfo(id)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					selectedWorkerinfo.workers.forEach(function (item) {
						item.row.forEach(function (worker) {
							if (worker.id == id) {
								workerinfo = {...worker, days: res.days }

								setSelectedworkerinfo({ ...selectedWorkerinfo, show: false, worker: workerinfo })
								selectDate(selectedDateinfo.date, res.days)
							}
						})
					})
				}
			})
	}
	const dateNavigate = (dir) => {
		setLoaded(false)

		const currTime = new Date(Date.now())
		const currDay = days[currTime.getDay()]
		const currMonth = months[currTime.getMonth()]

		let month = months.indexOf(selectedDateinfo.month), year = selectedDateinfo.year

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

		setSelecteddateinfo({ ...selectedDateinfo, month: months[month], date: null, year })
		setCalendar({ firstDay, numDays, data })
		setTimes(newTimes)
		setLoaded(true)
	}
	const selectDate = (date, days) => {
		const { month, year } = selectedDateinfo
		const hours = days != null ? 
						days
						: 
						selectedWorkerinfo.worker != null ? 
							selectedWorkerinfo.worker.days 
							: 
							null

		let openStr = month + " " + date + ", " + year + " " + openTime.hour + ":" + openTime.minute
		let closeStr = month + " " + date + ", " + year + " " + closeTime.hour + ":" + closeTime.minute
		let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), currDateStr = openDateStr
		let day = new Date(openDateStr).toString().substr(0, 3)
		let currenttime = Date.now(), newTimes = [], workerStarttime = null, workerEndtime = null, workerTime = null

		if (hours != null) {
			workerTime = hours[day]

			workerStarttime = Date.parse(month + " " + date + ", " + year + " " + workerTime["start"])
			workerEndtime = Date.parse(month + " " + date + ", " + year + " " + workerTime["end"])
		}

		while (currDateStr < (closeDateStr - pushtime)) {
			currDateStr += pushtime

			let timestr = new Date(currDateStr)
			let hour = timestr.getHours()
			let minute = timestr.getMinutes()
			let period = hour < 12 ? "am" : "pm"

			let timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period
			let timepassed = currenttime > currDateStr
			let timetaken = scheduledTimes.indexOf(currDateStr) > -1
			let working = hours != null ? 
								hours[day]["working"] ?
									(currDateStr > workerStarttime && currDateStr < workerEndtime)
									:
									false
								:
								true

			newTimes.push({ 
				key: newTimes.length, header: timedisplay, 
				time: currDateStr, timetaken, timepassed, working
			})
		}

		setSelecteddateinfo({ ...selectedDateinfo, date })
		setTimes(newTimes)
	}
	const selectTime = (name, timeheader, time) => {
		const { month, date, year } = selectedDateinfo

		setSelecteddateinfo({ ...selectedDateinfo, name, time })

		if (selectedDateinfo.date) {
			setConfirmrequest({ ...confirmRequest, show: true, service: name, time })
		}
	}
	const requestAnAppointment = async() => {
		if (userId) {
			const { month, date, year, time } = selectedDateinfo
			const { worker } = selectedWorkerinfo
			const { note, oldtime } = confirmRequest
			const selecteddate = new Date(time)
			const selectedtime = selecteddate.getHours() + ":" + selecteddate.getMinutes()
			const dateInfo = Date.parse(month + " " + date + ", " + year + " " + selectedtime).toString()
			let data = { 
				id: scheduleid, userid: userId, workerid: worker != null ? worker.id : -1, locationid, serviceid, oldtime, 
				time: dateInfo, note: note ? note : "", 
				type: "requestAppointment", currTime: Date.now()
			}

			requestAppointment(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						if (res.status == "new" || res.status == "updated" || res.status == "requested") {
							data = { ...data, receiver: res.receiver }
							socket.emit("socket/requestAppointment", data, () => setConfirmrequest({ ...confirmRequest, requested: true }))
						} else {
							let { oldtime, note } = res

							setConfirmrequest({ ...confirmRequest, show: true, oldtime, note })
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
							case "trialover":
								setConfirmrequest({ ...confirmRequest, show: false })
								setTrialover(true)

								break
							default:
								setConfirmrequest({ ...confirmRequest, show: true, errormsg })
						}
					} else {
						alert("an error has occurred in server")
					}
				})
		} else {
			setConfirmrequest({ ...confirmRequest, show: false })
			setShowauth(true)
		}
	}

	useEffect(() => {
		isMounted.current = true

		getTheNumCartItems()
		getTheServiceInfo()

		return () => isMounted.current = false
	}, [])

	return (
		<View style={style.booktime}>
			<View style={style.box}>
				<View style={style.headers}>
					<Text style={style.serviceHeader}><Text style={{ fontSize: fsize(0.05) }}>for</Text> {name}</Text>
				</View>

				{!loaded ? 
					<View style={{ height: '80%' }}>
						<ActivityIndicator color="black" size="small"/>
					</View>
					:
					times.length > 0 ? 
						<ScrollView style={{ height: '80%' }}>
							<View style={style.chooseWorker}>
								<Text style={style.timesHeader}>Pick a worker</Text>
								<Text style={style.chooseWorkerHeader}>(Optional, random by default)</Text>

								<View style={style.chooseWorkerActions}>
									{selectedWorkerinfo.worker != null && (
										<TouchableOpacity style={style.chooseWorkerAction} onPress={() => {
											setSelectedworkerinfo({ ...selectedWorkerinfo, worker: null })
											selectDate(selectedDateinfo.date)
										}}>
											<Text style={style.chooseWorkerActionHeader}>Cancel Worker</Text>
										</TouchableOpacity>
									)}
										
									<TouchableOpacity style={style.chooseWorkerAction} onPress={() => getTheWorkers()}>
										<Text style={style.chooseWorkerActionHeader}>{selectedWorkerinfo.worker == null ? 'Choose your worker' : 'Choose a different worker'}</Text>
									</TouchableOpacity>
								</View>
									

								{selectedWorkerinfo.worker != null && (
									<View style={style.selectedWorker}>
										<Image style={style.selectedWorkerImage} source={{ uri: logo_url + selectedWorkerinfo.worker.profile }}/>
										<Text style={style.selectedWorkerHeader}>{selectedWorkerinfo.worker.username}</Text>
									</View>
								)}
							</View>

							<View style={style.dateHeaders}>
								<Text style={style.timesHeader}>Pick a date</Text>
								
								<View style={style.date}>
									<TouchableOpacity style={style.dateNav} onPress={() => dateNavigate('left')}><AntDesign name="left" size={25}/></TouchableOpacity>
									<Text style={style.dateHeader}>{selectedDateinfo.month}, {selectedDateinfo.year}</Text>
									<TouchableOpacity style={style.dateNav} onPress={() => dateNavigate('right')}><AntDesign name="right" size={25}/></TouchableOpacity>
								</View>

								<View style={style.dateDays}>
									<View style={style.dateDaysRow}>
										{days.map((day, index) => (
											<TouchableOpacity key={"day-header-" + index} style={style.dateDayTouchDisabled}>
												<Text style={style.dateDayTouchDisabledHeader}>{day.substr(0, 3)}</Text>
											</TouchableOpacity>
										))}
									</View>
									{calendar.data.map((info, rowindex) => (
										<View key={info.key} style={style.dateDaysRow}>
											{info.row.map((day, dayindex) => (
												day.num > 0 ?
													day.passed ? 
														<TouchableOpacity key={day.key} disabled={true} style={style.dateDayTouchPassed}>
															<Text style={style.dateDayTouchPassedHeader}>{day.num}</Text>
														</TouchableOpacity>
														:
														selectedDateinfo.date == day.num ?
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
							<View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around', marginBottom: 50, width: '100%' }}>
								<View style={style.times}>
									{times.map(info => (
										<View key={info.key}>
											{(!info.timetaken && !info.timepassed && info.working) && (
												<TouchableOpacity style={style.unselect} onPress={() => selectTime(name, info.header, info.time)}>
													<Text style={style.unselectHeader}>{info.header}</Text>
												</TouchableOpacity>
											)}

											{(info.timetaken || info.timepassed || !info.working) && (
												info.timetaken ? 
													<TouchableOpacity style={style.selected} disabled={true} onPress={() => {}}>
														<Text style={style.selectedHeader}>{info.header}</Text>
													</TouchableOpacity>
													:
													<TouchableOpacity style={style.selectedPassed} disabled={true} onPress={() => {}}>
														<Text style={style.selectedPassedHeader}>{info.header}</Text>
													</TouchableOpacity>
											)}
										</View>
									))}
								</View>
							</View>
						</ScrollView>
						:
						<View style={{ alignItems: 'center', flexDirection: 'column', justifyContent: 'space-around', width: '100%' }}>
							<Text style={style.noTimeHeader}>Currently closed</Text>
						</View>
				}

				<View style={style.bottomNavs}>
					<View style={style.bottomNavsRow}>
						{userId && (
							<TouchableOpacity style={style.bottomNav} onPress={() => setOpencart(true)}>
								<Entypo name="shopping-cart" size={30}/>
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
							<Entypo name="home" size={30}/>
						</TouchableOpacity>

						<TouchableOpacity style={style.bottomNav} onPress={() => {
							if (userId) {
								AsyncStorage.clear()

								setUserid(null)
							} else {
								setShowauth(true)
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
												<Text style={{ fontFamily: 'appFont' }}>Request an appointment for</Text>
												{'\n' + confirmRequest.service + '\n'}
												{displayTime(confirmRequest.time) + '\n'}
											</Text>
											:
											<Text style={style.confirmHeader}>
												<Text style={{ fontFamily: 'appFont' }}>You already requested an appointment for</Text>
												{'\n' + confirmRequest.service + '\n'}
												{displayTime(confirmRequest.oldtime) + '\n\n'}
												<Text style={{ fontFamily: 'appFont' }}>Are you sure you want to change it to</Text>
												{'\n' + displayTime(confirmRequest.time) + '\n'}
											</Text>
										}

										<View style={style.note}>
											<TextInput 
												style={style.noteInput} multiline textAlignVertical="top" 
												placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Leave a note if you want" 
												maxLength={100} onChangeText={(note) => setConfirmrequest({...confirmRequest, note })} autoCorrect={false}
											/>
										</View>

										{confirmRequest.errormsg ? <Text style={style.errorMsg}>You already requested an appointment for this service</Text> : null}

										<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
											<View style={style.confirmOptions}>
												<TouchableOpacity style={style.confirmOption} onPress={() => setConfirmrequest({ show: false, service: "", oldtime: 0, time: 0, note: "", requested: false, errormsg: "" })}>
													<Text style={style.confirmOptionHeader}>No</Text>
												</TouchableOpacity>
												<TouchableOpacity style={style.confirmOption} onPress={() => requestAnAppointment()}>
													<Text style={style.confirmOptionHeader}>Yes</Text>
												</TouchableOpacity>
											</View>
										</View>
									</>
									:
									<>
										<View style={style.requestedHeaders}>
											<Text style={style.requestedHeader}>Appointment requested for{'\n'}</Text>
											<Text style={style.requestedHeaderInfo}>{confirmRequest.service} {'\n'}</Text>
											<Text style={style.requestedHeaderInfo}>{displayTime(confirmRequest.time)} {'\n'}</Text>
											<Text style={style.requestedHeaderInfo}>You will get notify by the salon in your notification very soon</Text>
											<TouchableOpacity style={style.requestedClose} onPress={() => {
												setConfirmrequest({ ...confirmRequest, show: false, requested: false })

												setTimeout(function () {
													props.navigation.dispatch(
														CommonActions.reset({
															index: 0,
															routes: [{ name: "main", params: { showNotif: true } }]
														})
													)
												}, 1000)
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
			{selectedWorkerinfo.show && (
				<Modal transparent={true}>
					<View style={style.workersContainer}>
						<View style={style.workersBox}>
							<Text style={style.workersHeader}>Book the worker you want</Text>

							<View style={style.workersList}>
								<FlatList
									data={selectedWorkerinfo.workers}
									renderItem={({ item, index }) => 
										<View key={item.key} style={style.workersRow}>
											{item.row.map(info => (
												info.id ? 
													<TouchableOpacity key={info.key} style={!info.selected ? style.worker : style.workerDisabled} onPress={() => selectWorker(info.id)}>
														<View style={style.workerProfile}>
															<Image source={{ uri: logo_url + info.profile }} style={{ height: workerImage, width: workerImage }}/>
														</View>
														<Text style={style.workerHeader}>{info.username}</Text>
													</TouchableOpacity>
													:
													<View key={info.key} style={style.worker}></View>
											))}
										</View>
									}
								/>
							</View>

							<TouchableOpacity style={style.workersClose} onPress={() => setSelectedworkerinfo({ ...selectedWorkerinfo, show: false, workers: [] })}>
								<Text style={style.workersCloseHeader}>Cancel</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			)}
			{openCart && <Modal><Cart navigation={props.navigation} close={() => {
				getTheNumCartItems()
				setOpencart(false)
			}}/></Modal>}
			{showPaymentrequired && (
				<Modal transparent={true}>
					<View style={{ paddingVertical: offsetPadding }}>
						<View style={style.requiredBox}>
							<View style={style.requiredContainer}>
								<Text style={style.requiredHeader}>
									You need to provide a payment method to book
									an appointment
								</Text>

								<View style={style.requiredActions}>
									<TouchableOpacity style={style.requiredAction} onPress={() => setShowpaymentrequired(false)}>
										<Text style={style.requiredActionHeader}>Close</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.requiredAction} onPress={() => {
										setShowpaymentrequired(false)
										props.navigation.navigate("account", { required: "card" })
									}}>
										<Text style={style.requiredActionHeader}>Ok</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</View>
				</Modal>
			)}
			{showTrialover && (
				<Modal transparent={true}>
					<View style={{ paddingVertical: offsetPadding }}>
						<View style={style.requiredBox}>
							<View style={style.requiredContainer}>
								<Text style={style.requiredHeader}>
									Your 30 days trial period is up. A cost of $0.50
									will be charged from you if any of your future appointment
									is accepted by a salon
								</Text>

								<View style={style.requiredActions}>
									<TouchableOpacity style={style.requiredAction} onPress={() => setShowtrialover(false)}>
										<Text style={style.requiredActionHeader}>Close</Text>
									</TouchableOpacity>
									<TouchableOpacity style={style.requiredAction} onPress={() => {
										setShowpaymentrequired(true)
										setShowtrialover(false)
									}}>
										<Text style={style.requiredActionHeader}>Ok</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</View>
				</Modal>
			)}
			{showAuth && (
				<Modal transparent={true}>
					<Userauth close={() => setShowauth(false)} done={(id, msg) => {
						if (msg == "setup") {
							props.navigation.dispatch(
								CommonActions.reset({
									index: 1,
									routes: [{ name: "setup" }]
								})
							);
						} else {
							socket.emit("socket/user/login", "user" + id, () => setUserid(id))
						}

						setShowauth(false)
					}} navigate={props.navigation.navigate}/>
				</Modal>
			)}
		</View>
	)
}

const style = StyleSheet.create({
	booktime: { backgroundColor: 'white', height: '100%', paddingBottom: offsetPadding, width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	headers: { height: '10%' },
	serviceHeader: { fontSize: fsize(0.08), fontWeight: 'bold', paddingVertical: 10, textAlign: 'center' },

	chooseWorker: { alignItems: 'center', marginBottom: 50, marginTop: 50 },
	chooseWorkerHeader: { fontSize: fsize(0.05) },

	chooseWorkerActions: { flexDirection: 'row', justifyContent: 'space-around' },
	chooseWorkerAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 2, padding: 5, width: 150 },
	chooseWorkerActionHeader: { textAlign: 'center' },
	selectedWorker: { marginVertical: 10 },
	selectedWorkerImage: { borderRadius: workerImage / 2, height: workerImage, width: workerImage },
	selectedWorkerHeader: { fontWeight: 'bold', textAlign: 'center' },

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

	noTimeHeader: { fontFamily: 'appFont', fontSize: fsize(0.05) },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	cart: { flexDirection: 'row', height: 30, marginVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', justifyContent: 'space-around', paddingVertical: 20, width: '80%' },
	confirmHeader: { fontSize: fsize(0.04), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	note: { alignItems: 'center', marginBottom: 20 },
	noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: fsize(0.04), height: 100, padding: 5, width: '80%' },
	confirmOptions: { flexDirection: 'row' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 50 },
	confirmOptionHeader: { },
	requestedHeaders: { alignItems: 'center', paddingHorizontal: 20 },
	requestedClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 10, padding: 5, width: 100 },
	requestedCloseHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), textAlign: 'center' },
	requestedHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), textAlign: 'center' },
	requestedHeaderInfo: { fontSize: fsize(0.05), textAlign: 'center' },

	workersContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	workersBox: { alignItems: 'center', backgroundColor: 'white', height: '90%', width: '90%' },
	workersHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), paddingVertical: 20, textAlign: 'center' },
	workersRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	workersList: { height: '80%' },
	workersRow: { flexDirection: 'row', justifyContent: 'space-between' },
	worker: { alignItems: 'center', marginHorizontal: 5, padding: 5, width: (width / 3) - 30 },
	workerProfile: { borderRadius: workerImage / 2, height: workerImage, overflow: 'hidden', width: workerImage },
	workerHeader: { fontSize: fsize(0.04), fontWeight: 'bold'  },
	workersClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: 100 },
	workersCloseHeader: { textAlign: 'center' },

	requiredBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	requiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	requiredHeader: { fontFamily: 'appFont', fontSize: fsize(0.05), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	requiredActions: { flexDirection: 'row', justifyContent: 'space-around' },
	requiredAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	requiredActionHeader: { },

	errorMsg: { color: 'darkred', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
})
