import React, { useEffect, useState, useRef } from 'react'
import { 
	SafeAreaView, ActivityIndicator, Dimensions, ScrollView, View, FlatList, Image, Text, 
	TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { socket, logo_url, displayTime } from '../../../assets/info'
import { getLocationHours, getLocationProfile, makeReservation } from '../../apis/locations'
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
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Makereservation(props) {
	const months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'October', 'November', 'December']
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const pushtime = 1000 * (60 * 10)
	
	const { locationid } = props.route.params
	const func = props.route.params
	const scheduleid = props.route.params.scheduleid ? props.route.params.scheduleid : null

	const [name, setName] = useState('')
  const [oldTime, setOldtime] = useState(0)

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
  const [openDays, setOpendays] = useState([])
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
	const [loaded, setLoaded] = useState(false)
  const [step, setStep] = useState(0)

	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(0)
	const [confirm, setConfirm] = useState({ show: false, service: "", time: 0, note: "", requested: false, errormsg: "" })
	
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
						alert("server error")
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
					const { name, logo } = res.info

					setName(name)
          setLocationinfo({ name, logo })
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("server error")
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
		let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), calcDateStr = openDateStr
		let currenttime = Date.now(), newTimes = []

		while (calcDateStr < (closeDateStr - pushtime)) {
			calcDateStr += pushtime

			let timestr = new Date(calcDateStr)
			let hour = timestr.getHours()
			let minute = timestr.getMinutes()
			let period = hour < 12 ? "am" : "pm"

			let timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period
			let timepassed = currenttime > calcDateStr
			let timetaken = scheduledTimes.indexOf(calcDateStr) > -1

  		if (!timepassed && !timetaken) {
        newTimes.push({ 
          key: newTimes.length, header: timedisplay, 
          time: calcDateStr, timetaken, timepassed
        })
      }
		}

		setSelecteddateinfo({ ...selectedDateinfo, month: months[month], date: null, year })
		setCalendar({ firstDay, numDays, data })
		setTimes(newTimes)
		setLoaded(true)
	}
	const selectDate = (date) => {
		const { month, year } = selectedDateinfo

		let openStr = month + " " + date + ", " + year + " " + openTime.hour + ":" + openTime.minute
		let closeStr = month + " " + date + ", " + year + " " + closeTime.hour + ":" + closeTime.minute
		let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), calcDateStr = openDateStr
		let currenttime = Date.now(), newTimes = []

		while (calcDateStr < (closeDateStr - pushtime)) {
			calcDateStr += pushtime

			let timestr = new Date(calcDateStr)
			let hour = timestr.getHours()
			let minute = timestr.getMinutes()
			let period = hour < 12 ? "am" : "pm"

			let timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period
			let timepassed = currenttime > calcDateStr
			let timetaken = scheduledTimes.indexOf(calcDateStr) > -1

  		if (!timepassed && !timetaken) {
        newTimes.push({ 
          key: newTimes.length, header: timedisplay, 
          time: calcDateStr, timetaken, timepassed
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
			setConfirm({ ...confirm, show: true, service: name, time })
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
					const { numdiners, diners, table, note, time } = res.reservationInfo

          setOldtime(time)
					setNumselecteddiners(numdiners)
					setSelecteddiners(diners)
					setSelectedtable(table)
					setConfirm({ ...confirm, note })
          getTheLocationHours(time)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				} else {
					alert("server error")
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

          let selectedTime = time > 0 ? new Date(time) : null
          let selectedDay = null, selectedDate = null, selectedMonth = null
          let openStr, closeStr, openDateStr, closeDateStr, calcDateStr

          if (selectedTime) {
            selectedDay = days[selectedTime.getDay()]
            selectedDate = selectedTime.getDate()
            selectedMonth = months[selectedTime.getMonth()]

            openStr = selectedDay + " " + selectedMonth + " " + selectedTime.getDate() + " " + selectedTime.getFullYear() + " " + openHour + ":" + openMinute
            closeStr = selectedDay + " " + selectedMonth + " " + selectedTime.getDate() + " " + selectedTime.getFullYear() + " " + closeHour + ":" + closeMinute
          } else {
            openStr = currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear() + " " + openHour + ":" + openMinute
            closeStr = currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear() + " " + closeHour + ":" + closeMinute
          }

					openDateStr = Date.parse(openStr)
          closeDateStr = Date.parse(closeStr)
          calcDateStr = openDateStr

					let newTimes = [], currenttime = Date.now()
					let firstDay = (new Date(currTime.getFullYear(), currTime.getMonth())).getDay()
					let numDays = 32 - new Date(currTime.getFullYear(), currTime.getMonth(), 32).getDate()
					let daynum = 1, data = calendar.data, datetime = 0, datenow = Date.parse(currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear())

					data.forEach(function (info, rowindex) {
						info.row.forEach(function (day, dayindex) {
							day.num = 0
              day.close = false

							if (rowindex == 0) {
								if (dayindex >= firstDay) {
									datetime = Date.parse(days[dayindex] + " " + currMonth + " " + daynum + " " + currTime.getFullYear())

									day.passed = datenow > datetime

                  if (res.openDays.indexOf(days[dayindex].substr(0, 3)) == -1) {
                    day.close = true
                  }

									day.num = daynum
									daynum++
								}
							} else if (daynum <= numDays) {
								datetime = Date.parse(days[dayindex] + " " + currMonth + " " + daynum + " " + currTime.getFullYear())

								day.passed = datenow > datetime

                if (res.openDays.indexOf(days[dayindex].substr(0, 3)) == -1) {
                  day.close = true
                }

								day.num = daynum
								daynum++
							}
						})
					})

					while (calcDateStr < (closeDateStr - pushtime)) {
						calcDateStr += pushtime

						let timestr = new Date(calcDateStr)
						let hour = timestr.getHours()
						let minute = timestr.getMinutes()
						let period = hour < 12 ? "am" : "pm"

						let timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period
						let timepassed = currenttime > calcDateStr
						let timetaken = scheduled.indexOf(calcDateStr) > -1

            if (!timepassed && !timetaken) {
              newTimes.push({ 
                key: newTimes.length, header: timedisplay, 
                time: calcDateStr, timetaken
              })
            }
					}

					setOpentime({ hour: openHour, minute: openMinute })
					setClosetime({ hour: closeHour, minute: closeMinute })
          setOpendays(res.openDays)

          if (selectedTime) {
            setSelecteddateinfo({ month: selectedMonth, year: selectedTime.getFullYear(), day: selectedDay, date: selectedDate, time: 0 })
          } else {
            setSelecteddateinfo({ 
              month: currMonth, year: currTime.getFullYear(), day: currDay, 
              date: res.openDays.indexOf(currDay.substr(0, 3)) > -1 ? currDate : 0, 
              time: 0
            })
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
					alert("server error")
				}
			})
	}
	const makeTheReservation = async() => {
		if (userId) {
			const { month, date, year, time } = selectedDateinfo
			const { note } = confirm
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
				oldtime: oldTime, time: dateInfo, diners, note: note ? note : "",
				type: "makeReservation"
			}

      setConfirm({ ...confirm, loading: true })

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
							socket.emit("socket/makeReservation", data, () => {
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
                }, 2000)
              })
						} else {
							let { oldtime, note } = res

							setConfirm({ ...confirm, note })
						}
					}
				})
				.catch((err) => {
					if (err.response && err.response.status == 400) {
						const { errormsg, status } = err.response.data

					} else {
						alert("server error")
					}
				})
		} else {
			setConfirm({ ...confirm, show: false })
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
					
				} else {
					alert("server error")
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
			setOpenlist(true)
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
      getTheLocationHours()
		}
	}

	useEffect(() => {
		isMounted.current = true

		initialize()

		return () => isMounted.current = false
	}, [])

	return (
		<SafeAreaView style={styles.makereservation}>
			{loaded ? 
				<View style={styles.box}>
					{scheduleid ? 
						<View style={styles.headers}>
							<Text style={styles.serviceHeader}><Text style={{ fontSize: wsize(5) }}>for</Text></Text>
							<Text style={styles.serviceHeader}>{numSelectedDiners} {numSelectedDiners == 1 ? 'person' : 'people'}</Text>
						</View>
						:
						<View style={styles.headers}>
							<Text style={styles.serviceHeader}><Text style={{ fontSize: wsize(5) }}>at</Text> {name}</Text>
						</View>
					}

					{times.length > 0 ?
						<ScrollView style={{ height: '80%' }}>
              {step == 0 && (
  							<View style={{ alignItems: 'center', marginBottom: 30, marginTop: 0 }}>
  								<View style={styles.dinersBox}>
  									{!scheduleid && (
  										<>
  											<TouchableOpacity style={styles.dinersAdd} onPress={() => openDinersList()}>
  												<Text style={styles.dinersAddHeader}>{numSelectedDiners > 0 ? 'Edit' : 'Add Other'} Diner(s)</Text>
  											</TouchableOpacity>
  											<Text style={styles.dinersHeader}>{numSelectedDiners} diner(s) selected</Text>
  										</>
  									)}

  									{(!openList && selectedDiners.length > 0) && (
  										selectedDiners.map(item => (
  											<View key={item.key} style={styles.selectedDinersRow}>
  												{item.row.map(diner => (
  													diner.id ? 
  														<View key={diner.key} style={styles.selectedDiner}>
  															{diner.id != userId ? 
  																<TouchableOpacity style={styles.selectedDinerDelete} onPress={() => deselectDiner(diner.id)}>
  																	<AntDesign name="closecircleo" size={15}/>
  																</TouchableOpacity>
  																:
  																<View style={styles.selectedDinerDelete}></View>
  															}
  															<View style={styles.dinerProfileHolder}>
  																<Image source={{ uri: logo_url + diner.profile }} style={{ height: 60, width: 60 }}/>
  															</View>
  														</View>
  														:
  														<View key={diner.key} style={styles.selectedDiner}>
  														</View>
  												))}
  											</View>
  										))
  									)}
  								</View>
  							</View>
              )}

              {step == 1 && (
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
  													day.passed || day.close ? 
                              day.close ? 
    														<TouchableOpacity key={day.key} disabled={true} style={[styles.dayTouch, { opacity: 0.1 }]}>
                                  <Text style={styles.dayTouchHeader}>{day.num}</Text>
                                </TouchableOpacity>
                                :
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
                  <Text style={styles.errorMsg}>{calendar.errorMsg}</Text>
  							</View>
              )}

              {step == 2 && (
  							<View style={styles.timesSelection}>
                  <Text style={styles.timesHeader}>Tap a time below</Text>
  								<View style={styles.times}>
  									{times.map(info => (
  										<View key={info.key}>
  											{!info.timetaken ?
  												<TouchableOpacity style={styles.unselect} onPress={() => selectTime(name, info.header, info.time)}>
  													<Text style={styles.unselectHeader}>{info.header}</Text>
  												</TouchableOpacity>
                          :
                          <TouchableOpacity style={[styles.unselect, { backgroundColor: 'black' }]} disabled={true} onPress={() => {}}>
                            <Text style={[styles.unselectHeader, { color: 'white' }]}>{info.header}</Text>
                          </TouchableOpacity>
                        }
  										</View>
  									))}
  								</View>
  							</View>
              )}

              <View style={styles.actions}>
                {step > 0 && (
                  <TouchableOpacity style={styles.action} onPress={() => {
                    setStep(step - 1)

                    if (step - 1 == 1) {
                      getTheLocationHours(oldTime)
                    }
                  }}>
                    <Text style={styles.actionHeader}>Back</Text>
                  </TouchableOpacity>
                )}

                {step < 2 && (
                  <TouchableOpacity style={styles.action} onPress={() => {
                    switch (step) {
                      case 0:
                        setStep(step + 1)
                        getTheLocationHours(oldTime)

                        break
                      case 1:
                        if (selectedDateinfo.date > 0) {
                          setStep(2)
                        } else {
                          setCalendar({ ...calendar, errorMsg: "Please tap on a day" })
                        }

                        break
                      default:
                        
                    }
                  }}>
                    <Text style={styles.actionHeader}>Next</Text>
                  </TouchableOpacity>
                )}
              </View>
						</ScrollView>
						:
						<View style={{ alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' }}>
							<Text style={styles.noTimeHeader}>Not open today</Text>
						</View>
					}

					<View style={styles.bottomNavs}>
						<View style={styles.bottomNavsRow}>
							{userId && (
								<TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.navigate("account")}>
									<FontAwesome5 name="user-circle" size={wsize(7)}/>
								</TouchableOpacity>
							)}

							{userId && (
								<TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.navigate("recent")}>
									<FontAwesome name="history" size={wsize(7)}/>
								</TouchableOpacity>
							)}

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
									setNumselecteddiners(0)
									setSelecteddiners([])
								} else {
									setShowauth({ show: true, action: "" })
								}
							}}>
								<Text style={styles.bottomNavHeader}>{userId ? 'Log-Out' : 'Log-In'}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
				:
				<View style={{ alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' }}>
					<ActivityIndicator color="black" size="large"/>
				</View>
			}
      
			{confirm.show && (
				<Modal transparent={true}>
					<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
						<SafeAreaView style={styles.confirmBox}>
							<View style={styles.confirmContainer}>
								{!confirm.requested ? 
									<>
										{oldTime == 0 ? 
											<Text style={styles.confirmHeader}>
												Make a reservation for {'\n'}
												{numSelectedDiners > 0 ? " " + numSelectedDiners + " " + (numSelectedDiners > 1 ? 'people' : 'person') : " yourself"}
												{'\nat ' + confirm.service}
												{'\n' + displayTime(confirm.time)}
											</Text>
											:
											<Text style={styles.confirmHeader}>
												Change Reservation for{'\n'}
												{numSelectedDiners > 0 ? " " + numSelectedDiners + " " + (numSelectedDiners > 1 ? 'people' : 'person') : " yourself"}
												{'\nat ' + confirm.service + '\n\n'}
												{displayTime(oldTime) + '\n\nto\n'}
												{'\n' + displayTime(confirm.time) + '\n'}
											</Text>
										}

										<View style={styles.note}>
											<TextInput 
                        style={styles.noteInput} multiline textAlignVertical="top" 
                        placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Leave a note if you want" 
                        maxLength={100} onChangeText={(note) => setConfirm({ ...confirm, note })} 
                        value={confirm.note} autoCorrect={false} autoCapitalize="none"
                      />
										</View>

										{confirm.errormsg ? <Text style={styles.errorMsg}>Reservation already made</Text> : null}

										<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
											<View style={styles.confirmOptions}>
												<TouchableOpacity style={[styles.confirmOption, { opacity: confirm.loading ? 0.3 : 1 }]} disabled={confirm.loading} onPress={() => setConfirm({ show: false, service: "", time: 0, note: "", requested: false, errormsg: "" })}>
													<Text style={styles.confirmOptionHeader}>No</Text>
												</TouchableOpacity>
												<TouchableOpacity style={[styles.confirmOption, { opacity: confirm.loading ? 0.3 : 1 }]} disabled={confirm.loading} onPress={() => makeTheReservation()}>
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
                    <Text style={styles.requestedHeader}>Reservation requested</Text>
                    <Text style={styles.requestedHeaderInfos}>
                      <Text style={styles.requestedHeaderInfo}>
                        at {confirm.service} {'\n'}
                        {displayTime(confirm.time)}

                        {'\n'}for 
                        {numSelectedDiners > 0 ? 
                          " " + numSelectedDiners + " " + (numSelectedDiners > 1 ? 'people' : 'person') 
                          : 
                          " yourself"
                        }
                      </Text>
                    </Text>
                    <Text style={styles.requestedHeader}>You will get notify very soon</Text>
                  </View>
								}
							</View>
						</SafeAreaView>
					</TouchableWithoutFeedback>
				</Modal>
			)}
			{openCart && <Modal><Cart navigation={props.navigation} close={() => {
				getTheNumCartItems()
				setOpencart(false)
			}}/></Modal>}
			{openList && (
				<Modal>
					<SafeAreaView style={styles.dinersListBox}>
						<View style={styles.dinersList}>
							<TextInput style={styles.dinerNameInput} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Search diner(s) to add to reservation" onChangeText={(username) => getDinersList(username)} autoCorrect={false} autoCapitalize="none"/>

							<View style={styles.dinersListContainer}>
								<View style={styles.dinersListSearched}>
									<Text style={styles.dinersHeader}>{numDiners} Searched Diner(s)</Text>

									<FlatList
										data={diners}
										renderItem={({ item, index }) => 
											<View key={item.key} style={styles.row}>
												{item.row.map(diner => (
													diner.username ? 
														<TouchableOpacity key={diner.key} style={styles.diner} onPress={() => selectDiner(diner.id)}>
															<View style={styles.dinerProfileHolder}>
																<Image source={{ uri: logo_url + diner.profile }} style={{ height: 60, width: 60 }}/>
															</View>
															<Text style={styles.dinerName}>{diner.username}</Text>
														</TouchableOpacity>
														:
														<View key={diner.key} style={styles.diner}></View>
												))}
											</View>
										}
									/>
								</View>
							
								<View style={styles.dinersListSelected}>
									{selectedDiners.length > 0 && (
										<>
											<Text style={styles.selectedDinersHeader}>{numSelectedDiners} Selected Diner(s) to this reservation</Text>

											<FlatList
												data={selectedDiners}
												renderItem={({ item, index }) => 
													<View key={item.key} style={styles.row}>
														{item.row.map(diner => (
															diner.username ? 
																<View key={diner.key} style={styles.diner}>
																	{diner.id != userId ? 
																		<TouchableOpacity style={styles.dinerDelete} onPress={() => deselectDiner(diner.id)}>
																			<AntDesign name="closecircleo" size={15}/>
																		</TouchableOpacity>
																		:
																		<View style={styles.dinerDelete}></View>
																	}
																	<View style={styles.dinerProfileHolder}>
																		<Image source={{ uri: logo_url + diner.profile }} style={{ height: 60, width: 60 }}/>
																	</View>
																	<Text style={styles.dinerName}>{diner.username}</Text>
																</View>
																:
																<View key={diner.key} style={styles.diner}></View>
														))}
													</View>
												}
											/>
										</>
									)}
								</View>
							</View>

							<View style={styles.itemContainer}>
								<View style={styles.itemImageHolder}>
									<Image style={{ height: wsize(30), width: wsize(30) }} source={{ uri: logo_url + locationInfo.logo }}/>
								</View>
								<Text style={styles.itemName}>{locationInfo.name}</Text>
							</View>

							<View style={{ alignItems: 'center' }}>
								<Text style={styles.errorMsg}>{errorMsg}</Text>

								<View style={styles.actions}>
									<TouchableOpacity style={styles.action} onPress={() => finish()}>
										<Text style={styles.actionHeader}>Finish</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
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
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	makereservation: { backgroundColor: 'white', height: '100%', width: '100%' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

	headers: { height: '10%' },
	serviceHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },

	body: { height: '80%' },

	dinersBox: { alignItems: 'center' },
	dinersAdd: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	dinersAddHeader: { fontSize: wsize(5), textAlign: 'center' },
	dinersHeader: { fontSize: wsize(4), marginVertical: 5, textAlign: 'center' },
	selectedDinersRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 10 },
	selectedDiner: { alignItems: 'center' },
	selectedDinerDelete: { height: 16, marginBottom: -5, marginLeft: 60, width: 16 },
	selectedDinerProfileHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 30, height: 60, overflow: 'hidden', width: 60 },

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
	unselectHeader: { color: 'black', fontSize: wsize(4) },

	noTimeHeader: { fontFamily: 'appFont', fontSize: wsize(5), textAlign: 'center' },

	bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
	bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
	bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
	bottomNavHeader: { fontSize: wsize(4), fontWeight: 'bold' },
	cart: { flexDirection: 'row', height: 30, marginVertical: 5 },
	numCartItemsHeader: { fontSize: wsize(4), fontWeight: 'bold' },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '80%', justifyContent: 'space-around', paddingVertical: 10, width: '80%' },
	confirmHeader: { fontSize: wsize(4), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	note: { alignItems: 'center', marginBottom: 20 },
	noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(4), height: 100, padding: 5, width: '80%' },
	confirmOptions: { flexDirection: 'row' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 50 },
	confirmOptionHeader: { },
	requestedHeaders: { alignItems: 'center', paddingHorizontal: 10 },
	requestedClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 10, padding: 5, width: 100 },
	requestedCloseHeader: { fontFamily: 'appFont', fontSize: wsize(5), textAlign: 'center' },
	requestedHeader: { fontFamily: 'appFont', fontSize: wsize(6), textAlign: 'center' },
	requestedHeaderInfos: { marginVertical: 50 },
	requestedHeaderInfo: { fontSize: wsize(6), fontWeight: 'bold', paddingVertical: 5, textAlign: 'center' },

	// friends list
	dinersListBox: { backgroundColor: 'white' },
	dinersList: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	dinerNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, margin: 10, padding: 10 },
	dinersListContainer: { flexDirection: 'column', height: '60%', justifyContent: 'space-between' },
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
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: wsize(30) / 2, height: wsize(30), overflow: 'hidden', width: wsize(30) },
	itemName: { fontWeight: 'bold', marginVertical: 15, marginLeft: 50, textAlign: 'center' },

	actions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 5 },
	action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 60 },
	actionHeader: { textAlign: 'center' },

	cardRequiredBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	cardRequiredContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	cardRequiredHeader: { fontFamily: 'appFont', fontSize: wsize(5), fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	cardRequiredActions: { flexDirection: 'row', justifyContent: 'space-around' },
	cardRequiredAction: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	cardRequiredActionHeader: { },

	errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' }
})
