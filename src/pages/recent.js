import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Dimensions, FlatList, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { logo_url } from '../../assets/info'
import { getTransactions } from '../apis/transactions'

export default function recent(props) {
	const { height, width } = Dimensions.get('window')
	const offsetPadding = Constants.statusBarHeight
	const screenHeight = height - offsetPadding
	
	const { params } = props.route
	const refetch = params && params.refetch ? params.refetch : null
	const [userId, setUserid] = useState(null)
	const [items, setItems] = useState([])
	const [cartIndex, setCartindex] = useState(0)
	const [loaded, setLoaded] = useState(false)

	const isMounted = useRef(null)
	
	const getTheTransactions = async() => {
		const userid = await AsyncStorage.getItem("userid")
		const data = { userid, cartIndex: 0 }

		getTransactions(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setUserid(userid)
					setItems(res.transactions)
					setLoaded(true)
				}
			})
			.catch((err) => {
				if (err.response && err.response.status == 400) {
					
				}
			})
	}
	const displayDateStr = (unixtime) => {
		let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
		let months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'October', 'November', 'December']

		let d = new Date(unixtime)
		let day = weekdays[d.getDay()]
		let month = months[d.getMonth()]
		let date = d.getDate()
		let year = d.getFullYear()

		let hour = d.getHours()
		let minute = d.getMinutes()
		let period = hour > 12 ? "pm" : "am"

		hour = hour > 12 ? hour - 12 : hour
		minute = minute < 10 ? "0" + minute : minute

		let datestr = day + ", " + month + " " + date + ", " + year + " at " + hour + ":" + minute + " " + period;

		return datestr
	}

	useEffect(() => {
		isMounted.current = true

		getTheTransactions()

		return () => isMounted.current = false
	}, [])

	return (
		<View style={style.recent}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<TouchableOpacity style={style.back} onPress={() => {
						if (refetch) refetch()
						props.navigation.goBack()
					}}>
						<Text style={style.backHeader}>Back</Text>
					</TouchableOpacity>
					<Text style={style.boxHeader}>Recent(s)</Text>
					
					{loaded ? 
						items.length > 0 ?
							<FlatList
								showsVerticalScrollIndicator={false}
								data={items}
								renderItem={({ item, index }) => 
									<View key={item.key} style={style.group}>
										<Text style={style.dateHeader}>
											{item.items[0].type == "service" ? 
												<><Text style={{ fontWeight: 'bold' }}>Appointment on</Text> {displayDateStr(item.time)}</>
												:
												<><Text style={{ fontWeight: 'bold' }}>Purchased on</Text> {displayDateStr(item.time)}</>
											}
										</Text>

										{item.items.map(recent => (
											<View style={style.item} key={recent.key}>
												<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
													<View style={{ alignItems: 'center' }}>
														<Text style={style.itemName}>{recent.name}</Text>
														<View style={style.itemImageHolder}>
															<Image source={{ uri: logo_url + recent.image }} style={style.itemImage}/>
														</View>
													</View>
													<View style={style.itemInfos}>
														{recent.type == "product" && (
															<>
																{recent.options.map(option => (
																	<Text key={option.key} style={style.itemInfo}>
																		<Text style={{ fontWeight: 'bold' }}>{option.header}:</Text> 
																		{option.selected}
																	</Text>
																))}

																{recent.others.map(other => (
																	other.selected ? 
																		<Text key={other.key} style={style.itemInfo}>
																			<Text style={{ fontWeight: 'bold' }}>{other.name}:</Text>
																			<Text>{other.input}</Text>
																		</Text>
																	: null
																))}

																{recent.sizes.map(size => (
																	size.selected ? 
																		<Text key={size.key} style={style.itemInfo}>
																			<Text style={{ fontWeight: 'bold' }}>Size:</Text>
																			<Text>{size.name}</Text>
																		</Text>
																	: null
																))}
															</>
														)}	
													</View>
													<View>
														<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>Service cost:</Text> ${recent.cost.toFixed(2)}</Text>
														<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>E-pay fee:</Text> ${recent.fee.toFixed(2)}</Text>
														<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>PST:</Text> ${recent.pst.toFixed(2)}</Text>
														<Text style={[style.header, { marginBottom: 10 }]}><Text style={{ fontWeight: 'bold' }}>HST:</Text> ${recent.hst.toFixed(2)}</Text>
														<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>Total:</Text> ${recent.total.toFixed(2)}</Text>
													</View>
												</View>
											</View>
										))}
									</View>
								}
							/>
							:
							<View style={{ alignItems: 'center', flexDirection: 'column', height: screenHeight - 117, justifyContent: 'space-around' }}>
								<Text>You don't have any recents</Text>
							</View>
						:
						<View style={{ flexDirection: 'column', height: screenHeight - 117, justifyContent: 'space-around' }}>
							<ActivityIndicator size="small"/>
						</View>
					}
				</View>
			</View>
		</View>
	);
}

const style = StyleSheet.create({
	recent: { backgroundColor: 'white' },
	box: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, marginVertical: 20, marginHorizontal: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },

	group: { borderRadius: 10, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10 },
	dateHeader: { fontSize: 15, marginBottom: 20 },
	item: { marginBottom: 5 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 50, height: 100, overflow: 'hidden', width: 100 },
	itemImage: { height: 100, width: 100 },
	itemInfos: {  },
	itemName: { fontSize: 20, marginBottom: 10 },
	itemInfo: { fontSize: 15 },
	header: { fontSize: 15 }
})
