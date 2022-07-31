import React, { useEffect, useState } from 'react'
import { 
	SafeAreaView, ActivityIndicator, Platform, Dimensions, ScrollView, View, FlatList, Text, Image, TextInput, 
	TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { CommonActions, StackActions } from '@react-navigation/native';
import { socket, logo_url } from '../../../assets/info'
import { displayTime, resizePhoto } from 'geottuse-tools'

import { getServiceInfo } from '../../apis/services'
import { getLocationHours, getDayHours } from '../../apis/locations'
import { getAllStylists, getStylistInfo, getAllWorkersTime, getWorkersHour } from '../../apis/owners'
import { getAppointmentInfo, getExistBooking, makeAppointment } from '../../apis/schedules'
import { getNumCartItems } from '../../apis/carts'

// components
import Orders from '../../components/orders'

// widgets
import Userauth from '../../widgets/userauth'
import Loadingprogress from '../../widgets/loadingprogress';

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const wsize = p => {return width * (p / 100)}

export default function Booktime(props) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const pushtime = 1000 * (60 * 15)

  const { locationid, serviceid, serviceinfo } = props.route.params

  const [scheduleId, setScheduleid] = useState(props.route.params.scheduleid ? props.route.params.scheduleid : null)
  const [userId, setUserid] = useState(null)
  const [name, setName] = useState('')
  const [hoursInfo, setHoursinfo] = useState({})
  const [oldTime, setOldtime] = useState(0)
  const [selectedDateinfo, setSelecteddateinfo] = useState({ month: '', year: 0, day: '', date: 0 })
  const [bookedDateinfo, setBookeddateinfo] = useState({ month: '', year: 0, day: '', date: 0, blocked: [] })
  const [selectedWorkerinfo, setSelectedworkerinfo] = useState({ id: -1, hours: {}, loading: false })
  const [calendar, setCalendar] = useState({ firstDay: 0, numDays: 30, data: [
    { key: "day-row-0", row: [
        { key: "day-0-0", num: 0, passed: false, noservice: false }, { key: "day-0-1", num: 0, passed: false, noservice: false }, { key: "day-0-2", num: 0, passed: false, noservice: false }, 
        { key: "day-0-3", num: 0, passed: false, noservice: false }, { key: "day-0-4", num: 0, passed: false, noservice: false }, { key: "day-0-5", num: 0, passed: false, noservice: false }, 
        { key: "day-0-6", num: 0, passed: false, noservice: false }
      ]}, 
      { key: "day-row-1", row: [
        { key: "day-1-0", num: 0, passed: false, noservice: false }, { key: "day-1-1", num: 0, passed: false, noservice: false }, { key: "day-1-2", num: 0, passed: false, noservice: false }, 
        { key: "day-1-3", num: 0, passed: false, noservice: false }, { key: "day-1-4", num: 0, passed: false, noservice: false }, { key: "day-1-5", num: 0, passed: false, noservice: false }, 
        { key: "day-1-6", num: 0, passed: false, noservice: false }
      ]}, 
      { key: "day-row-2", row: [
        { key: "day-2-0", num: 0, passed: false, noservice: false }, { key: "day-2-1", num: 0, passed: false, noservice: false }, { key: "day-2-2", num: 0, passed: false, noservice: false }, 
        { key: "day-2-3", num: 0, passed: false, noservice: false }, { key: "day-2-4", num: 0, passed: false, noservice: false }, { key: "day-2-5", num: 0, passed: false, noservice: false }, 
        { key: "day-2-6", num: 0, passed: false, noservice: false }
      ]}, 
      { key: "day-row-3", row: [
        { key: "day-3-0", num: 0, passed: false, noservice: false }, { key: "day-3-1", num: 0, passed: false, noservice: false }, { key: "day-3-2", num: 0, passed: false, noservice: false }, 
        { key: "day-3-3", num: 0, passed: false, noservice: false }, { key: "day-3-4", num: 0, passed: false, noservice: false }, { key: "day-3-5", num: 0, passed: false, noservice: false }, 
        { key: "day-3-6", num: 0, passed: false, noservice: false }
      ]}, 
      { key: "day-row-4", row: [
        { key: "day-4-0", num: 0, passed: false, noservice: false }, { key: "day-4-1", num: 0, passed: false, noservice: false }, { key: "day-4-2", num: 0, passed: false, noservice: false }, 
        { key: "day-4-3", num: 0, passed: false, noservice: false }, { key: "day-4-4", num: 0, passed: false, noservice: false }, { key: "day-4-5", num: 0, passed: false, noservice: false }, 
        { key: "day-4-6", num: 0, passed: false, noservice: false }
      ]}, 
      { key: "day-row-5", row: [
        { key: "day-5-0", num: 0, passed: false, noservice: false }, { key: "day-5-1", num: 0, passed: false, noservice: false }, { key: "day-5-2", num: 0, passed: false, noservice: false }, 
        { key: "day-5-3", num: 0, passed: false, noservice: false }, { key: "day-5-4", num: 0, passed: false, noservice: false }, { key: "day-5-5", num: 0, passed: false, noservice: false }, 
        { key: "day-5-6", num: 0, passed: false, noservice: false }
      ]}
  ], loading: false, errorMsg: "" })
  const [times, setTimes] = useState([])
  const [allStylists, setAllstylists] = useState({ stylists: [], numStylists: 0, ids: [] })
  const [allWorkerstime, setAllworkerstime] = useState({})
  const [scheduled, setScheduled] = useState({})
  const [loaded, setLoaded] = useState(false)

  const [step, setStep] = useState(0)
  const [numCartItems, setNumcartitems] = useState(0)

  const [confirm, setConfirm] = useState({ show: false, service: "", time: 0, workerIds: [], note: "", requested: false, errormsg: "" })
  const [showScheduleconflict, setShowscheduleconflict] = useState({ show: false, header: "" })
  const [openCart, setOpencart] = useState(false)
  const [showAuth, setShowauth] = useState({ show: false, booking: false })

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
          
        }
      })
  }
  const getTheAppointmentInfo = async(fetchBlocked) => {
    getAppointmentInfo(scheduleId)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { locationId, name, time, worker, blocked } = res
          const unix = jsonDateToUnix(time)

          setName(name)
          setOldtime(unix)

          if (!fetchBlocked) setSelectedworkerinfo({ ...selectedWorkerinfo, id: worker.id })

          const prevTime = new Date(unix)

          blocked.forEach(function (info) {
            info["time"] = JSON.parse(info["time"])
            info["unix"] = jsonDateToUnix(info["time"])
          })

          setBookeddateinfo({ 
            ...bookedDateinfo, 
            month: months[prevTime.getMonth()],  
            day: days[prevTime.getDay()].substr(0, 3),
            year: prevTime.getFullYear(),
            date: prevTime.getDate(),
            blocked
          })

          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getTheExistBooking = async() => {
    const userid = await AsyncStorage.getItem("userid")

    if (userid && serviceid && !scheduleId) {
      const data = { userid, serviceid }

      getExistBooking(data)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            setScheduleid(res.scheduleid)
          }
        })
    }
  }
  const getTheLocationHours = () => {
    getLocationHours(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { hours } = res

          setHoursinfo(hours)
          setLoaded(true)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getCalendar = (month, year) => {
    let currTime = new Date(), currDate = 0, currDay = ''
    let firstDay = (new Date(year, month)).getDay(), numDays = 32 - new Date(year, month, 32).getDate(), daynum = 1
    let data = calendar.data, datetime = 0, hourInfo, closedtime, now = Date.parse(
      days[currTime.getDay()] + " " + 
      months[currTime.getMonth()] + " " + 
      currTime.getDate() + " " + 
      currTime.getFullYear()
    ), timeStr = ""

    data.forEach(function (info, rowindex) {
      info.row.forEach(function (day, dayindex) {
        day.num = 0
        day.noservice = false

        timeStr = days[dayindex] + " " + months[month] + " " + daynum + " " + year

        if (rowindex == 0) {
          if (dayindex >= firstDay) {
            datetime = Date.parse(timeStr + " 23:00")

            day.passed = now > datetime
            day.noservice = selectedWorkerinfo.id > -1 ? 
            !(days[dayindex].substr(0, 3) in selectedWorkerinfo.hours)
            :
            !(days[dayindex].substr(0, 3) in allWorkerstime)

            if (!day.noservice) {
              if (selectedWorkerinfo.id > -1 && days[dayindex].substr(0, 3) in selectedWorkerinfo.hours) {
                let timeInfo = selectedWorkerinfo.hours[days[dayindex].substr(0, 3)]

                day.noservice = !(Date.now() < Date.parse(timeStr + " " + timeInfo.end))
              } else {
                let timeInfos = allWorkerstime[days[dayindex].substr(0, 3)]

                for (let k = 0; k < timeInfos.length; k++) {
                  let timeInfo = timeInfos[k]

                  day.noservice = !(Date.now() < Date.parse(timeStr + " " + timeInfo.end))

                  if (!day.noservice) {
                    break;
                  }
                }
              }
            }
            
            day.num = daynum
            daynum++
          }
        } else if (daynum <= numDays) {
          datetime = Date.parse(timeStr + " 23:00")

          day.passed = now > datetime
          day.noservice = selectedWorkerinfo.id > -1 ? 
            !(days[dayindex].substr(0, 3) in selectedWorkerinfo.hours)
            :
            !(days[dayindex].substr(0, 3) in allWorkerstime)

          if (!day.noservice) {
            if (selectedWorkerinfo.id > -1 && days[dayindex].substr(0, 3) in selectedWorkerinfo.hours) {
              let timeInfo = selectedWorkerinfo.hours[days[dayindex].substr(0, 3)]

              day.noservice = !(Date.now() < Date.parse(timeStr + " " + timeInfo.end))
            } else {
              let timeInfos = allWorkerstime[days[dayindex].substr(0, 3)]

              for (let k = 0; k < timeInfos.length; k++) {
                let timeInfo = timeInfos[k]

                day.noservice = !(Date.now() < Date.parse(timeStr + " " + timeInfo.end))

                if (!day.noservice) {
                  break;
                }
              }
            }
          }

          day.num = daynum
          daynum++
        }

        if (day.num > 0 && (!day.passed && !day.noservice) && currDate == 0) {
          currDay = days[dayindex].substr(0, 3)

          if (currDay in hoursInfo) {
            hourInfo = hoursInfo[currDay]

            closedtime = Date.parse(timeStr + " " + hourInfo["closeHour"] + ":" + hourInfo["closeMinute"])
            now = Date.now()

            if (now < closedtime) {
              currDate = day.num
            } else {
              day.passed = true
            }
          } else {
            day.noservice = true
          }
        }
      })
    })

    setSelecteddateinfo({ 
      ...selectedDateinfo, 
      month: months[month], day: currDay, 
      date: bookedDateinfo.date == 0 ? 
        currDate 
        : 
        bookedDateinfo.date < currDate ? currDate : bookedDateinfo.date,
      year 
    })
    setCalendar({ ...calendar, data, firstDay, numDays })
  }
  const getAllTheStylists = () => {
    getAllStylists(locationid)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setAllstylists({ ...allStylists, stylists: res.owners, numStylists: res.numWorkers, ids: res.ids })
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
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
          setAllworkerstime(res.workers)
        }
      })
      .catch((err) => {
        if (err.response && err.response.status == 400) {
          const { errormsg, status } = err.response.data
        }
      })
  }
  const getAllScheduledTimes = () => {
    const data = { locationid, ownerid: null }

    getWorkersHour(data)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          const { workersHour } = res
          const newScheduled = {}

          for (let worker in workersHour) {
            for (let info in workersHour[worker]) {
              if (info == "scheduled") {
                for (let info in workersHour[worker]["scheduled"]) {
                  let splitInfo = info.split("-")
                  let time = splitInfo[0]
                  let status = splitInfo[1]

                  newScheduled[jsonDateToUnix(JSON.parse(time)) + "-" + worker + "-" + status] = workersHour[worker]["scheduled"][info]
                }

                workersHour[worker]["scheduled"] = newScheduled
              }
            }
          }

          setScheduled(workersHour)
        }
      })
  }
  const selectWorker = id => {
    getStylistInfo(id)
      .then((res) => {
        if (res.status == 200) {
          return res.data
        }
      })
      .then((res) => {
        if (res) {
          setSelectedworkerinfo({ ...selectedWorkerinfo, id, hours: res.days })
          setStep(1)
        }
      })
  }
  const dateNavigate = dir => {
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

    getCalendar(month, year)
  }
  const selectDate = () => {
    const { date, day, month, year } = selectedDateinfo, { blocked } = bookedDateinfo
    const { openHour, openMinute, closeHour, closeMinute } = hoursInfo[day]
    const numBlockTaken = scheduleId > -1 ? 1 + blocked.length : 0
    let start = openHour + ":" + openMinute
    let end = closeHour + ":" + closeMinute
    let timeStr = month + " " + date + " " + year + " "
    let openDateStr = Date.parse(timeStr + start), closeDateStr = Date.parse(timeStr + end), calcDateStr = openDateStr
    let currenttime = Date.now(), newTimes = [], timesRow = [], timesNum = 0

    while (calcDateStr <= (closeDateStr - pushtime)) {
      calcDateStr += pushtime

      let timestr = new Date(calcDateStr)
      let hour = timestr.getHours()
      let minute = timestr.getMinutes()
      let period = hour < 12 ? "am" : "pm"
      let timedisplay = (
        hour <= 12 ? 
          hour == 0 ? 12 : hour
          : 
          hour - 12
        ) 
        + ":" + 
        (minute < 10 ? '0' + minute : minute) + " " + period
      let timepassed = currenttime > calcDateStr
      let timetaken = false, timeBlocked = false

      if (selectedWorkerinfo.id > -1) { // worker is selected
        const workerid = selectedWorkerinfo.id

        if (
          calcDateStr + "-" + workerid + "-co" in scheduled[workerid]["scheduled"]
          ||
          calcDateStr + "-" + workerid + "-ca" in scheduled[workerid]["scheduled"]
        ) {
          timetaken = true
        }
      } else {
        let numWorkers = Object.keys(scheduled).length
        let occur = JSON.stringify(scheduled).split("\"" + calcDateStr + "-").length - 1

        timetaken = occur == numWorkers
      }

      let availableService = false, workerIds = []

      if (selectedWorkerinfo.id > -1 && day in selectedWorkerinfo.hours) {
        let startTime = selectedWorkerinfo.hours[day]["start"]
        let endTime = selectedWorkerinfo.hours[day]["end"]

        if (
          calcDateStr >= Date.parse(timeStr + startTime) 
          && 
          calcDateStr < Date.parse(timeStr + endTime)
        ) {
          availableService = true
          workerIds = [selectedWorkerinfo.hours[day]["workerId"]]
        }
      } else {
        if (day in allWorkerstime) {
          let times = allWorkerstime[day]
          let startTime = "", endTime = ""

          times.forEach(function (info) {
            startTime = info.start
            endTime = info.end

            if (
              calcDateStr >= Date.parse(timeStr + startTime) 
              && 
              calcDateStr < Date.parse(timeStr + endTime)
            ) {              
              availableService = true
              workerIds.push(info.workerId)
            }
          })
        }
      }

      if (!timepassed && !timetaken && availableService == true) {
        let startCalc = calcDateStr

        if (numBlockTaken) {
          for (let k = 1; k <= numBlockTaken; k++) {
            if (selectedWorkerinfo.id > -1) {
              let { start, end } = selectedWorkerinfo.hours[day]
              
              if (startCalc + "-" + selectedWorkerinfo.id + "-b" in scheduled[selectedWorkerinfo.id]["scheduled"]) { // time is blocked
                if (!JSON.stringify(blocked).includes("\"unix\":" + startCalc)) {
                  timeBlocked = true
                }
              } else if (
                startCalc + "-" + selectedWorkerinfo.id + "-co" in scheduled[selectedWorkerinfo.id]["scheduled"]
                ||
                startCalc + "-" + selectedWorkerinfo.id + "-ca" in scheduled[selectedWorkerinfo.id]["scheduled"]
              ) { // time is taken
                if (
                  scheduled[selectedWorkerinfo.id]["scheduled"][startCalc + "-" + selectedWorkerinfo.id + "-co"] != scheduleId
                  ||
                  scheduled[selectedWorkerinfo.id]["scheduled"][startCalc + "-" + selectedWorkerinfo.id + "-ca"] != scheduleId
                ) {
                  timeBlocked = true
                }
              } else if (startCalc >= Date.parse(timeStr + end)) { // stylist is off
                timeBlocked = true
              }
            }

            startCalc += pushtime
          }
        } else {
          if (selectedWorkerinfo.id > -1) {
            if (startCalc + "-" + selectedWorkerinfo.id + "-b" in scheduled[selectedWorkerinfo.id]["scheduled"]) { // time is blocked
              timeBlocked = true
            }
          }
        }

        if (!timeBlocked) {
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
    }

    if (timesRow.length > 0) {
      for (let k = 0; k < (3 - timesRow.length); k++) {
        timesRow.push({ key: timesNum.toString() })
      }

      newTimes.push({ key: newTimes.length, row: timesRow })
    }

    setSelecteddateinfo({ ...selectedDateinfo, date, day })
    setTimes(newTimes)
    setStep(2)
  }
  const selectTime = info => {
    const { time, workerIds } = info

    setConfirm({ ...confirm, show: true, service: name ? name : serviceinfo, time, workerIds })
  }
  const makeAnAppointment = id => {
    if (userId || id) {
      setConfirm(prev => ({ ...prev, loading: true }))
      setShowauth(prev => ({ ...prev, show: false }))

      const workerid = selectedWorkerinfo.id
      const { blocked } = bookedDateinfo
      const { note, workerIds, time } = confirm
      const selectedinfo = new Date(time)
      const day = days[selectedinfo.getDay()], month = months[selectedinfo.getMonth()], date = selectedinfo.getDate(), year = selectedinfo.getFullYear()
      const hour = selectedinfo.getHours(), minute = selectedinfo.getMinutes()
      const selecteddate = { day, month, date, year, hour, minute }

      blocked.forEach(function (info, index) {
        info["newTime"] = unixToJsonDate(time + (info["unix"] - oldTime))
        info["newUnix"] = (time + (info["unix"] - oldTime)).toString()
      })

      let data = { 
        id: scheduleId, // id for socket purpose (updating)
        userid: userId || id, 
        workerid: workerid > -1 ? workerid : workerIds[Math.floor(Math.random() * (workerIds.length - 1)) + 0], 
        locationid, 
        serviceid: serviceid ? serviceid : -1, 
        serviceinfo: serviceinfo ? serviceinfo : name,
        time: selecteddate, note: note ? note : "", 
        timeDisplay: displayTime(selecteddate),
        type: scheduleId > -1 ? "remakeAppointment" : "makeAppointment",
        blocked, unix: time
      }

      makeAppointment(data)
        .then((res) => {
          if (res.status == 200) {
            return res.data
          }
        })
        .then((res) => {
          if (res) {
            data = { 
              ...data, 
              receiver: res.receiver, time, speak: res.speak, worker: res.speak.worker, 
            }

            socket.emit("socket/makeAppointment", data, () => {
              setConfirm({ ...confirm, show: true, requested: true, loading: false })

              setTimeout(function () {
                setConfirm({ ...confirm, show: false, requested: false })

                props.navigation.dispatch(
                  CommonActions.reset({ 
                    index: 0, 
                    routes: [{ 
                      name: "main", 
                      params: { initialize: true, showNotif: true }
                    }]
                  }
                )
              )
              }, 2000)
            })
          }
        })
        .catch((err) => {
          if (err.response && err.response.status == 400) {
            const { errormsg, status } = err.response.data

            switch (status) {
              case "scheduleConflict":
                setConfirm({ errorMsg: "Unable to reschedule due to schedule conflict" })
                
                break;
              case "confirmed":
              case "blocked":
                // already taken, booking is late
                setShowscheduleconflict({ ...showScheduleconflict, show: true, header: displayTime(time) + " has already been taken" })

                setTimeout(function () {
                  setShowscheduleconflict({ ...showScheduleconflict, show: false, header: "" })
                }, 2000)

                setConfirm({ ...confirm, show: false, requested: false })

                break;
              default:
                setConfirm({ errorMsg: errormsg, show: false, requested: false })
            }
          }
        })
    } else {
      setConfirm(prev => ({ ...prev, show: false }))
      setShowauth(prev => ({ ...prev, show: true, booking: true }))
    }
  }
  const jsonDateToUnix = date => {
    return Date.parse(date["day"] + " " + date["month"] + " " + date["date"] + " " + date["year"] + " " + date["hour"] + ":" + date["minute"])
  }
  const unixToJsonDate = unix => {
    const info = new Date(unix)

    return { 
      day: days[info.getDay()], month: months[info.getMonth()], 
      date: info.getDate(), year: info.getFullYear(), 
      hour: info.getHours(), minute: info.getMinutes() 
    }
  }
  
	useEffect(() => {
    getTheNumCartItems()
    getAllTheStylists()
    getTheLocationHours()
    getAllTheWorkersTime()
    getTheExistBooking()

    if (serviceid) getTheServiceInfo()
    if (scheduleId) getTheAppointmentInfo()
	}, [])

  useEffect(() => {
    const currTime = new Date()

    if (oldTime == 0) {
      getCalendar(currTime.getMonth(), currTime.getFullYear())
    } else {
      const prevTime = new Date(oldTime)

      getCalendar(prevTime.getMonth(), prevTime.getFullYear())
    }
  }, [selectedWorkerinfo.hours])

  useEffect(() => {
    if (Object.keys(scheduled).length > 0) selectDate()
  }, [scheduled])

  useEffect(() => {
    getTheAppointmentInfo()
  }, [scheduleId])

	return (
		<SafeAreaView style={styles.booktime}>
		  <View style={styles.box}>
        {loaded ? 
          <>
            {step == 0 && (
              <View style={styles.workerSelection}>
                <Text style={styles.workerSelectionHeader}>Pick a{scheduleId == -1 ? '' : '\ndifferent'} stylist (Optional)</Text>

                <View style={styles.workersList}>
                  <FlatList
                    data={allStylists.stylists}
                    renderItem={({ item, index }) => 
                      <View key={item.key} style={styles.workersRow}>
                        {item.row.map(info => (
                          info.id ? 
                            <TouchableOpacity key={info.key} style={[styles.worker, { backgroundColor: (selectedWorkerinfo.id == info.id) ? 'rgba(0, 0, 0, 0.3)' : null }]} disabled={selectedWorkerinfo.loading} onPress={() => selectWorker(info.id)}>
                              <View style={styles.workerProfile}>
                                <Image 
                                  source={info.profile.name ? { uri: logo_url + info.profile.name } : require("../../../assets/profilepicture.jpeg")} 
                                  style={resizePhoto(info.profile, wsize(20))}
                                />
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
              </View>
            )}

            {step == 1 && (
              <View style={styles.dateSelection}>
                <Text style={styles.dateSelectionHeader}>Tap a{scheduleId == -1 ? '' : '\ndifferent'} date below</Text>

                {!calendar.loading && (
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
                        {days.map((day, index) => <Text key={"day-header-" + index} style={styles.daysHeader}>{day.substr(0, 3)}</Text>)}
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
                                  <TouchableOpacity key={day.key} disabled={true} style={[styles.dayTouch, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
                                    <Text style={styles.dayTouchHeader}>{day.num}</Text>
                                  </TouchableOpacity>
                                :
                                selectedDateinfo.date == day.num ?
                                  <TouchableOpacity key={day.key} style={[styles.dayTouch, { backgroundColor: 'black' }]} onPress={() => {
                                    setSelecteddateinfo({ ...selectedDateinfo, date: day.num, day: days[dayindex].substr(0, 3) })
                                    getAllScheduledTimes()
                                  }}>
                                    <Text style={[styles.dayTouchHeader, { color: 'white' }]}>{day.num}</Text>
                                  </TouchableOpacity>
                                  :
                                  <TouchableOpacity key={day.key} style={styles.dayTouch} onPress={() => {
                                    setSelecteddateinfo({ ...selectedDateinfo, date: day.num, day: days[dayindex].substr(0, 3) })
                                    getAllScheduledTimes()
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
                )}
              </View>
            )}

            {step == 2 && (
              <View style={styles.timesSelection}>
                <ScrollView style={{ width: '100%' }}>
                  <Text style={[styles.timesHeader, { fontSize: 15 }]}>{scheduleId > -1 && 'Current: ' + displayTime(oldTime)}</Text>
                  <Text style={styles.timesHeader}>Tap a{scheduleId == -1 ? '' : '\ndifferent'} time below</Text>

                  <View style={{ alignItems: 'center' }}>
                    <View style={styles.times}>
                      {times.map(info => (
                        <View key={info.key} style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                          {info.row.map(item => (
                            item.header ? 
                              <TouchableOpacity key={item.key} style={styles.unselect} onPress={() => selectTime(item)}>
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
              <TouchableOpacity style={styles.action} onPress={() => {
                switch (step) {
                  case 0:
                    props.navigation.goBack()

                    break;
                  default:
                }

                setStep(step - 1)
              }}>
                <Text style={styles.actionHeader}>Back</Text>
              </TouchableOpacity>

              {(step == 0 || step == 1) && (
                <>
                  {step == 0 && (
                    <>
                      <TouchableOpacity style={styles.action} onPress={() => {
                        if (allStylists.numStylists == 1) {
                          selectWorker(allStylists.ids[0])
                        } else {
                          setSelectedworkerinfo({ ...selectedWorkerinfo, id: -1, hours: {} })
                        }
                        
                        setStep(1)
                      }}>
                        <Text style={styles.actionHeader}>{allStylists.numStylists == 1 ? 'Next' : 'Pick Random'}</Text>
                      </TouchableOpacity>

                      {selectedWorkerinfo.id > -1 && allStylists.numStylists > 1 && (
                        <TouchableOpacity style={styles.action} onPress={() => selectWorker(selectedWorkerinfo.id)}>
                          <Text style={styles.actionHeader}>Next</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}

                  {step == 1 && (
                    <TouchableOpacity style={styles.action} onPress={() => {
                      getTheAppointmentInfo(true)
                      getAllScheduledTimes()
                    }}>
                      <Text style={styles.actionHeader}>Next</Text>
                    </TouchableOpacity>
                  )}
                </>
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
            <TouchableOpacity style={styles.bottomNav} onPress={() => props.navigation.dispatch(StackActions.popToTop())}>
              <Entypo name="home" size={wsize(7)}/>
            </TouchableOpacity>
            
            {userId && (
              <TouchableOpacity style={styles.bottomNav} onPress={() => setOpencart(true)}>
                <Entypo name="shopping-cart" size={wsize(7)}/>
                {numCartItems > 0 && <Text style={styles.numCartItemsHeader}>{numCartItems}</Text>}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.bottomNav} onPress={() => {
              if (userId) {
                socket.emit("socket/user/logout", userId, () => {
                  AsyncStorage.clear()
                  setUserid(null)
                })
              } else {
                setShowauth(prev => ({ ...prev, show: true }))
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
                        <Text style={{ fontFamily: 'Chilanka_400Regular' }}>Make appointment for</Text>
                        {'\n' + confirm.service + '\n'}
                        {displayTime(confirm.time) + '\n'}
                      </Text>
                      :
                      <Text style={styles.confirmHeader}>
                        Change Appointment
                        {'\n' + confirm.service + '\n'}
                        to
                        {'\n\n' + displayTime(confirm.time)}
                      </Text>
                    }

                    <View style={styles.note}>
                      <TextInput 
                        style={styles.noteInput} multiline textAlignVertical="top" 
                        placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Leave a note if you want" 
                        maxLength={100} onChangeText={(note) => setConfirm(prev => ({...prev, note }))} autoCorrect={false}
                      />
                    </View>

                    {confirm.errormsg ? <Text style={styles.errorMsg}>{confirm.errormsg}</Text> : null}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                      <View style={styles.confirmOptions}>
                        <TouchableOpacity style={[styles.confirmOption, { opacity: confirm.loading ? 0.3 : 1 }]} disabled={confirm.loading} onPress={() => setConfirm(prev => ({ ...prev, show: false, service: "", time: 0, note: "", requested: false, errormsg: "" }))}>
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
                    <Text style={styles.requestedHeader}>Appointment made for</Text>
                    <Text style={styles.requestedHeaderInfo}>{confirm.service + '\n' + displayTime(confirm.time)}</Text>
                  </View>
                }
              </View>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      {showScheduleconflict.show && (
        <Modal transparent={true}>
          <SafeAreaView style={styles.scheduleConflictBox}>
            <View style={styles.scheduleConflict}>
              <Text style={styles.scheduleConflictHeader}>{showScheduleconflict.header}</Text>
            </View>
          </SafeAreaView>
        </Modal>
      )}
      {openCart && <Modal><Orders navigation={props.navigation} close={() => {
        getTheNumCartItems()
        setOpencart(false)
      }}/></Modal>}
      {showAuth.show && (
        <Modal transparent={true}>
          <Userauth close={() => setShowauth(prev => ({ ...prev, show: false }))} done={id => {
            socket.emit("socket/user/login", "user" + id, () => {
              setUserid(id)

              if (showAuth.booking == true) {
                makeAnAppointment(id)
              } else {
                setShowauth(prev => ({ ...prev, show: false }))
              }
            })
          }} navigate={props.navigation.navigate}/>
        </Modal>
      )}
      {selectedWorkerinfo.loading && <Modal transparent={true}><Loadingprogress/></Modal>}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
  booktime: { backgroundColor: 'white', height: '100%', width: '100%' },
  box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },

  serviceHeader: { fontSize: wsize(8), fontWeight: 'bold', paddingVertical: 10, textAlign: 'center' },

  // stylists list
  workerSelection: { alignItems: 'center', marginTop: 20 },
  workerSelectionHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
  workersList: { height: '60%' },
  workersRow: { flexDirection: 'row', justifyContent: 'space-between' },
  worker: { alignItems: 'center', borderRadius: 10, marginHorizontal: 5, padding: 5, width: (width / 3) - 30 },
  workerProfile: { borderRadius: wsize(20) / 2, flexDirection: 'column', height: wsize(20), justifyContent: 'space-around', overflow: 'hidden', width: wsize(20) },
  workerHeader: { fontSize: wsize(4), fontWeight: 'bold'  },
  selectedWorker: { marginVertical: 10 },
  selectedWorkerImage: { borderRadius: wsize(20) / 2, height: wsize(20), width: wsize(20) },
  selectedWorkerHeader: { fontSize: wsize(4), fontWeight: 'bold', textAlign: 'center' },

  // calendar
  dateSelection: { alignItems: 'center', width: '100%' },
  dateSelectionHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
  dateHeaders: { flexDirection: 'row', justifyContent: 'space-between', width: '70%' },
  dateHeader: { fontSize: wsize(6), marginVertical: 5, textAlign: 'center', width: wsize(50) },
  
  days: { alignItems: 'center', width: '100%' },
  daysHeaderRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  daysHeader: { fontSize: wsize(12) * 0.3, fontWeight: 'bold', marginVertical: 1, textAlign: 'center', width: wsize(12) },

  daysDataRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  dayTouch: { borderStyle: 'solid', borderWidth: 2, marginVertical: 1, paddingVertical: 10, width: wsize(12) },
  dayTouchHeader: { color: 'black', fontSize: wsize(12) * 0.4, textAlign: 'center' },

  dayTouchDisabled: { paddingVertical: 10, width: wsize(12) },
  dayTouchDisabledHeader: { fontSize: wsize(12) * 0.4, fontWeight: 'bold' },

  // times list
  timesSelection: { alignItems: 'center', height: '80%' },
  timesHeader: { fontSize: wsize(8), fontWeight: 'bold', textAlign: 'center' },
  times: { alignItems: 'center', paddingBottom: 50, width: '100%' },
  
  unselect: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, paddingVertical: 10, width: wsize(30) },
  unselectHeader: { color: 'black', fontSize: wsize(5) },

  actions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
  actionHeader: { color: 'black', fontSize: wsize(5), textAlign: 'center' },

  bottomNavs: { backgroundColor: 'white', flexDirection: 'column', height: '10%', justifyContent: 'space-around', width: '100%' },
  bottomNavsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', margin: 5 },
  bottomNavHeader: { fontSize: wsize(4), fontWeight: 'bold' },
  cart: { flexDirection: 'row', height: 30, marginVertical: 5 },
  numCartItemsHeader: { fontSize: wsize(4), fontWeight: 'bold' },

  // confirm & requested box
  confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  confirmContainer: { backgroundColor: 'white', flexDirection: 'column', justifyContent: 'space-around', padding: 10, width: '80%' },
  confirmHeader: { fontSize: wsize(6), fontWeight: 'bold', textAlign: 'center' },
  note: { alignItems: 'center', marginBottom: 20 },
  noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, fontSize: wsize(6), height: 100, padding: 5, width: '80%' },
  confirmOptions: { flexDirection: 'row' },
  confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: wsize(20) },
  confirmOptionHeader: { fontSize: wsize(4) },
  requestedHeaders: { alignItems: 'center', paddingHorizontal: 20 },
  requestedClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 10, padding: 5, width: 100 },
  requestedCloseHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(5), textAlign: 'center' },
  requestedHeader: { fontFamily: 'Chilanka_400Regular', fontSize: wsize(6), textAlign: 'center' },
  requestedHeaderInfo: { fontSize: wsize(7), fontWeight: 'bold', textAlign: 'center' },

  // schedule conflict alert box
  scheduleConflictBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
  scheduleConflict: { backgroundColor: 'white', flexDirection: 'column', height: '30%', justifyContent: 'space-around', width: '90%' },
  scheduleConflictHeader: { fontSize: wsize(6), textAlign: 'center' },

  column: { flexDirection: 'column', justifyContent: 'space-around' },
  errorMsg: { color: 'darkred', fontSize: wsize(4), textAlign: 'center' },
  loading: { alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
})
