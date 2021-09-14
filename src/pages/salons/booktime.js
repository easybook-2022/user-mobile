import React, { useEffect, useState } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { getServiceInfo } from '../../apis/services'
import { getLocationHours } from '../../apis/locations'
import { requestAppointment } from '../../apis/schedules'
import { getNumCartItems } from '../../apis/carts'

import Cart from '../../components/cart'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function booktime(props) {
	let { locationid, serviceid } = props.route.params
	let scheduleid = props.route.params.scheduleid ? props.route.params.scheduleid : null

	const [name, setName] = useState('')
	const [times, setTimes] = useState([])
	const [openTime, setOpentime] = useState(0)
	const [closeTime, setClosetime] = useState(0)
	const [loaded, setLoaded] = useState(false)
	const [showPaymentRequired, setShowpaymentrequired] = useState(false)

	const [openCart, setOpencart] = useState(false)
	const [numCartItems, setNumcartitems] = useState(0)
	const getTheNumCartItems = async() => {
		const userid = await AsyncStorage.getItem("userid")

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
	}
	
	const [confirm, setConfirm] = useState({ show: false, service: "", timeheader: "", time: "", note: "", requested: false, errormsg: "" })

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
					let newTimes = [], currenttime = Date.now(), currDateStr = openDateStr, pushtime = 1000 * (60 * 5)

					while (currDateStr < (closeDateStr - pushtime)) {
						currDateStr += pushtime

						let timestr = new Date(currDateStr).toString().split(" ")[4]
						let time = timestr.split(":")
						let hour = parseInt(time[0])
						let minute = time[1]
						let period = hour > 11 ? "pm" : "am"

						let currtime = parseInt(hour.toString() + "" + minute)
						let timedisplay = (hour > 12 ? hour - 12 : hour) + ":" + minute + " " + period
						let timepassed = currenttime > currDateStr
						let timetaken = scheduled.indexOf(currDateStr) > -1

						if (!timepassed) {
							newTimes.push({ 
								key: newTimes.length, header: timedisplay, 
								time: currDateStr, 
								available: !timetaken
							})
						}
					}

					setTimes(newTimes)
					setLoaded(true)
				}
			})
	}
	const requestAnAppointment = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const { timeheader, time, note } = confirm
		const data = { userid, locationid, scheduleid, serviceid, time, note: note ? note : "" }

		requestAppointment(data)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					}
				}
			})
			.then((res) => {
				if (res) setConfirm({ ...confirm, requested: true })
			})
			.catch((err) => {
				if (err.response.status == 400) {
					if (err.response.data.status) {
						const status = err.response.data.status

						switch (status) {
							case "cardrequired":
								setConfirm({ ...confirm, show: false })
								setShowpaymentrequired(true)

								break;
							case "existed":
								setConfirm({ ...confirm, errormsg: err.response.data.errormsg })

								break;
							default:
								
						}
					}
				}
			})
	}

	useEffect(() => {
		getTheNumCartItems()
		getTheServiceInfo()
	}, [])

	return (
		<View style={style.booktime}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
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
								<Text style={style.timesHeader}>Availabilities</Text>
								<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 50, width: '100%' }}>
									<View style={style.times}>
										{times.map(info => (
											<TouchableOpacity style={!info.available ? style.selected : style.unselect} disabled={!info.available} key={info.key} onPress={() => {
												if (info.available) setConfirm({ ...confirm, show: true, service: name, timeheader: info.header, time: info.time })
											}}>
												<Text style={{ color: !info.available ? 'white' : 'black', fontSize: 15 }}>{info.header}</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>
							</ScrollView>
							:
							<View style={style.noTime}>
								<Text style={style.noTimeHeader}>Currently closed</Text>
							</View>
					}

					<View style={style.bottomNavsContainer}>
						<View style={style.bottomNavs}>
							<TouchableOpacity style={style.bottomNav} onPress={() => setOpencart(true)}>
								<Entypo name="shopping-cart" size={30}/>
								{numCartItems > 0 && <Text style={style.numCartItemsHeader}>{numCartItems}</Text>}
							</TouchableOpacity>
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
						</View>
					</View>
				</View>

				{confirm.show && (
					<Modal transparent={true}>
						<TouchableWithoutFeedback style={{ paddingVertical: offsetPadding }} onPress={() => Keyboard.dismiss()}>
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

											<View style={style.note}>
												<TextInput style={style.noteInput} multiline={true} placeholderTextColor="rgba(127, 127, 127, 0.5)" placeholder="Leave a note if you want" maxLength={100} onChangeText={(note) => setConfirm({...confirm, note })} autoCorrect={false}/>
											</View>

											{confirm.errormsg ? <Text style={style.errorMsg}>You already requested an appointment for this service</Text> : null}

											<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
												<View style={style.confirmOptions}>
													<TouchableOpacity style={style.confirmOption} onPress={() => setConfirm({ show: false, service: "", time: "", errormsg: "" })}>
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
												<Text style={style.requestedHeaderInfo}>{confirm.service} {'\n'}</Text>
												<Text style={style.requestedHeaderInfo}>at {confirm.timeheader} {'\n'}</Text>
												<Text style={style.requestedHeaderInfo}>You will get notify by the salon in your notification very soon</Text>
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
						</TouchableWithoutFeedback>
					</Modal>
				)}
				
				<Modal visible={openCart}><Cart close={() => setOpencart(false)}/></Modal>

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
			</View>
		</View>
	)
}

const style = StyleSheet.create({
	booktime: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 30, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },

	headers: { height: 47, marginBottom: 50 },
	boxHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
	serviceHeader: { fontSize: 25, fontWeight: 'bold', textAlign: 'center' },

	timesHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', textAlign: 'center' },
	times: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', width: 300 },
	unselect: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5, width: 90 },
	selected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5, width: 90 },

	noTime: { flexDirection: 'column', height: screenHeight - 191, justifyContent: 'space-around', width: '100%' },
	noTimeHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },

	bottomNavsContainer: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around' },
	bottomNavs: { flexDirection: 'row', height: '100%', justifyContent: 'space-between', width: 100 },
	bottomNav: { flexDirection: 'row', height: 30, marginVertical: 5 },
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
