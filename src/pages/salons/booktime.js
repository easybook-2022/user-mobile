import React, { useEffect, useState } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { displayTime } from '../../../assets/info'
import { getServiceInfo } from '../../apis/services'
import { getLocationHours } from '../../apis/locations'
import { requestAppointment } from '../../apis/schedules'
import { getNumCartItems } from '../../apis/carts'

import Cart from '../../components/cart'
import Userauth from '../../components/userauth'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)
const months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'October', 'November', 'December']
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const pushtime = 1000 * (60 * 10)

export default function booktime(props) {
	const { locationid, serviceid } = props.route.params
	const func = props.route.params
	const scheduleid = props.route.params.scheduleid ? props.route.params.scheduleid : null

	const [name, setName] = useState('')
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
	const [showAuth, setShowauth] = useState(false)
	const [userId, setUserid] = useState(null)

	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(0)
	const getTheNumCartItems = async() => {
		const userid = await AsyncStorage.getItem("userid")

		setUserid(userid)

		if (userid != null) {
			getNumCartItems(userid)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
						setNumcartitems(res.numCartItems)
					}
				})
				.catch((err) => {
					if (err.response.status == 400) {
						
					}
				})
		}
	}
	
	const [confirmRequest, setConfirmrequest] = useState({ show: false, service: "", oldtime: 0, time: 0, note: "", requested: false, errormsg: "", action: false })

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
				if (err.response.status == 400) {
					
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

					openHour = openPeriod == "PM" ? parseInt(openHour) + 12 : openHour
					closeHour = closePeriod == "PM" ? parseInt(closeHour) + 12 : closeHour

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
				if (err.response.status == 400) {
					
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
	const requestAnAppointment = async() => {
		const userid = await AsyncStorage.getItem("userid")

		if (userid != null) {
			const { month, date, year, time } = selectedDateInfo
			const { note, oldtime } = confirmRequest
			const selecteddate = new Date(time)
			const selectedtime = selecteddate.getHours() + ":" + selecteddate.getMinutes()
			const dateInfo = Date.parse(month + " " + date + ", " + year + " " + selectedtime).toString()
			const data = { userid, locationid, scheduleid, serviceid, oldtime, time: dateInfo, note: note ? note : "" }

			requestAppointment(data)
				.then((res) => {
					if (res.status == 200) {
						if (!res.data.errormsg) {
							return res.data
						} else {
							setConfirmrequest({ ...confirmRequest, show: true, errormsg: res.data.errormsg })
						}
					}
				})
				.then((res) => {
					if (res) {
						if (res.status == "new" || res.status == "updated" || res.status == "requested") {
							setConfirmrequest({ ...confirmRequest, requested: true })

							if (func.initialize) {
								func.initialize()
							}
							
							props.navigation.goBack()
						} else {
							let { oldtime, note } = res

							setConfirmrequest({ ...confirmRequest, show: true, oldtime, note })
						}
					}
				})
				.catch((err) => {
					if (err.response.status == 400) {
						const status = err.response.data.status

						switch (status) {
							case "cardrequired":
								setConfirmrequest({ ...confirmRequest, show: false })
								setShowpaymentrequired(true)

								break;
							default:
								
						}
					}
				})
		} else {
			setConfirmrequest({ ...confirmRequest, show: false, action: true })
			setShowauth(true)
		}
	}
	const initialize = () => {
		getTheNumCartItems()
		getTheServiceInfo()
	}

	useEffect(() => {
		initialize()
	}, [])

	return (
		<View style={style.booktime}>
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
						<Text style={style.boxHeader}>{!scheduleid ? 'Book' : 'Re-book'} a time for</Text>
						<Text style={style.serviceHeader}>{name}</Text>
					</View>

					{!loaded ? 
						<ActivityIndicator size="small"/>
						:
						times.length > 0 ? 
							<ScrollView style={{ height: screenHeight - 191 }}>
								<View style={style.dateHeaders}>
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
																	<Text style={style.dateDayTouchHeaderSelected}>{day.num}</Text>
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
												{(!info.timetaken && !info.timepassed) ? 
													<TouchableOpacity style={style.unselect} onPress={() => selectTime(name, info.header, info.time)}>
														<Text style={{ color: 'black', fontSize: 15 }}>{info.header}</Text>
													</TouchableOpacity>
													:
													info.timetaken ?
														<TouchableOpacity style={style.selected} disabled={true} onPress={() => {}}>
															<Text style={{ color: 'white', fontSize: 15 }}>{info.header}</Text>
														</TouchableOpacity>
														:
														<TouchableOpacity style={style.selectedPassed} disabled={true} onPress={() => {}}>
															<Text style={{ color: 'black', fontSize: 15 }}>{info.header}</Text>
														</TouchableOpacity>
												}	
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
												<TextInput style={style.noteInput} multiline={true} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Leave a note if you want" maxLength={100} onChangeText={(note) => setConfirmrequest({...confirmRequest, note })} autoCorrect={false}/>
											</View>

											{confirmRequest.errormsg ? <Text style={style.errorMsg}>You already requested an appointment for this service</Text> : null}

											<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
												<View style={style.confirmOptions}>
													<TouchableOpacity style={style.confirmOption} onPress={() => setConfirmrequest({ show: false, service: "", oldtime: 0, time: 0, note: "", requested: false, errormsg: "", action: false })}>
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
													
													if (func.initialize) {
														func.initialize()
													}

													props.navigation.goBack()
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
				{openCart && <Modal><Cart close={() => setOpencart(false)}/></Modal>}
				{showPaymentRequired && (
					<Modal transparent={true}>
						<View style={{ paddingVertical: offsetPadding }}>
							<View style={style.cardRequiredBox}>
								<View style={style.cardRequiredContainer}>
									<Text style={style.cardRequiredHeader}>
										You need to provide a payment method to book
										an appointment
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
								setUserid(id)

								if (confirmRequest.action) requestAnAppointment()
							}

							setShowauth(false)
						}} navigate={props.navigation.navigate}/>
					</Modal>
				)}
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	booktime: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 30, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },

	headers: { marginBottom: 10 },
	boxHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
	serviceHeader: { fontSize: 25, fontWeight: 'bold', textAlign: 'center' },

	dateHeaders: { alignItems: 'center' },
	date: { flexDirection: 'row', margin: 10 },
	dateNav: { marginHorizontal: 20 },
	dateHeader: { fontFamily: 'appFont', fontSize: 20, marginVertical: 5, textAlign: 'center', width: 170 },
	dateDays: { alignItems: 'center' },
	dateDaysRow: { flexDirection: 'row' },
	dateDayTouch: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 3, padding: 7, width: 40 },
	dateDayTouchSelected: { backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 3, padding: 7, width: 40 },
	dateDayTouchHeaderSelected: { color: 'white', fontSize: 17, textAlign: 'center' },
	dateDayTouchPassed: { backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 3, padding: 7, width: 40 },
	dateDayTouchDisabled: { height: 40, margin: 3, padding: 3, width: 40 },
	dateDayTouchHeader: { color: 'black', fontSize: 17, textAlign: 'center' },
	dateDayTouchHeaderDisabled: { color: 'white', fontSize: 17, textAlign: 'center' },

	timesHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', textAlign: 'center' },
	times: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', width: 300 },
	unselect: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5, width: 90 },
	selected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5, width: 90 },
	selectedPassed: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, opacity: 0.3, padding: 5, width: 90 },

	noTime: { flexDirection: 'column', height: screenHeight - 191, justifyContent: 'space-around', width: '100%' },
	noTimeHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row' },
	bottomNav: { flexDirection: 'row', height: 30, justifyContent: 'space-around', marginHorizontal: 20, marginVertical: 5 },
	bottomNavHeader: { fontWeight: 'bold', paddingVertical: 5 },
	cart: { flexDirection: 'row', height: 30, marginVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', justifyContent: 'space-around', paddingVertical: 20, width: '80%' },
	confirmHeader: { fontSize: 15, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	note: { alignItems: 'center', marginBottom: 20 },
	noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: 15, height: 100, padding: 5, width: '80%' },
	confirmOptions: { flexDirection: 'row' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 50 },
	confirmOptionHeader: { },
	requestedHeaders: { alignItems: 'center', paddingHorizontal: 20 },
	requestedClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 10, padding: 5, width: 100 },
	requestedCloseHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },
	requestedHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },
	requestedHeaderInfo: { fontSize: 20, textAlign: 'center' },

	cardRequiredBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	cardRequiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	cardRequiredHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	cardRequiredActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cardRequiredAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	cardRequiredActionHeader: { },

	errorMsg: { color: 'darkred', fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
})
