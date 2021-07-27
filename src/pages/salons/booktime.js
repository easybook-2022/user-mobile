import React, { useEffect, useState } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { getServiceInfo } from '../../apis/services'
import { getLocationHours } from '../../apis/locations'
import { requestAppointment } from '../../apis/schedules'

import AntDesign from 'react-native-vector-icons/AntDesign'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function booktime(props) {
	let { locationid, menuid, serviceid } = props.route.params

	const [name, setName] = useState('')
	const [times, setTimes] = useState([])
	const [openTime, setOpentime] = useState(0)
	const [closeTime, setClosetime] = useState(0)
	const [loaded, setLoaded] = useState(false)

	const [confirm, setConfirm] = useState({ show: false, service: "", timeheader: "", time: "", requested: false })

	const getTheServiceInfo = async() => {
		getServiceInfo(serviceid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { serviceInfo } = res

					setName(serviceInfo.name)
					getTheLocationHours()
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

					const currTime = new Date(Date.now()).toString().split(" ")

					let openStr = currTime[0] + " " + currTime[1] + " " + currTime[2] + " " + currTime[3] + " " + openHour + ":" + openMinute
					let closeStr = currTime[0] + " " + currTime[1] + " " + currTime[2] + " " + currTime[3] + " " + closeHour + ":" + closeMinute
					let openDateStr = Date.parse(openStr), closeDateStr = Date.parse(closeStr)
					let k = 1, newTimes = []

					while (openDateStr < (closeDateStr - ((1000 * (60 * 10))))) {
						openDateStr += (1000 * (60 * 10)) // push every 10 minutes

						let timestr = new Date(openDateStr).toString().split(" ")[4]
						let time = timestr.split(":")
						let hour = parseInt(time[0])
						let minute = time[1]
						let period = hour > 11 ? "pm" : "am"

						let currtime = parseInt(hour.toString() + "" + minute)

						let timedisplay = (hour > 12 ? hour - 12 : hour) + ":" + minute + " " + period

						k++
						newTimes.push({ key: (k - 1).toString(), header: timedisplay, time: openDateStr, booked: scheduled.indexOf(openDateStr) > -1 ? true : false })
					}

					setTimes(newTimes)
					setLoaded(true)
				}
			})
	}
	const requestAnAppointment = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const { timeheader, time } = confirm
		const data = { userid, locationid, menuid, serviceid, time }

		requestAppointment(data)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					} else {

					}
				}
			})
			.then((res) => {
				if (res) setConfirm({ ...confirm, requested: true })
			})
			.catch((error) => console.log(error.message))
	}

	useEffect(() => {
		getTheServiceInfo()
	}, [])

	return (
		<View style={{ paddingVertical: offsetPadding }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>

				<Text style={style.boxHeader}>Book a time for</Text>
				<Text style={style.serviceHeader}>{name}</Text>

				{!loaded ? 
					<ActivityIndicator size="small"/>
					:
					<ScrollView>
						<Text style={style.timesHeader}>Availabilities</Text>
						<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 50, width: '100%' }}>
							<View style={style.times}>
								{times.map(info => (
									<TouchableOpacity style={info.booked ? style.selected : style.unselect} disabled={info.booked} key={info.key} onPress={() => {
										if (!info.booked) setConfirm({ ...confirm, show: true, service: name, timeheader: info.header, time: info.time })
									}}>
										<Text style={{ color: info.booked ? 'white' : 'black', fontSize: 15 }}>{info.header}</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					</ScrollView>
				}
			</View>


			{confirm.show && (
				<Modal transparent={true}>
					<View style={{ paddingVertical: offsetPadding }}>
						<View style={style.confirmBox}>
							<View style={style.confirmContainer}>
								{!confirm.requested ? 
									<>
										<Text style={style.confirmHeader}>
											<Text style={{ fontFamily: 'appFont' }}>Request an appointment for </Text>
											{confirm.service + '\n'}
											at
											{'\n' + confirm.timeheader}
										</Text>

										<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
											<View style={style.confirmOptions}>
												<TouchableOpacity style={style.confirmOption} onPress={() => setConfirm({ show: false, service: "", time: "" })}>
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
											<Text style={style.requestedHeader}>Appointment requested {'\n'}</Text>
											<Text style={style.requestedHeaderInfo}>{confirm.service} {'\n'}</Text>
											<Text style={style.requestedHeaderInfo}>at {confirm.timeheader} {'\n'}</Text>
											<Text style={style.requestedHeaderInfo}>You will get notified by the salon in your notification very soon</Text>
											<TouchableOpacity style={style.requestedClose} onPress={() => {
												setConfirm({ ...confirm, show: false, requested: false })
												props.navigation.goBack()
											}}>
												<Text style={style.requestedCloseHeader}>Ok</Text>
											</TouchableOpacity>
										</View>
									</>
								}
							</View>
						</View>
					</View>
				</Modal>
			)}
		</View>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },

	boxHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
	serviceHeader: { fontSize: 25, fontWeight: 'bold', textAlign: 'center', marginBottom: 50 },

	timesHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', textAlign: 'center' },
	times: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', width: 300 },
	unselect: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5, width: 90 },
	selected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5, width: 90 },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', width: '80%' },
	confirmHeader: { fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	confirmOptions: { flexDirection: 'row' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmOptionHeader: { },
	requestedHeaders: { alignItems: 'center', paddingHorizontal: 10 },
	requestedClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 10, padding: 5, width: 100 },
	requestedCloseHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },
	requestedHeader: { fontFamily: 'appFont', fontSize: 25 },
	requestedHeaderInfo: { fontSize: 20, textAlign: 'center' },
})
