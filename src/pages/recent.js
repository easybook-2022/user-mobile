import React, { useState, useEffect } from 'react';
import { AsyncStorage, ActivityIndicator, Dimensions, FlatList, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { logo_url } from '../../assets/info'
import { getTransactions } from '../apis/transactions'

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - offsetPadding

export default function recent(props) {
	const { refetch } = props.route.params
	const [items, setItems] = useState([])
	const [cartIndex, setCartindex] = useState(0)
	const [loaded, setLoaded] = useState(false)
	
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
				if (err.response.status == 400) {
					
				}
			})
	}
	const displayDateStr = (unixtime) => {
		let weekdays = { "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday", "Sun": "Sunday" }
		let months = { 
			"Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April", "May": "May", "Jun": "June", 
			"Jul": "July", "Aug": "August", "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December" 
		}
		let d = new Date(unixtime).toString().split(" ")
		let day = weekdays[d[0]]
		let month = months[d[1]]
		let date = d[2]
		let year = d[3]

		let time = d[4].split(":")
		let hour = parseInt(time[0])
		let minute = time[1]
		let period = hour > 11 ? "pm" : "am"

		hour = hour > 12 ? hour - 12 : hour

		let datestr = day + ", " + month + " " + date + ", " + year + " at " + hour + ":" + minute + " " + period;

		return datestr
	}

	useEffect(() => {
		getTheTransactions()
	}, [])

	return (
		<View style={style.recent}>
			<View style={{ paddingVertical: offsetPadding }}>
				<View style={style.box}>
					<TouchableOpacity style={style.back} onPress={() => {
						refetch()
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
										<Text style={style.dateHeader}><Text style={{ fontWeight: 'bold' }}>Purchased:</Text> {displayDateStr(item.time)}</Text>

										{item.items.map(recent => (
											<View style={style.item} key={recent.key}>
												<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
													<View style={style.itemImageHolder}>
														<Image source={{ uri: logo_url + recent.image }} style={style.itemImage}/>
													</View>
													<View style={style.itemInfos}>
														<Text style={style.itemName}>{recent.name}</Text>

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
														<Text style={style.header}><Text style={{ fontWeight: 'bold' }}>cost:</Text> ${recent.cost}</Text>
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
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, height: 30, marginTop: 20, marginHorizontal: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 30, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },

	group: { borderRadius: 10, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },
	dateHeader: { fontSize: 15, marginVertical: 10 },
	item: { marginBottom: 5 },
	itemImageHolder: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 50, height: 100, overflow: 'hidden', width: 100 },
	itemImage: { height: 100, width: 100 },
	itemInfos: {  },
	itemName: { fontSize: 20, marginBottom: 10 },
	itemInfo: { fontSize: 15 },
	header: { fontSize: 15 }
})
