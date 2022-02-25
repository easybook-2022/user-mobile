import React, { useEffect, useState } from 'react'
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
import { getWorkers, getWorkerInfo, getAllWorkersTime } from '../../apis/owners'
import { getAppointmentInfo, makeAppointment } from '../../apis/schedules'
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
	const pushtime = 1000 * (60 * 15)

	const { locationid, serviceid, serviceinfo } = props.route.params
	const func = props.route.params
	const scheduleid = props.route.params.scheduleid ? props.route.params.scheduleid : null

	const [name, setName] = useState()
  const [allWorkers, setAllworkers] = useState({})
	const [scheduledTimes, setScheduledtimes] = useState([])
  const [oldTime, setOldtime] = useState(0)
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
	], loading: false, errorMsg: "" })
  const [userId, setUserid] = useState(null)
	const [times, setTimes] = useState([])
	const [selectedWorkerinfo, setSelectedworkerinfo] = useState({ show: false, worker: null, workers: [], numWorkers: 0 })
	const [loaded, setLoaded] = useState(false)
	const [showAuth, setShowauth] = useState(false)
  const [step, setStep] = useState(0)

	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(0)
	const [confirm, setConfirm] = useState({ show: false, service: "", time: 0, workerIds: [], note: "", requested: false, errormsg: "" })

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
					if (res) {
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
					alert("server error")
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
        if (res) {
          const { locationId, name, time, worker } = res.appointmentInfo

          setName(name)
          setOldtime(time)
          setSelectedworkerinfo({ ...selectedWorkerinfo, worker })
          getTheLocationHours(time)
        }
      })
  }
	const getTheLocationHours = async(time) => {
		const day = new Date(Date.now()).toString().split(" ")[0]
		const data = { locationid, day }

    setCalendar({ ...calendar, loading: true })

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
          let calcDay = ""

          if (selectedTime) {
            selectedDay = days[selectedTime.getDay()]
            selectedDate = selectedTime.getDate()
            selectedMonth = months[selectedTime.getMonth()]

            openStr = selectedDay + " " + selectedMonth + " " + selectedTime.getDate() + " " + selectedTime.getFullYear() + " " + openHour + ":" + openMinute
            closeStr = selectedDay + " " + selectedMonth + " " + selectedTime.getDate() + " " + selectedTime.getFullYear() + " " + closeHour + ":" + closeMinute

            calcDay = selectedDay
          } else {
            openStr = currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear() + " " + openHour + ":" + openMinute
            closeStr = currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear() + " " + closeHour + ":" + closeMinute

            calcDay = currDay
          }

          openDateStr = Date.parse(openStr)
          closeDateStr = Date.parse(closeStr)
          calcDateStr = openDateStr

					let firstDay = (new Date(currTime.getFullYear(), currTime.getMonth())).getDay()
					let numDays = 32 - new Date(currTime.getFullYear(), currTime.getMonth(), 32).getDate()
					let daynum = 1, data = calendar.data, datetime = 0, datenow = Date.parse(currDay + " " + currMonth + " " + currTime.getDate() + " " + currTime.getFullYear())
          let currenttime = Date.now(), newTimes = [], timesRow = [], timesNum = 0

					data.forEach(function (info, rowindex) {
						info.row.forEach(function (day, dayindex) {
							day.num = 0
              day.noservice = false

							if (rowindex == 0) {
								if (dayindex >= firstDay) {
									datetime = Date.parse(days[dayindex] + " " + currMonth + " " + daynum + " " + currTime.getFullYear())

									day.passed = datenow > datetime

                  day.noservice = selectedWorkerinfo.worker != null ? 
                    !(days[dayindex].substr(0, 3) in selectedWorkerinfo.worker.days)
                    :
                    !(days[dayindex].substr(0, 3) in allWorkers)
                  
									day.num = daynum
									daynum++
								}
							} else if (daynum <= numDays) {
								datetime = Date.parse(days[dayindex] + " " + currMonth + " " + daynum + " " + currTime.getFullYear())

								day.passed = datenow > datetime

                day.noservice = selectedWorkerinfo.worker != null ? 
                  !(days[dayindex].substr(0, 3) in selectedWorkerinfo.worker.days)
                  :
                  !(days[dayindex].substr(0, 3) in allWorkers)
                
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

						let timepassed = currenttime > calcDateStr
						let timetaken = scheduled.indexOf(calcDateStr) > -1
            let availableService = false
            let timedisplay = "", workerIds = []

            if (selectedWorkerinfo.worker != null && calcDay.substr(0, 3) in selectedWorkerinfo.worker.days) {
              let startTime = selectedWorkerinfo.worker.days[calcDay.substr(0, 3)]["start"]
              let endTime = selectedWorkerinfo.worker.days[calcDay.substr(0, 3)]["end"]

              if (
                calcDateStr >= Date.parse(openStr.substring(0, openStr.length - 5) + startTime) 
                && 
                calcDateStr <= Date.parse(closeStr.substring(0, closeStr.length - 5) + endTime)
              ) {
                availableService = true
                workerIds = [selectedWorkerinfo.worker.days[calcDay.substr(0, 3)]["workerId"]]
              }
            } else {
              if (calcDay.substr(0, 3) in allWorkers) {
                let times = allWorkers[calcDay.substr(0, 3)]
                let startTime = "", endTime = ""

                times.forEach(function (info) {
                  workerIds.push(info.workerId)
                  startTime = info.start
                  endTime = info.end

                  if (
                    calcDateStr >= Date.parse(openStr.substring(0, openStr.length - 5) + startTime) 
                    && 
                    calcDateStr <= Date.parse(closeStr.substring(0, closeStr.length - 5) + endTime)
                  ) {
                    availableService = true
                  }
                })
              }
            }

            if (!timepassed && !timetaken && availableService == true) {
              timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period

              timesRow.push({
                key: timesNum.toString(), header: timedisplay, 
                time: calcDateStr, workerIds
              })
              timesNum++

              if (timesRow.length == 3) {
                newTimes.push({ key: newTimes.length, row: timesRow })
                timesRow = []
              }
            }
					}

          if (timesRow.length > 0 && timesRow.length < 3) {
            while (timesRow.length < 3) {
              timesRow.push({ key: timesNum.toString() })
              timesNum++
            }

            newTimes.push({ key: newTimes.length, row: timesRow })
          }

					if (selectedTime) {
            setSelecteddateinfo({ month: selectedMonth, year: selectedTime.getFullYear(), day: selectedDay, date: selectedDate, time: 0 })
          } else {
            setSelecteddateinfo({
              month: currMonth, year: currTime.getFullYear(), day: currDay,
              date: selectedWorkerinfo.worker == null || calcDay.substr(0, 3) in selectedWorkerinfo.worker.days ? 
                currDate 
                : 
                0,
              time: 0
            })
          }

					setCalendar({ firstDay, numDays, data, loading: false })
					setScheduledtimes(scheduled)
					setTimes(newTimes)
          setOpentime({ hour: openHour, minute: openMinute })
          setClosetime({ hour: closeHour, minute: closeMinute })
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					const { errormsg, status } = err.response.data
				} else {
					alert(err.message)
				}
			})
	}
	const getTheWorkers = () => {
		getWorkers(locationid)
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
  const getAllTheWorkersTime = () => {
    getAllWorkersTime(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAllworkers(res.workers)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        } else {
          alert("server error")
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
    let date = month == currTime.getMonth() && year == currTime.getFullYear() ? currTime.getDate() : 1
    let openStr = months[month] + " " + date + ", " + year + " " + openTime.hour + ":" + openTime.minute
    let closeStr = months[month] + " " + date + ", " + year + " " + closeTime.hour + ":" + closeTime.minute
    let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), currDateStr = openDateStr
    let currenttime = Date.now(), newTimes = [], timesRow = [], timesNum = 0

		firstDay = (new Date(year, month)).getDay()
		numDays = 32 - new Date(year, month, 32).getDate()

		data.forEach(function (info, rowindex) {
			info.row.forEach(function (day, dayindex) {
				day.num = 0
				day.noservice = false

				if (rowindex == 0) {
					if (dayindex >= firstDay) {
						datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

						day.passed = datenow > datetime

            if (selectedWorkerinfo.worker != null) {
              day.noservice = !(days[dayindex].substr(0, 3) in selectedWorkerinfo.worker.days)
            } else {
              day.noservice = !(days[dayindex].substr(0, 3) in allWorkers)
            }

						day.num = daynum
						daynum++
					}
				} else if (daynum <= numDays) {
					datetime = Date.parse(days[dayindex] + " " + months[month] + " " + daynum + " " + year)

					day.passed = datenow > datetime

          if (selectedWorkerinfo.worker != null) {
            day.noservice = !(days[dayindex].substr(0, 3) in selectedWorkerinfo.worker.days)
          } else {
            day.noservice = !(days[dayindex].substr(0, 3) in allWorkers)
          }

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
			
			let timepassed = currenttime > currDateStr
			let timetaken = scheduledTimes.indexOf(currDateStr) > -1
      let availableService = false
      let timedisplay = "", workerIds = []

      if (selectedWorkerinfo.worker != null && currDay.substr(0, 3) in selectedWorkerinfo.worker.days) {
        let startTime = selectedWorkerinfo.worker.days[currDay.substr(0, 3)]["start"]
        let endTime = selectedWorkerinfo.worker.days[currDay.substr(0, 3)]["end"]

        if (
          calcDateStr >= Date.parse(openStr.substring(0, openStr.length - 5) + startTime) 
          && 
          calcDateStr <= Date.parse(closeStr.substring(0, closeStr.length - 5) + endTime)
        ) {
          availableService = true
          workerIds = [selectedWorkerinfo.worker.days[currDay.substr(0, 3)]["workerId"]]
        }
      } else {
        if (currDay.substr(0, 3) in allWorkers) {
          let times = allWorkers[currDay.substr(0, 3)]
          let startTime = "", endTime = ""

          times.forEach(function (info) {
            startTime = info.start
            endTime = info.end

            if (
              calcDateStr >= Date.parse(openStr.substring(0, openStr.length - 5) + startTime) 
              && 
              calcDateStr <= Date.parse(closeStr.substring(0, closeStr.length - 5) + endTime)
            ) {
              availableService = true
              workerIds.push(info.workerId)
            }
          })
        }
      }

  		if (!timepassed && !timetaken && availableService == true) {
        timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period

        timesRow.push({
          key: timesNum.toString(), header: timedisplay, 
          time: calcDateStr, workerIds
        })
        timesNum++

        if (timesRow.length == 3) {
          newTimes.push({ key: newTimes.length, row: timesRow })
          timesRow = []
        }
      }
		}

    if (timesRow.length > 0) {
      while (timesRow.length < 3) {
        timesRow.push({ key: timesNum.toString() })
        timesNum++
      }

      newTimes.push({ key: newTimes.length, row: timesRow })
    }

		setSelecteddateinfo({ ...selectedDateinfo, month: months[month], year })
		setCalendar({ firstDay, numDays, data })
		setTimes(newTimes)
		setLoaded(true)
	}
	const selectDate = async(date) => {
    const { month, year } = selectedDateinfo

    let openStr = month + " " + date + ", " + year + " " + openTime.hour + ":" + openTime.minute
    let closeStr = month + " " + date + ", " + year + " " + closeTime.hour + ":" + closeTime.minute
    let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr), calcDateStr = openDateStr
    let day = new Date(openDateStr).toString()
    let currenttime = Date.now(), newTimes = [], timesRow = [], timesNum = 0, workerStarttime = null, workerEndtime = null, workerTime = null

    while (calcDateStr < (closeDateStr - pushtime)) {
      calcDateStr += pushtime

      let timestr = new Date(calcDateStr)
      let hour = timestr.getHours()
      let minute = timestr.getMinutes()
      let period = hour < 12 ? "am" : "pm"

      let timedisplay = (hour <= 12 ? (hour == 0 ? "12" : hour) : hour - 12) + ":" + (minute < 10 ? '0' + minute : minute) + " " + period
      let timepassed = currenttime > calcDateStr
      let timetaken = scheduledTimes.indexOf(calcDateStr) > -1
      let availableService = false, workerIds = []

      if (selectedWorkerinfo.worker != null && day.substr(0, 3) in selectedWorkerinfo.worker.days) {
        let startTime = selectedWorkerinfo.worker.days[day.substr(0, 3)]["start"]
        let endTime = selectedWorkerinfo.worker.days[day.substr(0, 3)]["end"]

        if (
          calcDateStr >= Date.parse(openStr.substring(0, openStr.length - 5) + startTime) 
          && 
          calcDateStr <= Date.parse(closeStr.substring(0, closeStr.length - 5) + endTime)
        ) {
          availableService = true
          workerIds = [selectedWorkerinfo.worker.days[day.substr(0, 3)]["workerId"]]
        }
      } else {
        if (day.substr(0, 3) in allWorkers) {
          let times = allWorkers[day.substr(0, 3)]
          let startTime = "", endTime = ""

          times.forEach(function (info) {
            startTime = info.start
            endTime = info.end

            if (
              calcDateStr >= Date.parse(openStr.substring(0, openStr.length - 5) + startTime) 
              && 
              calcDateStr <= Date.parse(closeStr.substring(0, closeStr.length - 5) + endTime)
            ) {
              availableService = true
              workerIds.push(info.workerId)
            }
          })
        }
      }

      if (!timepassed && !timetaken && availableService == true) {
        timesRow.push({
          key: timesNum.toString(), header: timedisplay, 
          time: calcDateStr, workerIds
        })
        timesNum++

        if (timesRow.length == 3) {
          newTimes.push({ key: newTimes.length, row: timesRow })
          timesRow = []
        }
      }
    }

    if (timesRow.length > 0) {
      for (let k = 0; k < (3 - timesRow.length); k++) {
        timesRow.push({ key: timesNum.toString() })
      }

      newTimes.push({ key: newTimes.length, row: timesRow })
    }

    setSelecteddateinfo({ ...selectedDateinfo, date, day })
    setTimes(newTimes)
	}
	const selectTime = (name, timeheader, time, workerIds) => {
		const { month, date, year } = selectedDateinfo

		setSelecteddateinfo({ ...selectedDateinfo, name, time })
    setConfirm({ ...confirm, show: true, service: name ? name : serviceinfo, time, workerIds })
	}
	const makeAnAppointment = async() => {
		if (userId) {
			const { month, date, year, time } = selectedDateinfo
			const { worker } = selectedWorkerinfo
			const { note, workerIds } = confirm
			const selecteddate = new Date(time)
			const selectedtime = selecteddate.getHours() + ":" + selecteddate.getMinutes()
			const dateInfo = Date.parse(month + " " + date + ", " + year + " " + selectedtime).toString()
			let data = { 
        id: scheduleid, // id for socket purpose (updating)
				userid: userId, 
				workerid: worker != null ? worker.id : workerIds[Math.floor(Math.random() * (workerIds.length - 1)) + 0], 
				locationid, 
				serviceid: serviceid ? serviceid : -1, 
				serviceinfo: serviceinfo ? serviceinfo : "",
				oldtime: oldTime, 
				time: dateInfo, note: note ? note : "", 
				type: "makeAppointment"
			}

      setConfirm({ ...confirm, loading: true })

			makeAppointment(data)
				.then((res) => {
					if (res.status == 200) {
						return res.data
					}
				})
				.then((res) => {
					if (res) {
            data = { ...data, receiver: res.receiver, time: res.time }
            socket.emit("socket/makeAppointment", data, () => {
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
			setShowauth(true)
		}
	}

	useEffect(() => {
		getTheNumCartItems()
    getAllTheWorkersTime()

		if (serviceid) getTheServiceInfo()

    if (scheduleid) {
      getTheAppointmentInfo()
    } else {
      getTheLocationHours()
    }
	}, [])

	return (
		<SafeAreaView style={styles.booktime}>
			<View style={styles.box}>
				<View style={styles.headers}>
					<Text style={styles.serviceHeader}>
            <Text style={{ fontSize: wsize(5) }}>for </Text> 
            {name ? name : serviceinfo}
          </Text>
				</View>

				{loaded ? 
          <>
            {step == 0 && (
							<View style={styles.workerSelection}>
								<Text style={styles.workerSelectionHeader}>Pick a stylist (Optional)</Text>

								<View style={styles.chooseWorkerActions}>
									{selectedWorkerinfo.worker != null && (
                    <View style={styles.column}>
  										<TouchableOpacity style={styles.chooseWorkerAction} onPress={() => {
                        setSelectedworkerinfo({ ...selectedWorkerinfo, worker: null })
                        getAllTheWorkersTime()
                      }}>
  											 <Text style={styles.chooseWorkerActionHeader}>Cancel</Text>
  										</TouchableOpacity>
                    </View>
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
            )}

            {step == 1 && (
							<View style={styles.dateSelection}>
								<Text style={styles.dateSelectionHeader}>Tap a date below</Text>

                {!calendar.loading ? 
                  <>
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
    													day.passed || day.noservice ? 
                                day.passed ? 
                                  <TouchableOpacity key={day.key} disabled={true} style={[styles.dayTouch, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                                    <Text style={styles.dayTouchHeader}>{day.num}</Text>
                                  </TouchableOpacity>
                                  :
                                  <TouchableOpacity key={day.key} disabled={true} style={[styles.dayTouch, { opacity: 0.1 }]}>
                                    <Text style={styles.dayTouchHeader}>{day.num}</Text>
                                  </TouchableOpacity>
    														:
    														selectedDateinfo.date == day.num ?
    															<TouchableOpacity key={day.key} style={[styles.dayTouch, { backgroundColor: 'black' }]} onPress={() => {
                                    if (selectedWorkerinfo.worker != null) {
                                      selectWorker(selectedWorkerinfo.worker.id)
                                    } else {
                                      getAllTheWorkersTime()
                                    }

                                    selectDate(day.num)
                                  }}>
    																<Text style={[styles.dayTouchHeader, { color: 'white' }]}>{day.num}</Text>
    															</TouchableOpacity>
    															:
    															<TouchableOpacity key={day.key} style={styles.dayTouch} onPress={() => {
                                    if (selectedWorkerinfo.worker != null) {
                                      selectWorker(selectedWorkerinfo.worker.id)
                                    } else {
                                      getAllTheWorkersTime()
                                    }

                                    selectDate(day.num)
                                  }}>
    																<Text style={styles.dayTouchHeader}>{day.num}</Text>
    															</TouchableOpacity>
    													:
    													<View key={"calender-header-" + rowindex + "-" + dayindex} style={styles.dayTouchDisabled}></View>
    											))}
    										</View>
    									))}
    								</View>
                    <Text style={styles.errorMsg}>{calendar.errorMsg}</Text>
                  </>
                  :
                  <View style={styles.loading}>
                    <ActivityIndicator color="black" size="small"/>
                  </View>
                }
  						</View>
            )}

            {step == 2 && (
							<View style={styles.timesSelection}>
                <ScrollView style={{ width: '100%' }}>
                  <Text style={styles.timesHeader}>Tap a time below</Text>

                  <View style={{ alignItems: 'center' }}>
    								<View style={styles.times}>
    									{times.map(info => (
                        <View key={info.key} style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                          {info.row.map(item => (
                            item.header ? 
                              <TouchableOpacity key={item.key} style={styles.unselect} onPress={() => selectTime(name, item.header, item.time, item.workerIds)}>
                                <Text style={styles.unselectHeader}>{item.header}</Text>
                              </TouchableOpacity>
                              :
                              <View key={item.key} style={[styles.unselect, { borderColor: 'transparent' }]}></View>
                          ))}
                        </View>
    									))}
    								</View>
                  </View>
                </ScrollView>
							</View>
            )}

            <View style={styles.actions}>
              {step > 0 && (
                <TouchableOpacity style={styles.action} onPress={async() => {
                  if (selectedWorkerinfo.worker != null) {
                    selectWorker(selectedWorkerinfo.worker.id)
                  } else {
                    getAllTheWorkersTime()
                  }

                  setStep(step - 1)
                }}>
                  <Text style={styles.actionHeader}>Back</Text>
                </TouchableOpacity>
              )}

              {step < 2 && (
                <TouchableOpacity style={styles.action} onPress={() => {
                  switch (step) {
                    case 0:
                      if (selectedWorkerinfo.worker != null) {
                        selectWorker(selectedWorkerinfo.worker.id)
                      } else {
                        getAllTheWorkersTime()
                      }

                      getTheLocationHours(oldTime)

                      setStep(1)

                      break;
                    case 1:
                      if (selectedDateinfo.date > 0) {
                        setStep(2)
                      } else {
                        setCalendar({ ...calendar, errorMsg: "Please tap on a day" })
                      }

                      break
                    default:
                      setStep(step + 1)
                  }
                }}>
                  <Text style={styles.actionHeader}>Next</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
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
										{oldTime == 0 ? 
											<Text style={styles.confirmHeader}>
												<Text style={{ fontFamily: 'appFont' }}>Make an appointment for</Text>
												{'\n' + confirm.service + '\n'}
												{displayTime(confirm.time) + '\n'}
											</Text>
											:
											<Text style={styles.confirmHeader}>
												Change Appointment for
												{'\nService: ' + confirm.service + '\n\n'}
												{displayTime(oldTime) + '\n\nto'}
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

										{confirm.errormsg ? <Text style={styles.errorMsg}>You already made an appointment for this service</Text> : null}

										<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
											<View style={styles.confirmOptions}>
												<TouchableOpacity style={[styles.confirmOption, { opacity: confirm.loading ? 0.3 : 1 }]} disabled={confirm.loading} onPress={() => setConfirm({ show: false, service: "", time: 0, note: "", requested: false, errormsg: "" })}>
													<Text style={styles.confirmOptionHeader}>No</Text>
												</TouchableOpacity>
												<TouchableOpacity style={[styles.confirmOption, { opacity: confirm.loading ? 0.3 : 1 }]} disabled={confirm.loading} onPress={() => makeAnAppointment()}>
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
                    <Text style={styles.requestedHeader}>Appointment made for{'\n'}</Text>
                    <Text style={styles.requestedHeaderInfo}>
                      {confirm.service} {'\n'}
                      {displayTime(confirm.time)}
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

              <TouchableOpacity style={styles.workersRefresh} onPress={() => getTheWorkers()}>
                <Text style={styles.workersRefreshHeader}>Refresh</Text>
              </TouchableOpacity>

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
		</SafeAreaView>
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

	dateSelection: { alignItems: 'center', width: '100%' },
  dateSelectionHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
  dateHeaders: { flexDirection: 'row', justifyContent: 'space-between', width: '70%' },
  column: { flexDirection: 'column', justifyContent: 'space-around' },
  dateHeader: { fontSize: wsize(6), marginVertical: 5, textAlign: 'center', width: wsize(50) },
  days: { alignItems: 'center', width: '100%' },

  daysHeaderRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  daysHeader: { fontSize: wsize(12) * 0.3, fontWeight: 'bold', marginVertical: 1, textAlign: 'center', width: wsize(12) },

  daysDataRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  dayTouch: { borderStyle: 'solid', borderWidth: 2, marginVertical: 1, paddingVertical: 10, width: wsize(12) },
  dayTouchHeader: { color: 'black', fontSize: wsize(12) * 0.4, textAlign: 'center' },

  dayTouchDisabled: { paddingVertical: 10, width: wsize(12) },
  dayTouchDisabledHeader: { fontSize: wsize(12) * 0.4, fontWeight: 'bold' },

  timesSelection: { alignItems: 'center', height: '60%' },
	timesHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
	times: { alignItems: 'center', paddingBottom: 50, width: '100%' },
	
	unselect: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, paddingVertical: 10, width: wsize(30) },
	unselectHeader: { color: 'black', fontSize: wsize(5) },

	noTimeHeader: { fontFamily: 'appFont', fontSize: wsize(4) },

  actions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5, width: wsize(30) },
  actionHeader: { color: 'black', fontSize: wsize(5), textAlign: 'center' },

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
  workersRefresh: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
  workersRefreshHeader: { textAlign: 'center' },
	workersList: { height: '70%' },
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
	errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },
  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
})
