import React, { useEffect, useState } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { getLocationHours, getLocationProfile, makeReservation } from '../../apis/locations'

import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'

const { width } = Dimensions.get('window')

export default function booktime(props) {
	let { locationid } = props.route.params
	
	const [name, setName] = useState(name)
	const [seaters, setSeaters] = useState(2)
	const [times, setTimes] = useState([])
	const [openTime, setOpentime] = useState(0)
	const [closeTime, setClosetime] = useState(0)
	const [loaded, setLoaded] = useState(false)

	const [confirm, setConfirm] = useState({ show: false, service: "", timeheader: "", time: "", requested: false })

	const getTheLocationProfile = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, locationid }

		getLocationProfile(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { locationInfo } = res

					setName(locationInfo.name)
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
					const { openTime, closeTime } = res
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
						newTimes.push({ key: (k - 1).toString(), header: timedisplay, time: openDateStr, booked: false })
					}

					setTimes(newTimes)
					setLoaded(true)
				}
			})
	}
	const makeTheReservation = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const { timeheader, time } = confirm
		const data = { userid, locationid, time, seaters }

		makeReservation(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) setConfirm({ ...confirm, requested: true })
			})
			.catch((error) => console.log(error.message))
	}

	useEffect(() => {
		getTheLocationProfile()
	}, [])

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>

				<Text style={style.boxHeader}>Make a reservation for</Text>
				<Text style={style.serviceHeader}>{name}</Text>

				{!loaded ? 
					<ActivityIndicator size="small"/>
					:
					<ScrollView>
						<View style={{ alignItems: 'center', marginVertical: 20 }}>
							<View style={style.seatersBox}>
								<Text style={style.seatersHeader}>Number of seaters</Text>
								<View style={style.seatersSelection}>
									<Text style={style.seatersSelectionHeader}>{seaters}</Text>
									<View style={style.seatersSelectionActions}>
										<TouchableOpacity onPress={() => setSeaters(seaters + 1)}>
											<SimpleLineIcons name="arrow-up" size={20}/>
										</TouchableOpacity>
										<TouchableOpacity onPress={() => setSeaters(seaters > 0 ? seaters - 1 : 0)}>
											<SimpleLineIcons name="arrow-down" size={20}/>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>

						<Text style={style.timesHeader}>Availabilities</Text>
						<View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
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
					<SafeAreaView style={{ flex: 1 }}>
						<View style={style.confirmBox}>
							<View style={style.confirmContainer}>
								{!confirm.requested ? 
									<>
										<Text style={style.confirmHeader}>
											<Text style={{ fontFamily: 'appFont' }}>Request a reservation at </Text>
											{'\n' + confirm.service + '\n'}
											at
											{'\n' + confirm.timeheader}
										</Text>

										<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
											<View style={style.confirmOptions}>
												<TouchableOpacity style={style.confirmOption} onPress={() => setConfirm({ show: false, service: "", time: "" })}>
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
											<Text style={style.requestedHeader}>Reservation requested at {'\n'}</Text>
											<Text style={style.requestedHeaderInfo}>{confirm.service} {'\n'}</Text>
											<Text style={style.requestedHeaderInfo}>at {confirm.timeheader} {'\n'}</Text>
											<Text style={style.requestedHeaderInfo}>You will get notified by the restaurant in your notification very soon</Text>
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
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },

	boxHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
	serviceHeader: { fontSize: 25, fontWeight: 'bold', textAlign: 'center', marginBottom: 50 },

	seatersBox: { flexDirection: 'row' },
	seatersHeader: { fontSize: 15, padding: 20 },
	seatersSelection: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, flexDirection: 'row', justifyContent: 'space-around', padding: 5, width: 80 },
	seatersSelectionHeader: { fontSize: 30, margin: 3 },

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
