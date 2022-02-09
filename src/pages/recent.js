import React, { useState, useEffect, useRef } from 'react';
import { 
  SafeAreaView, ActivityIndicator, Dimensions, FlatList, View, Text, Image, 
  TouchableOpacity, StyleSheet 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { logo_url } from '../../assets/info'
import { getTransactions } from '../apis/transactions'

const { height, width } = Dimensions.get('window')
const wsize = p => {
  return width * (p / 100)
}
const hsize = p => {
  return height * (p / 100)
}

export default function Recent(props) {
	const { params } = props.route
	const refetch = params && params.refetch ? params.refetch : null
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
					setItems(res.transactions)
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
		<SafeAreaView style={style.recent}>
			<View style={style.box}>
				{loaded ? 
					items.length > 0 ?
						<FlatList
							showsVerticalScrollIndicator={false}
							data={items}
							renderItem={({ item, index }) => 
								<View key={item.key} style={style.group}>
									<Text style={style.dateHeader}>
                    <Text style={{ fontWeight: 'bold' }}>
                      {item.type == "service" && "Appointment "}
                      {item.type == "cartorder" && "Purchased "}
                      {item.type == "dining" && "Dined "}
                      on
                    </Text> 
                    {' ' + displayDateStr(item.time)}
									</Text>

									{item.items.map(recent => (
										<View style={style.item} key={recent.key}>
											<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
												<View style={{ alignItems: 'center' }}>
													<Text style={style.itemName}>{recent.name}</Text>
													{recent.image && (
														<View style={style.itemImageHolder}>
															<Image source={{ uri: logo_url + recent.image }} style={style.itemImage}/>
														</View>
													)}
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
                          {recent.tip > 0 && <Text style={style.header}><Text style={{ fontWeight: 'bold' }}>Tip:</Text> ${recent.tip.toFixed(2)}</Text>}
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
						<View style={{ alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around' }}>
							<Text style={{ fontSize: wsize(5) }}>You don't have any recents</Text>
						</View>
					:
					<View style={{ alignItems: 'center', flexDirection: 'column', height: '100%', justifyContent: 'space-around' }}>
						<ActivityIndicator color="black" size="small"/>
					</View>
				}
			</View>
		</SafeAreaView>
	);
}

const style = StyleSheet.create({
	recent: { backgroundColor: '#EAEAEA', height: '100%', width: '100%' },
	box: { height: '100%', width: '100%' },

	group: { borderRadius: 10, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 10 },
	dateHeader: { fontSize: wsize(4), marginBottom: 20 },
	item: { marginBottom: 5 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 50, height: 100, overflow: 'hidden', width: 100 },
	itemImage: { height: 100, width: 100 },
	itemInfos: {  },
	itemName: { fontSize: wsize(5), marginBottom: 10 },
	itemInfo: { fontSize: wsize(4) },
	header: { fontSize: wsize(4) }
})
