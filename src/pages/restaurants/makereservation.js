import React, { useEffect, useState } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, FlatList, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Constants from 'expo-constants';
import { CommonActions } from '@react-navigation/native';
import { logo_url } from '../../../assets/info'
import { getLocationHours, getLocationProfile, makeReservation, getInfo } from '../../apis/locations'
import { getReservationInfo } from '../../apis/schedules'
import { getNumCartItems } from '../../apis/carts'
import { searchFriends } from '../../apis/users'

import Cart from '../../components/cart'

import AntDesign from 'react-native-vector-icons/AntDesign'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Entypo from 'react-native-vector-icons/Entypo'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function booktime(props) {
	let { locationid } = props.route.params

	const [name, setName] = useState(name)

	const [openList, setOpenlist] = useState(false)
	const [diners, setDiners] = useState([])
	const [numDiners, setNumdiners] = useState(0)
	const [selectedDiners, setSelecteddiners] = useState([])
	const [numSelectedDiners, setNumselecteddiners] = useState(0)
	const [locationInfo, setLocationinfo] = useState({ name: "", logo: "" })
	const [errorMsg, setErrormsg] = useState('')

	const [times, setTimes] = useState([])
	const [loaded, setLoaded] = useState(false)

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
	
	const [confirm, setConfirm] = useState({ show: false, service: "", timeheader: "", time: "", note: "", requested: false })

	const getTheLocationProfile = async() => {
		const longitude = await AsyncStorage.getItem("longitude")
		const latitude = await AsyncStorage.getItem("latitude")
		const data = { locationid, longitude, latitude }

		getLocationProfile(data)
			.then((res) => {
				if (res.status == 200) {
					if (!res.data.errormsg) {
						return res.data
					}
				}
			})
			.then((res) => {
				if (res) {
					const { name } = res.locationInfo

					setName(name)
					getTheLocationHours()
				}
			})
	}
	const getTheLocationHours = async() => {
		const userid = await AsyncStorage.getItem("userid")
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
								available: !timetaken,
							})
						}
					}

					setTimes(newTimes)
					setLoaded(true)
				}
			})
	}
	const makeTheReservation = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const { timeheader, time, note } = confirm
		const diners = []

		selectedDiners.forEach(function (info) {
			info.row.forEach(function (diner) {
				if (diner.id) {
					diners.push({ "userid": diner['id'].toString(), "status": "waiting" })
				}
			})
		})

		const data = { userid, locationid, time, diners, note: note ? note : "" }

		makeReservation(data)
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
			.catch((error) => console.log(error.message))
	}
	const finish = async() => {
		setOpenlist(false)
		setErrormsg('')
	}

	const getDinersList = async(username) => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, username }

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

			for (k in last_row) {
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
		const data = { locationid, menuid: "" }

		getInfo(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { storeName, storeLogo } = res

					setOpenlist(true)
					setLocationinfo({ name: storeName, logo: storeLogo })
				}
			})
	}

	useEffect(() => {
		getTheLocationProfile()
	}, [])

	return (
		<View style={{ paddingVertical: offsetPadding }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => props.navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>

				<View style={style.headers}>
					<Text style={style.boxHeader}>Make a reservation for</Text>
					<Text style={style.serviceHeader}>{name}</Text>
				</View>

				{!loaded ? 
					<ActivityIndicator size="small"/>
					:
					times.length > 0 ?
						<ScrollView style={{ height: screenHeight - 191 }}>
							<View style={{ alignItems: 'center' }}>
								<View style={style.dinersBox}>
									<TouchableOpacity style={style.dinersAdd} onPress={() => openDinersList()}>
										<Text style={style.dinersAddHeader}>{numSelectedDiners > 0 ? 'Edit' : 'Add Other'} Diner(s)</Text>
									</TouchableOpacity>
									<Text style={style.dinersHeader}>{numSelectedDiners} Diner(s) Selected</Text>
								</View>
							</View>

							<Text style={style.timesHeader}>Availabilities</Text>
							<View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
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

				<View style={style.bottomActionsContainer}>
					<View style={style.bottomActions}>
						<TouchableOpacity style={style.bottomAction} onPress={() => setOpencart(true)}>
							<Entypo name="shopping-cart" size={30}/>
							{numCartItems > 0 && <Text style={style.numCartItemsHeader}>{numCartItems}</Text>}
						</TouchableOpacity>
						<TouchableOpacity style={style.bottomAction} onPress={() => {
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
					<View style={{ paddingVertical: offsetPadding }}>
						<View style={style.confirmBox}>
							<View style={style.confirmContainer}>
								{!confirm.requested ? 
									<>
										<Text style={style.confirmHeader}>
											<Text style={{ fontFamily: 'appFont' }}>Request a reservation</Text>
											{'\n'}
											for {numSelectedDiners} {numSelectedDiners > 1 ? 'people' : 'person'} {'\n'}
											at
											<Text style={{ fontFamily: 'appFont' }}>{'\n' + confirm.service + '\n'}</Text>
											at
											<Text style={{ fontFamily: 'appFont' }}>{'\n' + confirm.timeheader}</Text>
										</Text>

										<View style={style.note}>
											<TextInput style={style.noteInput} multiline={true} placeholder="Leave a note if you want" maxLength={100} onChangeText={(note) => setConfirm({...confirm, note })} value={confirm.note} autoCorrect={false}/>
										</View>

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
											<Text style={style.requestedHeader}>Reservation requested</Text>
											<Text style={style.requestedHeader}>at</Text>
											<Text style={style.requestedHeaderInfos}>
												<Text style={style.requestedHeaderInfo}>{confirm.service} {'\n'}</Text>
												<Text style={style.requestedHeaderInfo}>at {confirm.timeheader} {'\n'}</Text>
												<Text style={style.requestedHeaderInfo}>for {numSelectedDiners} {numSelectedDiners > 1 ? 'people' : 'person'}</Text>
											</Text>
											<Text style={{ textAlign: 'center' }}>You will get notified by the restaurant in your notification very soon</Text>
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

			<Modal visible={openCart}><Cart close={() => setOpencart(false)}/></Modal>

			{openList && (
				<Modal>
					<View style={{ paddingVertical: offsetPadding }}>
						<View style={style.dinersList}>
							<TextInput style={style.dinerNameInput} placeholder="Search diner to add to reservation" onChangeText={(username) => getDinersList(username)} autoCorrect={false}/>

							<View style={style.dinersListContainer}>
								<View style={{ height: '50%', overflow: 'hidden' }}>
									<Text style={style.dinersHeader}>{numDiners} Searched Diner(s)</Text>

									<View>
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
								</View>
							
								<View style={{ height: '50%', overflow: 'hidden' }}>
									{selectedDiners.length > 0 && (
										<>
											<Text style={style.selectedDinersHeader}>{numSelectedDiners} Selected Diner(s) to this reservation</Text>

											<View>
												<FlatList
													data={selectedDiners}
													renderItem={({ item, index }) => 
														<View key={item.key} style={style.row}>
															{item.row.map(diner => (
																diner.username ? 
																	<View key={diner.key} style={style.diner}>
																		<TouchableOpacity style={style.dinerDelete} onPress={() => deselectDiner(diner.id)}>
																			<AntDesign name="closecircleo" size={15}/>
																		</TouchableOpacity>
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
											</View>
										</>
									)}
								</View>
							</View>

							<View style={style.itemContainer}>
								<View style={style.itemImageHolder}>
									<Image style={{ height: 100, width: 100 }} source={{ uri: logo_url + locationInfo.logo }}/>
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
				</Modal>
			)}
		</View>
	)
}

const style = StyleSheet.create({
	box: { backgroundColor: '#EAEAEA', flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 34, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },

	headers: { height: 47, marginBottom: 50 },
	boxHeader: { fontFamily: 'appFont', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
	serviceHeader: { fontSize: 25, fontWeight: 'bold', textAlign: 'center' },

	dinersBox: { marginBottom: 20 },
	dinersAdd: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, padding: 5 },
	dinersAddHeader: { textAlign: 'center' },
	dinersHeader: { marginVertical: 5, textAlign: 'center' },

	timesHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', textAlign: 'center' },
	times: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', width: 300 },
	unselect: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5, width: 90 },
	selected: { alignItems: 'center', backgroundColor: 'black', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 2, padding: 5, width: 90 },

	noTime: { flexDirection: 'column', height: screenHeight - 191, justifyContent: 'space-around', width: '100%' },
	noTimeHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },

	bottomActionsContainer: { backgroundColor: 'white', flexDirection: 'row', height: 40, justifyContent: 'space-around' },
	bottomActions: { flexDirection: 'row', height: '100%', justifyContent: 'space-between', width: 100 },
	bottomAction: { flexDirection: 'row', height: 30, marginVertical: 5 },
	cart: { flexDirection: 'row', height: 30, marginVertical: 5 },
	numCartItemsHeader: { fontWeight: 'bold' },

	// confirm & requested box
	confirmBox: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	confirmContainer: { backgroundColor: 'white', flexDirection: 'column', height: '50%', justifyContent: 'space-around', paddingVertical: 10, width: '80%' },
	confirmHeader: { fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, textAlign: 'center' },
	note: { alignItems: 'center', marginBottom: 20 },
	noteInput: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, height: 80, padding: 5, width: '80%' },
	confirmOptions: { flexDirection: 'row' },
	confirmOption: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, margin: 10, padding: 5, width: 100 },
	confirmOptionHeader: { },
	requestedHeaders: { alignItems: 'center', paddingHorizontal: 10 },
	requestedClose: { borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 10, padding: 5, width: 100 },
	requestedCloseHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },
	requestedHeader: { fontFamily: 'appFont', fontSize: 25 },
	requestedHeaderInfos: { marginVertical: 30 },
	requestedHeaderInfo: { fontSize: 18, paddingVertical: 5, textAlign: 'center' },

	// friends list
	dinersList: { flexDirection: 'column', height: '100%', justifyContent: 'space-between', width: '100%' },
	dinerNameInput: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, marginHorizontal: 20, padding: 10 },
	dinersListContainer: { flexDirection: 'column', height: '70%', justifyContent: 'space-between' },
	dinersHeader: { fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
	row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
	diner: { alignItems: 'center', height: width * 0.2, margin: 5, width: width * 0.2 },
	dinerDelete: { marginBottom: -5, marginLeft: 60 },
	dinerProfileHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 30, height: 60, overflow: 'hidden', width: 60 },
	dinerName: { textAlign: 'center' },

	// selected friends list
	selectedDinersHeader: { fontWeight: 'bold', textAlign: 'center' },

	// location info
	itemContainer: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 10, flexDirection: 'row', marginHorizontal: 10, padding: 10 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 25, height: 50, overflow: 'hidden', width: 50 },
	itemName: { fontWeight: 'bold', marginVertical: 15, marginLeft: 50, textAlign: 'center' },

	actions: { flexDirection: 'row', justifyContent: 'space-around' },
	action: { borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginHorizontal: 5, padding: 5, width: 60 },
	actionHeader: { textAlign: 'center' },
})
