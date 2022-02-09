import React, { useEffect, useState, useRef } from 'react'
import { 
	SafeAreaView, ActivityIndicator, Platform, Dimensions, ScrollView, View, FlatList, Text, Image, TextInput, 
	TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { socket, url, logo_url, displayTime } from '../../../assets/info'
import { getServiceInfo } from '../../apis/services'
import { getLocationHours } from '../../apis/locations'
import { getWorkers, getWorkerInfo } from '../../apis/owners'
import { getAppointmentInfo, requestAppointment } from '../../apis/schedules'
import { getNumCartItems } from '../../apis/carts'

import Cart from '../../components/cart'
import Userauth from '../../components/userauth'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Booktime(props) {
	const months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'October', 'November', 'December']
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const pushtime = 1000 * (60 * 10)

	const { locationid, serviceid, serviceinfo } = props.route.params
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
	const [confirm, setConfirm] = useState({ show: false, service: "", oldtime: 0, time: 0, note: "", requested: false, errormsg: "" })

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
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("an error has occurred in server")
				}
			})
	}
  const getTheAppointmentInfo = async() => {
    getAppointmentInfo(scheduleid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res && isMounted.current == true) {
          const { locationId, name, time, worker } = res.appointmentInfo

          setName(name)
          getTheLocationHours(time)
          setSelectedworkerinfo({ ...selectedWorkerinfo, worker })
        }
      })
  }
	const getTheLocationHours = async(time) => {
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

          let selectedTime = time > 0 && time > Date.now() ? new Date(time) : null
          let selectedDay = null, selectedDate = null, selectedMonth = null

          if (selectedTime) {
            selectedDay = days[selectedTime.getDay()]
            selectedDate = selectedTime.getDate()
            selectedMonth = months[selectedTime.getMonth()]
          }

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

          if (selectedTime) {
            openStr = selectedDay + " " + selectedMonth + " " + selectedTime.getDate() + " " + selectedTime.getFullYear() + " " + openHour + ":" + openMinute
            closeStr = selectedDay + " " + selectedMonth + " " + selectedTime.getDate() + " " + selectedTime.getFullYear() + " " + closeHour + ":" + closeMinute
            openDateStr = Date.parse(openStr)
            closeDateStr = Date.parse(closeStr)

            currDateStr = openDateStr
          }

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

            if (!timepassed) {
              newTimes.push({ 
                key: newTimes.length, header: timedisplay, 
                time: currDateStr, timetaken, working
              })
            }
					}

					setOpentime({ hour: openHour, minute: openMinute })
					setClosetime({ hour: closeHour, minute: closeMinute })

					if (selectedTime) {
            setSelecteddateinfo({ month: currMonth, year: selectedTime.getFullYear(), day: selectedDay, date: selectedDate, time: 0 })
          } else {
            setSelecteddateinfo({ month: currMonth, year: currTime.getFullYear(), day: currDay, date: currDate, time: 0 })
          }

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

  		if (!timepassed) {
        newTimes.push({ 
          key: newTimes.length, header: timedisplay, 
          time: currDateStr, timetaken, timepassed
        })
      }
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

  		if (!timepassed) {
        newTimes.push({ 
          key: newTimes.length, header: timedisplay, 
          time: currDateStr, timetaken, timepassed, working
        })
      }
		}

		setSelecteddateinfo({ ...selectedDateinfo, date })
		setTimes(newTimes)
	}
	const selectTime = (name, timeheader, time) => {
		const { month, date, year } = selectedDateinfo

		setSelecteddateinfo({ ...selectedDateinfo, name, time })

		if (selectedDateinfo.date) {
			setConfirm({ ...confirm, show: true, service: name ? name : serviceinfo, time })
		}
	}
	const requestAnAppointment = async() => {
		if (userId) {
			const { month, date, year, time } = selectedDateinfo
			const { worker } = selectedWorkerinfo
			const { note, oldtime } = confirm
			const selecteddate = new Date(time)
			const selectedtime = selecteddate.getHours() + ":" + selecteddate.getMinutes()
			const dateInfo = Date.parse(month + " " + date + ", " + year + " " + selectedtime).toString()
			let data = { 
        id: scheduleid, // socket purpose
				userid: userId, 
				workerid: worker != null ? worker.id : -1, 
				locationid, 
				serviceid: serviceid ? serviceid : -1, 
				serviceinfo: serviceinfo ? serviceinfo : "",
				oldtime, 
				time: dateInfo, note: note ? note : "", 
				type: "requestAppointment", currTime: Date.now()
			}

      setConfirm({ ...confirm, loading: true })

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
							socket.emit("socket/requestAppointment", data, () => {
                setConfirm({ ...confirm, requested: true, loading: false })

                setTimeout(function () {
                  setConfirm({ ...confirm, show: false, requested: false })

                  setTimeout(function () {
                    props.navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{ name: "main", params: { showNotif: true } }]
                      })
                    )
                  }, 1000)
                }, 3000)
              })
						} else {
							let { oldtime, note } = res

							setConfirm({ ...confirm, show: true, oldtime, note })
						}
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data

						switch (status) {
							case "trialover":
								setConfirm({ ...confirm, show: false })
								setTrialover(true)

								break
							default:
								setConfirm({ ...confirm, show: true, errormsg })
						}
					} else {
						alert("an error has occurred in server")
					}
				})
		} else {
			setConfirm({ ...confirm, show: false })
			setShowauth(true)
		}
	}

	useEffect(() => {
		isMounted.current = true

		getTheNumCartItems()

		if (serviceid) getTheServiceInfo()

    if (scheduleid) {
      getTheAppointmentInfo()
    } else {
      getTheLocationHours()
    }
		
		return () => isMounted.current = false
	}, [])

	return (
		<View style={styles.booktime}>
			<View style={styles.box}>
				<View style={styles.headers}>
					<Text style={styles.serviceHeader}><Text style={{ fontSize: wsize(5) }}>for</Text> {name ? name : serviceinfo}</Text>
				</View>

				{loaded ? 
					times.length > 0 ? 
						<ScrollView style={{ height: '80%', width: '100%' }}>
							<View style={styles.workerSelection}>
								<Text style={styles.workerSelectionHeader}>Pick a stylist (Optional)</Text>

								<View style={styles.chooseWorkerActions}>
									{selectedWorkerinfo.worker != null && (
										<TouchableOpacity style={styles.chooseWorkerAction} onPress={() => {
											setSelectedworkerinfo({ ...selectedWorkerinfo, worker: null })
											selectDate(selectedDateinfo.date)
										}}>
											<Text style={styles.chooseWorkerActionHeader}>Cancel Stylist</Text>
										</TouchableOpacity>
									)}
										
									<TouchableOpacity style={styles.chooseWorkerAction} onPress={() => getTheWorkers()}>
										<Text style={styles.chooseWorkerActionHeader}>{selectedWorkerinfo.worker == null ? 'Tap to choose your stylist' : 'Tap to choose a different stylist'}</Text>
									</TouchableOpacity>
								</View>

								{selectedWorkerinfo.worker != null && (
									<View style={styles.selectedWorker}>
										<Image style={styles.selectedWorkerImage} source={{ uri: logo_url + selectedWorkerinfo.worker.profile }}/>
										<Text style={styles.selectedWorkerHeader}>{selectedWorkerinfo.worker.username}</Text>
									</View>
								)}
							</View>

							<View style={styles.dateSelection}>
								<Text style={styles.dateSelectionHeader}>Tap a date below</Text>
								
								<View style={styles.dateHeaders}>
                  <View style={styles.column}>
									 <TouchableOpacity onPress={() => dateNavigate('left')}><AntDesign name="left" size={wsize(7)}/></TouchableOpacity>
                  </View>
                  <View style={styles.column}>
									 <Text style={styles.dateHeader}>{selectedDateinfo.month}, {selectedDateinfo.year}</Text>
                  </View>
                  <View style={styles.column}>
									 <TouchableOpacity onPress={() => dateNavigate('right')}><AntDesign name="right" size={wsize(7)}/></TouchableOpacity>
                  </View>
								</View>
								<View style={styles.days}>
									<View style={styles.daysHeaderRow}>
										{days.map((day, index) => (
                      <Text key={"day-header-" + index} style={styles.daysHeader}>{day.substr(0, 3)}</Text>
										))}
									</View>
									{calendar.data.map((info, rowindex) => (
										<View key={info.key} style={styles.daysDataRow}>
											{info.row.map((day, dayindex) => (
												day.num > 0 ?
													day.passed ? 
														<TouchableOpacity key={day.key} disabled={true} style={[styles.dayTouch, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
															<Text style={styles.dayTouchHeader}>{day.num}</Text>
														</TouchableOpacity>
														:
														selectedDateinfo.date == day.num ?
															<TouchableOpacity key={day.key} style={[styles.dayTouch, { backgroundColor: 'black' }]} onPress={() => selectDate(day.num)}>
																<Text style={[styles.dayTouchHeader, { color: 'white' }]}>{day.num}</Text>
															</TouchableOpacity>
															:
															<TouchableOpacity key={day.key} style={styles.dayTouch} onPress={() => selectDate(day.num)}>
																<Text style={styles.dayTouchHeader}>{day.num}</Text>
															</TouchableOpacity>
													:
													<TouchableOpacity key={"calender-header-" + rowindex + "-" + dayindex} style={styles.dayTouchDisabled}></TouchableOpacity>
											))}
										</View>
									))}
								</View>
							</View>

							<View style={styles.timesSelection}>
                <Text style={styles.timesHeader}>Tap a time below</Text>

								<View style={styles.times}>
									{times.map(info => (
										<View key={info.key}>
                      {info.working && (
                        info.timetaken ? 
                          <TouchableOpacity style={[styles.unselect, { backgroundColor: 'black' }]} disabled={true} onPress={() => {}}>
                            <Text style={[styles.unselectHeader, { color: 'white' }]}>{info.header}</Text>
                          </TouchableOpacity>
                          :
                          <TouchableOpacity style={styles.unselect} onPress={() => selectTime(name, info.header, info.time)}>
                            <Text style={styles.unselectHeader}>{info.header}</Text>
                          </TouchableOpacity>
                      )}
										</View>
									))}
								</View>
							</View>
						</ScrollView>
						:
						<View style={{ alignItems: 'center', flexDirection: 'column', justifyContent: 'space-around', width: '100%' }}>
						  <Text style={styles.noTimeHeader}>Not open today</Text>
						</View>
					:
					<View style={{ alignItems: 'center', flexDirection: 'column', height: '80%', justifyContent: 'space-around' }}>
						<ActivityIndicator color="black" size="small"/>
					</View>
				}

				<View style={styles.bottomNavs}>
					<View style={styles.bottomNavsRow}>
						{userId && (
							<TouchableOpacity style={styles.bottomNav} onPress={() => setOpencart(true)}>
								<Entypo name="shopping-cart" size={wsize(7)}/>
								{numCartItems > 0 && <Text style={styles.numCartItemsHeader}>{numCartItems}</Text>}
							</TouchableOpacity>
						)}

						<TouchableOpacity style={styles.bottomNav} onPress={() => {
							props.navigation.dispatch(
								CommonActions.reset({
									index: 0,
									routes: [{ name: "main" }]
								})
							)
						}}>
							<Entypo name="home" size={wsize(7)}/>
						</TouchableOpacity>

						<TouchableOpacity style={styles.bottomNav} onPress={() => {
							if (userId) {
								AsyncStorage.clear()

								setUserid(null)
							} else {
								setShowauth(true)
							}
						}}>
							<Text style={styles.bottomNavHeader}>{userId ? 'Log-Out' : 'Log-In'}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{confirm.show && (
				<Modal transparent={true}>
					<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
						<SafeAreaView style={styles.confirmBox}>
							<View style={styles.confirmContainer}>
								{!confirm.requested ? 
									<>
										{confirm.oldtime == 0 ? 
											<Text style={styles.confirmHeader}>
												<Text style={{ fontFamily: 'appFont' }}>Request an appointment for</Text>
												{'\n' + confirm.service + '\n'}
												{displayTime(confirm.time) + '\n'}
											</Text>
											:
											<Text style={styles.confirmHeader}>
												<Text style={{ fontFamily: 'appFont' }}>You already requested an appointment for</Text>
												{'\n' + confirm.service + '\n'}
												{displayTime(confirm.oldtime) + '\n\n'}
												<Text style={{ fontFamily: 'appFont' }}>Are you sure you want to change it to</Text>
												{'\n' + displayTime(confirm.time) + '\n'}
											</Text>
										}

										<View style={styles.note}>
											<TextInput 
												style={styles.noteInput} multiline textAlignVertical="top" 
												placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Leave a note if you want" 
												maxLength={100} onChangeText={(note) => setConfirm({...confirm, note })} autoCorrect={false}
											/>
										</View>

										{confirm.errormsg ? <Text style={styles.errorMsg}>You already requested an appointment for this service</Text> : null}

										<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
											<View style={styles.confirmOptions}>
												<TouchableOpacity style={[styles.confirmOption, { opacity: confirm.loading ? 0.3 : 1 }]} disabled={confirm.loading} onPress={() => setConfirm({ show: false, service: "", oldtime: 0, time: 0, note: "", requested: false, errormsg: "" })}>
													<Text style={styles.confirmOptionHeader}>No</Text>
												</TouchableOpacity>
												<TouchableOpacity style={[styles.confirmOption, { opacity: confirm.loading ? 0.3 : 1 }]} disabled={confirm.loading} onPress={() => requestAnAppointment()}>
													<Text style={styles.confirmOptionHeader}>Yes</Text>
												</TouchableOpacity>
											</View>
										</View>

                    {confirm.loading && (
                      <View style={{ alignItems: 'center' }}>
                        <ActivityIndicator color="black" size="small"/>
                      </View>
                    )}
									</>
									:
									<View style={styles.requestedHeaders}>
                    <Text style={styles.requestedHeader}>Appointment requested for{'\n'}</Text>
                    <Text style={styles.requestedHeaderInfo}>
                      {confirm.service} {'\n'}
                      {displayTime(confirm.time)} {'\n\n'}
                      You will get notify by the salon
                    </Text>
                  </View>
								}
							</View>
						</SafeAreaView>
					</TouchableWithoutFeedback>
				</Modal>
			)}
			{selectedWorkerinfo.show && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.workersContainer}>
						<View style={styles.workersBox}>
							<Text style={styles.workersHeader}>Tap the stylist you want</Text>

							<View style={styles.workersList}>
								<FlatList
									data={selectedWorkerinfo.workers}
									renderItem={({ item, index }) => 
										<View key={item.key} style={styles.workersRow}>
											{item.row.map(info => (
												info.id ? 
													<TouchableOpacity key={info.key} style={[styles.worker, { backgroundColor: info.selected ? 'rgba(0, 0, 0, 0.3)' : null }]} onPress={() => selectWorker(info.id)}>
														<View style={styles.workerProfile}>
															<Image source={{ uri: logo_url + info.profile }} style={{ height: wsize(20), width: wsize(20) }}/>
														</View>
														<Text style={styles.workerHeader}>{info.username}</Text>
													</TouchableOpacity>
													:
													<View key={info.key} style={styles.worker}></View>
											))}
										</View>
									}
								/>
							</View>

							<TouchableOpacity style={styles.workersClose} onPress={() => setSelectedworkerinfo({ ...selectedWorkerinfo, show: false, workers: [] })}>
								<Text style={styles.workersCloseHeader}>Cancel</Text>
							</TouchableOpacity>
						</View>
					</SafeAreaView>
				</Modal>
			)}
			{openCart && <Modal><Cart navigation={props.navigation} close={() => {
				getTheNumCartItems()
				setOpencart(false)
			}}/></Modal>}
			{showPaymentrequired && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.requiredBox}>
            <View style={styles.requiredContainer}>
              <Text style={styles.requiredHeader}>
                You need to provide a payment method to book
                an appointment
              </Text>

              <View style={styles.requiredActions}>
                <TouchableOpacity style={styles.requiredAction} onPress={() => setShowpaymentrequired(false)}>
                  <Text style={styles.requiredActionHeader}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.requiredAction} onPress={() => {
                  setShowpaymentrequired(false)
                  props.navigation.navigate("account", { required: "card" })
                }}>
                  <Text style={styles.requiredActionHeader}>Ok</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
				</Modal>
			)}
			{showTrialover && (
				<Modal transparent={true}>
					<SafeAreaView style={styles.requiredBox}>
            <View style={styles.requiredContainer}>
              <Text style={styles.requiredHeader}>
                Your 30 days trial period is up. A cost of $0.50
                will be charged from you if any of your future appointment
                is accepted by a salon
              </Text>

              <View style={styles.requiredActions}>
                <TouchableOpacity style={styles.requiredAction} onPress={() => setShowtrialover(false)}>
                  <Text style={styles.requiredActionHeader}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.requiredAction} onPress={() => {
                  setShowpaymentrequired(true)
                  setShowtrialover(false)
                }}>
                  <Text style={styles.requiredActionHeader}>Ok</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
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

const styles = StyleSheet.create({
	booktime: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	headers: { height: '10%' },
	serviceHeader: { fontSize: wsize(8), fontWeight: 'bold', paddingVertical: 10, textAlign: 'center' },

	workerSelection: { alignItems: 'center', marginVertical: 50 },
  workerSelectionHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
	chooseWorkerActions: { flexDirection: 'row', justifyContent: 'space-around' },
	chooseWorkerAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 2, padding: 5, width: wsize(40) },
	chooseWorkerActionHeader: { fontSize: wsize(5), textAlign: 'center' },
	selectedWorker: { marginVertical: 10 },
	selectedWorkerImage: { borderRadius: wsize(20) / 2, height: wsize(20), width: wsize(20) },
	selectedWorkerHeader: { fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },

	dateSelection: { alignItems: 'center', marginVertical: 50, width: '100%' },
  dateSelectionHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
  dateHeaders: { flexDirection: 'row', justifyContent: 'space-between', width: '70%' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
  dateHeader: { fontSize: wsize(6), marginVertical: 5, textAlign: 'center', width: wsize(50) },
  days: { alignItems: 'center', width: '100%' },

  daysHeaderRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  daysHeader: { fontSize: wsize(12) * 0.4, fontWeight: 'bold', marginVertical: 1, textAlign: 'center', width: wsize(12) },

  daysDataRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  dayTouch: { borderStyle: 'solid', borderWidth: 2, marginVertical: 1, paddingVertical: 10, width: wsize(12) },
  dayTouchHeader: { color: 'black', fontSize: wsize(12) * 0.4, textAlign: 'center' },

  dayTouchDisabled: { paddingVertical: 10, width: wsize(12) },
  dayTouchDisabledHeader: { fontSize: wsize(12) * 0.4, fontWeight: 'bold' },

  timesSelection: { alignItems: 'center', marginVertical: 50 },
	timesHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
	times: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', width: wsize(79) },
	
	unselect: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, paddingVertical: 10, width: wsize(25) },
	unselectHeader: { color: 'black', fontSize: wsize(5) },

	noTimeHeader: { fontFamily: 'appFont', fontSize: wsize(5) },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontSize: wsize(4), fontWeight: 'bold' },
	cart: { flexDirection: 'row', height: 30, marginVertical: 5 },
	numCartItemsHeader: { fontSize: wsize(4), fontWeight: 'bold' },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', justifyContent: 'space-around', paddingVertical: 20, width: '80%' },
	confirmHeader: { fontSize: wsize(4), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	note: { alignItems: 'center', marginBottom: 20 },
	noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(4), height: 100, padding: 5, width: '80%' },
	confirmOptions: { flexDirection: 'row' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(20) },
	confirmOptionHeader: { fontSize: wsize(4) },
	requestedHeaders: { alignItems: 'center', paddingHorizontal: 20 },
	requestedClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 10, padding: 5, width: 100 },
	requestedCloseHeader: { fontFamily: 'appFont', fontSize: wsize(5), textAlign: 'center' },
	requestedHeader: { fontFamily: 'appFont', fontSize: wsize(5), textAlign: 'center' },
	requestedHeaderInfo: { fontSize: wsize(5), textAlign: 'center' },

	workersContainer: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	workersBox: { alignItems: 'center', backgroundColor: 'white', height: '90%', width: '90%' },
	workersHeader: { fontSize: wsize(5), fontWeight: 'bold', paddingVertical: 20, textAlign: 'center' },
	workersList: { height: '80%' },
	workersRow: { flexDirection: 'row', justifyContent: 'space-between' },
	worker: { alignItems: 'center', marginHorizontal: 5, padding: 5, width: (width / 3) - 30 },
	workerProfile: { borderRadius: wsize(20) / 2, height: wsize(20), overflow: 'hidden', width: wsize(20) },
	workerHeader: { fontSize: wsize(4), fontWeight: 'bold'  },
	workersClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: wsize(30) },
	workersCloseHeader: { fontSize: wsize(4), textAlign: 'center' },

	requiredBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	requiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	requiredHeader: { fontFamily: 'appFont', fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	requiredActions: { flexDirection: 'row', justifyContent: 'space-around' },
	requiredAction: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(30) },
	requiredActionHeader: { fontSize: wsize(4), textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
	errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' }
})
